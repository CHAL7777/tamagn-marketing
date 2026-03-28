import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceListingById } from "@/lib/queries/services";
import { publicStorageUrl } from "@/lib/storage-url";
import Image from "next/image";
import { RequestServiceForm } from "@/components/service/RequestServiceForm";

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{listing.title}</h1>
      {sp ? (
        <p className="text-sm text-muted-foreground">
          {sp.business_name} · ★ {Number(sp.trust_score).toFixed(1)}
        </p>
      ) : null}
      <p className="mt-4 whitespace-pre-wrap text-sm">{listing.description}</p>
      {areas.length > 0 ? (
        <p className="mt-4 text-sm">
          <span className="font-medium">Areas: </span>
          {areas.map((a) => a.area_label).join(", ")}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {portfolio.map((p) => {
          const u = publicStorageUrl("portfolio", p.storage_path);
          if (!u) return null;
          return (
            <div
              key={p.storage_path}
              className="relative h-28 w-28 overflow-hidden rounded-md border"
            >
              <Image src={u} alt="" fill className="object-cover" unoptimized />
            </div>
          );
        })}
      </div>
      <div className="mt-8 rounded-lg border p-4">
        <RequestServiceForm serviceListingId={listing.id} />
      </div>
      <p className="mt-6">
        <Link href="/services" className="text-sm text-primary underline">
          ← All services
        </Link>
      </p>
    </div>
  );
}
