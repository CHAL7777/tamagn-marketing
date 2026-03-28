import Link from "next/link";
import { getProducts, getCategories } from "@/lib/queries/products";
import { publicStorageUrl } from "@/lib/storage-url";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Search = {
  q?: string;
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
        query: sp.q,
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
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <span className="tamagn-chip bg-surface-container-low text-secondary">
            <SlidersHorizontal className="size-4 text-primary" />
            Filter by category, price, trust, and distance
          </span>
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-[-0.06em] md:text-6xl">
            Discover trusted local products from verified Ethiopian merchants.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-secondary">
            Browse active listings, narrow by budget, and optionally pass{" "}
            <code className="rounded-full bg-surface-container-low px-2 py-1 text-xs text-foreground">
              ?lat=&amp;lng=&amp;km=
            </code>{" "}
            to prioritize nearby sellers and shorter delivery routes.
          </p>
        </div>
        <div className="section-shell bg-surface-container-lowest">
          <p className="section-kicker">Catalog status</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-foreground">
            {products.length}
          </p>
          <p className="mt-2 text-sm text-secondary">
            active results for the current filter set
          </p>
          <Link href="/services" className="eyebrow-link mt-6">
            Prefer booking a service?
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {catalogError ? (
        <p
          className="mt-6 rounded-[1.5rem] bg-error-container px-5 py-4 text-sm text-destructive"
          role="alert"
        >
          {catalogError}
        </p>
      ) : null}

      <form
        className="editorial-card mt-8 grid gap-4 p-5 md:grid-cols-[1.4fr_repeat(3,minmax(0,0.6fr))_auto]"
        method="get"
        action="/products"
      >
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-secondary" />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search for products or sellers"
            className="tamagn-field pl-11"
          />
        </label>
        <input
          name="min"
          type="number"
          defaultValue={sp.min}
          placeholder="Min ETB"
          className="tamagn-field"
        />
        <input
          name="max"
          type="number"
          defaultValue={sp.max}
          placeholder="Max ETB"
          className="tamagn-field"
        />
        <select
          name="sort"
          defaultValue={sp.sort ?? "popular"}
          className="tamagn-select"
        >
          <option value="popular">Most popular</option>
          <option value="rating">Top trust score</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
        </select>
        {sp.category ? (
          <input type="hidden" name="category" value={sp.category} />
        ) : null}
        {sp.lat ? <input type="hidden" name="lat" value={sp.lat} /> : null}
        {sp.lng ? <input type="hidden" name="lng" value={sp.lng} /> : null}
        {sp.km ? <input type="hidden" name="km" value={sp.km} /> : null}
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "default" }), "w-full md:w-auto")}
        >
          Apply
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/products"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            !sp.category
              ? "bg-primary text-on-primary shadow-[0_18px_36px_rgba(1,110,0,0.16)]"
              : "bg-surface-container-lowest text-secondary shadow-[0_12px_28px_rgba(26,28,28,0.04)] hover:bg-surface-container-highest"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${encodeURIComponent(c.slug)}${
              sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""
            }`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              sp.category === c.slug
                ? "bg-primary text-on-primary shadow-[0_18px_36px_rgba(1,110,0,0.16)]"
                : "bg-surface-container-lowest text-secondary shadow-[0_12px_28px_rgba(26,28,28,0.04)] hover:bg-surface-container-highest"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                  verified={Boolean(p.merchants?.verification_badge)}
                  locationLabel={p.merchants?.location_label}
                  distanceKm={p.distance_km ?? null}
                  soldCount={p.sold_count}
                />
              </Link>
            </li>
          );
        })}
      </ul>
      {products.length === 0 ? (
        <div className="editorial-card mt-8 p-8 text-center">
          <p className="text-lg font-semibold">No products match these filters.</p>
          <p className="mt-2 text-sm text-secondary">
            Adjust the price range, change category, or search a broader term.
          </p>
        </div>
      ) : null}
    </main>
  );
}
