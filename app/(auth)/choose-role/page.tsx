import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/auth";
import { MerchantApplyForm } from "@/components/auth/MerchantApplyForm";
import { Button, buttonVariants } from "@/components/ui/button";
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
      <h1 className="text-2xl font-semibold tracking-tight">Your path</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Shop as a buyer or apply to sell as a verified merchant.
      </p>
      <div className="mt-8 space-y-8">
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Continue as buyer</h2>
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
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Apply as merchant</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform admins verify every shop before you can list products.
          </p>
          <div className="mt-4">
            <MerchantApplyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
