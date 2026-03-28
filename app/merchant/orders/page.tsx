import { redirect } from "next/navigation";
import { CircleCheck, PackageCheck, ShoppingCart, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { OrderStatus } from "@/components/OrderStatus";
import { MerchantOrderActions } from "@/components/merchant/MerchantOrderActions";

export default async function MerchantOrdersPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at, order_type, buyer_id, escrow_released")
    .eq("merchant_id", profile.merchant_id)
    .order("created_at", { ascending: false });

  const orderRows = orders ?? [];
  const awaitingAction = orderRows.filter((order) =>
    ["paid_escrow", "merchant_confirmed", "pickup_scheduled"].includes(order.status)
  ).length;
  const deliveredCount = orderRows.filter((order) => order.status === "delivered").length;
  const revenueInFlow = orderRows
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Order control</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Manage payment, fulfillment, and courier handoff.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            This queue is where merchant-side delivery workflow starts. Advance orders only
            when stock is ready and handoff to the platform is real.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard icon={ShoppingCart} label="Orders" value={orderRows.length} />
          <MetricCard icon={PackageCheck} label="Awaiting action" value={awaitingAction} />
          <MetricCard icon={CircleCheck} label="Delivered" value={deliveredCount} />
          <MetricCard
            icon={Wallet}
            label="Revenue in flow"
            value={`ETB ${revenueInFlow.toLocaleString()}`}
          />
        </div>
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Incoming orders</h2>
          <p className="text-sm text-secondary">
            Recent orders are ordered newest first. Merchant actions update the shared
            buyer and courier timelines.
          </p>
        </div>
        <ul className="divide-y divide-border/70">
          {orderRows.map((order) => (
            <li key={order.id} className="px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-secondary">{order.id}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <OrderStatus status={order.status} />
                    <span className="text-xs uppercase tracking-[0.16em] text-secondary">
                      {order.order_type}
                    </span>
                    <span className="text-xs text-secondary">
                      escrow {order.escrow_released ? "released" : "held"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-secondary">
                    Buyer {order.buyer_id.slice(0, 8)} · {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    {Number(order.total).toLocaleString()} ETB
                  </p>
                  <MerchantOrderActions orderId={order.id} status={order.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
        {orderRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-secondary">
            No incoming orders yet.
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
  icon: typeof ShoppingCart;
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
