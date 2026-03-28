import { createAdminClient } from "@/lib/supabase/admin";
import { orderHasActiveDispute } from "@/lib/disputes";
import { initiateB2CPayout } from "@/lib/mpesa";
import { resolveOrderPayoutTarget } from "@/lib/payout-target";

type JsonObject = Record<string, unknown>;

type EscrowEventRow = {
  order_id: string;
  event_type: string;
  meta: JsonObject | null;
  created_at: string;
};

type MpesaAsyncCallbackResult = {
  originatorConversationId?: string;
  conversationId?: string;
  resultCode: number;
  resultDesc?: string;
  raw: unknown;
};

function asObject(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null
    ? (value as JsonObject)
    : null;
}

function parseAsyncCallbackResult(raw: unknown): MpesaAsyncCallbackResult {
  const root = asObject(raw);
  const result = asObject(root?.Result);

  return {
    originatorConversationId:
      typeof result?.OriginatorConversationID === "string"
        ? result.OriginatorConversationID
        : undefined,
    conversationId:
      typeof result?.ConversationID === "string"
        ? result.ConversationID
        : undefined,
    resultCode:
      typeof result?.ResultCode === "number"
        ? result.ResultCode
        : typeof result?.ResultCode === "string"
          ? Number(result.ResultCode)
          : -1,
    resultDesc:
      typeof result?.ResultDesc === "string" ? result.ResultDesc : undefined,
    raw,
  };
}

async function findEscrowEventByConversation(
  eventType: string,
  originatorConversationId: string
) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("escrow_events")
    .select("order_id, event_type, meta, created_at")
    .eq("event_type", eventType)
    .order("created_at", { ascending: false })
    .limit(200);

  return ((data ?? []) as EscrowEventRow[]).find((event) => {
    const meta = asObject(event.meta);
    return meta?.originatorConversationId === originatorConversationId;
  });
}

export async function requestEscrowRelease(
  orderId: string,
  options: { auto?: boolean } = {}
) {
  const admin = createAdminClient();

  if (await orderHasActiveDispute(admin, orderId)) {
    return { ok: false as const, error: "Escrow frozen: active dispute" };
  }

  const { data: order } = await admin
    .from("orders")
    .select("id, merchant_id, service_listing_id, status, escrow_released, subtotal")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { ok: false as const, error: "Order not found" };
  }

  if (order.status !== "completed" || order.escrow_released) {
    return { ok: false as const, error: "Order not eligible for release" };
  }

  const target = await resolveOrderPayoutTarget(admin, order);
  if (target.kind === "none") {
    return { ok: false as const, error: target.reason };
  }

  const payoutAmount = Math.max(0, Number(order.subtotal));
  const result = await initiateB2CPayout({
    partyB: target.partyB,
    amount: payoutAmount,
    remarks: `Order ${orderId}`,
  });

  if (!result.ok) {
    return {
      ok: false as const,
      error: result.error,
      raw: result.raw,
    };
  }

  await admin.from("escrow_events").insert({
    order_id: orderId,
    event_type: "release_requested",
    meta: {
      auto: options.auto ?? false,
      amount: payoutAmount,
      originatorConversationId: result.originatorConversationId,
      partyB: target.partyB,
      targetKind: target.kind,
      raw: result.raw,
      status: "pending",
    },
  });

  return {
    ok: true as const,
    data: result.raw,
    originatorConversationId: result.originatorConversationId,
  };
}

export async function recordB2CPayoutResult(raw: unknown) {
  const parsed = parseAsyncCallbackResult(raw);
  if (!parsed.originatorConversationId) return;

  const admin = createAdminClient();
  const event = await findEscrowEventByConversation(
    "release_requested",
    parsed.originatorConversationId
  );
  if (!event) return;

  const meta = asObject(event.meta);
  const targetKind =
    meta?.targetKind === "service_provider" ? "service_provider" : "merchant";

  if (parsed.resultCode === 0) {
    const { data: order } = await admin
      .from("orders")
      .select("escrow_released")
      .eq("id", event.order_id)
      .maybeSingle();

    if (!order?.escrow_released) {
      await admin
        .from("orders")
        .update({ escrow_released: true })
        .eq("id", event.order_id);
    }

    await admin.from("escrow_events").insert({
      order_id: event.order_id,
      event_type:
        targetKind === "service_provider"
          ? "released_to_service_provider"
          : "released_to_merchant",
      meta: {
        originatorConversationId: parsed.originatorConversationId,
        conversationId: parsed.conversationId,
        raw: parsed.raw,
        resultCode: parsed.resultCode,
        resultDesc: parsed.resultDesc ?? null,
      },
    });

    return;
  }

  await admin.from("escrow_events").insert({
    order_id: event.order_id,
    event_type: "release_failed",
    meta: {
      originatorConversationId: parsed.originatorConversationId,
      conversationId: parsed.conversationId,
      raw: parsed.raw,
      resultCode: parsed.resultCode,
      resultDesc: parsed.resultDesc ?? null,
    },
  });
}

export async function recordB2CPayoutQueueTimeout(raw: unknown) {
  const parsed = parseAsyncCallbackResult(raw);
  if (!parsed.originatorConversationId) return;

  const admin = createAdminClient();
  const event = await findEscrowEventByConversation(
    "release_requested",
    parsed.originatorConversationId
  );
  if (!event) return;

  await admin.from("escrow_events").insert({
    order_id: event.order_id,
    event_type: "release_timeout",
    meta: {
      originatorConversationId: parsed.originatorConversationId,
      conversationId: parsed.conversationId,
      raw: parsed.raw,
      resultCode: parsed.resultCode,
      resultDesc: parsed.resultDesc ?? null,
    },
  });
}

export async function recordReversalResult(raw: unknown) {
  const parsed = parseAsyncCallbackResult(raw);
  if (!parsed.originatorConversationId) return;

  const admin = createAdminClient();
  const event = await findEscrowEventByConversation(
    "reversal_requested",
    parsed.originatorConversationId
  );
  if (!event) return;

  await admin.from("escrow_events").insert({
    order_id: event.order_id,
    event_type: parsed.resultCode === 0 ? "reversal_succeeded" : "reversal_failed",
    meta: {
      originatorConversationId: parsed.originatorConversationId,
      conversationId: parsed.conversationId,
      raw: parsed.raw,
      resultCode: parsed.resultCode,
      resultDesc: parsed.resultDesc ?? null,
    },
  });
}

export async function recordReversalQueueTimeout(raw: unknown) {
  const parsed = parseAsyncCallbackResult(raw);
  if (!parsed.originatorConversationId) return;

  const admin = createAdminClient();
  const event = await findEscrowEventByConversation(
    "reversal_requested",
    parsed.originatorConversationId
  );
  if (!event) return;

  await admin.from("escrow_events").insert({
    order_id: event.order_id,
    event_type: "reversal_timeout",
    meta: {
      originatorConversationId: parsed.originatorConversationId,
      conversationId: parsed.conversationId,
      raw: parsed.raw,
      resultCode: parsed.resultCode,
      resultDesc: parsed.resultDesc ?? null,
    },
  });
}
