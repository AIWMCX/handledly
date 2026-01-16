-- Remove the overly permissive public SELECT policy from business_settings
DROP POLICY IF EXISTS "Public can read basic business info" ON public.business_settings;

-- Ensure only admins can access business_settings directly
-- (These policies should already exist, but let's ensure they're correct)
DROP POLICY IF EXISTS "Admins can read full business settings" ON public.business_settings;
DROP POLICY IF EXISTS "No public read access to business settings" ON public.business_settings;

-- Recreate admin-only SELECT policy
CREATE POLICY "Admins can read full business settings" 
ON public.business_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Recreate the view with SECURITY DEFINER to bypass RLS on business_settings
-- This allows public read of ONLY safe fields through the view
DROP VIEW IF EXISTS public.business_info_public;

CREATE VIEW public.business_info_public 
WITH (security_barrier = true)
AS
SELECT 
  company_name,
  phone_number,
  address,
  service_areas
FROM public.business_settings
LIMIT 1;

-- The view owner (postgres) can read business_settings
-- Grant public read access ONLY to the view, not the table
REVOKE ALL ON public.business_info_public FROM anon, authenticated;
GRANT SELECT ON public.business_info_public TO anon, authenticated;