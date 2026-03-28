import { createAdminClient } from "@/lib/supabase/admin";

export function scoreFromRatings(ratings: number[]) {
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

/** Recompute trust_score from reviews + completed orders (admin client). */
export async function recomputeMerchantTrust(merchantId: string) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }

  const { data: reviews } = await admin
    .from("reviews")
    .select("rating")
    .eq("merchant_id", merchantId);

  const ratings = (reviews ?? []).map((r: { rating: number }) => r.rating);
  const avg = scoreFromRatings(ratings);

  const { count: completed } = await admin
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", merchantId)
    .eq("status", "completed");

  const n = completed ?? 0;
  const completionBoost = Math.min(1, n / 50);
  const trust = Math.min(5, avg + completionBoost * 0.5);

  await admin
    .from("merchants")
    .update({ trust_score: trust.toFixed(2) })
    .eq("id", merchantId);
}

export async function recomputeServiceProviderTrust(serviceProviderId: string) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }

  const { data: reviews } = await admin
    .from("reviews")
    .select("rating")
    .eq("service_provider_id", serviceProviderId);

  const ratings = (reviews ?? []).map((r: { rating: number }) => r.rating);
  const avg = scoreFromRatings(ratings);

  const { data: listings } = await admin
    .from("service_listings")
    .select("id")
    .eq("service_provider_id", serviceProviderId);
  const listingIds = (listings ?? []).map((l: { id: string }) => l.id);
  const { count: completed } =
    listingIds.length > 0
      ? await admin
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed")
          .in("service_listing_id", listingIds)
      : { count: 0 };

  const n = completed ?? 0;
  const completionBoost = Math.min(1, n / 30);
  const trust = Math.min(5, avg + completionBoost * 0.5);

  await admin
    .from("service_providers")
    .update({ trust_score: trust.toFixed(2) })
    .eq("id", serviceProviderId);
}
