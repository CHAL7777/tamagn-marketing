import Link from "next/link";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { addToWishlistForm } from "@/app/actions/wishlist";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { productId: string };

export async function WishlistForm({ productId }: Props) {
  const user = await getUser();
  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "inline-flex shrink-0"
        )}
      >
        Sign in to save
      </Link>
    );
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (row) {
    return (
      <p className="text-sm text-muted-foreground">
        Saved —{" "}
        <Link href="/buyer/wishlist" className="text-primary underline">
          wishlist
        </Link>
      </p>
    );
  }

  return (
    <form action={addToWishlistForm} className="inline-flex shrink-0">
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" variant="outline" size="sm">
        Add to wishlist
      </Button>
    </form>
  );
}
