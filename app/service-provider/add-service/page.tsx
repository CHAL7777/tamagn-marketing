import { createServiceListing } from "@/app/actions/service-listings";
import { Button } from "@/components/ui/button";

export default function AddServicePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Add service</h1>
      <form action={createServiceListing} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input name="title" required className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" rows={3} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Min price</label>
            <input name="price_min" type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Max price</label>
            <input name="price_max" type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Primary service area</label>
          <input name="area" placeholder="City / zone" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="prepaid_escrow" />
          Allow prepaid escrow
        </label>
        <Button type="submit">Publish</Button>
      </form>
    </div>
  );
}
