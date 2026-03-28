import Link from "next/link";
import { getServiceListings } from "@/lib/queries/services";

export default async function ServicesMarketplacePage() {
  const listings = await getServiceListings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Services</h1>
      <p className="text-sm text-muted-foreground">
        Hire verified service providers near you.
      </p>
      <ul className="mt-8 space-y-4">
        {listings.map((row) => {
          const sp = Array.isArray(row.service_providers)
            ? row.service_providers[0]
            : row.service_providers;
          return (
            <li key={row.id}>
              <Link
                href={`/services/${row.id}`}
                className="block rounded-xl border p-4 hover:border-primary/40"
              >
                <h2 className="font-medium">{row.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {sp?.business_name} · Trust{" "}
                  {Number(sp?.trust_score ?? 0).toFixed(1)}
                </p>
                <p className="mt-2 line-clamp-2 text-sm">{row.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {row.price_min && row.price_max
                    ? `${row.price_min} – ${row.price_max} ETB`
                    : "Request quote"}
                  {row.prepaid_escrow ? " · Prepaid escrow available" : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      {listings.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No services listed yet.</p>
      ) : null}
    </div>
  );
}
