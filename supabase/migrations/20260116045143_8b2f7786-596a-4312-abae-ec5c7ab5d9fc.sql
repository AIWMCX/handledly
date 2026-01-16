-- =========================================
-- Security Hardening Migration: RESTRICTIVE Deny Policies
-- Prevents any data exposure to anonymous users
-- =========================================

-- 1. LEADS TABLE - Add RESTRICTIVE deny policy for anon users
-- This ensures even if a PERMISSIVE policy exists, anon cannot SELECT
CREATE POLICY "Deny anon SELECT on leads"
ON public.leads
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- 2. CHAT_CONVERSATIONS - Prevent lead_id injection + deny SELECT
-- First drop the existing INSERT policy
DROP POLICY IF EXISTS "Public can start conversations with rate limiting" ON public.chat_conversations;

-- Recreate with lead_id = NULL requirement (prevents client-side lead injection)
CREATE POLICY "Public can start conversations with rate limiting"
ON public.chat_conversations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (session_id IS NOT NULL) AND 
  (session_id <> ''::text) AND 
  (lead_id IS NULL) AND
  check_rate_limit_readonly('chat_conversations'::text, get_client_identifier(), 20, 60)
);

-- Add RESTRICTIVE deny SELECT for anon
CREATE POLICY "Deny anon SELECT on chat_conversations"
ON public.chat_conversations
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- 3. CHAT_MESSAGES - Validate conversation exists + is active + deny SELECT
DROP POLICY IF EXISTS "Public can create chat messages with validation" ON public.chat_messages;

CREATE POLICY "Public can create chat messages with validation"
ON public.chat_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (content IS NOT NULL) AND 
  (content <> ''::text) AND 
  (conversation_id IS NOT NULL) AND 
  (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text, 'agent'::text])) AND
  -- Validate conversation exists and is active or recently ended (30 min window)
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = conversation_id
    AND (c.status = 'active' OR c.ended_at > now() - INTERVAL '30 minutes')
  )
);

-- Add RESTRICTIVE deny SELECT for anon
CREATE POLICY "Deny anon SELECT on chat_messages"
ON public.chat_messages
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- 4. QUOTE_REQUESTS - Add explicit deny
CREATE POLICY "Deny anon SELECT on quote_requests"
ON public.quote_requests
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- 5. APPOINTMENTS - Add explicit deny
CREATE POLICY "Deny anon SELECT on appointments"
ON public.appointments
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);