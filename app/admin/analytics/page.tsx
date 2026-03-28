import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
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

  const { count: completed } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">System analytics</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Completed orders (snapshot):{" "}
        <span className="font-mono text-foreground">{completed ?? 0}</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Extend with revenue queries, delivery KPIs, and promotion income from SQL
        or Metabase.
      </p>
    </div>
  );
}
