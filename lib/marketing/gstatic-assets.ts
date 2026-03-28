/** Stable PNGs on Google’s gstatic CDN (Material System icons). Illustrative only; not a Google partnership. */
export const GSTATIC_MATERIAL_ICONS_BASE =
  "https://www.gstatic.com/images/icons/material/system/2x" as const;

export const gstaticMaterialIcon = (filename: string) =>
  `${GSTATIC_MATERIAL_ICONS_BASE}/${filename}`;

export const GSTATIC_ICONS = {
  shoppingCart: "shopping_cart_black_48dp.png",
  storefront: "storefront_black_48dp.png",
  person: "person_black_48dp.png",
  verifiedUser: "verified_user_black_48dp.png",
  localShipping: "local_shipping_black_48dp.png",
  terminal: "terminal_black_48dp.png",
  wallet: "account_balance_wallet_black_48dp.png",
} as const;
