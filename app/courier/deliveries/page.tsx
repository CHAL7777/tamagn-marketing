import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourierDeliveryActions } from "@/components/courier/CourierDeliveryActions";
import { OrderStatus } from "@/components/OrderStatus";

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
        .select("order_id, orders ( id, status, total )")
        .eq("courier_id", courier.id)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">My deliveries</h1>
      <ul className="mt-6 space-y-4">
        {(assignments ?? []).map((a) => {
            const raw = a.orders as
              | { id: string; status: string; total: string }
              | { id: string; status: string; total: string }[]
              | null;
            const o = Array.isArray(raw) ? raw[0] : raw;
            if (!o) return null;
            return (
              <li key={a.order_id} className="rounded-lg border p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <OrderStatus status={o.status} />
                  <span className="tabular-nums text-muted-foreground">
                    {Number(o.total).toLocaleString()} ETB
                  </span>
                </div>
                <Link
                  href={`/buyer/order/${o.id}`}
                  className="mt-2 inline-block text-xs text-primary underline"
                >
                  Order detail
                </Link>
                <div className="mt-3">
                  <CourierDeliveryActions orderId={o.id} status={o.status} />
                </div>
              </li>
            );
          }
        )}
      </ul>
      {(assignments ?? []).length === 0 ? (
        <p className="mt-6 text-muted-foreground">No assignments yet.</p>
      ) : null}
    </div>
  );
}
