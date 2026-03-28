import { MapPin, Star } from "lucide-react";
import Image from "next/image";

type Props = {
  title: string;
  price: number;
  imageUrl?: string | null;
  merchantName?: string | null;
  trust?: number;
  verified?: boolean;
  locationLabel?: string | null;
  distanceKm?: number | null;
  soldCount?: number;
};

export function ProductCard({
  title,
  price,
  imageUrl,
  merchantName,
  trust,
  verified,
  locationLabel,
  distanceKm,
  soldCount,
}: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-[0_18px_44px_rgba(26,28,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_58px_rgba(26,28,28,0.1)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,190,0,0.18),transparent_36%),linear-gradient(160deg,#ffffff_0%,#f3f3f3_100%)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
        {verified ? (
          <span className="trust-badge absolute left-4 top-4">
            <Star className="size-3.5 fill-current" />
            Verified
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-headline text-xl font-bold leading-snug tracking-[-0.03em]">
            {title}
          </h2>
          {trust != null ? (
            <span className="inline-flex items-center gap-1 rounded-xl bg-tertiary-container/14 px-2.5 py-1 text-xs font-bold text-on-tertiary-container">
              <Star className="size-3.5 fill-current text-tertiary-container" />
              {trust.toFixed(1)}
            </span>
          ) : null}
        </div>
        {merchantName ? (
          <p className="mt-2 text-sm font-medium text-secondary">{merchantName}</p>
        ) : null}
        {(locationLabel || distanceKm != null || soldCount != null) ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
            {locationLabel ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {locationLabel}
              </span>
            ) : null}
            {distanceKm != null ? <span>{distanceKm.toFixed(1)} km away</span> : null}
            {soldCount != null ? <span>{soldCount} sold</span> : null}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="section-kicker">Price</p>
            <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-primary">
              {price.toLocaleString()} ETB
            </p>
          </div>
          <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary transition group-hover:bg-primary group-hover:text-on-primary">
            View
          </span>
        </div>
      </div>
    </article>
  );
}
