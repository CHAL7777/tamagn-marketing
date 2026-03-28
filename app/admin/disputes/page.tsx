import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleAlert, Scale, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DisputeResolveActions } from "@/components/admin/DisputeResolveActions";

export default async function AdminDisputesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  const { data: rows } = await supabase
    .from("disputes")
    .select("id, order_id, status, outcome, evidence_urls, created_at")
    .in("status", ["open", "under_review"])
    .order("created_at", { ascending: false });

  const disputeRows = rows ?? [];
  const openCount = disputeRows.filter((dispute) => dispute.status === "open").length;
  const reviewCount = disputeRows.filter((dispute) => dispute.status === "under_review").length;

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Dispute desk</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Resolve issues before they erode buyer trust.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Resolution outcomes feed directly into order state and escrow release logic.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={Scale} label="Active disputes" value={disputeRows.length} />
          <MetricCard icon={CircleAlert} label="Open" value={openCount} />
          <MetricCard icon={ShieldCheck} label="Under review" value={reviewCount} />
        </div>
      </section>

      <section className="mt-8 editorial-card overflow-hidden">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-xl font-bold tracking-[-0.03em]">Open disputes</h2>
        </div>
        <ul className="divide-y divide-border/70">
          {disputeRows.map(
          (d: {
            id: string;
            order_id: string;
            status: string;
            outcome: string;
            evidence_urls: string[] | null;
            created_at: string;
          }) => (
            <li key={d.id} className="px-6 py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs">{d.id}</span>
                <span className="text-secondary">{d.status}</span>
              </div>
              <p className="mt-2">
                Order:{" "}
                <Link href={`/buyer/order/${d.order_id}`} className="text-primary underline">
                  {d.order_id.slice(0, 8)}…
                </Link>
              </p>
              {d.evidence_urls && d.evidence_urls.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Evidence count: {d.evidence_urls.length}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-secondary">
                Opened {new Date(d.created_at).toLocaleString()}
              </p>
              <DisputeResolveActions disputeId={d.id} />
            </li>
          )
        )}
        </ul>
        {disputeRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-secondary">No open disputes.</div>
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
  icon: typeof Scale;
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
