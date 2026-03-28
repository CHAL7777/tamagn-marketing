import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { OrderStatus } from "@/components/OrderStatus";
import { ServiceBookingActions } from "@/components/service-provider/ServiceBookingActions";

export default async function ServiceProviderBookingsPage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        No service provider profile linked.
      </p>
    );
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("service_listings")
    .select("id")
    .eq("service_provider_id", profile.service_provider_id);
  const ids = (listings ?? []).map((l: { id: string }) => l.id);
  if (ids.length === 0) {
    return (
      <p className="p-8 text-center text-muted-foreground">No listings yet.</p>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, service_listing_id, created_at")
    .eq("order_type", "service")
    .in("service_listing_id", ids)
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Service bookings</h1>
      <p className="text-sm text-muted-foreground">
        Prepaid jobs: after payment, mark complete so the buyer can confirm and
        release escrow.
      </p>
      <ul className="mt-6 space-y-4">
        {(orders ?? []).map(
          (o: {
            id: string;
            status: string;
            total: string;
            service_listing_id: string;
          }) => (
            <li key={o.id} className="rounded-lg border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <OrderStatus status={o.status} />
                <span className="tabular-nums">{Number(o.total).toLocaleString()} ETB</span>
              </div>
              <Link href={`/buyer/order/${o.id}`} className="mt-2 text-xs text-primary underline">
                View order
              </Link>
              <div className="mt-3">
                <ServiceBookingActions orderId={o.id} status={o.status} />
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
