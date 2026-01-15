-- Add explicit deny policy for business_settings to prevent any public access
-- This ensures financial data (pricing, rates) cannot be exposed
CREATE POLICY "No public read access to business settings"
ON public.business_settings
FOR SELECT
TO anon
USING (false);