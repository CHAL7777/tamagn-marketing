"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function AssignCourierForm() {
  const [orderId, setOrderId] = useState("");
  const [courierUserId, setCourierUserId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [p, start] = useTransition();

  function submit() {
    setMsg(null);
    start(async () => {
      try {
        const res = await fetch("/api/logistics/assign-courier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderId.trim(), courierUserId: courierUserId.trim() }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) setMsg(data.error ?? "Failed");
        else setMsg("Courier assigned.");
      } catch {
        setMsg("Network error");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border p-4 text-sm">
      <p className="font-medium">Assign courier</p>
      <p className="text-xs text-muted-foreground">
        Use the courier&apos;s Supabase auth user UUID (from Auth → Users).
      </p>
      <input
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Order UUID"
        className="w-full rounded border px-3 py-2 font-mono text-xs"
      />
      <input
        value={courierUserId}
        onChange={(e) => setCourierUserId(e.target.value)}
        placeholder="Courier user UUID"
        className="w-full rounded border px-3 py-2 font-mono text-xs"
      />
      <Button type="button" size="sm" disabled={p} onClick={() => submit()}>
        {p ? "Saving…" : "Assign"}
      </Button>
      {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
