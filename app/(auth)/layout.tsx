import Link from "next/link";
import { BadgeCheck, ShieldCheck, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import { MaterialIconImage } from "@/components/marketing/MaterialIconImage";
import { getCurrentLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/translations";

const featureIcons = [BadgeCheck, Wallet, ShieldCheck] as const;

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);

  return (
    <div className="page-shell flex flex-1 flex-col py-8 md:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 self-start rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary transition hover:bg-surface-container-highest lg:hidden"
      >
        {dictionary.common.appName} - {dictionary.authLayout.backHome}
      </Link>
      <div className="grid w-full flex-1 items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="section-shell relative hidden overflow-hidden lg:flex lg:min-h-[720px] lg:flex-col lg:justify-between">
          <div className="absolute -left-16 top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 right-0 size-56 rounded-full bg-tertiary-container/10 blur-3xl" />
          <div className="relative space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="rounded-full bg-primary-fixed px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-on-primary-fixed">
                {dictionary.authLayout.badge}
              </span>
            </Link>
            <div>
              <h1 className="max-w-lg text-5xl font-extrabold tracking-[-0.07em]">
                {dictionary.authLayout.title}
              </h1>
              <p className="mt-5 max-w-md text-base leading-8 text-secondary">
                {dictionary.authLayout.body}
              </p>
            </div>
          </div>
          <div
            className="relative flex flex-wrap items-center justify-center gap-6 rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-low/40 py-6"
            aria-hidden
          >
            <MaterialIconImage icon="verifiedUser" alt="" size={56} className="opacity-85" />
            <MaterialIconImage icon="storefront" alt="" size={56} className="opacity-85" />
            <MaterialIconImage icon="localShipping" alt="" size={56} className="opacity-85" />
          </div>
          <div className="relative grid gap-4">
            {dictionary.authLayout.features.map((feature, index) => {
              const Icon = featureIcons[index] ?? BadgeCheck;
              return (
                <FeatureItem
                  key={feature.title}
                  icon={Icon}
                  title={feature.title}
                  body={feature.body}
                />
              );
            })}
          </div>
        </aside>

        <div className="relative mx-auto flex w-full max-w-xl items-center justify-center overflow-hidden rounded-[2.5rem] bg-surface-container-lowest px-5 py-10 shadow-[0_30px_80px_rgba(26,28,28,0.08)] sm:px-8 lg:min-h-[720px]">
          <div className="absolute -right-12 top-12 size-52 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-12 left-6 size-52 rounded-full bg-tertiary-container/10 blur-3xl" />
          <div className="relative w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="editorial-card flex gap-4 p-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-base font-bold">{title}</p>
        <p className="mt-2 text-sm leading-6 text-secondary">{body}</p>
      </div>
    </div>
  );
}
