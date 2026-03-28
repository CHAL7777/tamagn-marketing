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
import { MobileNav } from "@/components/MobileNav";
import { buttonVariants } from "@/components/ui/button-variants";
import { LanguageSwitcher } from "@/components/preferences/LanguageSwitcher";
import { ThemeToggle } from "@/components/preferences/ThemeToggle";
import { getCurrentLocale, getCurrentTheme } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const [user, locale, theme] = await Promise.all([
    getUser(),
    getCurrentLocale(),
    getCurrentTheme(),
  ]);
  const dictionary = getDictionary(locale);

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
      ? {
          href: "/merchant/dashboard",
          label: dictionary.header.dashboardLabels.merchant,
        }
      : role === "service_provider"
        ? {
            href: "/service-provider/dashboard",
            label: dictionary.header.dashboardLabels.serviceProvider,
          }
        : role === "courier"
          ? {
              href: "/courier/deliveries",
              label: dictionary.header.dashboardLabels.courier,
            }
          : role === "admin"
            ? {
                href: "/admin/dashboard",
                label: dictionary.header.dashboardLabels.admin,
              }
            : {
                href: "/buyer/dashboard",
                label: dictionary.header.dashboardLabels.buyer,
              };

  const navLinks = [
    { href: "/", label: dictionary.header.nav.home },
    { href: "/products", label: dictionary.header.nav.marketplace },
    { href: "/services", label: dictionary.header.nav.services },
    { href: "/categories", label: dictionary.header.nav.categories },
  ];

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
                {dictionary.common.appName}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-secondary">
                {dictionary.common.appTagline}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full bg-surface-container-low px-2 py-2 lg:flex">
            {navLinks.map((link) => (
              <HeaderLink key={link.href} href={link.href}>
                {link.label}
              </HeaderLink>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 md:gap-3 lg:flex-none">
            <LanguageSwitcher
              locale={locale}
              localeNames={dictionary.common.localeNames}
              switchLanguageLabel={dictionary.common.switchLanguage}
              compact
            />
            <ThemeToggle
              theme={theme}
              labels={dictionary.common.themeButtonLabel}
              names={dictionary.common.themeNames}
            />
            <MobileNav
              links={navLinks}
              openLabel={dictionary.header.openMenu}
              closeLabel={dictionary.header.closeMenu}
              navigateLabel={dictionary.header.navigate}
            />
            <span className="hidden items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary xl:inline-flex">
              <ShieldCheck className="size-4 text-primary" />
              {dictionary.header.escrowProtected}
            </span>

            {user ? (
              <>
                <div className="hidden rounded-[1.25rem] bg-surface-container-low px-4 py-3 text-right md:block">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    {dictionary.header.signedIn}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {fullName || user.email || dictionary.common.appName}
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
                    {dictionary.header.signOut}
                  </button>
                </form>
              </>
            ) : (
              <>
                <span className="hidden items-center gap-2 rounded-full bg-primary-fixed px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-on-primary-fixed lg:inline-flex">
                  <Sparkles className="size-4" />
                  {dictionary.header.trustedInEthiopia}
                </span>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  {dictionary.header.signIn}
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  {dictionary.header.getStarted}
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
