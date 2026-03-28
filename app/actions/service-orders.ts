"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

async function assertOwnsServiceOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  orderId: string
) {
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_type, status, service_listing_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.order_type !== "service" || !order.service_listing_id) {
    throw new Error("Not a service order");
  }

  const { data: listing } = await supabase
    .from("service_listings")
    .select("service_provider_id")
    .eq("id", order.service_listing_id)
    .maybeSingle();
  if (!listing?.service_provider_id) throw new Error("Listing missing");

  const { data: spRow } = await supabase
    .from("service_providers")
    .select("owner_id")
    .eq("id", listing.service_provider_id)
    .maybeSingle();
  if (!spRow || spRow.owner_id !== userId) throw new Error("Forbidden");

  return order;
}

/** Provider marks prepaid work complete → buyer can confirm and release escrow. */
export async function serviceProviderMarkDelivered(orderId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();

  const order = await assertOwnsServiceOrder(supabase, user.id, orderId);
  if (order.status !== "paid_escrow") {
    throw new Error("Order not in escrow for fulfillment");
  }

  await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId);
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: "delivered",
    note: "Service provider marked work complete",
    created_by: user.id,
  });

  revalidatePath("/service-provider/bookings");
  revalidatePath(`/buyer/order/${orderId}`);
}
