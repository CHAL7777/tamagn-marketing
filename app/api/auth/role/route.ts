import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getRolePayload() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: true, user: null, profile: null });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, merchant_id, service_provider_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: profile ?? null,
  });
}

export async function GET() {
  return getRolePayload();
}

export async function POST() {
  return getRolePayload();
}
