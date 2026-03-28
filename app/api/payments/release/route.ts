import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requestEscrowRelease } from "@/lib/mpesa-payouts";

/**
 * Release escrow to merchant (B2C) after buyer confirmed delivery.
 * Caller must be buyer (auto) or admin; order must be completed and not yet released.
 */
export async function POST(request: Request) {
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, buyer_id, merchant_id, service_listing_id, status, escrow_released, subtotal"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  const isAdmin = profile?.role === "admin";
  const isBuyer = order.buyer_id === user.id;
  if (!isAdmin && !isBuyer) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "completed" || order.escrow_released) {
    return NextResponse.json(
      { ok: false, error: "Order not eligible for release" },
      { status: 400 }
    );
  }

  const result = await requestEscrowRelease(orderId);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, data: result.raw },
      { status: result.error === "Escrow frozen: active dispute" ? 409 : 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    pending: true,
    originatorConversationId: result.originatorConversationId,
    data: result.data,
  });
}
