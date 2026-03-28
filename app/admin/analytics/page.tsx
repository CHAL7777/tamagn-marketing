import { redirect } from "next/navigation";
import { BarChart3, CircleAlert, Handshake, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
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

  const [ordersResult, disputesCount, merchantsCount, promotionsResult] = await Promise.all([
    supabase.from("orders").select("total, status"),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "under_review"]),
    supabase.from("merchants").select("id", { count: "exact", head: true }),
    supabase.from("promotions").select("amount_paid, status"),
  ]);

  const orders = ordersResult.data ?? [];
  const grossMerchandiseValue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const completed = orders.filter((order) => order.status === "completed").length;
  const disputed = orders.filter((order) => order.status === "disputed").length;
  const promotionRevenue = (promotionsResult.data ?? [])
    .filter((promotion) => promotion.status === "active" || promotion.status === "pending")
    .reduce((sum, promotion) => sum + Number(promotion.amount_paid ?? 0), 0);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">System analytics</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Platform health across revenue, trust, and operations.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            These figures summarize commerce volume, marketplace risk, and merchant supply.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard icon={Wallet} label="GMV" value={`ETB ${grossMerchandiseValue.toLocaleString()}`} />
          <MetricCard icon={BarChart3} label="Completed orders" value={completed} />
          <MetricCard icon={CircleAlert} label="Open risk" value={disputesCount.count ?? 0} />
          <MetricCard icon={Handshake} label="Active merchants" value={merchantsCount.count ?? 0} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="editorial-card p-6">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Commerce snapshot</h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-low px-4 py-3">
              <dt className="text-secondary">Disputed orders</dt>
              <dd className="font-semibold tabular-nums">{disputed}</dd>
            </div>
            <div className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-low px-4 py-3">
              <dt className="text-secondary">Cancelled orders</dt>
              <dd className="font-semibold tabular-nums">
                {orders.filter((order) => order.status === "cancelled").length}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-low px-4 py-3">
              <dt className="text-secondary">Promotion revenue</dt>
              <dd className="font-semibold tabular-nums">
                ETB {promotionRevenue.toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
        <div className="section-shell">
          <p className="section-kicker">Interpretation</p>
          <p className="mt-3 text-sm leading-7 text-secondary">
            Rising GMV without matching dispute growth usually indicates the trust model is holding.
            If open disputes rise alongside failed promotions or stalled logistics, the bottleneck is
            operational rather than purely commercial.
          </p>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: number | string;
}) {
  return (
    <div className="metric-card">
      <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-5 section-kicker">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}
