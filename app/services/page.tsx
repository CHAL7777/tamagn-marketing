import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness } from "lucide-react";
import { getCategories } from "@/lib/queries/products";
import { getServiceListings } from "@/lib/queries/services";
import { getCurrentLocale } from "@/lib/i18n/server";
import {
  getDictionary,
  numberLocale,
  translateCategoryLabel,
} from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

type Search = { category?: string };

export default async function ServicesMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const [sp, locale] = await Promise.all([searchParams, getCurrentLocale()]);
  const dictionary = getDictionary(locale);
  const countFormat = new Intl.NumberFormat(numberLocale(locale));
  const trustFormat = new Intl.NumberFormat(numberLocale(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const [categories, listings] = await Promise.all([
    getCategories("service"),
    getServiceListings(sp.category),
  ]);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <span className="tamagn-chip bg-surface-container-low text-secondary">
            <BriefcaseBusiness className="size-4 text-primary" />
            {dictionary.services.badge}
          </span>
          <h1 className="mt-4 font-headline text-4xl font-extrabold tracking-[-0.06em] md:text-6xl">
            {dictionary.services.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-secondary">
            {dictionary.services.description}
          </p>
        </div>
        <div className="section-shell bg-surface-container-lowest">
          <p className="section-kicker">{dictionary.services.listingsAvailable}</p>
          <p className="mt-3 text-4xl font-black tracking-[-0.05em]">
            {countFormat.format(listings.length)}
          </p>
          <Link href="/service-provider/add-service" className="eyebrow-link mt-5">
            {dictionary.services.publishService}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <div className="chip-scroll mt-8 gap-3">
        <Link
          href="/services"
          className={cn(
            "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            !sp.category
              ? "bg-primary text-on-primary shadow-[0_18px_36px_rgba(1,110,0,0.16)]"
              : "bg-surface-container-lowest text-secondary shadow-[0_12px_28px_rgba(26,28,28,0.04)] hover:bg-surface-container-highest"
          )}
        >
          {dictionary.services.allServices}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/services?category=${encodeURIComponent(c.slug)}`}
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

      <ul className="mt-8 grid gap-5 lg:grid-cols-2">
        {listings.map((row) => {
          const sp = Array.isArray(row.service_providers)
            ? row.service_providers[0]
            : row.service_providers;
          return (
            <li key={row.id}>
              <Link
                href={`/services/${row.id}`}
                className="editorial-card group block border border-transparent p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-[0_24px_56px_rgba(1,110,0,0.08)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold tracking-[-0.04em]">{row.title}</h2>
                  <span className="inline-flex items-center gap-1 rounded-xl bg-primary-fixed px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-on-primary-fixed">
                    <BadgeCheck className="size-3.5" />
                    {dictionary.services.trust}{" "}
                    {trustFormat.format(Number(sp?.trust_score ?? 0))}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-secondary">
                  {sp?.business_name}
                </p>
                <p className="mt-4 line-clamp-2 text-sm leading-7 text-secondary">
                  {row.description}
                </p>
                <p className="mt-5 text-sm font-semibold text-foreground">
                  {row.price_min && row.price_max
                    ? `${countFormat.format(Number(row.price_min))} – ${countFormat.format(Number(row.price_max))} ETB`
                    : dictionary.services.requestQuote}
                  {row.prepaid_escrow ? ` · ${dictionary.services.prepaidEscrow}` : ""}
                </p>
                <span className="eyebrow-link mt-6 transition group-hover:gap-3">
                  {dictionary.services.viewService}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {listings.length === 0 ? (
        <div className="editorial-card mt-10 border border-dashed border-outline-variant/40 bg-surface-container-low/30 p-10 text-center">
          <p className="font-headline text-xl font-bold tracking-[-0.03em]">
            {sp.category
              ? dictionary.services.noCategoryTitle
              : dictionary.services.noServicesTitle}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-secondary">
            {sp.category
              ? dictionary.services.noCategoryBody
              : dictionary.services.noServicesBody}
          </p>
          {sp.category ? (
            <Link
              href="/services"
              className="eyebrow-link mt-6 inline-flex justify-center"
            >
              {dictionary.services.viewAllServices}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
