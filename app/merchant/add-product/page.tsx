import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getCategories } from "@/lib/queries/products";
import { createProduct } from "@/app/actions/merchant-products";
import { Button } from "@/components/ui/button";

export default async function AddProductPage() {
  const profile = await getProfile();
  if (!profile?.merchant_id) redirect("/choose-role");

  const categories = await getCategories("product");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Add product</h1>
      <form action={createProduct} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Price (ETB)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Stock</label>
          <input
            name="stock"
            type="number"
            defaultValue={0}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            name="category_id"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Publish</Button>
      </form>
    </div>
  );
}
