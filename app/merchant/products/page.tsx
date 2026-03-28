import Link from "next/link";
import { redirect } from "next/navigation";
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
    .select("id, title, price, stock, status")
    .eq("merchant_id", profile.merchant_id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your products</h1>
        <Link href="/merchant/add-product" className={cn(buttonVariants())}>
          Add product
        </Link>
      </div>
      <ul className="mt-6 divide-y rounded-lg border">
        {(products ?? []).map(
          (p: {
            id: string;
            title: string;
            price: string;
            stock: number;
            status: string;
          }) => (
            <li
              key={p.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span>
                {p.title}{" "}
                <span className="text-muted-foreground">
                  · {p.status} · stock {p.stock}
                </span>
              </span>
              <span className="tabular-nums">{Number(p.price).toLocaleString()} ETB</span>
            </li>
          )
        )}
      </ul>
      {(products ?? []).length === 0 ? (
        <p className="mt-4 text-muted-foreground">No products yet.</p>
      ) : null}
    </div>
  );
}
