import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canAssignCourier,
  deliveryAssignmentStatusForOrder,
  nextStatusAfterCourierAssignment,
} from "@/lib/orders/workflow";

export type AssignCourierResult =
  | { ok: true; assignmentId: string }
  | { ok: false; error: string };

/**
 * Assign or reassign a courier to an order (service-role Supabase client).
 */
export async function assignCourierToOrder(
  admin: SupabaseClient,
  orderId: string,
  courierUserId: string
): Promise<AssignCourierResult> {
  const { data: order } = await admin
    .from("orders")
    .select("id, order_type, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { ok: false, error: "Order not found" };
  }

  if (!canAssignCourier(order.order_type, order.status)) {
    return { ok: false, error: "Order is not ready for courier assignment" };
  }

  let { data: courier } = await admin
    .from("couriers")
    .select("id")
    .eq("user_id", courierUserId)
    .maybeSingle();

  if (!courier) {
    const { data: created, error: ce } = await admin
      .from("couriers")
      .insert({ user_id: courierUserId, is_active: true })
      .select("id")
      .single();
    if (ce || !created) {
      return { ok: false, error: ce?.message ?? "Courier create failed" };
    }
    courier = created;
  }

  const { data: da, error: ae } = await admin
    .from("delivery_assignments")
    .upsert(
      {
        order_id: orderId,
        courier_id: courier.id,
        status: deliveryAssignmentStatusForOrder(order.status),
      },
      { onConflict: "order_id" }
    )
    .select("id")
    .single();

  if (ae || !da) {
    return { ok: false, error: ae?.message ?? "Assignment failed" };
  }

  await admin.from("delivery_events").insert({
    assignment_id: da.id,
    event_type: "assigned",
  });

  const nextOrderStatus = nextStatusAfterCourierAssignment(order.status);
  if (nextOrderStatus !== order.status) {
    await admin.from("orders").update({ status: nextOrderStatus }).eq("id", orderId);
    await admin.from("order_status_history").insert({
      order_id: orderId,
      status: nextOrderStatus,
      note: "Courier assigned",
    });
  }

  return { ok: true, assignmentId: da.id };
}
