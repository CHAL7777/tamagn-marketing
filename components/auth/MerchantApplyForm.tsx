"use client";

import { useActionState } from "react";
import { submitMerchantApplication, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function MerchantApplyForm() {
  const [state, formAction, pending] = useActionState(
    submitMerchantApplication,
    null
  );

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-medium text-foreground">Application submitted</p>
        <p className="mt-1 text-muted-foreground">
          An administrator will review your business. You will get access to the
          merchant dashboard after approval.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" action={formAction}>
      {state?.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="business_name" className="text-sm font-medium">
          Business name
        </label>
        <input
          id="business_name"
          name="business_name"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="location_label" className="text-sm font-medium">
          Location
        </label>
        <input
          id="location_label"
          name="location_label"
          placeholder="City / area"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Business phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
