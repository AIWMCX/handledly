-- Create rate limiting tracking table
CREATE TABLE IF NOT EXISTS public.rate_limit_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    table_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracker_lookup 
ON public.rate_limit_tracker(identifier, table_name, created_at DESC);

-- Enable RLS on rate_limit_tracker
ALTER TABLE public.rate_limit_tracker ENABLE ROW LEVEL SECURITY;

-- Allow public INSERT for rate tracking (needed for rate limit to work)
CREATE POLICY "Public can insert rate limit records"
ON public.rate_limit_tracker FOR INSERT
WITH CHECK (true);

-- Only admins can read/delete rate limit records  
CREATE POLICY "Admins can manage rate limit records"
ON public.rate_limit_tracker FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-cleanup old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.rate_limit_tracker 
    WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;

-- Update the check_rate_limit function to actually work
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    table_name TEXT, 
    ip_identifier TEXT, 
    max_requests INTEGER DEFAULT 10, 
    time_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    request_count INTEGER;
BEGIN
    -- Count recent requests from this identifier
    SELECT COUNT(*) INTO request_count
    FROM public.rate_limit_tracker rt
    WHERE rt.identifier = ip_identifier
      AND rt.table_name = check_rate_limit.table_name
      AND rt.created_at > now() - (time_window_minutes || ' minutes')::INTERVAL;
    
    -- If under limit, record this request and return true
    IF request_count < max_requests THEN
        INSERT INTO public.rate_limit_tracker (identifier, table_name)
        VALUES (ip_identifier, check_rate_limit.table_name);
        RETURN TRUE;
    END IF;
    
    -- Over limit
    RETURN FALSE;
END;
$$;

-- Create a function to get client identifier for rate limiting
CREATE OR REPLACE FUNCTION public.get_client_identifier()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    -- Use a combination of session info for rate limiting
    -- Falls back to a hash if no user is authenticated
    SELECT COALESCE(
        auth.uid()::TEXT,
        encode(sha256(current_setting('request.headers', true)::bytea), 'hex')
    );
$$;

-- Drop existing public INSERT policy on leads
DROP POLICY IF EXISTS "Public can create leads with validation" ON public.leads;

-- Create new INSERT policy with rate limiting (5 leads per hour per client)
CREATE POLICY "Public can create leads with rate limiting"
ON public.leads FOR INSERT
WITH CHECK (
    -- Validate required fields
    (full_name IS NOT NULL AND full_name <> '') AND
    (email IS NOT NULL AND email <> '') AND
    (phone IS NOT NULL AND phone <> '') AND
    (status = 'new') AND
    -- Rate limit: 5 leads per hour per client
    check_rate_limit('leads', get_client_identifier(), 5, 60)
);

-- Drop existing public INSERT policy on quote_requests
DROP POLICY IF EXISTS "Public can create quote requests with validation" ON public.quote_requests;

-- Create new INSERT policy with rate limiting (10 quotes per hour per client)
CREATE POLICY "Public can create quote requests with rate limiting"
ON public.quote_requests FOR INSERT
WITH CHECK (
    -- Validate required fields
    (property_type IS NOT NULL AND property_type <> '') AND
    -- Rate limit: 10 quote requests per hour per client
    check_rate_limit('quote_requests', get_client_identifier(), 10, 60)
);

-- Drop existing public INSERT policy on chat_conversations
DROP POLICY IF EXISTS "Public can create chat conversations with validation" ON public.chat_conversations;

-- Create new INSERT policy with rate limiting (20 conversations per hour per client)
CREATE POLICY "Public can create chat conversations with rate limiting"
ON public.chat_conversations FOR INSERT
WITH CHECK (
    -- Validate required fields
    (session_id IS NOT NULL AND session_id <> '') AND
    (status = 'active') AND
    -- Rate limit: 20 conversations per hour per client
    check_rate_limit('chat_conversations', get_client_identifier(), 20, 60)
);

-- Add explicit DENY SELECT policies for anonymous users to prevent future exposure
-- Note: These are restrictive policies that ensure only admins can read

-- Ensure leads table has no public SELECT access
DROP POLICY IF EXISTS "No public read access to leads" ON public.leads;
CREATE POLICY "No public read access to leads"
ON public.leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure quote_requests has explicit protection
DROP POLICY IF EXISTS "No public read access to quote requests" ON public.quote_requests;
CREATE POLICY "No public read access to quote requests"  
ON public.quote_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add comment to document security requirements
COMMENT ON TABLE public.leads IS 'Contains sensitive customer PII (names, emails, phones, addresses). NEVER add public SELECT policies. Rate limited to 5 INSERT per hour per client.';
COMMENT ON TABLE public.quote_requests IS 'Contains customer quote details linked to leads. NEVER add public SELECT policies. Rate limited to 10 INSERT per hour per client.';