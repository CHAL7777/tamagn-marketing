import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canBuyerConfirmDelivery } from "@/lib/orders/workflow";
import {
  recomputeMerchantTrust,
  recomputeServiceProviderTrust,
} from "@/lib/reputation";
import { tryAutoReleaseEscrow } from "@/lib/escrow-release";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = (await request.json()) as { orderId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "orderId required" }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, buyer_id, merchant_id, service_listing_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.buyer_id !== user.id) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!canBuyerConfirmDelivery(order.status)) {
    return NextResponse.json(
      { ok: false, error: "Order is not marked as delivered" },
      { status: 400 }
    );
  }

  const confirmedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "completed",
      buyer_confirmed_at: confirmedAt,
    })
    .eq("id", orderId);
  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 400 });
  }

  const { error: historyError } = await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: "completed",
    note: "Buyer confirmed receipt",
    created_by: user.id,
  });
  if (historyError) {
    return NextResponse.json({ ok: false, error: historyError.message }, { status: 400 });
  }

  if (order.merchant_id) {
    await recomputeMerchantTrust(order.merchant_id);
  }
  if (order.service_listing_id) {
    const { data: listing } = await supabase
      .from("service_listings")
      .select("service_provider_id")
      .eq("id", order.service_listing_id)
      .maybeSingle();
    if (listing?.service_provider_id) {
      await recomputeServiceProviderTrust(listing.service_provider_id);
    }
  }

  await tryAutoReleaseEscrow(orderId);

  const { data: updatedOrder } = await supabase
    .from("orders")
    .select("id, status, escrow_released, buyer_confirmed_at")
    .eq("id", orderId)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    order: updatedOrder ?? {
      id: orderId,
      status: "completed",
      escrow_released: false,
      buyer_confirmed_at: confirmedAt,
    },
    escrowReleased: Boolean(updatedOrder?.escrow_released),
  });
}
