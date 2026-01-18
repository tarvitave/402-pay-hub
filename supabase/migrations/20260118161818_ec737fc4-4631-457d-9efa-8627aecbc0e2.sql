-- Allow public read access to newsletters
CREATE POLICY "Anyone can view newsletters"
ON public.newsletters
FOR SELECT
USING (true);