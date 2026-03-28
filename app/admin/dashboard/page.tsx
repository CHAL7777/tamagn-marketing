import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChartColumn,
  Handshake,
  PackageSearch,
  Scale,
  Truck,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  const { count: orders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });
  const { count: merchants } = await supabase
    .from("merchants")
    .select("*", { count: "exact", head: true });
  const { count: products } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  const { count: pendingApps } = await supabase
    .from("merchant_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  const { count: openDisputes } = await supabase
    .from("disputes")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_repeat(3,0.8fr)]">
        <div className="editorial-card relative overflow-hidden bg-primary p-8 text-on-primary shadow-[0_28px_60px_rgba(1,110,0,0.2)] lg:col-span-2">
          <div className="absolute -bottom-20 -right-16 size-64 rounded-full bg-white/10 blur-3xl" />
          <p className="section-kicker text-primary-fixed">Platform overview</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.07em]">
            {orders ?? 0} orders in motion
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82">
            Admin oversight spans merchant approvals, escrow, logistics,
            disputes, moderation, and the platform-wide trust model.
          </p>
        </div>
        <Stat label="Merchants" value={merchants ?? 0} />
        <Stat label="Products" value={products ?? 0} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pending applications" value={pendingApps ?? 0} />
        <Stat label="Open disputes" value={openDisputes ?? 0} />
        <ActionCard
          href="/admin/orders"
          icon={Wallet}
          title="Orders and escrow"
          body="Review platform orders, payment states, and escrow release paths."
        />
        <ActionCard
          href="/admin/analytics"
          icon={ChartColumn}
          title="Analytics"
          body="Inspect platform behavior, growth, and operational performance."
        />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          href="/admin/merchants"
          icon={Handshake}
          title="Merchant approvals"
          body="Approve or reject merchant applications and enforce trust controls."
        />
        <ActionCard
          href="/admin/products"
          icon={PackageSearch}
          title="Product moderation"
          body="Review product quality, merchant catalog issues, and platform compliance."
        />
        <ActionCard
          href="/admin/disputes"
          icon={Scale}
          title="Disputes"
          body="Resolve buyer and merchant issues through platform-managed decisions."
        />
        <ActionCard
          href="/admin/logistics"
          icon={Truck}
          title="Logistics"
          body="Assign couriers and oversee delivery operations across orders."
        />
      </section>

      <div className="mt-8 editorial-card p-6">
        <p className="section-kicker">Control surface</p>
        <p className="mt-3 text-sm leading-7 text-secondary">
          Tamagn’s admin role is responsible for merchant verification,
          platform integrity, dispute handling, and logistics oversight. The
          dashboard is designed around those responsibilities rather than simple
          CRUD views.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <p className="section-kicker">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-[-0.05em] tabular-nums">
        {value}
      </p>
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
