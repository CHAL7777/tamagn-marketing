import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { RemoveWishlistButton } from "@/components/wishlist/RemoveWishlistButton";
import { publicStorageUrl } from "@/lib/storage-url";

export default async function BuyerWishlistPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("wishlist_items")
    .select("product_id, products ( id, title, price, featured_image_path )")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Wishlist</h1>
      <ul className="mt-6 space-y-3">
        {(rows ?? []).map(
          (r: {
            product_id: string;
            products:
              | { id: string; title: string; price: string; featured_image_path: string | null }
              | null
              | Array<{
                  id: string;
                  title: string;
                  price: string;
                  featured_image_path: string | null;
                }>;
          }) => {
            const p = Array.isArray(r.products) ? r.products[0] : r.products;
            if (!p) return null;
            const img = publicStorageUrl("product-images", p.featured_image_path);
            return (
              <li
                key={r.product_id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
              >
                <Link href={`/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  {img ? (
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
                      <Image src={img} alt="" fill className="object-cover" unoptimized />
                    </span>
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded bg-muted" />
                  )}
                  <span className="truncate font-medium">{p.title}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {Number(p.price).toLocaleString()} ETB
                  </span>
                </Link>
                <RemoveWishlistButton productId={r.product_id} />
              </li>
            );
          }
        )}
      </ul>
      {(rows ?? []).length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Nothing saved yet.{" "}
          <Link href="/products" className="text-primary underline">
            Browse products
          </Link>
        </p>
      ) : null}
    </div>
  );
}
