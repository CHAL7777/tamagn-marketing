import { redirect } from "next/navigation";
import { Bike, ClipboardList, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AssignCourierForm } from "@/components/admin/AssignCourierForm";

export default async function AdminLogisticsPage() {
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

  const [couriersResult, candidateOrdersResult, assignmentsResult] = await Promise.all([
    supabase
      .from("couriers")
      .select("id, user_id, vehicle_info, is_active")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, status, total, created_at")
      .in("status", ["merchant_confirmed", "pickup_scheduled", "collected", "in_transit"])
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("delivery_assignments")
      .select("id, order_id, courier_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const couriers = couriersResult.data ?? [];
  const candidateOrders = candidateOrdersResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const assignedOrderIds = new Set(assignments.map((assignment) => assignment.order_id));
  const unassignedOrders = candidateOrders.filter((order) => !assignedOrderIds.has(order.id));

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Logistics control</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Assign couriers and watch delivery operations in one queue.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Orders appear here once merchant-side fulfillment reaches handoff status.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={Bike} label="Couriers" value={couriers.length} />
          <MetricCard icon={ClipboardList} label="Unassigned" value={unassignedOrders.length} />
          <MetricCard icon={Truck} label="Assignments" value={assignments.length} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="editorial-card p-6">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Assign courier</h2>
          <p className="mt-2 text-sm text-secondary">
            Pick an order and courier from the current roster, or paste UUIDs directly.
          </p>
          <div className="mt-6">
            <AssignCourierForm
              suggestedOrders={unassignedOrders.map((order) => ({
                id: order.id,
                label: `${order.status} · ${Number(order.total).toLocaleString()} ETB`,
              }))}
              suggestedCouriers={couriers.map((courier) => ({
                id: courier.user_id,
                label: courier.vehicle_info || courier.id,
              }))}
            />
          </div>
        </div>

        <div className="grid gap-6">
          <div className="editorial-card overflow-hidden">
            <div className="border-b border-border/70 px-6 py-5">
              <h2 className="text-xl font-bold tracking-[-0.03em]">Unassigned orders</h2>
            </div>
            <ul className="divide-y divide-border/70">
              {unassignedOrders.map((order) => (
                <li key={order.id} className="px-6 py-4 text-sm">
                  <p className="font-mono text-xs text-secondary">{order.id}</p>
                  <p className="mt-2 font-semibold text-foreground">{order.status}</p>
                  <p className="mt-1 text-secondary">
                    {Number(order.total).toLocaleString()} ETB ·{" "}
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
            {unassignedOrders.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-secondary">
                No unassigned logistics orders right now.
              </div>
            ) : null}
          </div>

          <div className="editorial-card overflow-hidden">
            <div className="border-b border-border/70 px-6 py-5">
              <h2 className="text-xl font-bold tracking-[-0.03em]">Courier roster</h2>
            </div>
            <ul className="divide-y divide-border/70">
              {couriers.map((courier) => (
                <li key={courier.id} className="px-6 py-4 text-sm">
                  <p className="font-mono text-xs text-secondary">{courier.user_id}</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {courier.vehicle_info || "Courier vehicle not specified"}
                  </p>
                  <p className="mt-1 text-secondary">
                    {courier.is_active ? "Active courier" : "Inactive courier"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
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
