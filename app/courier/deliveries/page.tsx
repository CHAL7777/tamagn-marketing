import Link from "next/link";
import { redirect } from "next/navigation";
import { Bike, CircleCheck, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CourierDeliveryActions } from "@/components/courier/CourierDeliveryActions";
import { OrderStatus } from "@/components/OrderStatus";

type DeliveryAssignmentRow = {
  order_id: string;
  status: string;
  created_at: string;
  orders:
    | { id: string; status: string; total: string }
    | { id: string; status: string; total: string }[]
    | null;
};

export default async function CourierDeliveriesPage() {
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
  if (profile?.role !== "courier" && profile?.role !== "admin") redirect("/");

  const { data: courier } = await supabase
    .from("couriers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!courier && profile?.role === "courier") {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-sm text-muted-foreground">
        <p>No courier profile. Ask an admin to create your courier record.</p>
      </div>
    );
  }

  const { data: assignments } = courier
    ? await supabase
        .from("delivery_assignments")
        .select("order_id, status, created_at, orders ( id, status, total )")
        .eq("courier_id", courier.id)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  const assignmentRows: DeliveryAssignmentRow[] =
    (assignments as DeliveryAssignmentRow[] | null) ?? [];
  const inTransitCount = assignmentRows.filter((assignment) =>
    ["collected", "in_transit"].includes(
      Array.isArray(assignment.orders) ? assignment.orders[0]?.status ?? "" : assignment.orders?.status ?? ""
    )
  ).length;
  const deliveredCount = assignmentRows.filter((assignment) => {
    const order = Array.isArray(assignment.orders) ? assignment.orders[0] : assignment.orders;
    return order?.status === "delivered" || order?.status === "completed";
  }).length;

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Courier workspace</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Advance delivery states from pickup to proof of arrival.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Courier actions update buyer tracking and merchant fulfillment timelines in real time.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={Bike} label="Assignments" value={assignmentRows.length} />
          <MetricCard icon={Truck} label="In transit" value={inTransitCount} />
          <MetricCard icon={CircleCheck} label="Delivered" value={deliveredCount} />
        </div>
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-xl font-bold tracking-[-0.03em]">My deliveries</h2>
        </div>
        <ul className="divide-y divide-border/70">
          {assignmentRows.map((a) => {
            const raw = a.orders as
              | { id: string; status: string; total: string }
              | { id: string; status: string; total: string }[]
              | null;
            const o = Array.isArray(raw) ? raw[0] : raw;
            if (!o) return null;
            return (
              <li key={a.order_id} className="px-6 py-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <OrderStatus status={o.status} />
                  <span className="tabular-nums text-muted-foreground">
                    {Number(o.total).toLocaleString()} ETB
                  </span>
                </div>
                <p className="mt-2 text-xs text-secondary">Assignment {a.status}</p>
                <Link
                  href={`/buyer/order/${o.id}`}
                  className="mt-2 inline-block text-xs font-semibold text-primary underline"
                >
                  Order detail
                </Link>
                <div className="mt-3">
                  <CourierDeliveryActions orderId={o.id} status={o.status} />
                </div>
              </li>
            );
          })}
        </ul>
        {assignmentRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-secondary">
            No assignments yet.
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
  icon: typeof Bike;
  label: string;
  value: number;
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
