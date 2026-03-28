import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Admin: assign courier to order. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let body: { orderId?: string; courierUserId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const courierUserId = body.courierUserId?.trim();
  if (!orderId || !courierUserId) {
    return NextResponse.json(
      { ok: false, error: "orderId and courierUserId required" },
      { status: 400 }
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ ok: false, error: "Server config" }, { status: 500 });
  }

  let { data: courier } = await admin
    .from("couriers")
    .select("id")
    .eq("user_id", courierUserId)
    .maybeSingle();

  if (!courier) {
    const { data: created, error: ce } = await admin
      .from("couriers")
      .insert({ user_id: courierUserId, is_active: true })
      .select("id")
      .single();
    if (ce || !created) {
      return NextResponse.json(
        { ok: false, error: ce?.message ?? "Courier create failed" },
        { status: 400 }
      );
    }
    courier = created;
  }

  const { data: da, error: ae } = await admin
    .from("delivery_assignments")
    .upsert(
      {
        order_id: orderId,
        courier_id: courier.id,
        status: "assigned",
      },
      { onConflict: "order_id" }
    )
    .select("id")
    .single();

  if (ae || !da) {
    return NextResponse.json(
      { ok: false, error: ae?.message ?? "Assignment failed" },
      { status: 400 }
    );
  }

  await admin.from("delivery_events").insert({
    assignment_id: da.id,
    event_type: "assigned",
  });

  return NextResponse.json({ ok: true, assignmentId: da.id });
}
