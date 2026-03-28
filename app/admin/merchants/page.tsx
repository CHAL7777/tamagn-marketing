import { redirect } from "next/navigation";
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

  const { data: applications } = await supabase
    .from("merchant_applications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Merchant applications</h1>
      <p className="text-sm text-muted-foreground">
        Approve to create merchant account and grant dashboard access.
      </p>
      <ul className="mt-6 space-y-4">
        {(applications ?? []).map(
          (a: {
            id: string;
            business_name: string;
            description: string | null;
            location_label: string | null;
            phone: string | null;
            created_at: string;
          }) => (
            <li key={a.id} className="rounded-lg border p-4">
              <p className="font-medium">{a.business_name}</p>
              <p className="text-sm text-muted-foreground">{a.description}</p>
              <p className="text-xs text-muted-foreground">
                {a.location_label} · {a.phone}
              </p>
              <MerchantApplicationActions applicationId={a.id} />
            </li>
          )
        )}
      </ul>
      {(applications ?? []).length === 0 ? (
        <p className="mt-6 text-muted-foreground">No pending applications.</p>
      ) : null}
    </div>
  );
}
