import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Boxes, ChartColumn, Megaphone, ShoppingCart } from "lucide-react";
import type { ComponentType } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export default async function MerchantDashboardPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const [{ count: products }, { count: orders }, merchantResult, revenueResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("merchant_id", profile.merchant_id),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("merchant_id", profile.merchant_id),
      supabase
        .from("merchants")
        .select("business_name, trust_score, verification_badge")
        .eq("id", profile.merchant_id)
        .maybeSingle(),
      supabase
        .from("orders")
        .select("total, status")
        .eq("merchant_id", profile.merchant_id),
    ]);

  const merchant = merchantResult.data;
  const revenue = (revenueResult.data ?? [])
    .filter((row) => row.status !== "cancelled")
    .reduce((sum, row) => sum + Number(row.total ?? 0), 0);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <div className="editorial-card relative overflow-hidden bg-primary p-8 text-on-primary shadow-[0_28px_58px_rgba(1,110,0,0.2)] lg:col-span-1">
          <div className="absolute -bottom-20 -right-16 size-52 rounded-full bg-white/10 blur-3xl" />
          <p className="section-kicker text-primary-fixed">Store revenue</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.07em]">
            ETB {revenue.toLocaleString()}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
            Monitor product performance, order flow, and promotions from one
            merchant workspace.
          </p>
        </div>
        <MetricCard label="Active products" value={products ?? 0} icon={Boxes} />
        <MetricCard label="Orders" value={orders ?? 0} icon={ShoppingCart} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          href="/merchant/products"
          icon={Boxes}
          title="Inventory"
          body="Add products, manage stock, and keep active listings visible."
        />
        <ActionCard
          href="/merchant/orders"
          icon={ShoppingCart}
          title="Orders"
          body="Confirm orders, monitor payment state, and follow fulfillment."
        />
        <ActionCard
          href="/merchant/analytics"
          icon={ChartColumn}
          title="Analytics"
          body="Review sales patterns and merchant performance trends."
        />
        <ActionCard
          href="/merchant/promotions"
          icon={Megaphone}
          title="Promotions"
          body="Boost product or store visibility through promotion workflows."
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="section-shell">
          <p className="section-kicker">Merchant profile</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em]">
            {merchant?.business_name ?? "Verified merchant"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-secondary">
            Trust score {Number(merchant?.trust_score ?? 0).toFixed(1)}
            {merchant?.verification_badge ? " · Tamagn verified" : ""}
          </p>
        </div>
        <div className="editorial-card p-6">
          <span className="trust-badge">
            <BadgeCheck className="size-3.5" />
            Merchant trust active
          </span>
          <p className="mt-5 text-sm leading-7 text-secondary">
            Verified merchant onboarding is one of the platform’s core safety
            rules. Keep product details and fulfillment quality accurate to
            preserve buyer confidence and review performance.
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
