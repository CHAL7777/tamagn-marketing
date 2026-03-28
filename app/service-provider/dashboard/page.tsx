import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ServiceProviderDashboardPage() {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-sm text-muted-foreground">
        <p>Your account is not linked as a service provider yet.</p>
        <p className="mt-2">Ask an admin to assign the role and provider profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Service provider</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/service-provider/services"
          className={cn(buttonVariants({ variant: "outline" }), "h-auto py-6")}
        >
          My listings
        </Link>
        <Link
          href="/service-provider/add-service"
          className={cn(buttonVariants({ variant: "outline" }), "h-auto py-6")}
        >
          Add service
        </Link>
        <Link
          href="/service-provider/requests"
          className={cn(buttonVariants({ variant: "outline" }), "h-auto py-6")}
        >
          Incoming requests
        </Link>
        <Link
          href="/service-provider/profile"
          className={cn(buttonVariants({ variant: "outline" }), "h-auto py-6")}
        >
          Profile
        </Link>
      </div>
    </div>
  );
}
