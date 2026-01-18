-- Add paused column to mailing_lists for per-list control
ALTER TABLE public.mailing_lists
ADD COLUMN paused BOOLEAN NOT NULL DEFAULT false;