import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { MerchantOrderActions } from "@/components/merchant/MerchantOrderActions";

export default async function MerchantOrdersPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .eq("merchant_id", profile.merchant_id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Incoming orders</h1>
      <ul className="mt-6 space-y-3">
        {(orders ?? []).map(
          (o: {
            id: string;
            status: string;
            total: string;
            created_at: string;
          }) => (
            <li key={o.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs">{o.id.slice(0, 8)}…</span>
                <span className="text-sm">{o.status}</span>
              </div>
              <p className="mt-1 text-sm tabular-nums">
                {Number(o.total).toLocaleString()} ETB
              </p>
              <MerchantOrderActions orderId={o.id} status={o.status} />
            </li>
          )
        )}
      </ul>
      {(orders ?? []).length === 0 ? (
        <p className="mt-4 text-muted-foreground">No orders yet.</p>
      ) : null}
    </div>
  );
}
