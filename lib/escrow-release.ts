import { createAdminClient } from "@/lib/supabase/admin";
import { initiateB2CPayout } from "@/lib/mpesa";
import { orderHasActiveDispute } from "@/lib/disputes";
import { resolveOrderPayoutTarget } from "@/lib/payout-target";

/** Attempt B2C payout to merchant or service provider after order is completed. Fails silently if env missing. */
export async function tryAutoReleaseEscrow(orderId: string) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }

  if (await orderHasActiveDispute(admin, orderId)) return;

  const { data: order } = await admin
    .from("orders")
    .select("merchant_id, service_listing_id, escrow_released, subtotal, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status !== "completed" || order.escrow_released) return;

  const target = await resolveOrderPayoutTarget(admin, order);
  if (target.kind === "none") return;

  const result = await initiateB2CPayout({
    partyB: target.partyB,
    amount: Math.max(0, Number(order.subtotal)),
    remarks: `Order ${orderId}`,
  });

  if (result.ok) {
    await admin.from("orders").update({ escrow_released: true }).eq("id", orderId);
    await admin.from("escrow_events").insert({
      order_id: orderId,
      event_type:
        target.kind === "service_provider"
          ? "released_to_service_provider"
          : "released_to_merchant",
      meta: { auto: true },
    });
  }
}
