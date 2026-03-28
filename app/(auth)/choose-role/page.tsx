import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/auth";
import { MerchantApplyForm } from "@/components/auth/MerchantApplyForm";
import { MaterialIconImage } from "@/components/marketing/MaterialIconImage";
import { buttonVariants } from "@/components/ui/button-variants";
import { getCurrentLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const copy: Record<
  Locale,
  {
    title: string;
    body: string;
    buyerTitle: string;
    buyerBody: string;
    buyerCta: string;
    buyerCartAlt: string;
    buyerPersonAlt: string;
    merchantTitle: string;
    merchantBody: string;
    merchantStoreAlt: string;
    merchantBadgeAlt: string;
    merchantForm: {
      successTitle: string;
      successBody: string;
      businessName: string;
      description: string;
      location: string;
      locationPlaceholder: string;
      phone: string;
      submit: string;
      submitting: string;
    };
  }
> = {
  en: {
    title: "Your path",
    body: "Shop as a buyer or apply to sell as a verified merchant.",
    buyerTitle: "Continue as buyer",
    buyerBody: "Browse products, track orders, and pay with M-Pesa escrow.",
    buyerCta: "Go to buyer home",
    buyerCartAlt: "Shopping cart",
    buyerPersonAlt: "Buyer account",
    merchantTitle: "Apply as merchant",
    merchantBody: "Platform admins verify every shop before you can list products.",
    merchantStoreAlt: "Storefront",
    merchantBadgeAlt: "Verified merchant",
    merchantForm: {
      successTitle: "Application submitted",
      successBody:
        "An administrator will review your business. You will get access to the merchant dashboard after approval.",
      businessName: "Business name",
      description: "Description",
      location: "Location",
      locationPlaceholder: "City / area",
      phone: "Business phone",
      submit: "Submit application",
      submitting: "Submitting…",
    },
  },
  am: {
    title: "መንገድዎ",
    body: "እንደ ገዢ ይግዙ ወይም እንደ ተረጋገጠ ነጋዴ ለመሸጥ ያመልክቱ።",
    buyerTitle: "እንደ ገዢ ይቀጥሉ",
    buyerBody: "ምርቶችን ያስሱ፣ ትእዛዞችን ይከታተሉ እና በኤም-ፔሳ ኤስክሮ ይክፈሉ።",
    buyerCta: "ወደ ገዢ መነሻ ይሂዱ",
    buyerCartAlt: "የግዢ ጋሪ",
    buyerPersonAlt: "የገዢ መለያ",
    merchantTitle: "እንደ ነጋዴ ያመልክቱ",
    merchantBody: "ምርቶችን ከማቅረብዎ በፊት የመድረኩ አስተዳዳሪዎች እያንዳንዱን ሱቅ ያረጋግጣሉ።",
    merchantStoreAlt: "ሱቅ",
    merchantBadgeAlt: "የተረጋገጠ ነጋዴ",
    merchantForm: {
      successTitle: "ማመልከቻው ተልኳል",
      successBody:
        "አስተዳዳሪ ንግድዎን ይገምግማል። ከፍቃድ በኋላ ወደ ነጋዴ ዳሽቦርድ መግቢያ ያገኛሉ።",
      businessName: "የንግድ ስም",
      description: "መግለጫ",
      location: "አካባቢ",
      locationPlaceholder: "ከተማ / አካባቢ",
      phone: "የንግድ ስልክ",
      submit: "ማመልከቻ ላክ",
      submitting: "በመላክ ላይ…",
    },
  },
  om: {
    title: "Karaa kee",
    body: "Akka bitataa bitadhu yookiin akka daldalaa mirkanaa'etti gurguruuf iyyadhu.",
    buyerTitle: "Akka bitataa itti fufi",
    buyerBody: "Meeshaalee ilaali, ajaja hordofi, fi M-Pesa escrow'n kaffali.",
    buyerCta: "Gara mana bitataa deemi",
    buyerCartAlt: "Gaarii bittaa",
    buyerPersonAlt: "Akaawuntii bitataa",
    merchantTitle: "Akka daldalaa iyyadhu",
    merchantBody: "Oomisha tarreessuu dura adminni platformii suuqii hunda ni mirkaneessa.",
    merchantStoreAlt: "Suuqii",
    merchantBadgeAlt: "Daldalaa mirkanaa'e",
    merchantForm: {
      successTitle: "Iyyanni ergameera",
      successBody:
        "Adminni hojii kee ni ilaala. Erga hayyamameen booda dashboard daldalaa ni argatta.",
      businessName: "Maqaa daldalaa",
      description: "Ibsa",
      location: "Bakki",
      locationPlaceholder: "Magaalaa / naannoo",
      phone: "Bilbila daldalaa",
      submit: "Iyyata ergi",
      submitting: "Ergaa jira…",
    },
  },
};

export default async function ChooseRolePage() {
  const [user, locale] = await Promise.all([getUser(), getCurrentLocale()]);
  const labels = copy[locale];
  if (!user) redirect("/login?next=/choose-role");

  const profile = await getProfile();
  if (profile?.role === "merchant" || profile?.role === "admin") {
    redirect("/merchant/dashboard");
  }
  if (profile?.role === "service_provider") {
    redirect("/service-provider/dashboard");
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold tracking-[-0.04em]">{labels.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {labels.body}
      </p>
      <div className="mt-8 space-y-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-surface-container-lowest shadow-[var(--panel-shadow)]">
          <div className="flex items-center justify-center gap-3 border-b border-border/60 bg-surface-container-low/50 px-4 py-5">
            <MaterialIconImage icon="shoppingCart" alt={labels.buyerCartAlt} size={48} />
            <MaterialIconImage icon="person" alt={labels.buyerPersonAlt} size={48} />
          </div>
          <div className="p-5">
            <h2 className="font-semibold text-foreground">{labels.buyerTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {labels.buyerBody}
            </p>
            <Link
              href="/buyer/dashboard"
              className={cn(buttonVariants(), "mt-4 inline-flex")}
            >
              {labels.buyerCta}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-surface-container-lowest shadow-[var(--panel-shadow)]">
          <div className="flex items-center justify-center gap-3 border-b border-border/60 bg-surface-container-low/50 px-4 py-5">
            <MaterialIconImage icon="storefront" alt={labels.merchantStoreAlt} size={48} />
            <MaterialIconImage icon="verifiedUser" alt={labels.merchantBadgeAlt} size={48} />
          </div>
          <div className="p-5">
            <h2 className="font-semibold text-foreground">{labels.merchantTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {labels.merchantBody}
            </p>
            <div className="mt-4">
              <MerchantApplyForm labels={labels.merchantForm} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
