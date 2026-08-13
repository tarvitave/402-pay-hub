CREATE TABLE public.x402_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'api',
  price TEXT,
  currency TEXT,
  network TEXT,
  docs_url TEXT,
  submitted_by_email TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  supports_402 BOOLEAN,
  last_status INTEGER,
  last_latency_ms INTEGER,
  last_checked_at TIMESTAMPTZ,
  uptime_24h NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.x402_endpoints TO anon, authenticated;
GRANT ALL ON public.x402_endpoints TO service_role;
ALTER TABLE public.x402_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved endpoints are public" ON public.x402_endpoints FOR SELECT TO anon, authenticated USING (approved = true AND active = true);
CREATE POLICY "Service role manages endpoints" ON public.x402_endpoints FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER update_x402_endpoints_updated_at BEFORE UPDATE ON public.x402_endpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.endpoint_health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint_id UUID NOT NULL REFERENCES public.x402_endpoints(id) ON DELETE CASCADE,
  status_code INTEGER,
  ok BOOLEAN NOT NULL DEFAULT false,
  is_402 BOOLEAN NOT NULL DEFAULT false,
  payment_header TEXT,
  latency_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_health_endpoint_created ON public.endpoint_health_checks (endpoint_id, created_at DESC);
GRANT SELECT ON public.endpoint_health_checks TO anon, authenticated;
GRANT ALL ON public.endpoint_health_checks TO service_role;
ALTER TABLE public.endpoint_health_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Health checks are public" ON public.endpoint_health_checks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages health checks" ON public.endpoint_health_checks FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL,
  content TEXT NOT NULL,
  link_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  source_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  external_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_social_posts_status ON public.social_posts (status, scheduled_for);
GRANT ALL ON public.social_posts TO service_role;
REVOKE ALL ON public.social_posts FROM anon, authenticated;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages social posts" ON public.social_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();