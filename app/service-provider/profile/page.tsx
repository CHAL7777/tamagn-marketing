import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export default async function ServiceProviderProfilePage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        No service provider profile linked to your account.
      </p>
    );
  }

  const supabase = await createClient();
  const { data: sp } = await supabase
    .from("service_providers")
    .select("business_name, bio, trust_score, is_active")
    .eq("id", profile.service_provider_id)
    .maybeSingle();

  if (!sp) redirect("/service-provider/dashboard");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Business</dt>
          <dd className="font-medium">{sp.business_name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Bio</dt>
          <dd>{sp.bio ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Trust score</dt>
          <dd className="tabular-nums">{Number(sp.trust_score).toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd>{sp.is_active ? "Active" : "Inactive"}</dd>
        </div>
      </dl>
    </div>
  );
}
