-- Remove public INSERT access to leads table (move to edge function)
DROP POLICY IF EXISTS "Public can create leads with rate limiting and validation" ON public.leads;

-- Remove public INSERT access to quote_requests table (move to edge function)  
DROP POLICY IF EXISTS "Public can create quote requests with rate limiting and validat" ON public.quote_requests;

-- Add explicit deny policy for public INSERT on leads
CREATE POLICY "Deny public INSERT on leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- Add explicit deny policy for public INSERT on quote_requests
CREATE POLICY "Deny public INSERT on quote_requests"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));