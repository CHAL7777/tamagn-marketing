import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MapPinned, Search, ShoppingBag, Store } from "lucide-react";
import type { ComponentType } from "react";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listAddressesForUser } from "@/app/actions/addresses";

export default async function BuyerDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/buyer/dashboard");

  const supabase = await createClient();
  const [addresses, ordersCount, wishlistCount] = await Promise.all([
    listAddressesForUser(),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", user.id),
    supabase
      .from("wishlist_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="section-shell">
          <p className="section-kicker">Buyer dashboard</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Hello{user.email ? `, ${user.email.split("@")[0]}` : ""}.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Find trusted merchants, manage deliveries, and keep your orders
            moving from escrow payment through confirmation.
          </p>
        </div>
        <div className="editorial-card bg-primary p-7 text-on-primary shadow-[0_28px_54px_rgba(1,110,0,0.2)]">
          <p className="section-kicker text-primary-fixed">Ready today</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em]">
            Browse products and services from verified local sellers.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-primary"
          >
            Open marketplace
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="Orders" value={ordersCount.count ?? 0} />
        <Metric label="Saved items" value={wishlistCount.count ?? 0} />
        <Metric label="Addresses" value={addresses.length} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          href="/products"
          icon={Search}
          title="Browse marketplace"
          body="Explore products with filters, trust signals, and nearby delivery context."
        />
        <ActionCard
          href="/buyer/orders"
          icon={ShoppingBag}
          title="Orders and tracking"
          body="Follow every order state from payment to courier handoff and delivery."
        />
        <ActionCard
          href="/buyer/profile"
          icon={MapPinned}
          title="Profile and addresses"
          body="Manage M-Pesa details, delivery destinations, and account preferences."
        />
        <ActionCard
          href="/choose-role"
          icon={Store}
          title="Apply as merchant"
          body="Start the verified onboarding path if you also want to sell on Tamagn."
        />
      </section>

      <Link href="/buyer/wishlist" className="eyebrow-link mt-8">
        <Heart className="size-4" />
        Open wishlist
      </Link>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <p className="section-kicker">{label}</p>
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
