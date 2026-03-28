# Design System Document: The Trust-Architect Framework

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Guardian."** In the Ethiopian hyperlocal commerce context, technology must bridge the gap between digital efficiency and traditional interpersonal trust (*Tamagn*). 

This system rejects the "template-heavy" look of generic marketplaces. Instead, it adopts a **High-End Editorial** approach. We achieve this by breaking the rigid grid through intentional asymmetry, overlapping elements, and high-contrast typography scales. The goal is to move beyond a "tool" and create an "experience" that feels as authoritative as a private bank but as accessible as a local market.

### Key Design Principles
*   **Trust through Transparency:** Use glassmorphism and layered depth to show, not just tell, security.
*   **Mobile-First Precision:** Every tap target and spacing unit is optimized for one-handed thumb interaction.
*   **Editorial Authority:** High-contrast type scales (Manrope for displays, Inter for utility) guide the user's eye like a premium magazine.

---

## 2. Colors & Surface Logic
The palette is rooted in the reliability of M-Pesa Green and the urgency of Action Orange, refined through a sophisticated Material Design tonal system.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts.
*   Use `surface-container-low` for secondary sections sitting on a `surface` background.
*   Use `surface-container-lowest` to create high-contrast "pop-out" cards against a `surface-dim` background.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
*   **Level 0 (Base):** `surface` (#f9f9f9)
*   **Level 1 (Subtle Inset):** `surface-container` (#eeeeee)
*   **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff)
*   **Level 3 (Elevated Overlays):** `surface-bright` (#f9f9f9) with Glassmorphism.

### The "Glass & Gradient" Rule
To escape the "flat" look, floating elements (like Bottom Navigation or Floating Action Buttons) must use a semi-transparent `primary-container` or `surface` with a `backdrop-blur` of 12px–20px. 
*   **Signature Texture:** Main CTAs should transition from `primary` (#016e00) to `primary-container` (#00be00) at a 135-degree angle to provide a "lit from within" professional polish.

---

## 3. Typography
We use a dual-font strategy to balance character with legibility.

*   **Display & Headlines (Manrope):** Chosen for its geometric modernism. Use `display-lg` for hero marketing moments and `headline-sm` for category titles.
*   **Body & Labels (Inter):** The workhorse for transaction details and product descriptions. It ensures maximum readability on low-resolution mobile screens.

**Hierarchy as Identity:** 
Large, bold headlines (`headline-lg`) paired with generous `spacing-8` create an editorial feel that signals "Premium Service." Labels (`label-sm`) should be tracked slightly wider (+2%) for a sophisticated, high-end fintech aesthetic.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural lines.

### The Layering Principle
Stacking surface tiers creates a soft, natural lift. 
*   **Example:** A card (`surface-container-lowest`) placed on a section (`surface-container-low`) creates an immediate visual hierarchy without a single drop shadow.

### Ambient Shadows
When a "floating" effect is required (e.g., a checkout button), use "Ambient Shadows":
*   **Color:** A tinted version of `on-surface` (#1a1c1c) at 6% opacity.
*   **Blur:** High diffusion (20px to 40px) to mimic natural light, avoiding the "dirty" look of dark grey shadows.

### The "Ghost Border" Fallback
If a border is required for accessibility in High Contrast modes, use the `outline-variant` token at **15% opacity**. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons (The Action Pillars)
*   **Primary:** Uses the Signature Gradient (`primary` to `primary-container`). Roundedness: `lg` (1rem). 
*   **Secondary:** `secondary-container` background with `on-secondary-container` text. No border.
*   **Tertiary (Action):** For high-priority tasks (Buy Now), use `tertiary-container` (#f68700) to command attention.

### Cards & Lists (Content Vessels)
*   **The Divider Ban:** Do not use line dividers between list items. Use `spacing-4` or a subtle shift from `surface` to `surface-container-low` to separate items.
*   **Layout:** Cards must use `rounded-xl` (1.5rem) to convey a friendly, approachable brand personality.

### Input Fields (Trust Anchors)
*   **State:** Default state uses `surface-container-high`. 
*   **Focus State:** A 2px "Ghost Border" using `primary` at 40% opacity. 
*   **Feedback:** Error states use `error` (#ba1a1a) text but the background should shift to `error-container` (#ffdad6) for high visibility.

### Verification Badges (The "Tamagn" Signature)
A custom component specifically for this system. A small, elegant badge using `primary-fixed` (#77ff61) with a soft glow effect to signify a verified, "trustworthy" merchant or transaction.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Overlap a product image across two background color blocks to create an editorial layout.
*   **Embrace Negative Space:** Use `spacing-12` and `spacing-16` to let high-value items "breathe."
*   **Contextual Dark Mode:** Ensure `surface-dim` and `inverse-surface` roles are mapped correctly to maintain the same "layered" logic in dark mode.

### Don’t:
*   **Don't use 1px lines:** Never use a line to separate content; use space or color.
*   **Don't use pure black:** Use `on-surface` (#1a1c1c) for text to maintain a premium, ink-like feel.
*   **Don't crowd the thumb zone:** Ensure all interactive elements are separated by at least `spacing-4`.
*   **Don't use default corners:** Avoid the `none` or `sm` roundedness tokens for main UI containers; they feel too "legacy/industrial."