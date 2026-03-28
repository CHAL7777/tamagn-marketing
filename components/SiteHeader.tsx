import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const user = await getUser();
  let role: string | null = null;
  let fullName: string | null = null;
  if (user) {
    const supabase = await createClient();
    const { data: p } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();
    role = p?.role ?? null;
    fullName = p?.full_name ?? null;
  }

  const dashboardLink =
    role === "merchant"
      ? { href: "/merchant/dashboard", label: "Merchant hub" }
      : role === "service_provider"
        ? { href: "/service-provider/dashboard", label: "Service hub" }
        : role === "courier"
          ? { href: "/courier/deliveries", label: "Courier hub" }
          : role === "admin"
            ? { href: "/admin/dashboard", label: "Admin hub" }
            : { href: "/buyer/dashboard", label: "Buyer hub" };

  return (
    <header className="sticky top-0 z-50 px-2 pt-2 md:px-4 md:pt-4">
      <div className="glass-panel rounded-[2rem] bg-surface/80 shadow-[0_18px_40px_rgba(26,28,28,0.06)]">
        <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-[0_18px_36px_rgba(1,110,0,0.16)]">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="font-headline text-2xl font-black tracking-[-0.06em] text-primary">
                ታማኝ
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-secondary">
                Verified local commerce
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full bg-surface-container-low px-2 py-2 lg:flex">
            <HeaderLink href="/">Home</HeaderLink>
            <HeaderLink href="/products">Marketplace</HeaderLink>
            <HeaderLink href="/services">Services</HeaderLink>
            <HeaderLink href="/categories">Categories</HeaderLink>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary xl:inline-flex">
              <ShieldCheck className="size-4 text-primary" />
              Escrow protected
            </span>

            {user ? (
              <>
                <div className="hidden rounded-[1.25rem] bg-surface-container-low px-4 py-3 text-right md:block">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    Signed in
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {fullName || user.email || "Tamagn member"}
                  </p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-[1.25rem] bg-surface-container-lowest text-secondary shadow-[0_12px_28px_rgba(26,28,28,0.05)]">
                  <Bell className="size-4" />
                </span>
                <Link
                  href={dashboardLink.href}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <LayoutDashboard className="size-4" />
                  {dashboardLink.label}
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <span className="hidden items-center gap-2 rounded-full bg-primary-fixed px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-on-primary-fixed lg:inline-flex">
                  <Sparkles className="size-4" />
                  Trusted in Ethiopia
                </span>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-surface-container-lowest hover:text-foreground"
    >
      {children}
    </Link>
  );
}
