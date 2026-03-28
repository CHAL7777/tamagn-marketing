import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createPromotion } from "@/app/actions/promotions";
import { Button } from "@/components/ui/button";

export default async function MerchantPromotionsPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Boost &amp; promotions</h1>
      <p className="text-sm text-muted-foreground">
        Create a boost record; complete payment via M-Pesa (integrate STK for
        promotion SKU in production).
      </p>
      <form action={createPromotion} className="mt-6 space-y-4">
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
          <label className="text-sm font-medium">Ends at (ISO date)</label>
          <input
            name="ends_at"
            type="datetime-local"
            required
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit">Create promotion record</Button>
      </form>
    </div>
  );
}
