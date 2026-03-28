import Image from "next/image";

type Props = {
  title: string;
  price: number;
  imageUrl?: string | null;
  merchantName?: string | null;
  trust?: number;
};

export function ProductCard({
  title,
  price,
  imageUrl,
  merchantName,
  trust,
}: Props) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-primary/40">
      <div className="relative aspect-[4/3] bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
            unoptimized
          />
        ) : null}
      </div>
      <div className="p-4">
        <h2 className="font-medium leading-snug">{title}</h2>
        {merchantName ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {merchantName}
            {trust != null ? ` · ★ ${trust.toFixed(1)}` : null}
          </p>
        ) : null}
        <p className="mt-2 text-lg font-semibold tabular-nums">
          {price.toLocaleString()} ETB
        </p>
      </div>
    </article>
  );
}
