import { redirect } from "next/navigation";
import { CircleAlert, PackageSearch, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductModerationButtons } from "@/components/admin/ProductModerationButtons";

export default async function AdminProductsPage() {
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

  const { data: products } = await supabase
    .from("products")
    .select("id, title, status, merchant_id, created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  const productRows = products ?? [];
  const merchantIds = [...new Set(productRows.map((product) => product.merchant_id))];
  const { data: merchants } =
    merchantIds.length > 0
      ? await supabase.from("merchants").select("id, business_name").in("id", merchantIds)
      : { data: [] as { id: string; business_name: string }[] };
  const merchantNameById = new Map((merchants ?? []).map((merchant) => [merchant.id, merchant.business_name]));
  const suspendedCount = productRows.filter((product) => product.status === "suspended").length;
  const activeCount = productRows.filter((product) => product.status === "active").length;

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Product moderation</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Review catalog quality and enforce listing standards.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Suspensions and restores write moderation history and affect marketplace visibility immediately.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={PackageSearch} label="Reviewed" value={productRows.length} />
          <MetricCard icon={ShieldCheck} label="Active" value={activeCount} />
          <MetricCard icon={CircleAlert} label="Suspended" value={suspendedCount} />
        </div>
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Catalog queue</h2>
        </div>
        <ul className="divide-y divide-border/70 text-sm">
          {productRows.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
            >
              <div>
                <p className="font-semibold text-foreground">{product.title}</p>
                <p className="mt-1 text-secondary">
                  {merchantNameById.get(product.merchant_id) ?? product.merchant_id}
                </p>
                <p className="mt-1 text-xs text-secondary">
                  Created {new Date(product.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-secondary">{product.status}</span>
                <ProductModerationButtons productId={product.id} currentStatus={product.status} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PackageSearch;
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
