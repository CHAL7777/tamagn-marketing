import { redirect } from "next/navigation";
import { BarChart3, Boxes, CircleCheck, TrendingUp, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export default async function MerchantAnalyticsPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const [ordersResult, topSkusResult, productsCount] = await Promise.all([
    supabase
      .from("orders")
      .select("total, status")
      .eq("merchant_id", profile.merchant_id),
    supabase
      .from("products")
      .select("title, sold_count, stock")
      .eq("merchant_id", profile.merchant_id)
      .order("sold_count", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", profile.merchant_id),
  ]);

  const orders = ordersResult.data ?? [];
  const topSkus = topSkusResult.data ?? [];
  const completed = orders.filter((order) => order.status === "completed").length;
  const activeOrders = orders.filter((order) => !["completed", "cancelled"].includes(order.status)).length;
  const grossRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const averageOrderValue = orders.length > 0 ? grossRevenue / orders.length : 0;
  const unitsSold = topSkus.reduce((sum, product) => sum + Number(product.sold_count ?? 0), 0);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Merchant analytics</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Revenue, conversion, and top-selling stock.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Use these signals to decide what to restock, promote, or tighten operationally.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard icon={Wallet} label="Gross revenue" value={`ETB ${grossRevenue.toLocaleString()}`} />
          <MetricCard icon={CircleCheck} label="Completed orders" value={completed} />
          <MetricCard icon={TrendingUp} label="Avg order value" value={`ETB ${averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          <MetricCard icon={Boxes} label="Catalog size" value={productsCount.count ?? 0} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="editorial-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
              <BarChart3 className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-[-0.03em]">Order pipeline</h2>
              <p className="text-sm text-secondary">
                Current snapshot of order throughput and catalog movement.
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 text-sm">
            <div className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-low px-4 py-3">
              <dt className="text-secondary">Active orders</dt>
              <dd className="font-semibold tabular-nums">{activeOrders}</dd>
            </div>
            <div className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-low px-4 py-3">
              <dt className="text-secondary">Units sold</dt>
              <dd className="font-semibold tabular-nums">{unitsSold}</dd>
            </div>
            <div className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-low px-4 py-3">
              <dt className="text-secondary">Cancelled orders</dt>
              <dd className="font-semibold tabular-nums">
                {orders.filter((order) => order.status === "cancelled").length}
              </dd>
            </div>
          </dl>
        </div>

        <div className="editorial-card p-6">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Top SKUs by units sold</h2>
          <ul className="mt-6 space-y-3">
            {topSkus.map((product) => (
              <li
                key={product.title}
                className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-low px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">{product.title}</p>
                  <p className="text-secondary">Stock left: {product.stock}</p>
                </div>
                <span className="font-semibold tabular-nums text-foreground">
                  {product.sold_count} sold
                </span>
              </li>
            ))}
          </ul>
          {topSkus.length === 0 ? (
            <p className="mt-6 text-sm text-secondary">No product sales yet.</p>
          ) : null}
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
