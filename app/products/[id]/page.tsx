import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/queries/products";
import { publicStorageUrl } from "@/lib/storage-url";
import { buttonVariants } from "@/components/ui/button";
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
          {mainImg ? (
            <Image
              src={mainImg}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
              unoptimized
              priority
            />
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="mt-2 text-2xl font-bold tabular-nums">
            {Number(product.price).toLocaleString()} ETB
          </p>
          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
            {product.description}
          </p>
          {m ? (
            <div className="mt-6 rounded-lg border p-4 text-sm">
              <p className="font-medium">{m.business_name}</p>
              {m.verification_badge ? (
                <span className="text-xs text-primary">Verified merchant</span>
              ) : null}
              <p className="mt-1 text-muted-foreground">
                Trust {Number(m.trust_score).toFixed(1)} · Sold{" "}
                {product.sold_count} · {m.location_label ?? "Local delivery"}
              </p>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/checkout?productId=${product.id}&qty=1`}
              className={cn(buttonVariants(), "inline-flex shrink-0")}
            >
              Buy with escrow
            </Link>
            <WishlistForm productId={product.id} />
          </div>
        </div>
      </div>
      {images.length > 0 ? (
        <div className="mt-8 flex gap-2 overflow-x-auto">
          {images.map((im) => {
            const u = publicStorageUrl("product-images", im.storage_path);
            if (!u) return null;
            return (
              <div
                key={im.storage_path}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border"
              >
                <Image src={u} alt="" fill className="object-cover" unoptimized />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
