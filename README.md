# Ecommerce Platform

Multi-role marketplace (buyer, merchant, service provider, admin) on Next.js.

## Stack

| Layer | Choice |
|--------|--------|
| **Frontend** | [Next.js](https://nextjs.org/) (App Router, SSR + static pages, React Server Components where useful) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 (utility-first, responsive) |
| **Backend / DB / Auth** | [Supabase](https://supabase.com/) — PostgreSQL, Auth, Realtime, Storage |
| **Payments** | Safaricom M-Pesa (STK / C2B, B2C payout, reversal) + **escrow** (`lib/mpesa.ts`, `lib/escrow.ts`) — Kenya [Daraja](https://developer.safaricom.co.ke/) or **Ethiopia** sandbox (`apisandbox.safaricom.et`) |

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

**Supabase** — Dashboard → Project Settings → API:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional server-only: `SUPABASE_SERVICE_ROLE_KEY`

**M-Pesa** — OAuth + STK use `lib/mpesa.ts` (`getMpesaAccessToken`, `initiateStkPush`, `parseStkCallbackResult`). B2C / reversal: `initiateB2CPayout`, `initiateReversal`.

| Variable | Kenya (Daraja sandbox) | Ethiopia sandbox (Postman-style) |
|----------|-------------------------|-------------------------------------|
| `MPESA_BASE_URL` | `https://sandbox.safaricom.co.ke` | `https://apisandbox.safaricom.et` |
| `MPESA_OAUTH_PATH` | `/oauth/v1/generate` (default) | `/v1/token/generate` |
| `MPESA_STK_PATH` | `/mpesa/stkpush/v1/processrequest` (default) | `/mpesa/stkpush/v3/processrequest` |
| `MPESA_B2C_PATH` | `/mpesa/b2c/v1/paymentrequest` (default) | `/mpesa/b2c/v2/paymentrequest` |
| `MPESA_REVERSAL_PATH` | set per your portal docs | `/mpesa/reversal/v2/request` |
| `MPESA_MSISDN_COUNTRY_CODE` | `254` (default) | `251` |

**STK (collection):** `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_CALLBACK_URL`, optional `MPESA_TRANSACTION_TYPE` (default `CustomerPayBillOnline`). For ET v3, set `MPESA_STK_MERCHANT_REQUEST_PREFIX` (e.g. your app name) so `MerchantRequestID` is sent, or pass `merchantRequestId` / `referenceData` from `/api/payments/mpesa-stkpush`.

**B2C (escrow payout):** `MPESA_INITIATOR_NAME`, `MPESA_SECURITY_CREDENTIAL` (encrypted credential from portal), `MPESA_B2C_PARTY_A` (shortcode), `MPESA_B2C_QUEUE_TIMEOUT_URL`, `MPESA_B2C_RESULT_URL`. Optional `MPESA_B2C_COMMAND_ID` (default `BusinessPayment`).

**Reversal:** `MPESA_REVERSAL_RESULT_URL`, `MPESA_REVERSAL_QUEUE_TIMEOUT_URL`, plus optional `MPESA_REVERSAL_INITIATOR`, `MPESA_REVERSAL_SECURITY_CREDENTIAL`, `MPESA_REVERSAL_PARTY_A`, `MPESA_REVERSAL_RECEIVER_ID_TYPE`.

Never commit consumer secrets, bearer tokens, `SecurityCredential`, or Postman collections that contain real keys. Rotate anything that was shared or checked into git.

## shadcn + React Bits (MCP)

- `components.json` registers **`@react-bits`**: `https://reactbits.dev/r/{name}.json`.
- **`.cursor/mcp.json`** — shadcn MCP for Cursor (`npx shadcn@latest mcp init --client cursor`).
- Enable the **shadcn** MCP server under **Cursor Settings → MCP** if it is disabled.
- UI experiments and notes: **`design/`** (see `design/README.md`).

## Structure

- `app/` — routes, layouts, API handlers
- `components/` — shared UI (Tailwind + shadcn)
- `design/` — design workspace for React Bits / layout experiments
- `lib/supabase/` — browser / server / middleware clients
- `lib/mpesa.ts` — OAuth + STK Push + callback parsing
- `lib/escrow.ts` — escrow state helpers (pair with Supabase writes)
- `hooks/` — client hooks
- `types/` — models + `database.ts` (generate from Supabase)

## Supabase types

After you define tables:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts
```

Middleware refreshes the Supabase auth session on each matched request.
