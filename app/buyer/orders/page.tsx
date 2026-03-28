import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { OrderStatus } from "@/components/OrderStatus";

export default async function BuyerOrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/buyer/orders");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Your orders</h1>
      <ul className="mt-6 space-y-3">
        {(orders ?? []).map(
          (o: {
            id: string;
            status: string;
            total: string;
            created_at: string;
          }) => (
            <li key={o.id}>
              <Link
                href={`/buyer/order/${o.id}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <span className="font-mono text-xs">{o.id.slice(0, 8)}…</span>
                <OrderStatus status={o.status} />
                <span className="tabular-nums text-sm">
                  {Number(o.total).toLocaleString()} ETB
                </span>
              </Link>
            </li>
          )
        )}
      </ul>
      {(orders ?? []).length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          No orders yet.{" "}
          <Link href="/products" className="text-primary underline">
            Browse products
          </Link>
        </p>
      ) : null}
    </div>
  );
}
