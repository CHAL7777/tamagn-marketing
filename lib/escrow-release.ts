import { createAdminClient } from "@/lib/supabase/admin";
import { initiateB2CPayout } from "@/lib/mpesa";
import { orderHasActiveDispute } from "@/lib/disputes";

/** Attempt B2C payout to merchant owner after order is completed. Fails silently if env missing. */
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
    .select("merchant_id, escrow_released, subtotal, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status !== "completed" || order.escrow_released || !order.merchant_id)
    return;

  const { data: merchant } = await admin
    .from("merchants")
    .select("owner_id")
    .eq("id", order.merchant_id)
    .maybeSingle();
  if (!merchant) return;

  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("mpesa_msisdn, phone")
    .eq("id", merchant.owner_id)
    .maybeSingle();

  const partyB = ownerProfile?.mpesa_msisdn || ownerProfile?.phone;
  if (!partyB) return;

  const result = await initiateB2CPayout({
    partyB,
    amount: Math.max(0, Number(order.subtotal)),
    remarks: `Order ${orderId}`,
  });

  if (result.ok) {
    await admin.from("orders").update({ escrow_released: true }).eq("id", orderId);
    await admin.from("escrow_events").insert({
      order_id: orderId,
      event_type: "released_to_merchant",
      meta: { auto: true },
    });
  }
}
