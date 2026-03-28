-- Liger (ታማኝ) — initial schema, RLS, helpers
-- Apply via Supabase SQL editor or: supabase db push

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'buyer', 'merchant', 'service_provider', 'admin', 'courier'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM (
    'pending', 'approved', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM (
    'draft', 'active', 'suspended'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'awaiting_payment',
    'paid_escrow',
    'merchant_confirmed',
    'pickup_scheduled',
    'collected',
    'in_transit',
    'delivered',
    'completed',
    'cancelled',
    'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_type AS ENUM ('product', 'service');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM (
    'pending', 'completed', 'failed', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.promotion_type AS ENUM ('store', 'product', 'featured_merchant');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.service_request_status AS ENUM (
    'pending', 'accepted', 'declined', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.dispute_status AS ENUM (
    'open', 'under_review', 'resolved', 'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.dispute_outcome AS ENUM (
    'pending', 'release_to_merchant', 'refund_buyer', 'partial_refund'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.category_kind AS ENUM ('product', 'service');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Profiles (1:1 auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'buyer',
  full_name TEXT,
  phone TEXT,
  mpesa_msisdn TEXT,
  avatar_url TEXT,
  merchant_id UUID,
  service_provider_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  location_label TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  trust_score NUMERIC(4,2) NOT NULL DEFAULT 0,
  verification_badge BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id)
);

CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  bio TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  trust_score NUMERIC(4,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id)
);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_merchant_fk
  FOREIGN KEY (merchant_id) REFERENCES public.merchants (id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_service_provider_fk
  FOREIGN KEY (service_provider_id) REFERENCES public.service_providers (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.merchant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  location_label TEXT,
  phone TEXT,
  status public.application_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users (id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  kind public.category_kind NOT NULL DEFAULT 'product',
  parent_id UUID REFERENCES public.categories (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants (id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories (id),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status public.product_status NOT NULL DEFAULT 'draft',
  featured_image_path TEXT,
  sold_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.service_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers (id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories (id),
  title TEXT NOT NULL,
  description TEXT,
  price_min NUMERIC(12,2),
  price_max NUMERIC(12,2),
  prepaid_escrow BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_listing_id UUID NOT NULL REFERENCES public.service_listings (id) ON DELETE CASCADE,
  area_label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.service_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_listing_id UUID NOT NULL REFERENCES public.service_listings (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_listing_id UUID NOT NULL REFERENCES public.service_listings (id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  message TEXT,
  status public.service_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  label TEXT,
  line1 TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants (id),
  service_listing_id UUID REFERENCES public.service_listings (id),
  order_type public.order_type NOT NULL DEFAULT 'product',
  status public.order_status NOT NULL DEFAULT 'awaiting_payment',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_snapshot JSONB,
  mpesa_checkout_request_id TEXT UNIQUE,
  escrow_released BOOLEAN NOT NULL DEFAULT false,
  buyer_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT orders_one_target CHECK (
    (order_type = 'product' AND merchant_id IS NOT NULL AND service_listing_id IS NULL)
    OR (order_type = 'service' AND service_listing_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  provider TEXT NOT NULL DEFAULT 'mpesa',
  mpesa_checkout_request_id TEXT UNIQUE,
  mpesa_receipt TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  raw_callback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.escrow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  vehicle_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  courier_id UUID NOT NULL REFERENCES public.couriers (id),
  status TEXT NOT NULL DEFAULT 'assigned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

CREATE TABLE IF NOT EXISTS public.delivery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.delivery_assignments (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants (id) ON DELETE SET NULL,
  service_provider_id UUID REFERENCES public.service_providers (id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS public.review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants (id) ON DELETE CASCADE,
  promotion_type public.promotion_type NOT NULL,
  product_id UUID REFERENCES public.products (id) ON DELETE CASCADE,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  mpesa_checkout_request_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  opened_by UUID NOT NULL REFERENCES auth.users (id),
  status public.dispute_status NOT NULL DEFAULT 'open',
  evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  resolution_note TEXT,
  resolved_by UUID REFERENCES auth.users (id),
  outcome public.dispute_outcome NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users (id),
  action TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_merchant ON public.products (merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON public.orders (merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_merchants_location ON public.merchants (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_service_listings_provider ON public.service_listings (service_provider_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated ON public.profiles;
CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_merchants_updated ON public.merchants;
CREATE TRIGGER tr_merchants_updated BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_products_updated ON public.products;
CREATE TRIGGER tr_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_orders_updated ON public.orders;
CREATE TRIGGER tr_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- New user → profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'buyer',
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_merchant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT merchant_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_service_provider_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT service_provider_id FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (id = auth.uid());

-- merchants: public read active; owner full; admin all
CREATE POLICY merchants_select ON public.merchants FOR SELECT
  USING (is_active = true OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY merchants_owner_all ON public.merchants FOR ALL
  USING (owner_id = auth.uid() OR public.is_admin());

-- service_providers
CREATE POLICY sp_select ON public.service_providers FOR SELECT
  USING (is_active = true OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY sp_owner_all ON public.service_providers FOR ALL
  USING (owner_id = auth.uid() OR public.is_admin());

-- applications
CREATE POLICY app_select ON public.merchant_applications FOR SELECT
  USING (applicant_id = auth.uid() OR public.is_admin());
CREATE POLICY app_insert ON public.merchant_applications FOR INSERT WITH CHECK (applicant_id = auth.uid());
CREATE POLICY app_admin_update ON public.merchant_applications FOR UPDATE USING (public.is_admin());

-- categories: read all authenticated + anon for marketplace — allow public read
CREATE POLICY categories_read ON public.categories FOR SELECT USING (true);
CREATE POLICY categories_admin ON public.categories FOR ALL USING (public.is_admin());

-- products: active public read; merchant owns
CREATE POLICY products_public_read ON public.products FOR SELECT
  USING (status = 'active' OR public.is_admin() OR EXISTS (
    SELECT 1 FROM public.merchants m WHERE m.id = products.merchant_id AND m.owner_id = auth.uid()
  ));
CREATE POLICY products_merchant_write ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = merchant_id AND m.owner_id = auth.uid())
);
CREATE POLICY products_merchant_update ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = products.merchant_id AND m.owner_id = auth.uid())
  OR public.is_admin()
);
CREATE POLICY products_merchant_delete ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = products.merchant_id AND m.owner_id = auth.uid())
  OR public.is_admin()
);

-- product_images
CREATE POLICY pi_select ON public.product_images FOR SELECT USING (true);
CREATE POLICY pi_write ON public.product_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.merchants m ON m.id = p.merchant_id
    WHERE p.id = product_images.product_id AND m.owner_id = auth.uid()
  ) OR public.is_admin()
);

-- service listings
CREATE POLICY sl_read ON public.service_listings FOR SELECT USING (true);
CREATE POLICY sl_write ON public.service_listings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.service_providers sp
    WHERE sp.id = service_listings.service_provider_id AND sp.owner_id = auth.uid()
  ) OR public.is_admin()
);

CREATE POLICY sa_read ON public.service_areas FOR SELECT USING (true);
CREATE POLICY sa_write ON public.service_areas FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.service_listings sl
    JOIN public.service_providers sp ON sp.id = sl.service_provider_id
    WHERE sl.id = service_areas.service_listing_id AND sp.owner_id = auth.uid()
  ) OR public.is_admin()
);

CREATE POLICY spfo_read ON public.service_portfolio FOR SELECT USING (true);
CREATE POLICY spfo_write ON public.service_portfolio FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.service_listings sl
    JOIN public.service_providers sp ON sp.id = sl.service_provider_id
    WHERE sl.id = service_portfolio.service_listing_id AND sp.owner_id = auth.uid()
  ) OR public.is_admin()
);

-- service requests
CREATE POLICY sr_buyer ON public.service_requests FOR SELECT USING (
  buyer_id = auth.uid() OR public.is_admin() OR EXISTS (
    SELECT 1 FROM public.service_listings sl
    JOIN public.service_providers sp ON sp.id = sl.service_provider_id
    WHERE sl.id = service_requests.service_listing_id AND sp.owner_id = auth.uid()
  )
);
CREATE POLICY sr_insert ON public.service_requests FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY sr_update ON public.service_requests FOR UPDATE USING (
  buyer_id = auth.uid() OR public.is_admin() OR EXISTS (
    SELECT 1 FROM public.service_listings sl
    JOIN public.service_providers sp ON sp.id = sl.service_provider_id
    WHERE sl.id = service_requests.service_listing_id AND sp.owner_id = auth.uid()
  )
);

-- addresses
CREATE POLICY addr_own ON public.addresses FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- orders
CREATE POLICY ord_select ON public.orders FOR SELECT USING (
  buyer_id = auth.uid()
  OR public.is_admin()
  OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = orders.merchant_id AND m.owner_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.service_listings sl
    JOIN public.service_providers sp ON sp.id = sl.service_provider_id
    WHERE sl.id = orders.service_listing_id AND sp.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.delivery_assignments da
    JOIN public.couriers c ON c.id = da.courier_id
    WHERE da.order_id = orders.id AND c.user_id = auth.uid()
  )
);
CREATE POLICY ord_buyer_insert ON public.orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY ord_update ON public.orders FOR UPDATE USING (
  buyer_id = auth.uid()
  OR public.is_admin()
  OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = orders.merchant_id AND m.owner_id = auth.uid())
);

-- order_items
CREATE POLICY oi_select ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND (
    o.buyer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
  ))
);
CREATE POLICY oi_insert ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.buyer_id = auth.uid())
);
CREATE POLICY oi_admin ON public.order_items FOR DELETE USING (public.is_admin());

