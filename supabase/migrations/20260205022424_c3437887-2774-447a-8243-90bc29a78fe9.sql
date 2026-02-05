-- Create table to store SEO recommendations
CREATE TABLE public.seo_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_url TEXT NOT NULL,
  recommendation_type TEXT NOT NULL,
  current_value TEXT,
  recommended_value TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_recommendations ENABLE ROW LEVEL SECURITY;

-- Service role can manage
CREATE POLICY "Service role can manage seo_recommendations" 
ON public.seo_recommendations 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_seo_recommendations_updated_at
BEFORE UPDATE ON public.seo_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();