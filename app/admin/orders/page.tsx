import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, ShieldCheck, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OrderStatus } from "@/components/OrderStatus";

export default async function AdminOrdersPage() {
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

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, escrow_released, created_at, order_type")
    .order("created_at", { ascending: false })
    .limit(50);

  const orderRows = orders ?? [];
  const heldEscrow = orderRows.filter((order) => !order.escrow_released).length;
  const grossValue = orderRows.reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Orders and escrow</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Monitor marketplace money flow and fulfillment state.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            This queue is the shared control plane for buyer protection, merchant payout, and dispute handling.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={ClipboardList} label="Orders" value={orderRows.length} />
          <MetricCard icon={ShieldCheck} label="Escrow held" value={heldEscrow} />
          <MetricCard icon={Wallet} label="Value" value={`ETB ${grossValue.toLocaleString()}`} />
        </div>
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Recent orders</h2>
        </div>
        <ul className="divide-y divide-border/70">
          {orderRows.map((order) => (
            <li key={order.id} className="px-6 py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-secondary">{order.id}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <OrderStatus status={order.status} />
                    <span className="text-xs uppercase tracking-[0.16em] text-secondary">
                      {order.order_type}
                    </span>
                    <span className="text-xs text-secondary">
                      escrow: {order.escrow_released ? "released" : "held"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="tabular-nums font-semibold">
                    {Number(order.total).toLocaleString()} ETB
                  </span>
                  <Link href={`/buyer/order/${order.id}`} className="text-xs font-semibold text-primary underline">
                    View
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardList;
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
