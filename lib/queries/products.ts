import { createClient } from "@/lib/supabase/server";
import { haversineKm } from "@/lib/geo";

export type ProductListFilters = {
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  buyerLat?: number;
  buyerLng?: number;
  maxDistanceKm?: number;
  sort?: "popular" | "price_asc" | "price_desc" | "rating";
};

export async function getCategories(kind: "product" | "service" = "product") {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("kind", kind)
    .order("name");
  return data ?? [];
}

export async function getProducts(filters: ProductListFilters = {}) {
  const supabase = await createClient();

  let categoryId: string | undefined;
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .eq("kind", "product")
      .maybeSingle();
    categoryId = cat?.id;
  }

  let q = supabase
    .from("products")
    .select(
      "id, title, description, price, stock, featured_image_path, sold_count, category_id, merchant_id, merchants ( id, business_name, trust_score, latitude, longitude, location_label, verification_badge )"
    )
    .eq("status", "active");

  if (categoryId) q = q.eq("category_id", categoryId);
  if (filters.query?.trim()) {
    const term = filters.query.trim().replace(/[,%]/g, " ");
    if (term.trim()) {
      q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }
  if (filters.minPrice != null) q = q.gte("price", filters.minPrice);
  if (filters.maxPrice != null) q = q.lte("price", filters.maxPrice);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    title: string;
    description: string | null;
    price: string;
    stock: number;
    featured_image_path: string | null;
    sold_count: number;
    category_id: string | null;
    merchant_id: string;
    merchants: {
      id: string;
      business_name: string;
      trust_score: string;
      latitude: number | null;
      longitude: number | null;
      location_label: string | null;
      verification_badge: boolean;
    } | null;
    distance_km?: number | null;
  };

  const raw = (data ?? []) as unknown as Record<string, unknown>[];
  let rows: Row[] = raw.map((r) => {
    const m = r.merchants;
    const merchant = Array.isArray(m) ? m[0] : m;
    return {
      ...(r as unknown as Row),
      merchants: merchant as Row["merchants"],
    };
  });

  if (
    filters.buyerLat != null &&
    filters.buyerLng != null &&
    filters.maxDistanceKm != null
  ) {
    rows = rows.map((r) => {
      const m = r.merchants;
      if (m?.latitude == null || m?.longitude == null) {
        return { ...r, distance_km: null };
      }
      const d = haversineKm(
        filters.buyerLat!,
        filters.buyerLng!,
        m.latitude,
        m.longitude
      );
      return { ...r, distance_km: d };
    });

    rows = rows.filter((r) => {
      if (r.distance_km == null) return true;
      return r.distance_km <= filters.maxDistanceKm!;
    });
  }

  switch (filters.sort) {
    case "price_asc":
      rows.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price_desc":
      rows.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "rating":
      rows.sort(
        (a, b) =>
          Number(b.merchants?.trust_score ?? 0) -
          Number(a.merchants?.trust_score ?? 0)
      );
      break;
    case "popular":
    default:
      rows.sort((a, b) => b.sold_count - a.sold_count);
  }

  return rows;
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "*, merchants ( id, business_name, description, trust_score, verification_badge, latitude, longitude, location_label )"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!product || product.status !== "active") return null;

  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path, sort_order")
    .eq("product_id", id)
    .order("sort_order");

  return { product, images: images ?? [] };
}
