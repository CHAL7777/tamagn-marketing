import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness } from "lucide-react";
import { getServiceListings } from "@/lib/queries/services";

export default async function ServicesMarketplacePage() {
  const listings = await getServiceListings();

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <span className="tamagn-chip bg-surface-container-low text-secondary">
            <BriefcaseBusiness className="size-4 text-primary" />
            Verified service marketplace
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.06em] md:text-6xl">
            Find service providers with visible trust and quote workflows.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-secondary">
            Service discovery is part of the same trusted commerce model:
            verified providers, quote requests, and prepaid bookings when
            escrow is required.
          </p>
        </div>
        <div className="section-shell bg-surface-container-lowest">
          <p className="section-kicker">Listings available</p>
          <p className="mt-3 text-4xl font-black tracking-[-0.05em]">
            {listings.length}
          </p>
          <Link href="/service-provider/add-service" className="eyebrow-link mt-5">
            Publish a service
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <ul className="mt-8 grid gap-5 lg:grid-cols-2">
        {listings.map((row) => {
          const sp = Array.isArray(row.service_providers)
            ? row.service_providers[0]
            : row.service_providers;
          return (
            <li key={row.id}>
              <Link
                href={`/services/${row.id}`}
                className="editorial-card block p-6 transition hover:-translate-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold tracking-[-0.04em]">{row.title}</h2>
                  <span className="inline-flex items-center gap-1 rounded-xl bg-primary-fixed px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-on-primary-fixed">
                    <BadgeCheck className="size-3.5" />
                    Trust{" "}
                    {Number(sp?.trust_score ?? 0).toFixed(1)}
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
                    ? `${row.price_min} – ${row.price_max} ETB`
                    : "Request quote"}
                  {row.prepaid_escrow ? " · Prepaid escrow available" : ""}
                </p>
                <span className="eyebrow-link mt-6">
                  View service
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {listings.length === 0 ? (
        <div className="editorial-card mt-8 p-8 text-center">
          <p className="text-lg font-semibold">No services listed yet.</p>
          <p className="mt-2 text-sm text-secondary">
            Providers can add listings from their service dashboard.
          </p>
        </div>
      ) : null}
    </main>
  );
}
