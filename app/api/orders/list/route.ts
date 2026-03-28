import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ORDER_SELECT =
  "id, status, order_type, total, subtotal, delivery_fee, platform_fee, buyer_id, merchant_id, service_listing_id, escrow_released, created_at, updated_at";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedScope = searchParams.get("scope")?.trim();
  const allowedScopes = new Set([
    "buyer",
    "merchant",
    "service_provider",
    "admin",
    "courier",
  ]);

  if (requestedScope && !allowedScopes.has(requestedScope)) {
    return NextResponse.json({ ok: false, error: "Invalid scope" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, merchant_id, service_provider_id")
    .eq("id", user.id)
    .maybeSingle();

  const scope =
    requestedScope ??
    (profile?.role === "admin"
      ? "admin"
      : profile?.merchant_id
        ? "merchant"
        : profile?.service_provider_id
          ? "service_provider"
          : profile?.role === "courier"
            ? "courier"
            : "buyer");

  if (scope === "merchant" && !profile?.merchant_id) {
    return NextResponse.json({ ok: false, error: "Not a merchant" }, { status: 403 });
  }
  if (scope === "service_provider" && !profile?.service_provider_id) {
    return NextResponse.json(
      { ok: false, error: "Not a service provider" },
      { status: 403 }
    );
  }
  if (scope === "admin" && profile?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  if (scope === "courier") {
    const { data: courier } = await supabase
      .from("couriers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!courier) {
      return NextResponse.json({ ok: true, scope, items: [] });
    }

    const { data: assignments } = await supabase
      .from("delivery_assignments")
      .select("order_id")
      .eq("courier_id", courier.id);
    const orderIds = (assignments ?? []).map((row: { order_id: string }) => row.order_id);
    if (orderIds.length === 0) {
      return NextResponse.json({ ok: true, scope, items: [] });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .in("id", orderIds)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, scope, items: data ?? [] });
  }

  if (scope === "service_provider") {
    const { data: listings } = await supabase
      .from("service_listings")
      .select("id")
      .eq("service_provider_id", profile!.service_provider_id);
    const listingIds = (listings ?? []).map((row: { id: string }) => row.id);
    if (listingIds.length === 0) {
      return NextResponse.json({ ok: true, scope, items: [] });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .in("service_listing_id", listingIds)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, scope, items: data ?? [] });
  }

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);

  if (scope === "buyer") {
    query = query.eq("buyer_id", user.id);
  } else if (scope === "merchant") {
    query = query.eq("merchant_id", profile!.merchant_id);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, scope, items: data ?? [] });
}
