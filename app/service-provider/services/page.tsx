import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export default async function ServiceProviderServicesPage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return <p className="p-8 text-center text-sm text-muted-foreground">No provider profile.</p>;
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("service_listings")
    .select("id, title, price_min, price_max")
    .eq("service_provider_id", profile.service_provider_id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">My services</h1>
      <ul className="mt-6 space-y-2">
        {(listings ?? []).map(
          (l: {
            id: string;
            title: string;
            price_min: string | null;
            price_max: string | null;
          }) => (
            <li key={l.id}>
              <Link href={`/services/${l.id}`} className="block rounded border p-3 text-sm hover:bg-muted/50">
                {l.title}{" "}
                <span className="text-muted-foreground">
                  {l.price_min}–{l.price_max} ETB
                </span>
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
