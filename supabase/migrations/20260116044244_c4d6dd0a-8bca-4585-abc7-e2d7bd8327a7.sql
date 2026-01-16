-- Add RLS policy to business_info_public view
-- This is a VIEW (not a table) that exposes public business info
-- Views inherit security from underlying tables, but we should ensure proper access

-- First, check if it's a view and drop/recreate with proper security
DROP VIEW IF EXISTS public.business_info_public;

-- Recreate the view with security definer to ensure public read access
CREATE VIEW public.business_info_public WITH (security_invoker = false) AS
SELECT 
  company_name,
  phone_number,
  address,
  service_areas
FROM public.business_settings
LIMIT 1;

-- Grant SELECT access to public (anon and authenticated roles)
GRANT SELECT ON public.business_info_public TO anon;
GRANT SELECT ON public.business_info_public TO authenticated;