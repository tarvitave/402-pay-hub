-- Add confirmed and unsubscribed_at columns to subscribers
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- Create mailing_lists table
CREATE TABLE IF NOT EXISTS public.mailing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on mailing_lists
ALTER TABLE public.mailing_lists ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage mailing_lists" 
ON public.mailing_lists FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Create email_invites table (separate from invite_contacts for new structure)
CREATE TABLE IF NOT EXISTS public.email_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  list_id UUID REFERENCES public.mailing_lists(id) ON DELETE CASCADE,
  CONSTRAINT email_invites_email_unique UNIQUE (email)
);

-- Enable RLS on email_invites
ALTER TABLE public.email_invites ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage email_invites" 
ON public.email_invites FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Add error_message and metadata columns to email_events if not exists
ALTER TABLE public.email_events 
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create page_views table
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage page_views" 
ON public.page_views FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS public.newsletters (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  month TEXT NOT NULL,
  read_time TEXT DEFAULT '8 min read',
  category TEXT DEFAULT 'GenAI Tools',
  industry TEXT DEFAULT 'General',
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  hero_image TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on newsletters
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage newsletters" 
ON public.newsletters FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_mailing_lists_updated_at ON public.mailing_lists;
CREATE TRIGGER update_mailing_lists_updated_at
BEFORE UPDATE ON public.mailing_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletters_updated_at ON public.newsletters;
CREATE TRIGGER update_newsletters_updated_at
BEFORE UPDATE ON public.newsletters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();