-- Allow service providers to update service orders and log status history.

DROP POLICY IF EXISTS ord_update ON public.orders;
CREATE POLICY ord_update ON public.orders FOR UPDATE USING (
  buyer_id = auth.uid()
  OR public.is_admin()
  OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = orders.merchant_id AND m.owner_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.service_listings sl
    JOIN public.service_providers sp ON sp.id = sl.service_provider_id
    WHERE orders.service_listing_id IS NOT NULL
      AND sl.id = orders.service_listing_id
      AND sp.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS osh_select ON public.order_status_history;
CREATE POLICY osh_select ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id AND (
    o.buyer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.service_listings sl
      JOIN public.service_providers sp ON sp.id = sl.service_provider_id
      WHERE o.service_listing_id IS NOT NULL
        AND sl.id = o.service_listing_id
        AND sp.owner_id = auth.uid()
    )
  ))
);

DROP POLICY IF EXISTS osh_insert ON public.order_status_history;
CREATE POLICY osh_insert ON public.order_status_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id AND (
    o.buyer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.service_listings sl
      JOIN public.service_providers sp ON sp.id = sl.service_provider_id
      WHERE o.service_listing_id IS NOT NULL
        AND sl.id = o.service_listing_id
        AND sp.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.delivery_assignments da
      JOIN public.couriers c ON c.id = da.courier_id
      WHERE da.order_id = o.id AND c.user_id = auth.uid()
    )
  ))
);

DROP POLICY IF EXISTS pay_select ON public.payments;
CREATE POLICY pay_select ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payments.order_id AND (
    o.buyer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.service_listings sl
      JOIN public.service_providers sp ON sp.id = sl.service_provider_id
      WHERE o.service_listing_id IS NOT NULL
        AND sl.id = o.service_listing_id
        AND sp.owner_id = auth.uid()
    )
  ))
);

DROP POLICY IF EXISTS ee_select ON public.escrow_events;
CREATE POLICY ee_select ON public.escrow_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = escrow_events.order_id AND (
    o.buyer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.service_listings sl
      JOIN public.service_providers sp ON sp.id = sl.service_provider_id
      WHERE o.service_listing_id IS NOT NULL
        AND sl.id = o.service_listing_id
        AND sp.owner_id = auth.uid()
    )
  ))
);
