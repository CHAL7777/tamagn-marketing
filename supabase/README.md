# Supabase (Liger schema)

1. Open the [SQL Editor](https://supabase.com/dashboard) for your project.
2. Paste and run [`migrations/20250328120000_init_liger.sql`](./migrations/20250328120000_init_liger.sql) **once** (or use the Supabase CLI: `supabase db push` if linked).
3. Enable **Realtime** replication for `orders`, `delivery_assignments`, and `order_status_history` if you want live updates (Database → Replication).
4. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for server routes that call `createAdminClient()` (M-Pesa callback, admin APIs).
5. Optional: run [`seed.sql`](./seed.sql) for baseline categories.
6. Optional: set `MPESA_CALLBACK_SECRET` and configure your tunnel/proxy to send header `x-mpesa-callback-secret` so random callers cannot hit the callback URL.

The first user you promote to `admin` must be updated manually in SQL:

```sql
UPDATE public.profiles SET role = 'admin' WHERE id = '<auth-user-uuid>';
```
