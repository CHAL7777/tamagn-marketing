import type { SupabaseClient } from "@supabase/supabase-js";

/** True when an order has a dispute that should freeze escrow release. */
export async function orderHasActiveDispute(
  client: SupabaseClient,
  orderId: string
): Promise<boolean> {
  const { data } = await client
    .from("disputes")
    .select("id")
    .eq("order_id", orderId)
    .in("status", ["open", "under_review"])
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}
