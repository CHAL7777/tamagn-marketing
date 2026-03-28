"use client";

import { useActionState } from "react";
import { submitMerchantApplication } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type Props = {
  labels: {
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
};

export function MerchantApplyForm({ labels }: Props) {
  const [state, formAction, pending] = useActionState(
    submitMerchantApplication,
    null
  );

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-medium text-foreground">{labels.successTitle}</p>
        <p className="mt-1 text-muted-foreground">
          {labels.successBody}
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
          {labels.businessName}
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
          {labels.description}
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
          {labels.location}
        </label>
        <input
          id="location_label"
          name="location_label"
          placeholder={labels.locationPlaceholder}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          {labels.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
