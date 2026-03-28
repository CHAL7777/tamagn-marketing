# Full API Prompt

Use this prompt to ask a coding agent to build or finish the full API for this repository.

```text
You are working inside this repository:
/home/chaldev/Code-room/code-collection/tamagn/ecommerce-platform

Your job is to build a complete, production-ready API layer for this marketplace app using the repo's existing architecture.

Project context:
- Next.js App Router
- TypeScript
- Supabase auth + Postgres + RLS
- Multi-role marketplace: buyer, merchant, service_provider, admin, courier
- Payments via M-Pesa
- Escrow release flow
- Product commerce and service marketplace in one app

Read these files first before writing code:
- README.md
- package.json
- supabase/README.md
- supabase/migrations/20250328120000_init_liger.sql
- types/database.ts
- types/order.ts
- lib/auth.ts
- lib/supabase/server.ts
- lib/supabase/admin.ts
- lib/mpesa.ts
- lib/escrow.ts
- app/api/**/route.ts
- app/actions/**/*.ts

Important schema entities already exist in Supabase:
- profiles
- merchants
- service_providers
- merchant_applications
- categories
- products
- product_images
- service_listings
- service_areas
- service_portfolio
- service_requests
- addresses
- orders
- order_items
- order_status_history
- payments
- escrow_events
- couriers
- delivery_assignments
- delivery_events
- reviews
- review_images
- promotions
- disputes
- moderation_actions
- wishlist_items

Current API routes already present:
- app/api/auth/login/route.ts
- app/api/auth/role/route.ts
- app/api/auth/signup/route.ts
- app/api/categories/create/route.ts
- app/api/categories/list/route.ts
- app/api/logistics/assign-courier/route.ts
- app/api/logistics/track/route.ts
- app/api/orders/confirm/route.ts
- app/api/orders/create/route.ts
- app/api/orders/list/route.ts
- app/api/payments/mpesa-callback/route.ts
- app/api/payments/mpesa-stkpush/route.ts
- app/api/payments/mpesa-stkpush-promotion/route.ts
- app/api/payments/release/route.ts
- app/api/products/[id]/route.ts
- app/api/products/create/route.ts
- app/api/products/list/route.ts

Current server actions already present:
- app/actions/addresses.ts
- app/actions/admin.ts
- app/actions/auth.ts
- app/actions/checkout.ts
- app/actions/checkout-service.ts
- app/actions/merchant-products.ts
- app/actions/orders.ts
- app/actions/profile.ts
- app/actions/promotions.ts
- app/actions/service-listings.ts
- app/actions/service-orders.ts
- app/actions/service-requests.ts
- app/actions/wishlist.ts

Goal:
Audit the current API and server actions, then implement the missing or incomplete pieces so the app has a coherent, full backend API for all major business flows.

Required API coverage:

1. Auth and role management
- sign up
- sign in
- sign out
- fetch current session/user/profile
- choose role
- merchant application submission
- admin approval/rejection of merchant applications

2. Profile and account
- get/update profile
- upload/update avatar URL if storage path is used
- manage phone and M-Pesa MSISDN
- manage addresses

3. Categories
- list categories by kind
- create categories
- update and delete categories if admin-only behavior fits the app

4. Products
- list products with filtering, search, category, merchant, status, pagination, sorting
- get product detail by id
- create product
- update product
- delete product
- manage product images
- expose only active products publicly
- restrict merchant-owned mutations correctly

5. Wishlist
- list wishlist items for current buyer
- add item to wishlist
- remove item from wishlist

6. Service marketplace
- list service listings with filtering and search
- get service listing detail by id
- create service listing
- update service listing
- delete service listing
- manage service areas and portfolio media
- create service request
- list service requests for buyer and service provider
- accept, decline, cancel, and complete service requests when allowed by role and state

7. Checkout and orders
- create product order from cart-style payload
- create service order where prepaid escrow is needed
- list orders by current role
- get order detail by id
- add status history entries on every status transition
- buyer order confirmation
- merchant confirmation
- courier assignment and delivery tracking
- prevent invalid order status jumps

8. Payments and escrow
- start M-Pesa STK push
- handle M-Pesa callback idempotently
- persist payment records
- mark order paid when callback succeeds
- release escrow only when business rules allow
- support refunds/reversals if already modeled
- promotion payment flow if app supports paid promotions

9. Logistics
- assign courier
- track delivery
- append delivery events
- enforce courier/admin/merchant permissions where appropriate

10. Promotions
- create promotion
- list merchant promotions
- activate/deactivate promotion
- connect paid promotion flows to payment records if required

11. Reviews and disputes
- create review after eligible completed orders only
- attach review images if schema supports it
- create dispute
- list disputes for buyer, merchant, admin
- admin moderation and resolution flow

12. Admin API
- merchant applications review
- merchant and service provider oversight
- order oversight
- product moderation
- analytics summary endpoints if the existing dashboards need them
- moderation action logging

Implementation rules:
- Use App Router route handlers under app/api. Do not use Pages Router.
- Keep server actions under app/actions for UI-first mutations where they already exist, but also provide a clean API layer where external calls or route handlers make more sense.
- Use TypeScript strictly.
- Use Zod for request validation if not already present; add it consistently if needed.
- Use NextRequest and NextResponse.
- Return a consistent JSON envelope, for example:
  { success: true, data, message? }
  { success: false, error, details? }
- Do not invent schema columns that are not in the migration or types.
- Respect RLS. Use the normal server client for user-scoped operations.
- Use createAdminClient() only for webhooks, privileged admin flows, or cases that truly require bypassing RLS.
- Make payment callbacks idempotent.
- Treat M-Pesa secrets and service-role usage as server-only.
- Reuse helper modules in lib/ where possible instead of duplicating logic.
- Add small shared API helpers if that reduces duplication.
- Keep error messages explicit and useful.
- Do not break the current route structure unless there is a strong reason.
- If a route already exists, finish or improve it instead of creating a conflicting duplicate.
- Follow current Next.js App Router best practices compatible with this repo.

Behavior rules:
- Public users can read only public-safe catalog data.
- Buyers can manage their own profile, addresses, wishlist, service requests, and orders.
- Merchants can manage only their own products, promotions, and merchant-side order actions.
- Service providers can manage only their own listings, portfolios, and service request/order flows.
- Couriers can only access courier-specific logistics flows.
- Admins can moderate and oversee the full platform.

Order and payment rules:
- Product orders and service orders must respect the order_type constraint.
- Every state transition should create an order_status_history record.
- Successful payment should move the order from awaiting_payment to paid_escrow when appropriate.
- Escrow release must not happen twice.
- Delivery tracking and buyer confirmation should align with order status rules.

Output requirements:
1. Start with a short audit of what already exists vs what is missing.
2. Then implement the code file by file.
3. Show every created or changed file with full code.
4. If a helper or validation file is needed, create it.
5. If a schema mismatch blocks implementation, stop and call it out clearly instead of guessing.
6. Include a short verification plan with exact commands to run.

Quality bar:
- Production-ready
- Consistent auth and authorization
- Clean separation between route handlers, actions, and shared domain logic
- No placeholder TODO code
- No deprecated Next.js API patterns
- No unsafe trust in client-provided role or ownership fields
```
