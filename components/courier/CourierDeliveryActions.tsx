"use client";

import { useTransition } from "react";
import { courierAdvanceDelivery } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";

type Props = { orderId: string; status: string };

export function CourierDeliveryActions({ orderId, status }: Props) {
  const [p, start] = useTransition();

  if (!["collected", "in_transit"].includes(status)) {
    return (
      <p className="text-xs text-muted-foreground">
        Wait until the order is <code>collected</code> before advancing delivery.
      </p>
    );
  }

  const label =
    status === "collected"
      ? "Mark in transit"
      : status === "in_transit"
        ? "Mark delivered"
        : null;
  if (!label) return null;

  return (
    <Button
      type="button"
      size="sm"
      disabled={p}
      onClick={() =>
        start(() => courierAdvanceDelivery(orderId, status === "collected" ? "in_transit" : "delivered"))
      }
    >
      {p ? "Updating…" : label}
    </Button>
  );
}
