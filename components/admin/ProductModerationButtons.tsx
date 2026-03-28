"use client";

import { useTransition } from "react";
import { setProductModerationStatus } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

type Props = { productId: string; currentStatus: string };

export function ProductModerationButtons({ productId, currentStatus }: Props) {
  const [p, start] = useTransition();

  return (
    <div className="flex gap-2">
      {currentStatus !== "suspended" ? (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={p}
          onClick={() =>
            start(async () => {
              await setProductModerationStatus(productId, "suspended", "Admin suspend");
            })
          }
        >
          Suspend
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={p}
          onClick={() =>
            start(async () => {
              await setProductModerationStatus(productId, "active", "Admin restore");
            })
          }
        >
          Restore
        </Button>
      )}
    </div>
  );
}
