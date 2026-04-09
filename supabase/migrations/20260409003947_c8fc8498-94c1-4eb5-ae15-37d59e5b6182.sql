
-- Fix permissive INSERT policy on moving_companies
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.moving_companies;

CREATE POLICY "Authenticated users can register a company"
ON public.moving_companies FOR INSERT
TO authenticated
WITH CHECK (
  -- User must not already own a company
  get_user_company_id(auth.uid()) IS NULL
);
