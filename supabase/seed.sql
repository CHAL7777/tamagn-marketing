-- Optional demo data (idempotent). Run in SQL Editor after migrations, or via `supabase db reset` (local).
-- Slugs are globally unique across product + service kinds.

-- Product categories (physical & general marketplace)
INSERT INTO public.categories (name, slug, kind)
VALUES
  ('Electronics & accessories', 'electronics', 'product'),
  ('Phones & tablets', 'phones-tablets', 'product'),
  ('Computers & office', 'computers-office', 'product'),
  ('Fashion & apparel', 'fashion-apparel', 'product'),
  ('Shoes & bags', 'shoes-bags', 'product'),
  ('Beauty & personal care', 'beauty-personal-care', 'product'),
  ('Health & wellness', 'health-wellness', 'product'),
  ('Baby, kids & toys', 'baby-kids-toys', 'product'),
  ('Home, kitchen & dining', 'home-kitchen', 'product'),
  ('Furniture & décor', 'furniture-decor', 'product'),
  ('Groceries & packaged food', 'groceries-food', 'product'),
  ('Sports & outdoors', 'sports-outdoors', 'product'),
  ('Automotive & motorbike', 'automotive-motorbike', 'product'),
  ('Tools & home improvement', 'tools-home-improvement', 'product'),
  ('Garden & outdoor living', 'garden-outdoor', 'product'),
  ('Books, media & stationery', 'books-media-stationery', 'product'),
  ('Pet supplies', 'pet-supplies', 'product'),
  ('Jewelry & watches', 'jewelry-watches', 'product'),
  ('Arts, crafts & gifts', 'arts-crafts-gifts', 'product'),
  ('Industrial & business supplies', 'industrial-business-supplies', 'product')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  kind = EXCLUDED.kind;

-- Service categories (bookable / provider listings)
INSERT INTO public.categories (name, slug, kind)
VALUES
  ('Professional & business services', 'professional-services', 'service'),
  ('Home repair & handyman', 'home-repair-handyman', 'service'),
  ('Cleaning & laundry', 'cleaning-laundry', 'service'),
  ('Beauty & grooming services', 'beauty-grooming-services', 'service'),
  ('Education & tutoring', 'education-tutoring', 'service'),
  ('IT, web & digital', 'it-web-digital', 'service'),
  ('Events, photo & video', 'events-photo-video', 'service'),
  ('Moving, delivery & logistics', 'moving-delivery-logistics', 'service'),
  ('Legal, tax & accounting', 'legal-tax-accounting', 'service'),
  ('Construction & renovation', 'construction-renovation', 'service'),
  ('Coaching & consulting', 'coaching-consulting', 'service'),
  ('Healthcare & wellness services', 'healthcare-wellness-services', 'service'),
  ('Automotive & bike services', 'automotive-bike-services', 'service'),
  ('Catering & food services', 'catering-food-services', 'service')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  kind = EXCLUDED.kind;
