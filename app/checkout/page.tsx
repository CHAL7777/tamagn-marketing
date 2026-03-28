import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BanknoteArrowDown, MapPin, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import { getUser } from "@/lib/auth";
import { listAddressesForUser } from "@/app/actions/addresses";
import { createClient } from "@/lib/supabase/server";
import { createProductOrder } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { publicStorageUrl } from "@/lib/storage-url";

type Props = {
  searchParams: Promise<{ productId?: string; qty?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const user = await getUser();
  if (!user) redirect("/login?next=/checkout");

  const { productId, qty } = await searchParams;
  if (!productId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p>No product selected.</p>
        <Link href="/products" className="mt-4 inline-block text-primary underline">
          Browse products
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, title, price, stock, status, featured_image_path, merchants ( business_name )"
    )
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.status !== "active") {
    return <p className="p-8 text-center">Product unavailable.</p>;
  }

  const quantity = Math.min(
    product.stock,
    Math.max(1, Number(qty ?? 1))
  );
  const merchant = Array.isArray(product.merchants)
    ? product.merchants[0]
    : product.merchants;
  const imageUrl = publicStorageUrl("product-images", product.featured_image_path);
  const subtotal = Number(product.price) * quantity;

  const addresses = await listAddressesForUser();

  return (
    <main className="page-shell pb-24 pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/products/${productId}`} className="eyebrow-link">
          <ArrowLeft className="size-4" />
          Back to product
        </Link>
        <span className="tamagn-chip bg-surface-container-low text-secondary">
          <ShieldCheck className="size-4 text-primary" />
          Escrow active for this order
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-6">
          <div className="section-shell">
            <p className="section-kicker">Review your order</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em]">
              Secure checkout before delivery and escrow release.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
              The platform documentation requires buyer protection through
              M-Pesa escrow, platform-managed delivery, and confirmation before
              funds are released to the merchant.
            </p>
          </div>

          <div className="editorial-card overflow-hidden">
            <div className="grid gap-5 p-5 md:grid-cols-[150px_1fr] md:p-6">
              <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-surface-container-low">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="150px"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <p className="section-kicker">Order item</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                    {product.title}
                  </h2>
                  <p className="mt-2 text-sm text-secondary">
                    {merchant?.business_name ?? "Verified merchant"} · Quantity{" "}
                    {quantity}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-secondary">
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
                    <Truck className="size-4 text-primary" />
                    Delivery scheduled after confirmation
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
                    <BanknoteArrowDown className="size-4 text-tertiary-container" />
                    Subtotal {subtotal.toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {addresses.length === 0 ? (
            <div className="editorial-card p-6 text-sm">
              <p className="text-base font-semibold">Add a delivery address first.</p>
              <p className="mt-2 leading-7 text-secondary">
                Checkout needs a delivery destination so logistics can be
                assigned and escrow release rules can complete correctly.
              </p>
              <Link
                href="/buyer/profile"
                className={cn(buttonVariants({ variant: "default" }), "mt-5 inline-flex")}
              >
                Manage addresses
              </Link>
            </div>
          ) : (
            <form action={createProductOrder} className="editorial-card space-y-5 p-6">
              <input type="hidden" name="product_id" value={productId} />
              <input type="hidden" name="quantity" value={String(quantity)} />
              <div>
                <p className="section-kicker">Delivery address</p>
                <label className="mt-3 block text-sm font-semibold">
                  Choose destination
                </label>
                <select name="address_id" required className="tamagn-select mt-3">
                  {addresses.map(
                    (a: {
                      id: string;
                      label: string | null;
                      line1: string;
                      city: string;
                    }) => (
                      <option key={a.id} value={a.id}>
                        {(a.label ? `${a.label} — ` : "") + a.line1 + ", " + a.city}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-secondary">
                Delivery fee and platform fee are finalized during order
                creation. You will complete payment with M-Pesa after the order
                is placed.
              </div>
              <Button type="submit" size="lg">
                Place order and continue to payment
              </Button>
            </form>
          )}
        </section>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="editorial-card p-6">
            <p className="section-kicker">Escrow summary</p>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-[1.5rem] bg-surface-container-low p-4">
                <ShieldCheck className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Buyer protection</p>
                  <p className="mt-1 leading-6 text-secondary">
                    Payment remains protected until the buyer confirms delivery.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[1.5rem] bg-surface-container-low p-4">
                <Truck className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Delivery workflow</p>
                  <p className="mt-1 leading-6 text-secondary">
                    Courier assignment and tracking happen inside Tamagn.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[1.5rem] bg-surface-container-low p-4">
                <MapPin className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Address accuracy</p>
                  <p className="mt-1 leading-6 text-secondary">
                    Delivery routing depends on the selected address and optional
                    location coordinates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
