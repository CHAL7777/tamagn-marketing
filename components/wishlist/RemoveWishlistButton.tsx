"use client";

import { useTransition } from "react";
import { removeFromWishlist } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/button";

export function RemoveWishlistButton({ productId }: { productId: string }) {
  const [p, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={p}
      onClick={() => start(() => removeFromWishlist(productId))}
    >
      Remove
    </Button>
  );
}
