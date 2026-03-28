import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { getProductById } from "@/lib/queries/products";
import { publicStorageUrl } from "@/lib/storage-url";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { WishlistForm } from "@/components/product/WishlistForm";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getProductById(id);
  if (!data) notFound();

  const { product, images } = data;
  const m = product.merchants as {
    id: string;
    business_name: string;
    description: string | null;
    trust_score: string;
    verification_badge: boolean;
    location_label: string | null;
  } | null;

  const mainImg = publicStorageUrl(
    "product-images",
    product.featured_image_path
  );
  const gallery = [
    mainImg,
    ...images.map((im) => publicStorageUrl("product-images", im.storage_path)),
  ].filter(Boolean) as string[];

  return (
    <main className="page-shell pb-24 pt-8">
      <Link href="/products" className="eyebrow-link mb-6">
        <ArrowRight className="size-4 rotate-180" />
        Back to marketplace
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="editorial-card relative aspect-[4/5] overflow-hidden bg-surface-container-low">
            {mainImg ? (
              <Image
                src={mainImg}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 55vw"
                unoptimized
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,190,0,0.18),transparent_36%),linear-gradient(160deg,#ffffff_0%,#f3f3f3_100%)]" />
            )}
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              {m?.verification_badge ? (
                <span className="trust-badge">
                  <BadgeCheck className="size-3.5" />
                  Verified merchant
                </span>
              ) : null}
              <span className="rounded-full bg-black/35 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                {product.stock > 0 ? `${product.stock} in stock` : "Made to order"}
              </span>
            </div>
          </div>

          {gallery.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="editorial-card relative aspect-square overflow-hidden"
                >
                  <Image
                    src={src}
                    alt={product.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="section-shell bg-surface-container-lowest">
            <p className="section-kicker">Product detail</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
              {product.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-secondary">
              {m ? (
                <span className="inline-flex items-center gap-2">
                  <StoreBadge businessName={m.business_name} />
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-current text-tertiary-container" />
                Trust {Number(m?.trust_score ?? 0).toFixed(1)}
              </span>
              {m?.location_label ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {m.location_label}
                </span>
              ) : null}
            </div>
            <p className="mt-6 text-4xl font-black tracking-[-0.06em] text-primary">
              {Number(product.price).toLocaleString()} ETB
            </p>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-secondary">
              {product.description || "No product description provided yet."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/checkout?productId=${product.id}&qty=1`}
                className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              >
                <ShoppingBag className="size-4" />
                Buy with escrow
              </Link>
              <WishlistForm productId={product.id} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoCard
              icon={ShieldCheck}
              title="Escrow protected"
              body="Payment stays protected until the buyer confirms delivery."
            />
            <InfoCard
              icon={Truck}
              title="Managed delivery"
              body="Courier coordination and tracking happen through the platform."
            />
            <InfoCard
              icon={BadgeCheck}
              title="Merchant trust"
              body={`${product.sold_count} completed sales contribute to merchant visibility.`}
            />
          </div>

          {m ? (
            <div className="editorial-card p-6">
              <p className="section-kicker">Merchant profile</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]">
                {m.business_name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-secondary">
                {m.description ||
                  "This merchant is verified on the platform and eligible to receive payment only after successful fulfillment."}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="editorial-card p-5">
      <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-base font-bold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-secondary">{body}</p>
    </div>
  );
}

function StoreBadge({ businessName }: { businessName: string }) {
  return (
    <>
      <BadgeCheck className="size-4 text-primary" />
      <span className="font-semibold text-foreground">{businessName}</span>
    </>
  );
}
