import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawKind = searchParams.get("kind")?.trim();
  const kind =
    rawKind === "product" || rawKind === "service" ? rawKind : rawKind ? "__invalid__" : null;

  if (kind === "__invalid__") {
    return NextResponse.json(
      { ok: false, error: "kind must be 'product' or 'service'" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id, name, slug, kind, parent_id, created_at")
    .order("name");

  if (kind) {
    query = query.eq("kind", kind);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
