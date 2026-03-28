import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createPromotion } from "@/app/actions/promotions";
import { Button } from "@/components/ui/button";
import { PayPromotionButton } from "@/components/merchant/PayPromotionButton";

type Props = { searchParams: Promise<{ pay?: string }> };

export default async function MerchantPromotionsPage({ searchParams }: Props) {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const { pay } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Boost &amp; promotions</h1>
      <p className="text-sm text-muted-foreground">
        Create a pending boost, then pay the fee with M-Pesa. After payment the
        promotion becomes active.
      </p>

      {pay ? (
        <div className="mt-6 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Complete payment</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Promotion ID: <span className="font-mono">{pay}</span>
          </p>
          <div className="mt-3">
            <PayPromotionButton promotionId={pay} />
          </div>
        </div>
      ) : null}

      <form action={createPromotion} className="mt-8 space-y-4 border-t pt-8">
        <input type="hidden" name="merchant_id" value={profile.merchant_id} />
        <div>
          <label className="text-sm font-medium">Type</label>
          <select name="promotion_type" className="mt-1 w-full rounded border px-3 py-2 text-sm">
            <option value="store">Store boost</option>
            <option value="product">Product boost</option>
            <option value="featured_merchant">Featured merchant</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Amount paid (ETB)</label>
          <input
            name="amount_paid"
            type="number"
            defaultValue={500}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Ends at</label>
          <input
            name="ends_at"
            type="datetime-local"
            required
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit">Create &amp; continue to payment</Button>
      </form>
    </div>
  );
}
