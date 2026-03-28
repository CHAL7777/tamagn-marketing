import type { SupabaseClient } from "@supabase/supabase-js";

export type PayoutTarget =
  | { kind: "merchant"; partyB: string }
  | { kind: "service_provider"; partyB: string }
  | { kind: "none"; reason: string };

/** Resolve M-Pesa party B MSISDN for a completed order (admin client). */
export async function resolveOrderPayoutTarget(
  admin: SupabaseClient,
  order: {
    merchant_id: string | null;
    service_listing_id: string | null;
    subtotal: string | number;
  }
): Promise<PayoutTarget> {
  if (order.merchant_id) {
    const { data: merchant } = await admin
      .from("merchants")
      .select("owner_id")
      .eq("id", order.merchant_id)
      .maybeSingle();
    if (!merchant) return { kind: "none", reason: "Merchant missing" };

    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("mpesa_msisdn, phone")
      .eq("id", merchant.owner_id)
      .maybeSingle();

    const partyB = ownerProfile?.mpesa_msisdn || ownerProfile?.phone;
    if (!partyB?.trim()) {
      return { kind: "none", reason: "Merchant payout number not set" };
    }
    return { kind: "merchant", partyB: partyB.trim() };
  }

  if (order.service_listing_id) {
    const { data: listing } = await admin
      .from("service_listings")
      .select("service_provider_id")
      .eq("id", order.service_listing_id)
      .maybeSingle();
    if (!listing?.service_provider_id) {
      return { kind: "none", reason: "Service listing missing" };
    }

    const { data: sp } = await admin
      .from("service_providers")
      .select("owner_id")
      .eq("id", listing.service_provider_id)
      .maybeSingle();
    if (!sp) return { kind: "none", reason: "Service provider missing" };

    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("mpesa_msisdn, phone")
      .eq("id", sp.owner_id)
      .maybeSingle();

    const partyB = ownerProfile?.mpesa_msisdn || ownerProfile?.phone;
    if (!partyB?.trim()) {
      return { kind: "none", reason: "Provider payout number not set" };
    }
    return { kind: "service_provider", partyB: partyB.trim() };
  }

  return { kind: "none", reason: "No payout target" };
}
