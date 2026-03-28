import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
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

  const { count: orders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });
  const { count: merchants } = await supabase
    .from("merchants")
    .select("*", { count: "exact", head: true });
  const { count: products } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  const { count: pendingApps } = await supabase
    .from("merchant_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders" value={orders ?? 0} />
        <Stat label="Merchants" value={merchants ?? 0} />
        <Stat label="Products" value={products ?? 0} />
        <Stat label="Pending applications" value={pendingApps ?? 0} />
      </div>
      <ul className="mt-10 space-y-2 text-sm">
        <li>
          <Link href="/admin/merchants" className="text-primary underline">
            Merchant applications
          </Link>
        </li>
        <li>
          <Link href="/admin/products" className="text-primary underline">
            Product moderation
          </Link>
        </li>
        <li>
          <Link href="/admin/orders" className="text-primary underline">
            Orders &amp; escrow
          </Link>
        </li>
        <li>
          <Link href="/admin/analytics" className="text-primary underline">
            Analytics
          </Link>
        </li>
        <li>
          <Link href="/admin/disputes" className="text-primary underline">
            Disputes
          </Link>
        </li>
        <li>
          <Link href="/admin/logistics" className="text-primary underline">
            Logistics (assign courier)
          </Link>
        </li>
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
