import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/auth";
import { MerchantApplyForm } from "@/components/auth/MerchantApplyForm";
import { MaterialIconImage } from "@/components/marketing/MaterialIconImage";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default async function ChooseRolePage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/choose-role");

  const profile = await getProfile();
  if (profile?.role === "merchant" || profile?.role === "admin") {
    redirect("/merchant/dashboard");
  }
  if (profile?.role === "service_provider") {
    redirect("/service-provider/dashboard");
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold tracking-[-0.04em]">Your path</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Shop as a buyer or apply to sell as a verified merchant.
      </p>
      <div className="mt-8 space-y-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-surface-container-lowest shadow-[var(--panel-shadow)]">
          <div className="flex items-center justify-center gap-3 border-b border-border/60 bg-surface-container-low/50 px-4 py-5">
            <MaterialIconImage icon="shoppingCart" alt="Shopping cart" size={48} />
            <MaterialIconImage icon="person" alt="Buyer account" size={48} />
          </div>
          <div className="p-5">
            <h2 className="font-semibold text-foreground">Continue as buyer</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse products, track orders, and pay with M-Pesa escrow.
            </p>
            <Link
              href="/buyer/dashboard"
              className={cn(buttonVariants(), "mt-4 inline-flex")}
            >
              Go to buyer home
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-surface-container-lowest shadow-[var(--panel-shadow)]">
          <div className="flex items-center justify-center gap-3 border-b border-border/60 bg-surface-container-low/50 px-4 py-5">
            <MaterialIconImage icon="storefront" alt="Storefront" size={48} />
            <MaterialIconImage icon="verifiedUser" alt="Verified merchant" size={48} />
          </div>
          <div className="p-5">
            <h2 className="font-semibold text-foreground">Apply as merchant</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform admins verify every shop before you can list products.
            </p>
            <div className="mt-4">
              <MerchantApplyForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
