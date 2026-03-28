import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function MerchantDashboardPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const supabase = await createClient();
  const { count: products } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", profile.merchant_id);
  const { count: orders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", profile.merchant_id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Merchant overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Products</p>
          <p className="text-2xl font-semibold">{products ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="text-2xl font-semibold">{orders ?? 0}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/merchant/products" className={cn(buttonVariants())}>
          Products
        </Link>
        <Link href="/merchant/orders" className={cn(buttonVariants({ variant: "outline" }))}>
          Orders
        </Link>
        <Link href="/merchant/analytics" className={cn(buttonVariants({ variant: "outline" }))}>
          Analytics
        </Link>
        <Link href="/merchant/promotions" className={cn(buttonVariants({ variant: "outline" }))}>
          Promotions
        </Link>
      </div>
    </div>
  );
}
