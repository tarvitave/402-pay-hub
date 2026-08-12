DROP INDEX IF EXISTS public.email_suppressions_email_key;
ALTER TABLE public.email_suppressions ADD CONSTRAINT email_suppressions_email_unique UNIQUE (email);