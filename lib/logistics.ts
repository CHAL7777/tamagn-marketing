import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getDeliveryTimeline,
  type DeliveryTimeline,
} from "@/lib/queries/delivery";
import { assignCourierToOrder, type AssignCourierResult } from "@/lib/logistics-core";

/** Delivery assignment + events for an order (RLS applies). */
export async function trackShipment(
  supabase: SupabaseClient,
  orderId: string
): Promise<DeliveryTimeline> {
  return getDeliveryTimeline(supabase, orderId);
}

/**
 * Assign courier by auth user id — pass **admin** Supabase client (service role).
 */
export async function assignCourier(
  admin: SupabaseClient,
  orderId: string,
  courierUserId: string
): Promise<AssignCourierResult> {
  return assignCourierToOrder(admin, orderId, courierUserId);
}
