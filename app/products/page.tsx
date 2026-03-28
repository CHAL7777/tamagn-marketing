import Link from "next/link";
import { getProducts, getCategories } from "@/lib/queries/products";
import { publicStorageUrl } from "@/lib/storage-url";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { getCurrentLocale } from "@/lib/i18n/server";
import {
  getDictionary,
  numberLocale,
  translateCategoryLabel,
} from "@/lib/i18n/translations";
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
  const [sp, locale] = await Promise.all([searchParams, getCurrentLocale()]);
  const dictionary = getDictionary(locale);
  const countFormat = new Intl.NumberFormat(numberLocale(locale));
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
            {dictionary.products.filterChip}
          </span>
          <h1 className="max-w-4xl font-headline text-4xl font-extrabold tracking-[-0.06em] md:text-6xl">
            {dictionary.products.title}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-secondary">{dictionary.products.description}</p>
        </div>
        <div className="section-shell bg-surface-container-lowest">
          <p className="section-kicker">{dictionary.products.catalogStatus}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-foreground">
            {countFormat.format(products.length)}
          </p>
          <p className="mt-2 text-sm text-secondary">
            {dictionary.products.activeResults}
          </p>
          <Link href="/services" className="eyebrow-link mt-6">
            {dictionary.products.preferService}
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
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-secondary" />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder={dictionary.products.searchPlaceholder}
            className="tamagn-field pl-11"
          />
        </label>
        <input
          name="min"
          type="number"
          defaultValue={sp.min}
          placeholder={dictionary.products.minPlaceholder}
          className="tamagn-field"
        />
        <input
          name="max"
          type="number"
          defaultValue={sp.max}
          placeholder={dictionary.products.maxPlaceholder}
          className="tamagn-field"
        />
        <select
          name="sort"
          defaultValue={sp.sort ?? "popular"}
          className="tamagn-select"
        >
          <option value="popular">{dictionary.products.sortPopular}</option>
          <option value="rating">{dictionary.products.sortRating}</option>
          <option value="price_asc">{dictionary.products.sortPriceAsc}</option>
          <option value="price_desc">{dictionary.products.sortPriceDesc}</option>
        </select>
        {sp.category ? (
          <input type="hidden" name="category" value={sp.category} />
        ) : null}
        {sp.lat ? <input type="hidden" name="lat" value={sp.lat} /> : null}
        {sp.lng ? <input type="hidden" name="lng" value={sp.lng} /> : null}
        {sp.km ? <input type="hidden" name="km" value={sp.km} /> : null}
        <button
          type="submit"
          className={cn(
            buttonVariants({ variant: "default" }),
            "sm:col-span-2 lg:col-span-1 lg:w-auto lg:justify-self-start"
          )}
        >
          {dictionary.products.apply}
        </button>
      </form>

      <div className="chip-scroll mt-6 gap-3">
        <Link
          href="/products"
          className={cn(
            "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            !sp.category
              ? "bg-primary text-on-primary shadow-[0_18px_36px_rgba(1,110,0,0.16)]"
              : "bg-surface-container-lowest text-secondary shadow-[0_12px_28px_rgba(26,28,28,0.04)] hover:bg-surface-container-highest"
          )}
        >
          {dictionary.products.all}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${encodeURIComponent(c.slug)}${
              sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""
            }`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition",
              sp.category === c.slug
                ? "bg-primary text-on-primary shadow-[0_18px_36px_rgba(1,110,0,0.16)]"
                : "bg-surface-container-lowest text-secondary shadow-[0_12px_28px_rgba(26,28,28,0.04)] hover:bg-surface-container-highest"
            )}
          >
            {translateCategoryLabel(c.slug, c.name, locale)}
          </Link>
        ))}
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => {
          const img = publicStorageUrl(
            "product-images",
            p.featured_image_path
          );
          return (
            <li key={p.id}>
              <Link
                href={`/products/${p.id}`}
                className="block rounded-[2rem] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                <ProductCard
                  locale={locale}
                  title={p.title}
                  price={Number(p.price)}
                  imageUrl={img}
                  merchantName={p.merchants?.business_name}
                  trust={Number(p.merchants?.trust_score ?? 0)}
                  verified={Boolean(p.merchants?.verification_badge)}
                  locationLabel={p.merchants?.location_label}
                  distanceKm={p.distance_km ?? null}
                  soldCount={p.sold_count}
                  labels={{
                    verified: dictionary.products.verified,
                    kmAway: dictionary.products.kmAway,
                    sold: dictionary.products.sold,
                    price: dictionary.products.price,
                    view: dictionary.products.view,
                  }}
                />
              </Link>
            </li>
          );
        })}
      </ul>
      {products.length === 0 ? (
        <div className="editorial-card mt-10 border border-dashed border-outline-variant/40 bg-surface-container-low/30 p-10 text-center">
          <p className="font-headline text-xl font-bold tracking-[-0.03em]">
            {dictionary.products.noResultsTitle}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-secondary">
            {dictionary.products.noResultsBody}
          </p>
        </div>
      ) : null}
    </main>
  );
}
