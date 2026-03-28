"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/types/order";
import {
  buyerConfirmDelivery,
  openDispute,
  submitReview,
} from "@/app/actions/orders";

type Props = {
  orderId: string;
  status: OrderStatus | string;
};

export function OrderActions({ orderId, status }: Props) {
  const [pending, start] = useTransition();

  if (status === "delivered") {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          disabled={pending}
          onClick={() => start(() => buyerConfirmDelivery(orderId))}
        >
          Confirm delivery received
        </Button>
        <form
          className="rounded-[1.5rem] bg-surface-container-low p-4"
          action={(fd) => {
            const ev = String(fd.get("evidence") ?? "");
            start(() => openDispute(orderId, ev));
          }}
        >
          <p className="text-sm font-medium text-foreground">Report a problem</p>
          <input
            name="evidence"
            placeholder="Evidence URL or note"
            className="tamagn-field mt-3"
          />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={pending}
            className="mt-3"
          >
            Open dispute
          </Button>
        </form>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <form
        className="space-y-3 rounded-[1.5rem] bg-surface-container-low p-5"
        action={(fd) => {
          const rating = Number(fd.get("rating") ?? 5);
          const body = String(fd.get("body") ?? "");
          start(() => submitReview(orderId, rating, body));
        }}
      >
        <p className="text-sm font-medium">Rate this order</p>
        <select name="rating" className="tamagn-select">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} stars
            </option>
          ))}
        </select>
        <textarea
          name="body"
          rows={2}
          placeholder="Review (optional)"
          className="tamagn-textarea"
        />
        <Button type="submit" size="sm" disabled={pending}>
          Submit review
        </Button>
      </form>
    );
  }

  return null;
}
