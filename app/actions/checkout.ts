"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { deliveryFeeKm, haversineKm } from "@/lib/geo";
import { platformFeeAmount } from "@/lib/constants/commerce";

export async function createProductOrder(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) redirect("/login");

  const productId = String(formData.get("product_id") ?? "").trim();
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const addressId = String(formData.get("address_id") ?? "").trim();

  if (!productId || !addressId) redirect("/checkout?productId=" + encodeURIComponent(productId));

  const supabase = await createClient();

  const { data: product, error: pe } = await supabase
    .from("products")
    .select(
      "id, price, stock, merchant_id, status, merchants ( latitude, longitude )"
    )
    .eq("id", productId)
    .maybeSingle();

  if (pe || !product) redirect("/products");
  if (product.status !== "active") redirect("/products");
  if (product.stock < quantity) redirect(`/products/${productId}`);

  const { data: address, error: ae } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (ae || !address) redirect("/buyer/profile");

  const lineTotal = Math.round(Number(product.price) * quantity * 100) / 100;
  const platformFee = platformFeeAmount(lineTotal);
  const m = product.merchants as unknown as {
    latitude: number | null;
    longitude: number | null;
  } | null;

  let deliveryFee = 80;
  if (
    address.latitude != null &&
    address.longitude != null &&
    m?.latitude != null &&
    m?.longitude != null
  ) {
    const km = haversineKm(
      address.latitude,
      address.longitude,
      m.latitude,
      m.longitude
    );
    deliveryFee = deliveryFeeKm(km);
  }

  const total =
    Math.round((lineTotal + deliveryFee + platformFee) * 100) / 100;

  const { data: order, error: oe } = await supabase
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
    .select("id")
    .single();

  if (oe || !order) redirect(`/checkout?productId=${productId}`);

  const { error: ie } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: productId,
    quantity,
    unit_price: String(product.price),
  });
  if (ie) redirect(`/checkout?productId=${productId}`);

  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "awaiting_payment",
    note: "Checkout started",
    created_by: user.id,
  });

  revalidatePath("/buyer/orders");
  redirect(`/buyer/order/${order.id}?pay=1`);
}
