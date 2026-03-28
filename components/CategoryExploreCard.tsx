import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  href: string;
  icon: LucideIcon;
  accent: "product" | "service";
  typeLabel: string;
  browseLabel: string;
};

export function CategoryExploreCard({
  name,
  href,
  icon: Icon,
  accent,
  typeLabel,
  browseLabel,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface-container-lowest p-5 shadow-[0_14px_40px_rgba(26,28,28,0.05)] transition duration-300",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_22px_50px_rgba(1,110,0,0.1)]"
      )}
    >
      <span
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-2xl transition-colors",
          accent === "product"
            ? "bg-primary/10 text-primary group-hover:bg-primary/15"
            : "bg-tertiary-container/15 text-on-tertiary-container group-hover:bg-tertiary-container/25"
        )}
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <span className="section-kicker text-[10px]">{typeLabel}</span>
      <h3 className="mt-2 font-headline text-lg font-bold leading-snug tracking-[-0.03em] text-foreground">
        {name}
      </h3>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-90 transition group-hover:opacity-100">
        {browseLabel}
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}
