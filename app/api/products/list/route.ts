import { NextResponse } from "next/server";
import { getProducts, type ProductListFilters } from "@/lib/queries/products";

function parseNumber(value: string | null) {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort");
  const allowedSort = new Set<ProductListFilters["sort"]>([
    "popular",
    "price_asc",
    "price_desc",
    "rating",
  ]);

  if (sort && !allowedSort.has(sort as ProductListFilters["sort"])) {
    return NextResponse.json({ ok: false, error: "Invalid sort" }, { status: 400 });
  }

  const minPrice = parseNumber(searchParams.get("minPrice"));
  const maxPrice = parseNumber(searchParams.get("maxPrice"));
  const buyerLat = parseNumber(searchParams.get("buyerLat"));
  const buyerLng = parseNumber(searchParams.get("buyerLng"));
  const maxDistanceKm = parseNumber(searchParams.get("maxDistanceKm"));

  if ([minPrice, maxPrice, buyerLat, buyerLng, maxDistanceKm].some(Number.isNaN)) {
    return NextResponse.json({ ok: false, error: "Invalid numeric filter" }, { status: 400 });
  }

  try {
    const items = await getProducts({
      categorySlug: searchParams.get("category")?.trim() || undefined,
      query:
        searchParams.get("q")?.trim() ||
        searchParams.get("query")?.trim() ||
        undefined,
      minPrice,
      maxPrice,
      buyerLat,
      buyerLng,
      maxDistanceKm,
      sort: (sort as ProductListFilters["sort"] | null) ?? undefined,
    });
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list products";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
