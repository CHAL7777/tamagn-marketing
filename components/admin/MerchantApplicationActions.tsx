"use client";

import { useTransition } from "react";
import {
  approveMerchantApplication,
  rejectMerchantApplication,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

type Props = { applicationId: string };

export function MerchantApplicationActions({ applicationId }: Props) {
  const [p, start] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        disabled={p}
        onClick={() =>
          start(async () => {
            try {
              await approveMerchantApplication(applicationId);
            } catch (e) {
              alert(e instanceof Error ? e.message : "Approve failed");
            }
          })
        }
      >
        Approve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={p}
        onClick={() =>
          start(async () => {
            try {
              await rejectMerchantApplication(applicationId, "Rejected");
            } catch (e) {
              alert(e instanceof Error ? e.message : "Reject failed");
            }
          })
        }
      >
        Reject
      </Button>
    </div>
  );
}
