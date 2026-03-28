import Link from "next/link";
import {
  ArrowRight,
  Grid3x3,
  Layers,
  Briefcase,
  Cpu,
  Home,
  Shirt,
  Sparkles,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Baby,
  BookOpen,
  Dog,
  Gem,
  Palette,
  Factory,
  Wrench,
  SprayCan,
  Scissors,
  GraduationCap,
  Monitor,
  Camera,
  Truck,
  Scale,
  Hammer,
  MessageSquare,
  Stethoscope,
  Bike,
  ChefHat,
  Smartphone,
  Plug,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCategories } from "@/lib/queries/products";
import { CategoryExploreCard } from "@/components/CategoryExploreCard";
import { buttonVariants } from "@/components/ui/button-variants";
import { getCurrentLocale } from "@/lib/i18n/server";
import {
  getDictionary,
  numberLocale,
  translateCategoryLabel,
} from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const PRODUCT_ICONS: LucideIcon[] = [
  Cpu,
  Smartphone,
  Plug,
  Shirt,
  Sparkles,
  Sparkles,
  Baby,
  UtensilsCrossed,
  Home,
  Home,
  UtensilsCrossed,
  Dumbbell,
  Car,
  Wrench,
  Grid3x3,
  BookOpen,
  Dog,
  Gem,
  Palette,
  Factory,
];

const SERVICE_ICONS: LucideIcon[] = [
  Briefcase,
  Wrench,
  SprayCan,
  Scissors,
  GraduationCap,
  Monitor,
  Camera,
  Truck,
  Scale,
  Hammer,
  MessageSquare,
  Stethoscope,
  Bike,
  ChefHat,
];

function iconFor(index: number, icons: LucideIcon[]) {
  return icons[index % icons.length]!;
}

export default async function CategoriesPage() {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
  const countFormat = new Intl.NumberFormat(numberLocale(locale));
  const [productCats, serviceCats] = await Promise.all([
    getCategories("product"),
    getCategories("service"),
  ]);

  return (
    <main className="page-shell pb-24 pt-8 md:pt-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-surface-container-lowest px-6 py-10 shadow-[var(--panel-shadow)] md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-tertiary-container/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <span className="tamagn-chip bg-primary-fixed text-on-primary-fixed">
              <Layers className="size-4" />
              {dictionary.categories.badge}
            </span>
            <h1 className="max-w-3xl font-headline text-4xl font-extrabold tracking-[-0.06em] text-foreground md:text-6xl">
              {dictionary.categories.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-secondary md:text-lg">
              {dictionary.categories.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/products"
                className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              >
                {dictionary.categories.shopProducts}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/services"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                {dictionary.categories.findServices}
              </Link>
            </div>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-6 md:p-7">
            <p className="section-kicker">{dictionary.categories.atAGlance}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-4xl font-black tracking-[-0.05em] text-primary">
                  {countFormat.format(productCats.length)}
                </p>
                <p className="mt-1 text-sm font-medium text-secondary">
                  {dictionary.categories.productCategories}
                </p>
              </div>
              <div>
                <p className="text-4xl font-black tracking-[-0.05em] text-tertiary-container">
                  {countFormat.format(serviceCats.length)}
                </p>
                <p className="mt-1 text-sm font-medium text-secondary">
                  {dictionary.categories.serviceCategories}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">{dictionary.categories.productsKicker}</p>
            <h2 className="mt-2 font-headline text-3xl font-bold tracking-[-0.05em] md:text-4xl">
              {dictionary.categories.productsTitle}
            </h2>
          </div>
          <Link href="/products" className="eyebrow-link">
            {dictionary.categories.viewAllProducts}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productCats.map((c, i) => (
            <li key={c.id}>
              <CategoryExploreCard
                name={translateCategoryLabel(c.slug, c.name, locale)}
                href={`/products?category=${encodeURIComponent(c.slug)}`}
                icon={iconFor(i, PRODUCT_ICONS)}
                accent="product"
                typeLabel={dictionary.categories.productsKicker}
                browseLabel={dictionary.products.view}
              />
            </li>
          ))}
        </ul>
        {productCats.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-surface-container-low px-5 py-4 text-sm text-secondary">
            {dictionary.categories.noProductCategories}
          </p>
        ) : null}
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">{dictionary.categories.servicesKicker}</p>
            <h2 className="mt-2 font-headline text-3xl font-bold tracking-[-0.05em] md:text-4xl">
              {dictionary.categories.servicesTitle}
            </h2>
          </div>
          <Link href="/services" className="eyebrow-link">
            {dictionary.categories.viewAllServices}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {serviceCats.map((c, i) => (
            <li key={c.id}>
              <CategoryExploreCard
                name={translateCategoryLabel(c.slug, c.name, locale)}
                href={`/services?category=${encodeURIComponent(c.slug)}`}
                icon={iconFor(i, SERVICE_ICONS)}
                accent="service"
                typeLabel={dictionary.categories.servicesKicker}
                browseLabel={dictionary.services.viewService}
              />
            </li>
          ))}
        </ul>
        {serviceCats.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-surface-container-low px-5 py-4 text-sm text-secondary">
            {dictionary.categories.noServiceCategories}
          </p>
        ) : null}
      </section>
    </main>
  );
}
