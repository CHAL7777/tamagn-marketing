import type { EscrowState } from "@/types/escrow";
import type { ParsedStkCallback } from "@/lib/mpesa";
import { createAdminClient } from "@/lib/supabase/admin";

/** M-Pesa webhook: idempotent payment + move order to paid_escrow, decrement stock. */
export async function recordStkCallbackForEscrow(parsed: ParsedStkCallback) {
  if (!parsed.checkoutRequestId) return;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    console.error("recordStkCallbackForEscrow: admin client unavailable");
    return;
  }

  const { data: existing } = await admin
    .from("payments")
    .select("id, status")
    .eq("mpesa_checkout_request_id", parsed.checkoutRequestId)
    .maybeSingle();

  if (existing?.status === "completed") return;

  const { data: order } = await admin
    .from("orders")
    .select("id, status, buyer_id, total")
    .eq("mpesa_checkout_request_id", parsed.checkoutRequestId)
    .maybeSingle();

  if (!order) return;

  const callbackJson = {
    success: parsed.success,
    resultCode: parsed.resultCode,
    checkoutRequestId: parsed.checkoutRequestId,
  };

  if (parsed.success) {
    if (existing) {
      await admin
        .from("payments")
        .update({
          status: "completed",
          mpesa_receipt: parsed.mpesaReceipt ?? null,
          raw_callback: callbackJson,
        })
        .eq("mpesa_checkout_request_id", parsed.checkoutRequestId);
    } else {
      await admin.from("payments").insert({
        order_id: order.id,
        amount: order.total,
        mpesa_checkout_request_id: parsed.checkoutRequestId,
        mpesa_receipt: parsed.mpesaReceipt ?? null,
        status: "completed",
        raw_callback: callbackJson,
      });
    }

    const wasAwaiting = order.status === "awaiting_payment";

    if (wasAwaiting) {
      await admin
        .from("orders")
        .update({ status: "paid_escrow" })
        .eq("id", order.id);

      await admin.from("order_status_history").insert({
        order_id: order.id,
        status: "paid_escrow",
        note: "M-Pesa payment confirmed (escrow)",
      });

      await admin.from("escrow_events").insert({
        order_id: order.id,
        event_type: "funds_in_escrow",
        meta: { receipt: parsed.mpesaReceipt },
      });

      const { data: items } = await admin
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", order.id);

      for (const item of items ?? []) {
        const { data: p } = await admin
          .from("products")
          .select("stock, sold_count")
          .eq("id", item.product_id)
          .maybeSingle();
        if (p) {
          await admin
            .from("products")
            .update({
              stock: Math.max(0, p.stock - item.quantity),
              sold_count: (p.sold_count ?? 0) + item.quantity,
            })
            .eq("id", item.product_id);
        }
      }
    }
  } else if (existing) {
    await admin
      .from("payments")
      .update({
        status: "failed",
        raw_callback: callbackJson,
      })
      .eq("mpesa_checkout_request_id", parsed.checkoutRequestId);
  }
}

export function escrowStateFromStkCallback(parsed: ParsedStkCallback): EscrowState {
  if (!parsed.success) return "failed";
  return "in_escrow";
}

export function canReleaseEscrow(current: EscrowState): boolean {
  return current === "in_escrow";
}

export async function holdFunds(_orderId: string) {
  return { ok: true as const };
}

export async function releaseFunds(_orderId: string) {
  return { ok: true as const };
}
