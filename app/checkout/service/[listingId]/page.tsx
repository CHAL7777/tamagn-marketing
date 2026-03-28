import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createPrepaidServiceOrder } from "@/app/actions/checkout-service";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ listingId: string }> };

export default async function ServiceCheckoutPage({ params }: Props) {
  const user = await getUser();
  if (!user) {
    const { listingId } = await params;
    redirect(`/login?next=/checkout/service/${listingId}`);
  }

  const { listingId } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("service_listings")
    .select(
      "id, title, description, price_min, prepaid_escrow, service_providers ( business_name )"
    )
    .eq("id", listingId)
    .maybeSingle();

  const spRaw = listing?.service_providers;
  const sp = Array.isArray(spRaw) ? spRaw[0] : spRaw;

  if (!listing || !listing.prepaid_escrow) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-sm">
        <p>This listing is not available for prepaid booking.</p>
        <Link href={`/services/${listingId}`} className="mt-4 inline-block text-primary underline">
          Back
        </Link>
      </div>
    );
  }

  const price = Number(listing.price_min ?? 0);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Book service</h1>
      <p className="mt-2 text-sm text-muted-foreground">{listing.title}</p>
      {sp && typeof sp === "object" && "business_name" in sp ? (
        <p className="text-xs text-muted-foreground">
          {(sp as { business_name: string }).business_name}
        </p>
      ) : null}
      <p className="mt-4 text-lg font-semibold tabular-nums">
        {price.toLocaleString()} ETB + platform fee (shown at payment)
      </p>
      <form action={createPrepaidServiceOrder} className="mt-6 space-y-4">
        <input type="hidden" name="listing_id" value={listingId} />
        <Button type="submit">Create order &amp; pay with M-Pesa</Button>
      </form>
      <Link
        href={`/services/${listingId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-4 inline-flex")}
      >
        Cancel
      </Link>
    </div>
  );
}
