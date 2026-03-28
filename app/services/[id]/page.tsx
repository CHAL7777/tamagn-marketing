import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CreditCard, MapPinned, Star } from "lucide-react";
import { getServiceListingById } from "@/lib/queries/services";
import { publicStorageUrl } from "@/lib/storage-url";
import Image from "next/image";
import { RequestServiceForm } from "@/components/service/RequestServiceForm";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getServiceListingById(id);
  if (!listing) notFound();

  const sp = listing.service_providers as {
    id: string;
    business_name: string;
    bio: string | null;
    trust_score: string;
  } | null;

  const areas = (listing.service_areas as { area_label: string }[]) ?? [];
  const portfolio =
    (listing.service_portfolio as { storage_path: string }[]) ?? [];

  const prepaid = Boolean(listing.prepaid_escrow);
  const minPrice = listing.price_min != null ? Number(listing.price_min) : null;

  return (
    <main className="page-shell pb-24 pt-8">
      <Link href="/services" className="eyebrow-link">
        <ArrowLeft className="size-4" />
        Back to services
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <div className="editorial-card overflow-hidden p-6 md:p-8">
            <p className="section-kicker">Service detail</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">
              {listing.title}
            </h1>
            {sp ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-secondary">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="size-4 text-primary" />
                  {sp.business_name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-current text-tertiary-container" />
                  Trust {Number(sp.trust_score).toFixed(1)}
                </span>
              </div>
            ) : null}
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-secondary">
              {listing.description}
            </p>
            {areas.length > 0 ? (
              <div className="mt-6 rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-secondary">
                <p className="font-semibold text-foreground">Service areas</p>
                <p className="mt-2">{areas.map((a) => a.area_label).join(", ")}</p>
              </div>
            ) : null}
          </div>

          {portfolio.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {portfolio.slice(0, 6).map((p) => {
                const u = publicStorageUrl("portfolio", p.storage_path);
                if (!u) return null;
                return (
                  <div
                    key={p.storage_path}
                    className="editorial-card relative aspect-square overflow-hidden"
                  >
                    <Image src={u} alt="" fill className="object-cover" unoptimized />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="editorial-card p-6">
            <p className="section-kicker">Booking options</p>
            <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-primary">
              {minPrice != null && listing.price_max != null
                ? `${minPrice.toLocaleString()} – ${Number(listing.price_max).toLocaleString()} ETB`
                : minPrice != null
                  ? `${minPrice.toLocaleString()} ETB+`
                  : "Request quote"}
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-[1.5rem] bg-surface-container-low p-4">
                <p className="inline-flex items-center gap-2 font-semibold text-foreground">
                  <MapPinned className="size-4 text-primary" />
                  Area-aware service routing
                </p>
              </div>
              {prepaid && minPrice != null && minPrice > 0 ? (
                <div className="rounded-[1.5rem] bg-surface-container-low p-4">
                  <p className="inline-flex items-center gap-2 font-semibold text-foreground">
                    <CreditCard className="size-4 text-primary" />
                    Prepaid escrow booking available
                  </p>
                  <p className="mt-2 leading-6 text-secondary">
                    Pay with M-Pesa and keep funds protected until work is
                    completed.
                  </p>
                  <Link
                    href={`/checkout/service/${listing.id}`}
                    className={cn(buttonVariants({ variant: "default" }), "mt-4 inline-flex")}
                  >
                    Book and pay
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="editorial-card p-6">
            <h2 className="text-xl font-bold tracking-[-0.03em]">Request a quote</h2>
            <p className="mt-2 text-sm leading-7 text-secondary">
              Send a direct message with your job details to start the
              conversation.
            </p>
            <div className="mt-5">
              <RequestServiceForm serviceListingId={listing.id} />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
