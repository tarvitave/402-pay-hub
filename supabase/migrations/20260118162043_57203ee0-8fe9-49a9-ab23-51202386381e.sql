-- Add paused column to invite_settings
ALTER TABLE public.invite_settings
ADD COLUMN paused BOOLEAN NOT NULL DEFAULT false;