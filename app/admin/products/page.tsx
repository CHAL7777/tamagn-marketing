import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
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

  const { data: products } = await supabase
    .from("products")
    .select("id, title, status, merchant_id")
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Product moderation</h1>
      <p className="text-sm text-muted-foreground">
        Suspend listings from Supabase SQL or extend with moderation actions.
      </p>
      <ul className="mt-6 divide-y rounded-lg border text-sm">
        {(products ?? []).map(
          (p: { id: string; title: string; status: string }) => (
            <li key={p.id} className="flex justify-between px-4 py-3">
              <span>{p.title}</span>
              <span className="text-muted-foreground">{p.status}</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
