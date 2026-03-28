import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { ClipboardList, MessageSquareMore, Wrench } from "lucide-react";

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
  const requestRows = reqs ?? [];
  const openCount = requestRows.filter((request) => request.status === "open").length;
  const handledCount = requestRows.filter((request) => request.status !== "open").length;

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Request inbox</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Review demand before it turns into a booking.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Buyers use these requests to ask for custom timing, scope, or quote details.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={ClipboardList} label="Requests" value={requestRows.length} />
          <MetricCard icon={MessageSquareMore} label="Open" value={openCount} />
          <MetricCard icon={Wrench} label="Handled" value={handledCount} />
        </div>
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Incoming requests</h2>
        </div>
        <ul className="divide-y divide-border/70 text-sm">
        {requestRows.map(
          (r: {
            id: string;
            message: string | null;
            status: string;
            created_at: string;
            service_listing_id: string;
          }) => {
            return (
              <li key={r.id} className="px-6 py-4">
                <p className="font-medium">
                  {titleById.get(r.service_listing_id) ?? "Listing"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-secondary">
                  {r.status} · {new Date(r.created_at).toLocaleString()}
                </p>
                <p className="mt-3 leading-7 text-secondary">{r.message ?? "No message provided."}</p>
              </li>
            );
          }
        )}
        </ul>
        {requestRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-secondary">No requests yet.</div>
        ) : null}
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: number;
}) {
  return (
    <div className="metric-card">
      <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-5 section-kicker">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}
