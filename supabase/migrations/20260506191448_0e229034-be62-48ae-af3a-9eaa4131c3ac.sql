DROP POLICY IF EXISTS "Service role can manage subscribers" ON public.subscribers;
CREATE POLICY "Service role can manage subscribers"
  ON public.subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage invite_settings" ON public.invite_settings;
CREATE POLICY "Service role can manage invite_settings"
  ON public.invite_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage email_events" ON public.email_events;
CREATE POLICY "Service role can manage email_events"
  ON public.email_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage seo_recommendations" ON public.seo_recommendations;
CREATE POLICY "Service role can manage seo_recommendations"
  ON public.seo_recommendations FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage page_views" ON public.page_views;
CREATE POLICY "Service role can manage page_views"
  ON public.page_views FOR ALL TO service_role USING (true) WITH CHECK (true);