-- order_status_history
CREATE POLICY osh_select ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id AND (
    o.buyer_id = auth.uid() OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
  ))
);
CREATE POLICY osh_insert ON public.order_status_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id AND (
    o.buyer_id = auth.uid() OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.delivery_assignments da
      JOIN public.couriers c ON c.id = da.courier_id
      WHERE da.order_id = o.id AND c.user_id = auth.uid()
    )
  ))
);

-- payments
CREATE POLICY pay_select ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payments.order_id AND (
    o.buyer_id = auth.uid() OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
  ))
);
-- Inserts/updates from M-Pesa webhook use service role (bypass RLS). Buyers may insert pending rows for their order.
CREATE POLICY pay_insert_buyer ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payments.order_id AND o.buyer_id = auth.uid())
);
CREATE POLICY pay_update_admin ON public.payments FOR UPDATE USING (public.is_admin());

-- escrow_events
CREATE POLICY ee_select ON public.escrow_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = escrow_events.order_id AND (
    o.buyer_id = auth.uid() OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
  ))
);
CREATE POLICY ee_insert ON public.escrow_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = escrow_events.order_id AND (
    public.is_admin() OR o.buyer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
  ))
);

-- couriers
CREATE POLICY courier_self ON public.couriers FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- delivery
CREATE POLICY da_select ON public.delivery_assignments FOR SELECT USING (
  public.is_admin()
  OR EXISTS (SELECT 1 FROM public.couriers c WHERE c.id = delivery_assignments.courier_id AND c.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = delivery_assignments.order_id AND (
    o.buyer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
  ))
);
CREATE POLICY da_admin ON public.delivery_assignments FOR ALL USING (public.is_admin());

