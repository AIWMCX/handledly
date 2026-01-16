-- Drop the view that's causing security definer warnings
DROP VIEW IF EXISTS public.business_info_public;

-- Create a security definer function to fetch public business info
-- This is the recommended Supabase pattern for exposing limited data
CREATE OR REPLACE FUNCTION public.get_public_business_info()
RETURNS TABLE (
  company_name text,
  phone_number text,
  address text,
  service_areas text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bs.company_name,
    bs.phone_number,
    bs.address,
    bs.service_areas
  FROM public.business_settings bs
  LIMIT 1;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.get_public_business_info() TO anon, authenticated;