import { redirect } from "next/navigation";
import { Megaphone, Rocket, Wallet } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createPromotion } from "@/app/actions/promotions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PayPromotionButton } from "@/components/merchant/PayPromotionButton";

type Props = { searchParams: Promise<{ pay?: string }> };

export default async function MerchantPromotionsPage({ searchParams }: Props) {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const { pay } = await searchParams;
  const [promotionsResult, productsResult] = await Promise.all([
    supabase
      .from("promotions")
      .select("id, promotion_type, product_id, amount_paid, status, starts_at, ends_at")
      .eq("merchant_id", profile.merchant_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("id, title, status")
      .eq("merchant_id", profile.merchant_id)
      .order("title"),
  ]);

  const promotions = promotionsResult.data ?? [];
  const products = productsResult.data ?? [];
  const productNames = new Map(products.map((product) => [product.id, product.title]));
  const activeCount = promotions.filter((promotion) => promotion.status === "active").length;
  const pendingCount = promotions.filter((promotion) => promotion.status === "pending").length;
  const failedCount = promotions.filter((promotion) => promotion.status === "payment_failed").length;

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Visibility engine</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Boost stores or products with paid promotion slots.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Create a promotion, complete M-Pesa payment, and the campaign switches to active
            once the callback lands successfully.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={Rocket} label="Active" value={activeCount} />
          <MetricCard icon={Wallet} label="Pending payment" value={pendingCount} />
          <MetricCard icon={Megaphone} label="Payment failed" value={failedCount} />
        </div>
      </section>

      {pay ? (
        <div className="editorial-card mt-8 p-6">
          <p className="text-sm font-medium">Complete payment</p>
          <p className="mt-1 text-xs text-secondary">
            Promotion ID: <span className="font-mono">{pay}</span>
          </p>
          <div className="mt-3">
            <PayPromotionButton promotionId={pay} />
          </div>
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form action={createPromotion} className="editorial-card space-y-4 p-6">
          <input type="hidden" name="merchant_id" value={profile.merchant_id} />
          <div>
            <label className="text-sm font-medium">Promotion type</label>
            <select name="promotion_type" className="mt-1 tamagn-select">
              <option value="store">Store boost</option>
              <option value="product">Product boost</option>
              <option value="featured_merchant">Featured merchant</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Product target (for product boost)</label>
            <select name="product_id" className="mt-1 tamagn-select">
              <option value="">No product selected</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title} ({product.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Amount paid (ETB)</label>
            <input
              name="amount_paid"
              type="number"
              defaultValue={500}
              className="mt-1 tamagn-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ends at</label>
            <input
              name="ends_at"
              type="datetime-local"
              required
              className="mt-1 tamagn-field"
            />
          </div>
          <Button type="submit">Create &amp; continue to payment</Button>
        </form>

        <div className="editorial-card overflow-hidden">
          <div className="border-b border-border/70 px-6 py-5">
            <h2 className="text-xl font-bold tracking-[-0.03em]">Promotion history</h2>
            <p className="text-sm text-secondary">
              Pending promotions require STK payment before activation.
            </p>
          </div>
          <ul className="divide-y divide-border/70">
            {promotions.map((promotion) => (
              <li key={promotion.id} className="px-6 py-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {promotion.promotion_type.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-secondary">
                      {promotion.product_id
                        ? productNames.get(promotion.product_id) ?? promotion.product_id
                        : "Store-wide"}
                    </p>
                    <p className="mt-1 text-xs text-secondary">
                      {new Date(promotion.starts_at).toLocaleDateString()} -{" "}
                      {new Date(promotion.ends_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {Number(promotion.amount_paid).toLocaleString()} ETB
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-secondary">
                      {promotion.status}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {promotions.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-secondary">
              No promotions created yet.
            </div>
          ) : null}
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
  icon: typeof Rocket;
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
