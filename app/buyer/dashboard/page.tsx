import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function BuyerDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/buyer/dashboard");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Buyer home</h1>
      <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/products"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto justify-start py-6"
          )}
        >
          Browse marketplace
        </Link>
        <Link
          href="/buyer/orders"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto justify-start py-6"
          )}
        >
          Orders &amp; tracking
        </Link>
        <Link
          href="/buyer/profile"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto justify-start py-6"
          )}
        >
          Profile &amp; addresses
        </Link>
        <Link
          href="/choose-role"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto justify-start py-6"
          )}
        >
          Apply as merchant
        </Link>
      </div>
    </div>
  );
}
