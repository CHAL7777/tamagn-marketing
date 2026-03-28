import type { SupabaseClient } from "@supabase/supabase-js";

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
      { order_id: orderId, courier_id: courier.id, status: "assigned" },
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

  return { ok: true, assignmentId: da.id };
}
