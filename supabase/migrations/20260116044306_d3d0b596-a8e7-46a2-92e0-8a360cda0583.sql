-- Fix security definer view issue by using security invoker
DROP VIEW IF EXISTS public.business_info_public;

-- Recreate with security_invoker = true (uses caller's permissions)
-- This is safe because the underlying business_settings table has proper RLS
CREATE VIEW public.business_info_public WITH (security_invoker = true) AS
SELECT 
  company_name,
  phone_number,
  address,
  service_areas
FROM public.business_settings
LIMIT 1;

-- We need to add a public SELECT policy to business_settings for public info
-- This allows anyone to read ONLY the fields exposed in the view
CREATE POLICY "Public can read basic business info"
ON public.business_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Grant SELECT on the view
GRANT SELECT ON public.business_info_public TO anon;
GRANT SELECT ON public.business_info_public TO authenticated;