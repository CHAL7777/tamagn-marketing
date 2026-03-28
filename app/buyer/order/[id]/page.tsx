import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { PayWithMpesaButton } from "@/components/order/PayWithMpesaButton";
import { OrderStatus } from "@/components/OrderStatus";
import { OrderActions } from "@/components/order/OrderActions";
import { OrderRealtimeRefresh } from "@/components/order/OrderRealtimeRefresh";
import { getDeliveryTimeline } from "@/lib/queries/delivery";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pay?: string }>;
};

export default async function BuyerOrderDetailPage({ params, searchParams }: Props) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { pay } = await searchParams;

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, products(title)), merchants(business_name)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!order || order.buyer_id !== user.id) notFound();

  const history = await supabase
    .from("order_status_history")
    .select("status, note, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const delivery = await getDeliveryTimeline(supabase, id);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <OrderRealtimeRefresh orderId={id} />
      <Link href="/buyer/orders" className="text-sm text-primary underline">
        ← Orders
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Order</h1>
      <p className="font-mono text-xs text-muted-foreground">{id}</p>
      <p className="mt-2">
        Status: <OrderStatus status={order.status} />
      </p>
      <p className="mt-2 text-lg font-medium tabular-nums">
        {Number(order.total).toLocaleString()} ETB
      </p>

      {order.status === "awaiting_payment" && pay === "1" ? (
        <div className="mt-6 rounded-lg border p-4">
          <PayWithMpesaButton orderId={id} />
        </div>
      ) : null}

      {order.status === "awaiting_payment" && pay !== "1" ? (
        <Link
          href={`/buyer/order/${id}?pay=1`}
          className="mt-4 inline-block text-sm text-primary underline"
        >
          Pay now
        </Link>
      ) : null}

      <ul className="mt-6 space-y-2 text-sm">
        {(order.order_items as { quantity: number; products: { title: string } | null }[])?.map(
          (li, i) => (
            <li key={i}>
              {li.products?.title ?? "Item"} × {li.quantity}
            </li>
          )
        )}
      </ul>

      <section className="mt-8">
        <h2 className="font-medium">Timeline</h2>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {(history.data ?? []).map((h) => (
            <li key={h.created_at}>
              {h.status} {h.note ? `— ${h.note}` : ""}
            </li>
          ))}
        </ul>
      </section>

      {delivery.assignment ? (
        <section className="mt-6">
          <h2 className="font-medium">Delivery</h2>
          <p className="text-xs text-muted-foreground">
            Assignment: {delivery.assignment.status}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {delivery.events.map((e, i) => (
              <li key={`${e.created_at}-${e.event_type}-${i}`}>
                {e.event_type.replace(/_/g, " ")} —{" "}
                {new Date(e.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <OrderActions orderId={id} status={order.status} />
    </div>
  );
}
