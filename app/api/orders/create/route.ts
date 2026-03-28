import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkoutProductSchema } from "@/lib/validations/checkout";
import { deliveryFeeKm, haversineKm } from "@/lib/geo";
import { platformFeeAmount } from "@/lib/constants/commerce";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutProductSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message =
      fields.product_id?.[0] ?? fields.quantity?.[0] ?? fields.address_id?.[0] ?? "Invalid input";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const { product_id: productId, quantity, address_id: addressId } = parsed.data;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, price, stock, merchant_id, status, merchants ( latitude, longitude )")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  }
  if (product.status !== "active") {
    return NextResponse.json({ ok: false, error: "Product is not active" }, { status: 400 });
  }
  if (product.stock < quantity) {
    return NextResponse.json({ ok: false, error: "Insufficient stock" }, { status: 400 });
  }

  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (addressError || !address) {
    return NextResponse.json({ ok: false, error: "Address not found" }, { status: 404 });
  }

  const lineTotal = Math.round(Number(product.price) * quantity * 100) / 100;
  const platformFee = platformFeeAmount(lineTotal);
  const merchant = Array.isArray(product.merchants)
    ? product.merchants[0]
    : product.merchants;

  let deliveryFee = 80;
  if (
    address.latitude != null &&
    address.longitude != null &&
    merchant?.latitude != null &&
    merchant?.longitude != null
  ) {
    const km = haversineKm(
      address.latitude,
      address.longitude,
      merchant.latitude,
      merchant.longitude
    );
    deliveryFee = deliveryFeeKm(km);
  }

  const total = Math.round((lineTotal + deliveryFee + platformFee) * 100) / 100;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      merchant_id: product.merchant_id,
      order_type: "product",
      status: "awaiting_payment",
      subtotal: lineTotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      total,
      delivery_snapshot: address as unknown as Record<string, unknown>,
    })
    .select(
      "id, status, total, subtotal, delivery_fee, platform_fee, created_at, updated_at"
    )
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { ok: false, error: orderError?.message ?? "Order creation failed" },
      { status: 400 }
    );
  }

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: productId,
    quantity,
    unit_price: String(product.price),
  });
  if (itemError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ ok: false, error: itemError.message }, { status: 400 });
  }

  const { error: historyError } = await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "awaiting_payment",
    note: "Checkout started",
    created_by: user.id,
  });
  if (historyError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ ok: false, error: historyError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, orderId: order.id, order }, { status: 201 });
}
