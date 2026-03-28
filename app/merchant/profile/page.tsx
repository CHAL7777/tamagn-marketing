import { redirect } from "next/navigation";
import { BadgeCheck, Boxes, MapPinned, Megaphone, Store, Wallet } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateMerchantProfile } from "@/app/actions/business-profiles";
import { Button } from "@/components/ui/button";

export default async function MerchantProfilePage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const [merchantResult, productsCount, ordersResult, promotionsCount, reviewsResult] =
    await Promise.all([
      supabase
        .from("merchants")
        .select(
          "business_name, description, location_label, latitude, longitude, trust_score, verification_badge, is_active"
        )
        .eq("id", profile.merchant_id)
        .maybeSingle(),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("merchant_id", profile.merchant_id),
      supabase
        .from("orders")
        .select("total, status")
        .eq("merchant_id", profile.merchant_id),
      supabase
        .from("promotions")
        .select("id", { count: "exact", head: true })
        .eq("merchant_id", profile.merchant_id),
      supabase
        .from("reviews")
        .select("rating")
        .eq("merchant_id", profile.merchant_id),
    ]);

  const merchant = merchantResult.data;
  if (!merchant) redirect("/merchant/dashboard");

  const revenue = (ordersResult.data ?? [])
    .filter((row) => row.status !== "cancelled")
    .reduce((sum, row) => sum + Number(row.total ?? 0), 0);
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
              <Store className="size-8" />
            </span>
            <div>
              <p className="section-kicker">Merchant profile</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.05em]">
                {merchant.business_name}
              </h1>
              <p className="mt-2 text-sm text-secondary">
                Trust score {Number(merchant.trust_score ?? 0).toFixed(1)}
                {merchant.verification_badge ? " · Tamagn verified" : ""}
                {merchant.is_active ? " · Active" : " · Inactive"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-surface-container-low p-5">
            <span className="tamagn-chip bg-primary-fixed text-on-primary-fixed">
              <BadgeCheck className="size-4" />
              Verified merchant trust
            </span>
            <p className="mt-4 text-sm leading-7 text-secondary">
              Keep your catalog and business details accurate so buyers see the same
              trust signals on your profile, products, and order history.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            icon={Boxes}
            label="Products"
            value={productsCount.count ?? 0}
            helper="Active catalog items"
          />
          <MetricCard
            icon={Wallet}
            label="Revenue"
            value={`ETB ${revenue.toLocaleString()}`}
            helper="All non-cancelled orders"
          />
          <MetricCard
            icon={Megaphone}
            label="Promotions"
            value={promotionsCount.count ?? 0}
            helper="Boosts and featured placements"
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
              <h2 className="text-xl font-bold tracking-[-0.03em]">Public business details</h2>
              <p className="text-sm text-secondary">
                These fields appear across your merchant profile and marketplace listings.
              </p>
            </div>
          </div>

          <form action={updateMerchantProfile} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Business name</label>
              <input
                name="business_name"
                required
                defaultValue={merchant.business_name}
                className="mt-1 tamagn-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={merchant.description ?? ""}
                className="mt-1 tamagn-textarea"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location label</label>
              <input
                name="location_label"
                defaultValue={merchant.location_label ?? ""}
                placeholder="City / area"
                className="mt-1 tamagn-field"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Latitude</label>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  defaultValue={merchant.latitude ?? ""}
                  className="mt-1 tamagn-field"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Longitude</label>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  defaultValue={merchant.longitude ?? ""}
                  className="mt-1 tamagn-field"
                />
              </div>
            </div>
            <Button type="submit">Save merchant profile</Button>
          </form>
        </section>

        <section className="section-shell">
          <p className="section-kicker">Operational notes</p>
          <ul className="mt-4 space-y-4 text-sm leading-7 text-secondary">
            <li>
              Orders only move smoothly when your location label, stock, and delivery handoff
              details stay current.
            </li>
            <li>
              Promotions increase visibility, but trust score and fulfillment quality still drive
              repeat purchases.
            </li>
            <li>
              If your shop goes inactive, products remain in the database but buyer confidence
              drops immediately.
            </li>
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
  icon: typeof Store;
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
