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
      <div className="mt-8 space-y-4">
        <Button
          type="button"
          disabled={pending}
          onClick={() => start(() => buyerConfirmDelivery(orderId))}
        >
          Confirm delivery received
        </Button>
        <form
          className="space-y-2"
          action={(fd) => {
            const ev = String(fd.get("evidence") ?? "");
            start(() => openDispute(orderId, ev));
          }}
        >
          <p className="text-sm font-medium">Report a problem</p>
          <input
            name="evidence"
            placeholder="Evidence URL or note"
            className="w-full rounded border px-2 py-1 text-sm"
          />
          <Button type="submit" variant="destructive" size="sm" disabled={pending}>
            Open dispute
          </Button>
        </form>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <form
        className="mt-8 space-y-2 rounded-lg border p-4"
        action={(fd) => {
          const rating = Number(fd.get("rating") ?? 5);
          const body = String(fd.get("body") ?? "");
          start(() => submitReview(orderId, rating, body));
        }}
      >
        <p className="text-sm font-medium">Rate this order</p>
        <select name="rating" className="rounded border px-2 py-1 text-sm">
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
          className="w-full rounded border px-2 py-1 text-sm"
        />
        <Button type="submit" size="sm" disabled={pending}>
          Submit review
        </Button>
      </form>
    );
  }

  return null;
}