CREATE POLICY dev_events ON public.delivery_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.delivery_assignments da
    JOIN public.orders o ON o.id = da.order_id
    WHERE da.id = delivery_events.assignment_id AND (
      o.buyer_id = auth.uid() OR public.is_admin()
      OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.couriers c WHERE c.id = da.courier_id AND c.user_id = auth.uid())
    )
  )
);
CREATE POLICY dev_events_ins ON public.delivery_events FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.delivery_assignments da
    JOIN public.couriers c ON c.id = da.courier_id
    WHERE da.id = delivery_events.assignment_id AND (c.user_id = auth.uid() OR public.is_admin())
  )
);

-- reviews
CREATE POLICY rev_read ON public.reviews FOR SELECT USING (true);
CREATE POLICY rev_ins ON public.reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY rev_own ON public.reviews FOR UPDATE USING (reviewer_id = auth.uid() OR public.is_admin());

CREATE POLICY riv_read ON public.review_images FOR SELECT USING (true);
CREATE POLICY riv_write ON public.review_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_images.review_id AND r.reviewer_id = auth.uid())
  OR public.is_admin()
);

-- promotions
CREATE POLICY prom_merchant ON public.promotions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = promotions.merchant_id AND m.owner_id = auth.uid())
  OR public.is_admin()
);

-- disputes
CREATE POLICY disp_read ON public.disputes FOR SELECT USING (
  opened_by = auth.uid() OR public.is_admin()
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = disputes.order_id AND o.buyer_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.orders o JOIN public.merchants m ON m.id = o.merchant_id
    WHERE o.id = disputes.order_id AND m.owner_id = auth.uid())
);
CREATE POLICY disp_ins ON public.disputes FOR INSERT WITH CHECK (opened_by = auth.uid());
CREATE POLICY disp_admin ON public.disputes FOR UPDATE USING (public.is_admin());

-- moderation
CREATE POLICY mod_admin ON public.moderation_actions FOR ALL USING (public.is_admin());

-- wishlist
CREATE POLICY wl_own ON public.wishlist_items FOR ALL USING (user_id = auth.uid());

-- Realtime: in Dashboard → Database → Replication, add tables orders, delivery_assignments, order_status_history

-- Storage buckets (run once; ignore errors if exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies (authenticated uploads; public buckets readable)
CREATE POLICY "storage_public_read" ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'review-images', 'portfolio'));

CREATE POLICY "storage_auth_upload_product" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "storage_auth_upload_review" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

CREATE POLICY "storage_auth_upload_portfolio" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

CREATE POLICY "storage_delete_authenticated" ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('product-images', 'review-images', 'portfolio')
    AND auth.role() = 'authenticated'
  );
