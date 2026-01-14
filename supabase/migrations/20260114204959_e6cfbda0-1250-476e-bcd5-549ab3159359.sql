-- Fix the get_client_identifier function to handle the headers correctly
-- The issue is that current_setting returns a JSON string, not bytea-compatible data
CREATE OR REPLACE FUNCTION public.get_client_identifier()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    -- Use a combination of session info for rate limiting
    -- Falls back to a hash of the headers if no user is authenticated
    SELECT COALESCE(
        auth.uid()::TEXT,
        encode(sha256(COALESCE(current_setting('request.headers', true), 'anonymous')::bytea), 'hex')
    );
$$;