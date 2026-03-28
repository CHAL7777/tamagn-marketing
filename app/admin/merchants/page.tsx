import { redirect } from "next/navigation";
import { Handshake, ShieldCheck, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MerchantApplicationActions } from "@/components/admin/MerchantApplicationActions";

export default async function AdminMerchantsPage() {
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

  const [applicationsResult, merchantsResult] = await Promise.all([
    supabase
      .from("merchant_applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("merchants")
      .select("id, business_name, verification_badge, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const applications = applicationsResult.data ?? [];
  const merchants = merchantsResult.data ?? [];
  const verifiedCount = merchants.filter((merchant) => merchant.verification_badge).length;
  const activeCount = merchants.filter((merchant) => merchant.is_active).length;

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <p className="section-kicker">Merchant approvals</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
            Control seller onboarding and verified commerce supply.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Approval links applicant profiles to merchant records and unlocks dashboard access.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={Handshake} label="Pending" value={applications.length} />
          <MetricCard icon={ShieldCheck} label="Verified" value={verifiedCount} />
          <MetricCard icon={Store} label="Active merchants" value={activeCount} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="editorial-card overflow-hidden">
          <div className="border-b border-border/70 px-6 py-5">
            <h2 className="text-xl font-bold tracking-[-0.03em]">Pending applications</h2>
          </div>
          <ul className="divide-y divide-border/70">
            {applications.map(
          (a: {
            id: string;
            business_name: string;
            description: string | null;
            location_label: string | null;
            phone: string | null;
            created_at: string;
          }) => (
            <li key={a.id} className="px-6 py-4">
              <p className="font-medium">{a.business_name}</p>
              <p className="text-sm text-muted-foreground">{a.description}</p>
              <p className="text-xs text-muted-foreground">
                {a.location_label} · {a.phone} · {new Date(a.created_at).toLocaleDateString()}
              </p>
              <MerchantApplicationActions applicationId={a.id} />
            </li>
          )
            )}
          </ul>
          {applications.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-secondary">
              No pending applications.
            </div>
          ) : null}
        </div>

        <div className="editorial-card overflow-hidden">
          <div className="border-b border-border/70 px-6 py-5">
            <h2 className="text-xl font-bold tracking-[-0.03em]">Recent merchant roster</h2>
          </div>
          <ul className="divide-y divide-border/70">
            {merchants.map((merchant) => (
              <li key={merchant.id} className="px-6 py-4 text-sm">
                <p className="font-semibold text-foreground">{merchant.business_name}</p>
                <p className="mt-1 text-secondary">
                  {merchant.verification_badge ? "Verified" : "Unverified"} ·{" "}
                  {merchant.is_active ? "Active" : "Inactive"}
                </p>
                <p className="mt-1 text-xs text-secondary">
                  Joined {new Date(merchant.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Handshake;
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
