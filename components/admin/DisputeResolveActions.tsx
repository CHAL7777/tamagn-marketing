"use client";

import { useTransition } from "react";
import { resolveDispute } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

type Props = { disputeId: string };

export function DisputeResolveActions({ disputeId }: Props) {
  const [p, start] = useTransition();

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        disabled={p}
        onClick={() =>
          start(async () => {
            try {
              await resolveDispute(
                disputeId,
                "release_to_merchant",
                "Admin: release escrow to seller"
              );
            } catch (e) {
              alert(e instanceof Error ? e.message : "Failed");
            }
          })
        }
      >
        Release to seller
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={p}
        onClick={() =>
          start(async () => {
            try {
              await resolveDispute(
                disputeId,
                "refund_buyer",
                "Admin: cancel order / refund buyer"
              );
            } catch (e) {
              alert(e instanceof Error ? e.message : "Failed");
            }
          })
        }
      >
        Refund buyer
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={p}
        onClick={() =>
          start(async () => {
            try {
              await resolveDispute(
                disputeId,
                "partial_refund",
                "Admin: partial — settle payout manually"
              );
            } catch (e) {
              alert(e instanceof Error ? e.message : "Failed");
            }
          })
        }
      >
        Partial (manual payout)
      </Button>
    </div>
  );
}
