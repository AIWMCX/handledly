-- =============================================
-- COMPLETE SECURITY HARDENING - Phase 1, 2 & 3
-- =============================================

-- PHASE 1: Fix Critical Chat Table Issues

-- 1a. CHAT_MESSAGES - Restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;

CREATE POLICY "Admins can read messages" 
ON public.chat_messages 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 1b. CHAT_CONVERSATIONS - Restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read own conversations by session" ON public.chat_conversations;

CREATE POLICY "Admins can read conversations" 
ON public.chat_conversations 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- PHASE 2: Add Missing DELETE Policies (Admin Only)

-- 2a. LEADS - Admin DELETE
CREATE POLICY "Admins can delete leads" 
ON public.leads 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2b. APPOINTMENTS - Admin DELETE
CREATE POLICY "Admins can delete appointments" 
ON public.appointments 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2c. QUOTE_REQUESTS - Admin DELETE
CREATE POLICY "Admins can delete quote requests" 
ON public.quote_requests 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2d. CHAT_MESSAGES - Admin DELETE
CREATE POLICY "Admins can delete messages" 
ON public.chat_messages 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2e. CHAT_CONVERSATIONS - Admin DELETE
CREATE POLICY "Admins can delete conversations" 
ON public.chat_conversations 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- PHASE 3: Add Missing UPDATE Policies

-- 3a. BUSINESS_SETTINGS - Admin UPDATE
CREATE POLICY "Admins can update business settings" 
ON public.business_settings 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 3b. QUOTE_REQUESTS - Admin UPDATE
CREATE POLICY "Admins can update quote requests" 
ON public.quote_requests 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));