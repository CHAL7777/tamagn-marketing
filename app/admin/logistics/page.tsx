import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssignCourierForm } from "@/components/admin/AssignCourierForm";

export default async function AdminLogisticsPage() {
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

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Logistics</h1>
      <p className="text-sm text-muted-foreground">
        Assign a courier to an order after the merchant hands off to platform
        delivery.
      </p>
      <div className="mt-8">
        <AssignCourierForm />
      </div>
    </div>
  );
}
