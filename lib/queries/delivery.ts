import type { SupabaseClient } from "@supabase/supabase-js";

export type DeliveryTimeline = {
  assignment: {
    id: string;
    status: string;
    created_at: string;
  } | null;
  events: { event_type: string; created_at: string }[];
};

export async function getDeliveryTimeline(
  supabase: SupabaseClient,
  orderId: string
): Promise<DeliveryTimeline> {
  const { data: assignment } = await supabase
    .from("delivery_assignments")
    .select("id, status, created_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!assignment) {
    return { assignment: null, events: [] };
  }

  const { data: events } = await supabase
    .from("delivery_events")
    .select("event_type, created_at")
    .eq("assignment_id", assignment.id)
    .order("created_at", { ascending: true });

  return {
    assignment: {
      id: assignment.id,
      status: assignment.status,
      created_at: assignment.created_at,
    },
    events: events ?? [],
  };
}
