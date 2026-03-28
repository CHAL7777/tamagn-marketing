import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { ComponentType } from "react";
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
  const timeline = history.data ?? [];
  const merchant = Array.isArray(order.merchants)
    ? order.merchants[0]
    : order.merchants;
  const stepOrder = [
    "awaiting_payment",
    "paid_escrow",
    "merchant_confirmed",
    "pickup_scheduled",
    "in_transit",
    "delivered",
    "completed",
  ];
  const currentStepIndex = Math.max(stepOrder.indexOf(order.status), 0);
  const progress = `${Math.max(
    14,
    Math.min(100, ((currentStepIndex + 1) / stepOrder.length) * 100)
  )}%`;

  return (
    <main className="page-shell pb-24 pt-8">
      <OrderRealtimeRefresh orderId={id} />
      <Link href="/buyer/orders" className="eyebrow-link">
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-6">
          <div className="editorial-card overflow-hidden">
            <div className="bg-surface-container-low p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="section-kicker">Order tracking</p>
                  <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em]">
                    Order #{id.slice(0, 8)}
                  </h1>
                  <p className="mt-2 text-sm text-secondary">
                    From {(merchant as { business_name?: string } | null)?.business_name ??
                      "Tamagn merchant"}
                  </p>
                </div>
                <OrderStatus status={order.status} />
              </div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-[linear-gradient(135deg,#016e00,#00be00)]" style={{ width: progress }} />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <SummaryPill
                  icon={PackageCheck}
                  label="Total"
                  value={`${Number(order.total).toLocaleString()} ETB`}
                />
                <SummaryPill
                  icon={ShieldCheck}
                  label="Escrow"
                  value={order.escrow_released ? "Released" : "Protected"}
                />
                <SummaryPill
                  icon={Clock3}
                  label="Updated"
                  value={new Date(order.updated_at).toLocaleDateString()}
                />
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold tracking-[-0.03em]">Items in this order</h2>
              <ul className="mt-4 space-y-3">
                {(order.order_items as { quantity: number; products: { title: string } | null }[])?.map(
                  (li, i) => (
                    <li key={i} className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm">
                      <span className="font-semibold text-foreground">
                        {li.products?.title ?? "Item"}
                      </span>{" "}
                      × {li.quantity}
                    </li>
                  )
                )}
              </ul>

              {order.status === "awaiting_payment" && pay === "1" ? (
                <div className="mt-6 rounded-[1.5rem] bg-surface-container-low p-5">
                  <h3 className="text-sm font-semibold">Complete M-Pesa payment</h3>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    Trigger STK Push to continue the escrow flow for this order.
                  </p>
                  <div className="mt-4">
                    <PayWithMpesaButton orderId={id} />
                  </div>
                </div>
              ) : null}

              {order.status === "awaiting_payment" && pay !== "1" ? (
                <Link href={`/buyer/order/${id}?pay=1`} className="eyebrow-link mt-6">
                  <ShieldCheck className="size-4" />
                  Pay now with M-Pesa
                </Link>
              ) : null}

              <div className="mt-6">
                <OrderActions orderId={id} status={order.status} />
              </div>
            </div>
          </div>

          {delivery.assignment ? (
            <div className="editorial-card p-6">
              <h2 className="text-xl font-bold tracking-[-0.03em]">Delivery events</h2>
              <p className="mt-2 text-sm text-secondary">
                Assignment status: {delivery.assignment.status}
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {delivery.events.map((e, i) => (
                  <li
                    key={`${e.created_at}-${e.event_type}-${i}`}
                    className="rounded-[1.5rem] bg-surface-container-low p-4"
                  >
                    <p className="font-semibold text-foreground">
                      {e.event_type.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-secondary">
                      {new Date(e.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <aside className="editorial-card p-6 lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
              <Truck className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-[-0.03em]">Order journey</h2>
              <p className="text-sm text-secondary">
                Every state change is recorded in order history.
              </p>
            </div>
          </div>
          <div className="relative mt-6 space-y-5">
            <div className="absolute left-[0.95rem] top-2 bottom-2 w-px bg-outline-variant/40" />
            {timeline.map((h, index) => {
              const active = index === timeline.length - 1;
              return (
                <div key={h.created_at} className="relative pl-10">
                  <span
                    className={`absolute left-0 top-1 flex size-8 items-center justify-center rounded-full ${
                      active
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-secondary"
                    }`}
                  >
                    <Clock3 className="size-4" />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    {new Date(h.created_at).toLocaleString()}
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {h.status.replace(/_/g, " ")}
                  </p>
                  {h.note ? (
                    <p className="mt-1 text-sm leading-6 text-secondary">{h.note}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-surface-container-low p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
