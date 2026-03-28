"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { submitServiceRequest } from "@/app/actions/service-requests";
import { Button } from "@/components/ui/button";

type Props = { serviceListingId: string };

export function RequestServiceForm({ serviceListingId }: Props) {
  const bound = submitServiceRequest.bind(null, serviceListingId);
  const [state, formAction, pending] = useActionState(bound, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error ? (
        <p className="rounded-[1.25rem] bg-error-container px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-[1.25rem] bg-surface-container-low px-4 py-3 text-sm text-primary">
          Request sent to the provider.
        </p>
      ) : null}
      <textarea
        name="message"
        rows={3}
        placeholder="Describe what you need"
        className="tamagn-textarea"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send request"}
        {!pending ? <ArrowRight className="size-4" /> : null}
      </Button>
    </form>
  );
}
