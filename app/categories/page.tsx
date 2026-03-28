import Link from "next/link";
import { getCategories } from "@/lib/queries/products";

export default async function CategoriesPage() {
  const productCats = await getCategories("product");
  const serviceCats = await getCategories("service");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <section className="mt-8">
        <h2 className="text-lg font-medium">Products</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {productCats.map((c) => (
            <li key={c.id}>
              <Link
                href={`/products?category=${encodeURIComponent(c.slug)}`}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-medium">Services</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {serviceCats.map((c) => (
            <li key={c.id}>
              <Link
                href={`/services?category=${encodeURIComponent(c.slug)}`}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
