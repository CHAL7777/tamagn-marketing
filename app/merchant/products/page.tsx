import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes, CircleAlert, PackageCheck, Plus, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default async function MerchantProductsPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, stock, status, sold_count, created_at")
    .eq("merchant_id", profile.merchant_id)
    .order("created_at", { ascending: false });

  const productRows = products ?? [];
  const activeCount = productRows.filter((product) => product.status === "active").length;
  const draftCount = productRows.filter((product) => product.status === "draft").length;
  const lowStockCount = productRows.filter((product) => product.stock <= 5).length;
  const unitsSold = productRows.reduce((sum, product) => sum + Number(product.sold_count ?? 0), 0);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Catalog operations</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Keep your inventory healthy and visible.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Track listing status, low-stock items, and unit sales from one merchant
            catalog view.
          </p>
        </div>
        <div className="editorial-card bg-primary p-7 text-on-primary shadow-[0_28px_54px_rgba(1,110,0,0.2)]">
          <p className="section-kicker text-primary-fixed">Catalog action</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em]">
            Add new products whenever you have verified stock ready to ship.
          </p>
          <Link
            href="/merchant/add-product"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-primary"
          >
            <Plus className="mr-2 size-4" />
            Add product
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <MetricCard icon={Store} label="Total products" value={productRows.length} />
        <MetricCard icon={PackageCheck} label="Active" value={activeCount} />
        <MetricCard icon={CircleAlert} label="Low stock" value={lowStockCount} />
        <MetricCard icon={Boxes} label="Units sold" value={unitsSold} />
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.03em]">Product list</h2>
            <p className="text-sm text-secondary">
              {activeCount} active, {draftCount} draft, {productRows.length - activeCount - draftCount} suspended.
            </p>
          </div>
          <Link href="/products" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            View public catalog
          </Link>
        </div>
        <ul className="divide-y divide-border/70">
          {productRows.map((product) => (
            <li key={product.id} className="grid gap-3 px-6 py-4 md:grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr] md:items-center">
              <div>
                <p className="font-semibold text-foreground">{product.title}</p>
                <p className="mt-1 text-sm text-secondary">
                  {product.status} · stock {product.stock} · sold {product.sold_count}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground">
                {Number(product.price).toLocaleString()} ETB
              </p>
              <p className="text-sm text-secondary">{new Date(product.created_at).toLocaleDateString()}</p>
              <Link
                href={`/products/${product.id}`}
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                View listing
              </Link>
            </li>
          ))}
        </ul>
        {productRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-secondary">
            No products yet. Publish your first product to start building order volume.
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
  icon: typeof Store;
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
