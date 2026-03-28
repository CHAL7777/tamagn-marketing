-- Optional demo data (idempotent). Run in SQL Editor after migrations.
-- Merchants/products require real auth.users — create users in Auth UI first, then insert merchants
-- and link profiles, or use the merchant application + admin approve flow.

INSERT INTO public.categories (name, slug, kind)
VALUES
  ('Electronics', 'electronics', 'product'),
  ('Home & kitchen', 'home-kitchen', 'product'),
  ('Professional services', 'professional-services', 'service')
ON CONFLICT (slug) DO NOTHING;
