import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  slug: z.string().trim().min(1).max(120).optional(),
  kind: z.enum(["product", "service"]),
  parent_id: z.string().uuid().nullable().optional(),
});

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message =
      fields.name?.[0] ?? fields.slug?.[0] ?? fields.kind?.[0] ?? fields.parent_id?.[0];
    return NextResponse.json({ ok: false, error: message ?? "Invalid input" }, { status: 400 });
  }

  const slug = normalizeSlug(parsed.data.slug?.trim() || parsed.data.name);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug,
      kind: parsed.data.kind,
      parent_id: parsed.data.parent_id ?? null,
    })
    .select("id, name, slug, kind, parent_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
