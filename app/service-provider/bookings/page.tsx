import Link from "next/link";
import { BookCheck, CircleCheck, Hourglass, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { OrderStatus } from "@/components/OrderStatus";
import { ServiceBookingActions } from "@/components/service-provider/ServiceBookingActions";

export default async function ServiceProviderBookingsPage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        No service provider profile linked.
      </p>
    );
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("service_listings")
    .select("id")
    .eq("service_provider_id", profile.service_provider_id);
  const ids = (listings ?? []).map((l: { id: string }) => l.id);
  if (ids.length === 0) {
    return (
      <p className="p-8 text-center text-muted-foreground">No listings yet.</p>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, service_listing_id, created_at")
    .eq("order_type", "service")
    .in("service_listing_id", ids)
    .order("created_at", { ascending: false })
    .limit(40);

  const orderRows = orders ?? [];
  const awaitingPaymentCount = orderRows.filter((order) => order.status === "awaiting_payment").length;
  const activeCount = orderRows.filter((order) => order.status === "paid_escrow").length;
  const completedCount = orderRows.filter((order) => order.status === "completed").length;
  const bookedRevenue = orderRows.reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Prepaid bookings</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Manage paid service orders from start to buyer confirmation.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Once work is complete, mark the booking finished so the buyer can confirm and release escrow.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard icon={Hourglass} label="Awaiting payment" value={awaitingPaymentCount} />
          <MetricCard icon={BookCheck} label="In progress" value={activeCount} />
          <MetricCard icon={CircleCheck} label="Completed" value={completedCount} />
          <MetricCard icon={Wallet} label="Booked value" value={`ETB ${bookedRevenue.toLocaleString()}`} />
        </div>
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Service bookings</h2>
        </div>
        <ul className="divide-y divide-border/70">
        {orderRows.map(
          (o: {
            id: string;
            status: string;
            total: string;
            service_listing_id: string;
          }) => (
            <li key={o.id} className="px-6 py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <OrderStatus status={o.status} />
                <span className="tabular-nums">{Number(o.total).toLocaleString()} ETB</span>
              </div>
              <Link href={`/buyer/order/${o.id}`} className="mt-2 inline-block text-xs text-primary underline">
                View order
              </Link>
              <div className="mt-3">
                <ServiceBookingActions orderId={o.id} status={o.status} />
              </div>
            </li>
          )
        )}
        </ul>
        {orderRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-secondary">No bookings yet.</div>
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
  icon: typeof Hourglass;
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
