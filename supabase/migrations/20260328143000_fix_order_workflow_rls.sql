-- Fix recursive order RLS checks and allow courier-driven order status updates.

CREATE OR REPLACE FUNCTION public.is_order_courier(
  order_uuid UUID,
  user_uuid UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.delivery_assignments da
    JOIN public.couriers c ON c.id = da.courier_id
    WHERE da.order_id = order_uuid
      AND c.user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_order(
  order_uuid UUID,
  user_uuid UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_uuid
      AND (
        o.buyer_id = user_uuid
        OR public.is_admin()
        OR EXISTS (
          SELECT 1
          FROM public.merchants m
          WHERE m.id = o.merchant_id
            AND m.owner_id = user_uuid
        )
        OR EXISTS (
          SELECT 1
          FROM public.service_listings sl
          JOIN public.service_providers sp ON sp.id = sl.service_provider_id
          WHERE o.service_listing_id IS NOT NULL
            AND sl.id = o.service_listing_id
            AND sp.owner_id = user_uuid
        )
        OR public.is_order_courier(order_uuid, user_uuid)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_order(
  order_uuid UUID,
  user_uuid UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.can_view_order(order_uuid, user_uuid);
$$;

DROP POLICY IF EXISTS ord_select ON public.orders;
CREATE POLICY ord_select
ON public.orders
FOR SELECT
USING (public.can_view_order(id));

DROP POLICY IF EXISTS ord_update ON public.orders;
CREATE POLICY ord_update
ON public.orders
FOR UPDATE
USING (public.can_manage_order(id));
