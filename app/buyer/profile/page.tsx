import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { listAddressesForUser, addAddress } from "@/app/actions/addresses";
import { updateMpesaMsisdn } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";

export default async function BuyerProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/buyer/profile");

  const addresses = await listAddressesForUser();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Profile &amp; addresses</h1>
      <p className="text-sm text-muted-foreground">{user.email}</p>

      <section className="mt-8">
        <h2 className="font-medium">M-Pesa number</h2>
        <p className="text-xs text-muted-foreground">
          Used for STK Push (international format, e.g. 251…)
        </p>
        <form action={updateMpesaMsisdn} className="mt-2 flex gap-2">
          <input
            name="mpesa_msisdn"
            type="tel"
            placeholder="251…"
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm">
            Save
          </Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-medium">Delivery addresses</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {addresses.map(
            (a: {
              id: string;
              label: string | null;
              line1: string;
              city: string;
              is_default: boolean;
            }) => (
              <li key={a.id} className="rounded border p-3">
                {a.label ? `${a.label} · ` : ""}
                {a.line1}, {a.city}
                {a.is_default ? " (default)" : ""}
              </li>
            )
          )}
        </ul>

        <form action={addAddress} className="mt-6 space-y-3 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Add address</h3>
          <input
            name="label"
            placeholder="Label (e.g. Home)"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <input
            name="line1"
            required
            placeholder="Street / building"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <input
            name="city"
            required
            placeholder="City"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <input
            name="latitude"
            type="number"
            step="any"
            placeholder="Latitude (optional)"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <input
            name="longitude"
            type="number"
            step="any"
            placeholder="Longitude (optional)"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_default" />
            Set as default
          </label>
          <Button type="submit">Add</Button>
        </form>
      </section>
    </div>
  );
}
