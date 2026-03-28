import Link from "next/link";
import { redirect } from "next/navigation";
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
    .select("id, status, total, escrow_released, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Orders &amp; escrow</h1>
      <ul className="mt-6 divide-y rounded-lg border">
        {(orders ?? []).map(
          (o: {
            id: string;
            status: string;
            total: string;
            escrow_released: boolean;
          }) => (
            <li key={o.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              <span className="font-mono text-xs">{o.id.slice(0, 8)}…</span>
              <OrderStatus status={o.status} />
              <span className="tabular-nums">{Number(o.total).toLocaleString()} ETB</span>
              <span className="text-xs text-muted-foreground">
                escrow: {o.escrow_released ? "released" : "held"}
              </span>
              <Link href={`/buyer/order/${o.id}`} className="text-xs text-primary underline">
                View
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
