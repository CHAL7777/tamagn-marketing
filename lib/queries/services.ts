import { createClient } from "@/lib/supabase/server";

export async function getServiceListings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_listings")
    .select(
      "id, title, description, price_min, price_max, prepaid_escrow, service_providers ( id, business_name, trust_score )"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getServiceListingById(id: string) {
  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("service_listings")
    .select(
      "*, service_providers ( id, business_name, bio, trust_score ), service_areas ( area_label ), service_portfolio ( storage_path )"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return listing;
}
