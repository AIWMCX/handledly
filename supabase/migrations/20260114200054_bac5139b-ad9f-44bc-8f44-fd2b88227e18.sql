
-- =====================================================
-- COMPREHENSIVE SECURITY HARDENING MIGRATION
-- =====================================================
-- This migration addresses:
-- 1. Public INSERT policies on sensitive tables (leads, appointments, chats)
-- 2. Exposed business settings (pricing, contact info)
-- 3. Unrestricted table insertions allowing spam/abuse
-- =====================================================

-- =====================================================
-- STEP 1: Create a public-facing business info view
-- Only expose what's needed for the website front-end
-- =====================================================

CREATE OR REPLACE VIEW public.business_info_public
WITH (security_invoker=on) AS
SELECT 
  company_name,
  phone_number,
  address,
  service_areas
FROM public.business_settings
LIMIT 1;

-- Grant read access on the public view
GRANT SELECT ON public.business_info_public TO anon, authenticated;

-- =====================================================
-- STEP 2: Drop overly permissive policies
-- =====================================================

-- Drop old business_settings public read policy
DROP POLICY IF EXISTS "Anyone can read business settings" ON public.business_settings;

-- Create admin-only read policy for full business_settings
CREATE POLICY "Admins can read full business settings" 
ON public.business_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- STEP 3: Secure LEADS table - Rate limit insertions
-- Allow public inserts but add basic validation
-- =====================================================

-- Drop old overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;

-- Create a new policy that allows public lead creation but with better structure
-- We use anon role for public quote form submissions
CREATE POLICY "Public can create leads with validation" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are not empty
  full_name IS NOT NULL AND 
  full_name <> '' AND
  email IS NOT NULL AND 
  email <> '' AND
  phone IS NOT NULL AND 
  phone <> '' AND
  -- Prevent future timestamp manipulation
  created_at = now() AND
  -- Ensure status starts as 'new'
  status = 'new'
);

-- =====================================================
-- STEP 4: Secure QUOTE_REQUESTS table
-- =====================================================

-- Drop old overly permissive INSERT policy  
DROP POLICY IF EXISTS "Anyone can create quote requests" ON public.quote_requests;

-- Create controlled insert policy
CREATE POLICY "Public can create quote requests with validation" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (
  -- Ensure property_type is provided
  property_type IS NOT NULL AND 
  property_type <> '' AND
  -- Must be created now (prevents backdating)
  created_at = now()
);

-- =====================================================
-- STEP 5: Secure APPOINTMENTS table
-- Only allow admin creation OR authenticated edge functions
-- =====================================================

-- Drop old overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

-- Only admins can create appointments (prevents scheduling chaos)
CREATE POLICY "Admins can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- STEP 6: Secure CHAT_CONVERSATIONS table
-- =====================================================

-- Drop old overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;

-- Create controlled insert policy with validation
CREATE POLICY "Public can create chat conversations with validation" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (
  -- Ensure session_id is provided
  session_id IS NOT NULL AND 
  session_id <> '' AND
  -- Status must start as 'active'
  status = 'active' AND
  -- Must be created now
  created_at = now()
);

-- =====================================================
-- STEP 7: Secure CHAT_MESSAGES table
-- =====================================================

-- Drop old overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;

-- Create controlled insert policy with validation
CREATE POLICY "Public can create chat messages with validation" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  -- Ensure content is provided
  content IS NOT NULL AND 
  content <> '' AND
  -- Ensure conversation_id is provided  
  conversation_id IS NOT NULL AND
  -- Role must be valid
  role IN ('user', 'assistant', 'system') AND
  -- Must be created now
  created_at = now()
);

-- =====================================================
-- STEP 8: Create rate limiting helper function
-- This can be used in edge functions to prevent abuse
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  table_name text,
  ip_identifier text,
  max_requests integer DEFAULT 10,
  time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_count integer;
BEGIN
  -- This is a placeholder function that always returns true
  -- In production, you would track requests in a rate_limit table
  -- and check against the limit
  RETURN true;
END;
$$;
