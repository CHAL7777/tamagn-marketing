import { redirect } from "next/navigation";
import {
  BadgeCheck,
  BookCheck,
  ClipboardList,
  MapPinned,
  UserCircle2,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { updateServiceProviderProfile } from "@/app/actions/business-profiles";
import { Button } from "@/components/ui/button";

export default async function ServiceProviderProfilePage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return (
      <main className="page-shell pb-24 pt-8">
        <div className="editorial-card mx-auto max-w-2xl p-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            No service provider profile linked.
          </h1>
          <p className="mt-4 text-sm leading-7 text-secondary">
            Ask an admin to link your account before editing provider details.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const [providerResult, listingsResult, listingIdsResult, reviewsResult] =
    await Promise.all([
      supabase
        .from("service_providers")
        .select("business_name, bio, trust_score, is_active, latitude, longitude")
        .eq("id", profile.service_provider_id)
        .maybeSingle(),
      supabase
        .from("service_listings")
        .select("id", { count: "exact", head: true })
        .eq("service_provider_id", profile.service_provider_id),
      supabase
        .from("service_listings")
        .select("id")
        .eq("service_provider_id", profile.service_provider_id),
      supabase
        .from("reviews")
        .select("rating")
        .eq("service_provider_id", profile.service_provider_id),
    ]);

  const provider = providerResult.data;
  if (!provider) redirect("/service-provider/dashboard");

  const listingRows = listingIdsResult.data ?? [];
  const listingIds = listingRows.map((row) => row.id);

  const [{ count: requestsCount }, { count: bookingsCount }] =
    listingIds.length > 0
      ? await Promise.all([
          supabase
            .from("service_requests")
            .select("id", { count: "exact", head: true })
            .in("service_listing_id", listingIds),
          supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .in("service_listing_id", listingIds),
        ])
      : [{ count: 0 }, { count: 0 }];

  const averageRating =
    (reviewsResult.data ?? []).length > 0
      ? (reviewsResult.data ?? []).reduce((sum, row) => sum + Number(row.rating ?? 0), 0) /
        (reviewsResult.data ?? []).length
      : 0;

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="editorial-card p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-18 items-center justify-center rounded-[1.5rem] bg-primary-fixed text-on-primary-fixed shadow-[0_18px_36px_rgba(69,227,53,0.2)]">
              <UserCircle2 className="size-8" />
            </span>
            <div>
              <p className="section-kicker">Provider profile</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.05em]">
                {provider.business_name}
              </h1>
              <p className="mt-2 text-sm text-secondary">
                Trust score {Number(provider.trust_score ?? 0).toFixed(1)}
                {provider.is_active ? " · Active" : " · Inactive"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-surface-container-low p-5">
            <span className="tamagn-chip bg-primary-fixed text-on-primary-fixed">
              <BadgeCheck className="size-4" />
              Service trust visibility
            </span>
            <p className="mt-4 text-sm leading-7 text-secondary">
              Buyers discover you through listing quality, response speed, and successful
              prepaid delivery. Keep this profile complete so your service pages stay credible.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            icon={Wrench}
            label="Listings"
            value={listingsResult.count ?? 0}
            helper="Published services"
          />
          <MetricCard
            icon={ClipboardList}
            label="Requests"
            value={requestsCount ?? 0}
            helper="Buyer inquiries received"
          />
          <MetricCard
            icon={BookCheck}
            label="Bookings"
            value={bookingsCount ?? 0}
            helper="Escrow-backed service orders"
          />
          <MetricCard
            icon={BadgeCheck}
            label="Avg rating"
            value={averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            helper={`${reviewsResult.data?.length ?? 0} reviews received`}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="editorial-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
              <MapPinned className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-[-0.03em]">Public provider details</h2>
              <p className="text-sm text-secondary">
                Update the core information buyers use before they request work.
              </p>
            </div>
          </div>

          <form action={updateServiceProviderProfile} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Business name</label>
              <input
                name="business_name"
                required
                defaultValue={provider.business_name}
                className="mt-1 tamagn-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea
                name="bio"
                rows={5}
                defaultValue={provider.bio ?? ""}
                className="mt-1 tamagn-textarea"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Latitude</label>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  defaultValue={provider.latitude ?? ""}
                  className="mt-1 tamagn-field"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Longitude</label>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  defaultValue={provider.longitude ?? ""}
                  className="mt-1 tamagn-field"
                />
              </div>
            </div>
            <Button type="submit">Save provider profile</Button>
          </form>
        </section>

        <section className="section-shell">
          <p className="section-kicker">Provider operations</p>
          <ul className="mt-4 space-y-4 text-sm leading-7 text-secondary">
            <li>Use concise pricing ranges so buyers can decide when to request a quote.</li>
            <li>Move prepaid bookings forward as soon as work is complete so buyers can confirm.</li>
            <li>Trust score improves over time when booked work finishes successfully and reviews arrive.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof UserCircle2;
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <div className="metric-card">
      <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-5 section-kicker">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{value}</p>
      <p className="mt-2 text-sm text-secondary">{helper}</p>
    </div>
  );
}
