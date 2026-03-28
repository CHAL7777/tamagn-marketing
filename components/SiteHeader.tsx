import Link from "next/link";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const user = await getUser();
  let role: string | null = null;
  if (user) {
    const supabase = await createClient();
    const { data: p } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = p?.role ?? null;
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          ታማኝ
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/products" className="text-muted-foreground hover:text-foreground">
            Products
          </Link>
          <Link href="/services" className="text-muted-foreground hover:text-foreground">
            Services
          </Link>
          <Link href="/categories" className="text-muted-foreground hover:text-foreground">
            Categories
          </Link>
          {user ? (
            <>
              {role === "buyer" || !role ? (
                <Link
                  href="/buyer/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Buyer
                </Link>
              ) : null}
              {role === "merchant" ? (
                <Link
                  href="/merchant/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Merchant
                </Link>
              ) : null}
              {role === "service_provider" ? (
                <Link
                  href="/service-provider/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Services
                </Link>
              ) : null}
              {role === "admin" ? (
                <Link
                  href="/admin/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Admin
                </Link>
              ) : null}
              <form action={signOut}>
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-auto px-2 py-1"
                  )}
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
                Sign in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
