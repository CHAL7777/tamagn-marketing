import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateB2CPayout } from "@/lib/mpesa";
import { orderHasActiveDispute } from "@/lib/disputes";
import { resolveOrderPayoutTarget } from "@/lib/payout-target";

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

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server configuration" },
      { status: 500 }
    );
  }

  const { data: order } = await admin
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

  if (await orderHasActiveDispute(admin, orderId)) {
    return NextResponse.json(
      { ok: false, error: "Escrow frozen: active dispute" },
      { status: 409 }
    );
  }

  const target = await resolveOrderPayoutTarget(admin, order);
  if (target.kind === "none") {
    return NextResponse.json(
      { ok: false, error: target.reason },
      { status: 400 }
    );
  }
  const partyB = target.partyB;

  const payoutAmount = Math.max(0, Number(order.subtotal));

  const result = await initiateB2CPayout({
    partyB,
    amount: payoutAmount,
    remarks: `Order ${orderId}`,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, data: result.raw },
      { status: 502 }
    );
  }

  await admin
    .from("orders")
    .update({ escrow_released: true })
    .eq("id", orderId);

  await admin.from("escrow_events").insert({
    order_id: orderId,
    event_type:
      target.kind === "service_provider"
        ? "released_to_service_provider"
        : "released_to_merchant",
    meta: { raw: result.raw },
  });

  return NextResponse.json({ ok: true, data: result.raw });
}
