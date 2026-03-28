import Link from "next/link";
import { redirect } from "next/navigation";
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Disputes</h1>
      <p className="text-sm text-muted-foreground">
        Resolve outcomes update order status; release triggers B2C when configured.
      </p>
      <ul className="mt-6 space-y-4">
        {(rows ?? []).map(
          (d: {
            id: string;
            order_id: string;
            status: string;
            outcome: string;
            evidence_urls: string[] | null;
            created_at: string;
          }) => (
            <li key={d.id} className="rounded-lg border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs">{d.id.slice(0, 8)}…</span>
                <span className="text-muted-foreground">{d.status}</span>
              </div>
              <p className="mt-2">
                Order:{" "}
                <Link href={`/buyer/order/${d.order_id}`} className="text-primary underline">
                  {d.order_id.slice(0, 8)}…
                </Link>
              </p>
              {d.evidence_urls && d.evidence_urls.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Evidence: {d.evidence_urls.join(", ")}
                </p>
              ) : null}
              <DisputeResolveActions disputeId={d.id} />
            </li>
          )
        )}
      </ul>
      {(rows ?? []).length === 0 ? (
        <p className="mt-6 text-muted-foreground">No open disputes.</p>
      ) : null}
    </div>
  );
}
