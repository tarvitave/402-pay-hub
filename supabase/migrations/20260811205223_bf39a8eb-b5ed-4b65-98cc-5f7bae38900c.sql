CREATE TABLE public.email_suppressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'bounce',
  source TEXT,
  description TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX email_suppressions_email_key ON public.email_suppressions (lower(email));

GRANT ALL ON public.email_suppressions TO service_role;

ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email_suppressions"
ON public.email_suppressions FOR ALL
USING (true) WITH CHECK (true);

CREATE TRIGGER update_email_suppressions_updated_at
BEFORE UPDATE ON public.email_suppressions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();