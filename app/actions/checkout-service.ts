"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { platformFeeAmount } from "@/lib/constants/commerce";

export async function createPrepaidServiceOrder(formData: FormData): Promise<void> {
  const listingId = String(formData.get("listing_id") ?? "").trim();
  if (!listingId) redirect("/services");

  const user = await getUser();
  if (!user) redirect("/login?next=/checkout/service/" + listingId);

  const supabase = await createClient();

  const { data: listing, error: le } = await supabase
    .from("service_listings")
    .select("id, title, price_min, prepaid_escrow, service_provider_id")
    .eq("id", listingId)
    .maybeSingle();

  if (le || !listing) redirect("/services");
  if (!listing.prepaid_escrow) redirect(`/services/${listingId}`);
  const subtotal = Number(listing.price_min ?? 0);
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    redirect(`/services/${listingId}`);
  }

  const platformFee = platformFeeAmount(subtotal);
  const total = Math.round((subtotal + platformFee) * 100) / 100;

  const { data: order, error: oe } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      merchant_id: null,
      service_listing_id: listing.id,
      order_type: "service",
      status: "awaiting_payment",
      subtotal,
      delivery_fee: 0,
      platform_fee: platformFee,
      total,
      delivery_snapshot: { service_title: listing.title },
    })
    .select("id")
    .single();

  if (oe || !order) redirect(`/services/${listingId}`);

  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "awaiting_payment",
    note: "Prepaid service checkout",
    created_by: user.id,
  });

  revalidatePath("/buyer/orders");
  redirect(`/buyer/order/${order.id}?pay=1`);
}
