ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS duration_seconds integer;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS referrer text;
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);

CREATE TABLE IF NOT EXISTS public.client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,
  page_path text,
  error_type text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  stack text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT ALL ON public.client_errors TO service_role;
ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage client_errors" ON public.client_errors FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS client_errors_created_at_idx ON public.client_errors (created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,
  page_path text,
  action text NOT NULL,
  label text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT ALL ON public.user_actions TO service_role;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage user_actions" ON public.user_actions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS user_actions_created_at_idx ON public.user_actions (created_at DESC);