-- =====================================================
-- COMPREHENSIVE SECURITY HARDENING: Add explicit deny policies
-- for all admin-only tables to prevent any potential bypass
-- =====================================================

-- 1. business_settings: Add explicit deny for anonymous users
CREATE POLICY "Deny anon SELECT on business_settings" 
ON public.business_settings 
FOR SELECT 
TO anon
USING (false);

-- 2. leads_archive: Add explicit deny for anonymous users  
CREATE POLICY "Deny anon SELECT on leads_archive" 
ON public.leads_archive 
FOR SELECT 
TO anon
USING (false);

-- 3. cost_tracker: Add explicit deny for anonymous users
CREATE POLICY "Deny anon SELECT on cost_tracker" 
ON public.cost_tracker 
FOR SELECT 
TO anon
USING (false);

-- 4. circuit_breaker_config: Add explicit deny for anonymous users
CREATE POLICY "Deny anon SELECT on circuit_breaker_config" 
ON public.circuit_breaker_config 
FOR SELECT 
TO anon
USING (false);

-- 5. client_trust_scores: Add explicit deny for anonymous users
CREATE POLICY "Deny anon SELECT on client_trust_scores" 
ON public.client_trust_scores 
FOR SELECT 
TO anon
USING (false);

-- 6. ai_quality_reviews: Add explicit deny for anonymous users
CREATE POLICY "Deny anon SELECT on ai_quality_reviews" 
ON public.ai_quality_reviews 
FOR SELECT 
TO anon
USING (false);

-- 7. call_retry_queue: Add explicit deny for anonymous users
CREATE POLICY "Deny anon SELECT on call_retry_queue" 
ON public.call_retry_queue 
FOR SELECT 
TO anon
USING (false);

-- 8. user_roles: Add explicit deny for reading other users' roles (non-admins)
-- Note: users can already read their own roles, this prevents enumeration
CREATE POLICY "Deny anon SELECT on user_roles" 
ON public.user_roles 
FOR SELECT 
TO anon
USING (false);

-- 9. honeypot_detections: Restrict INSERT to service role only
-- Remove public INSERT to prevent detection pattern probing
DROP POLICY IF EXISTS "Public can log honeypot detections with validation" ON public.honeypot_detections;

-- 10. Add explicit deny for INSERT on honeypot_detections for public
CREATE POLICY "Deny public INSERT on honeypot_detections" 
ON public.honeypot_detections 
FOR INSERT 
TO anon, authenticated
WITH CHECK (false);