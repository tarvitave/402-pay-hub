DROP POLICY IF EXISTS "Service role can manage email_suppressions" ON public.email_suppressions;
CREATE POLICY "Service role can manage email_suppressions" ON public.email_suppressions FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.email_suppressions FROM anon, authenticated;
GRANT ALL ON public.email_suppressions TO service_role;