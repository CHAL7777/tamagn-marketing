import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export default async function MerchantAnalyticsPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const { count: completed } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", profile.merchant_id)
    .eq("status", "completed");

  const { data: topSkus } = await supabase
    .from("products")
    .select("title, sold_count")
    .eq("merchant_id", profile.merchant_id)
    .order("sold_count", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="mt-4 text-sm">
        Completed orders:{" "}
        <span className="font-semibold tabular-nums">{completed ?? 0}</span>
      </p>
      <h2 className="mt-8 text-sm font-medium">Top SKUs by units sold</h2>
      <ul className="mt-2 text-xs text-muted-foreground">
        {(topSkus ?? []).map((p: { title: string; sold_count: number }) => (
          <li key={p.title}>
            {p.title} — {p.sold_count} sold
          </li>
        ))}
      </ul>
    </div>
  );
}
