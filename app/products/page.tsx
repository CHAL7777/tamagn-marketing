import Link from "next/link";
import { getProducts, getCategories } from "@/lib/queries/products";
import { publicStorageUrl } from "@/lib/storage-url";
import { ProductCard } from "@/components/ProductCard";

type Search = {
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
  lat?: string;
  lng?: string;
  km?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const buyerLat = sp.lat ? Number(sp.lat) : undefined;
  const buyerLng = sp.lng ? Number(sp.lng) : undefined;

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let catalogError: string | null = null;

  try {
    [categories, products] = await Promise.all([
      getCategories("product"),
      getProducts({
        categorySlug: sp.category,
        minPrice: sp.min ? Number(sp.min) : undefined,
        maxPrice: sp.max ? Number(sp.max) : undefined,
        buyerLat,
        buyerLng,
        maxDistanceKm: sp.km ? Number(sp.km) : undefined,
        sort:
          (sp.sort as "popular" | "price_asc" | "price_desc" | "rating") ||
          "popular",
      }),
    ]);
  } catch (e) {
    catalogError =
      e instanceof Error ? e.message : "Could not load catalog. Check Supabase env and DB.";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Products</h1>
      <p className="text-sm text-muted-foreground">
        Nearby verified merchants — filter by category, price, distance (set{" "}
        <code className="rounded bg-muted px-1">?lat=&lng=&km=</code> from your device).
      </p>

      {catalogError ? (
        <p
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {catalogError}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${encodeURIComponent(c.slug)}`}
            className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <form
        className="mt-4 flex flex-wrap gap-3 text-sm"
        method="get"
        action="/products"
      >
        {sp.category ? (
          <input type="hidden" name="category" value={sp.category} />
        ) : null}
        <label className="flex items-center gap-1">
          Min
          <input
            name="min"
            type="number"
            defaultValue={sp.min}
            className="w-24 rounded border px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-1">
          Max
          <input
            name="max"
            type="number"
            defaultValue={sp.max}
            className="w-24 rounded border px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-1">
          Sort
          <select
            name="sort"
            defaultValue={sp.sort ?? "popular"}
            className="rounded border px-2 py-1"
          >
            <option value="popular">Popular</option>
            <option value="rating">Rating</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1 text-primary-foreground"
        >
          Apply
        </button>
      </form>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const img = publicStorageUrl(
            "product-images",
            p.featured_image_path
          );
          return (
            <li key={p.id}>
              <Link href={`/products/${p.id}`}>
                <ProductCard
                  title={p.title}
                  price={Number(p.price)}
                  imageUrl={img}
                  merchantName={p.merchants?.business_name}
                  trust={Number(p.merchants?.trust_score ?? 0)}
                />
              </Link>
            </li>
          );
        })}
      </ul>
      {products.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No products match filters.</p>
      ) : null}
    </div>
  );
}
