import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export default async function ServiceProviderRequestsPage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return <p className="p-8 text-center text-sm text-muted-foreground">No provider profile.</p>;
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("service_listings")
    .select("id")
    .eq("service_provider_id", profile.service_provider_id);
  const ids = (listings ?? []).map((l: { id: string }) => l.id);
  const { data: reqs } =
    ids.length > 0
      ? await supabase
          .from("service_requests")
          .select("id, message, status, created_at, service_listing_id")
          .in("service_listing_id", ids)
          .order("created_at", { ascending: false })
      : { data: [] as never[] };

  const { data: titles } =
    ids.length > 0
      ? await supabase.from("service_listings").select("id, title").in("id", ids)
      : { data: [] as { id: string; title: string }[] };
  const titleById = new Map((titles ?? []).map((t) => [t.id, t.title]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Incoming requests</h1>
      <ul className="mt-6 space-y-3 text-sm">
        {(reqs ?? []).map(
          (r: {
            id: string;
            message: string | null;
            status: string;
            created_at: string;
            service_listing_id: string;
          }) => {
            return (
              <li key={r.id} className="rounded border p-3">
                <p className="font-medium">
                  {titleById.get(r.service_listing_id) ?? "Listing"}
                </p>
                <p className="text-muted-foreground">{r.status}</p>
                <p className="mt-1">{r.message}</p>
              </li>
            );
          }
        )}
      </ul>
      {(reqs ?? []).length === 0 ? (
        <p className="mt-6 text-muted-foreground">No requests yet.</p>
      ) : null}
    </div>
  );
}
