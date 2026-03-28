import Link from "next/link";
import { CircleDollarSign, CirclePlus, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export default async function ServiceProviderServicesPage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return <p className="p-8 text-center text-sm text-muted-foreground">No provider profile.</p>;
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("service_listings")
    .select("id, title, price_min, price_max, prepaid_escrow, created_at")
    .eq("service_provider_id", profile.service_provider_id);

  const listingRows = listings ?? [];
  const prepaidCount = listingRows.filter((listing) => listing.prepaid_escrow).length;
  const pricedCount = listingRows.filter((listing) => listing.price_min || listing.price_max).length;

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Service catalog</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Manage your public services and pricing ranges.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Listings should stay current so buyers understand whether a quote or prepaid booking is expected.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={Wrench} label="Listings" value={listingRows.length} />
          <MetricCard icon={CircleDollarSign} label="Priced" value={pricedCount} />
          <MetricCard icon={CirclePlus} label="Prepaid escrow" value={prepaidCount} />
        </div>
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.03em]">My services</h2>
            <p className="text-sm text-secondary">
              Every service page can receive direct requests and, when enabled, prepaid escrow orders.
            </p>
          </div>
          <Link href="/service-provider/add-service" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Add service
          </Link>
        </div>
        <ul className="divide-y divide-border/70">
          {listingRows.map((listing) => (
            <li key={listing.id} className="px-6 py-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{listing.title}</p>
                  <p className="mt-1 text-secondary">
                    {listing.price_min || listing.price_max
                      ? `${listing.price_min ?? "?"} - ${listing.price_max ?? "?"} ETB`
                      : "Quote-based pricing"}
                    {listing.prepaid_escrow ? " · prepaid escrow" : ""}
                  </p>
                  <p className="mt-1 text-xs text-secondary">
                    Created {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/services/${listing.id}`}
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  View service
                </Link>
              </div>
            </li>
          ))}
        </ul>
        {listingRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-secondary">
            No services published yet.
          </div>
        ) : null}
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wrench;
  label: string;
  value: number;
}) {
  return (
    <div className="metric-card">
      <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-5 section-kicker">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}
