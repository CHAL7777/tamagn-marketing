import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  HandCoins,
  MapPinned,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const trustPillars = [
  {
    icon: BadgeCheck,
    title: "Verified merchants only",
    body: "Tamagn is built around admin-approved merchants and service providers so the marketplace stays accountable.",
  },
  {
    icon: HandCoins,
    title: "M-Pesa escrow",
    body: "Buyers pay into escrow first. Funds are released only after delivery or successful completion of service.",
  },
  {
    icon: Truck,
    title: "Platform-managed delivery",
    body: "Logistics stays inside the platform so buyers can track order progress from confirmation through handoff.",
  },
];

const steps = [
  {
    label: "Discover",
    body: "Browse nearby products and services with merchant verification, trust scores, and location-aware delivery context.",
  },
  {
    label: "Pay securely",
    body: "Use M-Pesa checkout with escrow protection so the merchant is paid only when the transaction is fulfilled properly.",
  },
  {
    label: "Track and confirm",
    body: "Follow order progress, see courier updates, and confirm delivery before escrow is released.",
  },
];

const roles = [
  {
    icon: ShoppingBag,
    title: "For buyers",
    body: "Search trusted local sellers, request services, manage delivery addresses, and review order history in one place.",
    href: "/products",
    cta: "Explore the marketplace",
  },
  {
    icon: Store,
    title: "For merchants",
    body: "Manage inventory, orders, promotions, and performance while building trust through verified onboarding.",
    href: "/choose-role",
    cta: "Apply as a merchant",
  },
  {
    icon: BriefcaseBusiness,
    title: "For service providers",
    body: "Publish service listings, receive quote requests, and take prepaid bookings where escrow protection is required.",
    href: "/services",
    cta: "Browse services",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell pb-24 pt-8 md:pt-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <span className="tamagn-chip bg-primary-fixed text-on-primary-fixed">
            <ShieldCheck className="size-4" />
            Ethiopia&apos;s digital guardian for local trade
          </span>
          <div className="space-y-5">
            <h1 className="max-w-4xl font-headline text-5xl font-extrabold leading-[0.95] tracking-[-0.06em] text-foreground md:text-7xl">
              Trusted local commerce with verified sellers, M-Pesa escrow, and
              delivery built in.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-secondary md:text-xl">
              ታማኝ connects Ethiopian buyers, merchants, and service providers
              through a single hyperlocal platform designed around trust,
              discoverability, protected payments, and reliable logistics.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Shop products
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/services"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Book services
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="metric-card bg-surface-container-low p-5">
              <p className="section-kicker">Trust model</p>
              <p className="mt-2 text-xl font-extrabold text-foreground">
                Admin-approved onboarding
              </p>
            </div>
            <div className="metric-card bg-surface-container-low p-5">
              <p className="section-kicker">Payments</p>
              <p className="mt-2 text-xl font-extrabold text-foreground">
                Escrow-first M-Pesa flow
              </p>
            </div>
            <div className="metric-card bg-surface-container-low p-5">
              <p className="section-kicker">Operations</p>
              <p className="mt-2 text-xl font-extrabold text-foreground">
                Marketplace + delivery + disputes
              </p>
            </div>
          </div>
        </div>

        <div className="editorial-card relative overflow-hidden p-8 md:p-10">
          <div className="absolute -right-14 -top-16 size-48 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-16 -left-8 size-44 rounded-full bg-tertiary-container/10 blur-3xl" />
          <div className="relative space-y-8">
            <div className="glass-panel rounded-[1.75rem] p-6">
              <p className="section-kicker">Platform promise</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
                Tamagn turns local trust into product logic.
              </h2>
              <p className="mt-3 text-sm leading-7 text-secondary">
                The platform documentation centers on three linked systems:
                digital marketplace infrastructure, secure transaction
                infrastructure, and platform-managed delivery.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-primary p-6 text-on-primary shadow-[0_24px_48px_rgba(1,110,0,0.18)]">
                <MapPinned className="size-8" />
                <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-primary-fixed">
                  Hyperlocal discovery
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  Nearby merchants and service areas
                </p>
              </div>
              <div className="rounded-[1.75rem] bg-surface-container-low p-6">
                <HandCoins className="size-8 text-tertiary-container" />
                <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-secondary">
                  Release only on success
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  Buyer protection from checkout to delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-3">
        {trustPillars.map(({ icon: Icon, title, body }) => (
          <article key={title} className="editorial-card p-7">
            <span className="flex size-14 items-center justify-center rounded-[1.25rem] bg-surface-container-low text-primary">
              <Icon className="size-6" />
            </span>
            <h2 className="mt-6 text-2xl font-bold tracking-[-0.04em]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-secondary">{body}</p>
          </article>
        ))}
      </section>

      <section className="mt-20 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="section-shell">
          <p className="section-kicker">How it works</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
            Trusted commerce should feel simple.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-secondary">
            The project brief focuses on reducing fraud, increasing digital
            visibility for local businesses, and giving buyers a clear
            transaction path from discovery through delivery confirmation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.label} className="editorial-card p-7">
              <p className="text-6xl font-black tracking-[-0.08em] text-surface-container-high">
                {index + 1}
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em]">
                {step.label}
              </h3>
              <p className="mt-3 text-sm leading-7 text-secondary">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-5 lg:grid-cols-3">
        {roles.map(({ icon: Icon, title, body, href, cta }) => (
          <article key={title} className="editorial-card p-7">
            <span className="flex size-14 items-center justify-center rounded-[1.25rem] bg-surface-container-low text-primary">
              <Icon className="size-6" />
            </span>
            <h3 className="mt-6 text-2xl font-bold tracking-[-0.04em]">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-secondary">{body}</p>
            <Link href={href} className="eyebrow-link mt-6">
              {cta}
              <ArrowRight className="size-4" />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
