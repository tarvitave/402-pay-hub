CREATE TABLE IF NOT EXISTS public.ecosystem_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  contact_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ecosystem_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage ecosystem_submissions"
  ON public.ecosystem_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);