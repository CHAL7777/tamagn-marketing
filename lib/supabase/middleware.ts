import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseCookie } from "@/lib/supabase/cookies";

type UserRole =
  | "buyer"
  | "merchant"
  | "service_provider"
  | "admin"
  | "courier";

const ROLE_BY_PREFIX: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/buyer", roles: ["buyer", "admin"] },
  { prefix: "/merchant", roles: ["merchant", "admin"] },
  { prefix: "/service-provider", roles: ["service_provider", "admin"] },
  { prefix: "/courier", roles: ["courier", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/api/payments/mpesa-callback")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/choose-role")
  )
    return true;
  if (pathname.startsWith("/products")) return true;
  if (pathname.startsWith("/categories")) return true;
  if (pathname.startsWith("/services")) return true;
  return false;
}

function requiresBuyerLogin(pathname: string): boolean {
  return pathname.startsWith("/checkout");
}

function roleRequirement(
  pathname: string
): { roles: UserRole[] } | null {
  for (const { prefix, roles } of ROLE_BY_PREFIX) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`))
      return { roles };
  }
  return null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: SupabaseCookie[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (requiresBuyerLogin(path) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (!isPublicPath(path)) {
    const req = roleRequirement(path);
    if (req) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", path);
        return NextResponse.redirect(url);
      }
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileErr) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // No profile row yet (e.g. trigger lag): treat as buyer so /buyer/* is usable.
      const role = profile?.role ?? "buyer";
      if (!req.roles.includes(role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return supabaseResponse;
}
