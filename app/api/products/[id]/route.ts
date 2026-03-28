import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/queries/products";

type Ctx = { params: Promise<{ id: string }> };

const updateProductSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    price: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    status: z.enum(["draft", "active", "suspended"]).optional(),
    category_id: z.string().uuid().nullable().optional(),
    featured_image_path: z.string().trim().min(1).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

async function ensureProductAccess(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }

  const [{ data: profile }, { data: product }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id, merchant_id")
      .eq("id", productId)
      .maybeSingle(),
  ]);

  if (!product) {
    return { error: NextResponse.json({ ok: false, error: "Not found" }, { status: 404 }) };
  }

  if (profile?.role === "admin") {
    return { supabase };
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("owner_id")
    .eq("id", product.merchant_id)
    .maybeSingle();

  if (!merchant || merchant.owner_id !== user.id) {
    return { error: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase };
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ...product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch product";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const access = await ensureProductAccess(id);
  if ("error" in access) return access.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message =
      fields.title?.[0] ??
      fields.description?.[0] ??
      fields.price?.[0] ??
      fields.stock?.[0] ??
      fields.status?.[0] ??
      fields.category_id?.[0] ??
      parsed.error.issues[0]?.message ??
      "Invalid input";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  if (parsed.data.category_id) {
    const { data: category } = await access.supabase
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

  const update = {
    ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
    ...(parsed.data.description !== undefined
      ? { description: parsed.data.description || null }
      : {}),
    ...(parsed.data.price !== undefined ? { price: parsed.data.price } : {}),
    ...(parsed.data.stock !== undefined ? { stock: parsed.data.stock } : {}),
    ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
    ...(parsed.data.category_id !== undefined
      ? { category_id: parsed.data.category_id ?? null }
      : {}),
    ...(parsed.data.featured_image_path !== undefined
      ? { featured_image_path: parsed.data.featured_image_path ?? null }
      : {}),
  };

  const { data, error } = await access.supabase
    .from("products")
    .update(update)
    .eq("id", id)
    .select(
      "id, title, description, price, stock, category_id, status, featured_image_path, updated_at"
    )
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const access = await ensureProductAccess(id);
  if ("error" in access) return access.error;

  const { data, error } = await access.supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: data.id, deleted: true });
}
