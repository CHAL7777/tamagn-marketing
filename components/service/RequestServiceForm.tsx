"use client";

import { useActionState } from "react";
import { submitServiceRequest, type ServiceReqState } from "@/app/actions/service-requests";
import { Button } from "@/components/ui/button";

type Props = { serviceListingId: string };

export function RequestServiceForm({ serviceListingId }: Props) {
  const bound = submitServiceRequest.bind(null, serviceListingId);
  const [state, formAction, pending] = useActionState(bound, null);

  return (
    <form action={formAction} className="space-y-3">
      <h2 className="font-medium">Request this service</h2>
      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-primary">Request sent to the provider.</p>
      ) : null}
      <textarea
        name="message"
        rows={3}
        placeholder="Describe what you need"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}
