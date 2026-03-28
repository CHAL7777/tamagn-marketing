import { createClient } from "@/lib/supabase/server";

export async function getServiceListings(categorySlug?: string) {
  const supabase = await createClient();
  let categoryId: string | undefined;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("kind", "service")
      .maybeSingle();
    categoryId = cat?.id;
  }

  let q = supabase
    .from("service_listings")
    .select(
      "id, title, description, price_min, price_max, prepaid_escrow, service_providers ( id, business_name, trust_score )"
    )
    .order("created_at", { ascending: false });
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data, error } = await q;
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
