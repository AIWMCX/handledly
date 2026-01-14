-- =============================================
-- CRITICAL SECURITY FIX: Harden RLS Policies
-- =============================================

-- 1. LEADS TABLE - Restrict SELECT/UPDATE to admins only
DROP POLICY IF EXISTS "Anyone can read leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON public.leads;

CREATE POLICY "Admins can read leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads" 
ON public.leads 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2. APPOINTMENTS TABLE - Restrict SELECT/UPDATE to admins only
DROP POLICY IF EXISTS "Anyone can read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can update appointments" ON public.appointments;

CREATE POLICY "Admins can read appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 3. QUOTE_REQUESTS TABLE - Restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read quote requests" ON public.quote_requests;

CREATE POLICY "Admins can read quote requests" 
ON public.quote_requests 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));