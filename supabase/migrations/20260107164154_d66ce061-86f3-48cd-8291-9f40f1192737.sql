-- Create table for email invite contacts (not subscribers)
CREATE TABLE public.invite_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on email
CREATE UNIQUE INDEX idx_invite_contacts_email ON public.invite_contacts (email);

-- Enable RLS
ALTER TABLE public.invite_contacts ENABLE ROW LEVEL SECURITY;

-- Service role policy for admin operations
CREATE POLICY "Service role can manage invite_contacts"
ON public.invite_contacts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create table for invite settings (rate limiting, template)
CREATE TABLE public.invite_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emails_per_hour INTEGER NOT NULL DEFAULT 50,
  email_subject TEXT NOT NULL DEFAULT 'Join the x402 Protocol Newsletter!',
  email_template TEXT NOT NULL DEFAULT 'Hi {{name}},

You have been invited to join the x402 Protocol newsletter! Stay updated on the future of web monetization, micropayments, and the HTTP 402 protocol.

Click here to subscribe: {{subscribe_url}}

Best regards,
The x402 Protocol Team',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invite_settings ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role can manage invite_settings"
ON public.invite_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert default settings
INSERT INTO public.invite_settings (emails_per_hour, email_subject, email_template) VALUES (50, 'Join the x402 Protocol Newsletter!', 'Hi {{name}},

You have been invited to join the x402 Protocol newsletter! Stay updated on the future of web monetization, micropayments, and the HTTP 402 protocol.

Click here to subscribe: {{subscribe_url}}

Best regards,
The x402 Protocol Team');