import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const createProductSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(200),
  description: z.string().trim().max(5000).optional().default(""),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  stock: z.coerce.number().int().min(0).optional().default(0),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "active", "suspended"]).optional().default("active"),
  featured_image_path: z.string().trim().min(1).nullable().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message =
      fields.title?.[0] ??
      fields.price?.[0] ??
      fields.stock?.[0] ??
      fields.category_id?.[0] ??
      "Invalid input";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("merchant_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.merchant_id) {
    return NextResponse.json({ ok: false, error: "Not a merchant" }, { status: 403 });
  }

  if (parsed.data.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("id, kind")
      .eq("id", parsed.data.category_id)
      .maybeSingle();
    if (!category || category.kind !== "product") {
      return NextResponse.json(
        { ok: false, error: "Invalid product category" },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      merchant_id: profile.merchant_id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price,
      stock: parsed.data.stock,
      category_id: parsed.data.category_id ?? null,
      status: parsed.data.status,
      featured_image_path: parsed.data.featured_image_path ?? null,
    })
    .select(
      "id, title, description, price, stock, category_id, status, featured_image_path, created_at"
    )
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
