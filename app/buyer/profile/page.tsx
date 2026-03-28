import { redirect } from "next/navigation";
import { CreditCard, MapPinned, ShieldCheck, UserCircle2 } from "lucide-react";
import { getProfile, getUser } from "@/lib/auth";
import { listAddressesForUser, addAddress } from "@/app/actions/addresses";
import { updateMpesaMsisdn } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";

export default async function BuyerProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/buyer/profile");

  const [profile, addresses] = await Promise.all([getProfile(), listAddressesForUser()]);

  return (
    <main className="page-shell pb-24 pt-8">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="editorial-card p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-20 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed shadow-[0_18px_36px_rgba(69,227,53,0.2)]">
              <UserCircle2 className="size-10" />
            </span>
            <div>
              <p className="section-kicker">Profile settings</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.05em]">
                {profile?.full_name || user.email || "Tamagn buyer"}
              </h1>
              <p className="mt-2 text-sm text-secondary">{user.email}</p>
            </div>
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-surface-container-low p-5">
            <span className="tamagn-chip bg-primary-fixed text-on-primary-fixed">
              <ShieldCheck className="size-4" />
              Escrow-ready account
            </span>
            <p className="mt-4 text-sm leading-7 text-secondary">
              Keep your delivery destinations and M-Pesa number current so STK
              checkout and platform logistics work without friction.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="editorial-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
                <CreditCard className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-[-0.03em]">M-Pesa number</h2>
                <p className="text-sm text-secondary">
                  Used for STK Push in international format.
                </p>
              </div>
            </div>
            <form action={updateMpesaMsisdn} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                name="mpesa_msisdn"
                type="tel"
                placeholder="251…"
                defaultValue={profile?.mpesa_msisdn ?? ""}
                className="tamagn-field flex-1"
              />
              <Button type="submit">Save number</Button>
            </form>
          </section>

          <section className="editorial-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-[1.1rem] bg-surface-container-low text-primary">
                <MapPinned className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-[-0.03em]">Delivery addresses</h2>
                <p className="text-sm text-secondary">
                  Saved destinations for order routing and courier assignment.
                </p>
              </div>
            </div>

            <ul className="mt-5 grid gap-3">
              {addresses.map(
                (a: {
                  id: string;
                  label: string | null;
                  line1: string;
                  city: string;
                  is_default: boolean;
                }) => (
                  <li key={a.id} className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm">
                    <p className="font-semibold text-foreground">
                      {a.label || "Saved address"}
                      {a.is_default ? " · Default" : ""}
                    </p>
                    <p className="mt-1 text-secondary">
                      {a.line1}, {a.city}
                    </p>
                  </li>
                )
              )}
            </ul>

            <form action={addAddress} className="mt-6 space-y-3 rounded-[1.5rem] bg-surface-container-low p-5">
              <h3 className="text-sm font-semibold">Add address</h3>
              <input
                name="label"
                placeholder="Label (e.g. Home)"
                className="tamagn-field"
              />
              <input
                name="line1"
                required
                placeholder="Street / building"
                className="tamagn-field"
              />
              <input
                name="city"
                required
                placeholder="City"
                className="tamagn-field"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  className="tamagn-field"
                />
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  className="tamagn-field"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-secondary">
                <input type="checkbox" name="is_default" />
                Set as default
              </label>
              <Button type="submit">Add address</Button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
