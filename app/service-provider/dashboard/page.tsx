import Link from "next/link";
import type { ComponentType } from "react";
import {
  BadgeCheck,
  BookCheck,
  CirclePlus,
  ClipboardList,
  UserCircle2,
  Wrench,
} from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ServiceProviderDashboardPage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return (
      <main className="page-shell pb-24 pt-8">
        <div className="editorial-card mx-auto max-w-2xl p-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            Service provider profile not linked yet.
          </h1>
          <p className="mt-4 text-sm leading-7 text-secondary">
            Ask an admin to connect your account to a service-provider profile
            so listings, bookings, and requests can be managed from this
            dashboard.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const { count: listingsCount } = await supabase
    .from("service_listings")
    .select("id", { count: "exact", head: true })
    .eq("service_provider_id", profile.service_provider_id);

  const { data: listingRows } = await supabase
    .from("service_listings")
    .select("id")
    .eq("service_provider_id", profile.service_provider_id);

  const listingIds = (listingRows ?? []).map((row) => row.id);
  let requestsCount = 0;
  let bookingsCount = 0;

  if (listingIds.length > 0) {
    const [{ count: requests }, { count: bookings }] = await Promise.all([
      supabase
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .in("service_listing_id", listingIds),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("service_listing_id", listingIds),
    ]);
    requestsCount = requests ?? 0;
    bookingsCount = bookings ?? 0;
  }

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <div className="section-shell">
          <p className="section-kicker">Service workspace</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Manage bookings, requests, and your public service profile.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            This workspace covers listings, prepaid escrow bookings, direct
            service requests, and provider-facing operations.
          </p>
        </div>
        <MetricCard label="Listings" value={listingsCount ?? 0} icon={Wrench} />
        <MetricCard label="Bookings" value={bookingsCount} icon={BookCheck} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          href="/service-provider/services"
          icon={Wrench}
          title="My listings"
          body="Review your public services, pricing, and availability areas."
        />
        <ActionCard
          href="/service-provider/add-service"
          icon={CirclePlus}
          title="Add service"
          body="Publish a new offering with pricing and portfolio details."
        />
        <ActionCard
          href="/service-provider/bookings"
          icon={BookCheck}
          title="Prepaid bookings"
          body="Track orders that require M-Pesa escrow before work begins."
        />
        <ActionCard
          href="/service-provider/requests"
          icon={ClipboardList}
          title="Incoming requests"
          body={`Handle ${requestsCount} service requests from buyers.`}
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <ActionCard
          href="/service-provider/profile"
          icon={UserCircle2}
          title="Profile"
          body="Update your provider profile, bio, and trust-related information."
        />
        <div className="editorial-card p-6">
          <span className="trust-badge">
            <BadgeCheck className="size-3.5" />
            Trust-based service delivery
          </span>
          <p className="mt-5 text-sm leading-7 text-secondary">
            Service providers are part of the same trust framework as
            merchants: verified onboarding, visible reputation, and order flows
            that keep buyers protected.
          </p>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
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

function ActionCard({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="editorial-card p-6 transition hover:-translate-y-1">
      <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-5 text-xl font-bold tracking-[-0.03em]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-secondary">{body}</p>
    </Link>
  );
}
