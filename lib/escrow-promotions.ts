import type { ParsedStkCallback } from "@/lib/mpesa";
import { createAdminClient } from "@/lib/supabase/admin";

/** M-Pesa STK success for promotion boost fee — idempotent. */
export async function recordStkCallbackForPromotion(parsed: ParsedStkCallback) {
  if (!parsed.checkoutRequestId) return;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }

  const { data: promo } = await admin
    .from("promotions")
    .select("id, status, mpesa_checkout_request_id")
    .eq("mpesa_checkout_request_id", parsed.checkoutRequestId)
    .maybeSingle();

  if (!promo) return;
  if (promo.status === "active") return;

  if (parsed.success) {
    await admin
      .from("promotions")
      .update({
        status: "active",
        mpesa_checkout_request_id: parsed.checkoutRequestId,
      })
      .eq("id", promo.id);
  } else if (promo.status === "pending") {
    await admin
      .from("promotions")
      .update({ status: "payment_failed" })
      .eq("id", promo.id);
  }
}
