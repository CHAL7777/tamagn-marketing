# Ecommerce Platform

Next.js App Router marketplace with buyer, merchant, service-provider, and admin areas.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `app/` — routes, layouts, and API handlers
- `components/` — shared UI
- `lib/` — Supabase, auth, M-Pesa, escrow, logistics helpers
- `hooks/` — client hooks
- `types/` — TypeScript models

## Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon public** key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Use the clients from:
   - `lib/supabase/client.ts` — Client Components / browser
   - `lib/supabase/server.ts` — Server Components, Route Handlers, Server Actions
4. After you define tables, regenerate typed definitions:

   ```bash
   npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts
   ```

Middleware refreshes the auth session cookie on each matched request.
# tamagn-marketing
