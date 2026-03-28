import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { listAddressesForUser } from "@/app/actions/addresses";
import { createClient } from "@/lib/supabase/server";
import { createProductOrder } from "@/app/actions/checkout";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    .select("id, title, price, stock, status")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.status !== "active") {
    return <p className="p-8 text-center">Product unavailable.</p>;
  }

  const quantity = Math.min(
    product.stock,
    Math.max(1, Number(qty ?? 1))
  );

  const addresses = await listAddressesForUser();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {product.title} × {quantity} — subtotal approx.{" "}
        {(Number(product.price) * quantity).toLocaleString()} ETB (+ delivery &
        platform fee at confirm).
      </p>

      {addresses.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-4 text-sm">
          <p>Add a delivery address first.</p>
          <Link
            href="/buyer/profile"
            className={cn(buttonVariants(), "mt-3 inline-flex")}
          >
            Manage addresses
          </Link>
        </div>
      ) : (
        <form action={createProductOrder} className="mt-6 space-y-4">
          <input type="hidden" name="product_id" value={productId} />
          <input type="hidden" name="quantity" value={String(quantity)} />
          <label className="block text-sm font-medium">Deliver to</label>
          <select
            name="address_id"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {addresses.map((a: { id: string; label: string | null; line1: string; city: string }) => (
              <option key={a.id} value={a.id}>
                {(a.label ? `${a.label} — ` : "") + a.line1 + ", " + a.city}
              </option>
            ))}
          </select>
          <Button type="submit">Place order &amp; pay</Button>
        </form>
      )}
    </div>
  );
}
