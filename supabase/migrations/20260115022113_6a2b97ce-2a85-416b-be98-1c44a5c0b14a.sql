-- Fix the get_client_identifier function to use stable request-based identification
-- The issue is that gen_random_uuid() generates a new value each call, breaking rate limiting

CREATE OR REPLACE FUNCTION public.get_client_identifier()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT COALESCE(
        -- If user is authenticated, use their user ID
        auth.uid()::TEXT,
        -- For anonymous users, create a stable hash from request headers
        -- Use COALESCE chain to find any available identifying information
        encode(
            sha256(
                convert_to(
                    COALESCE(
                        -- Try to get the full headers JSON
                        current_setting('request.headers', true),
                        -- Fallback to a combination of available request info
                        COALESCE(current_setting('request.jwt.claims', true), '') || 
                        COALESCE(current_setting('request.method', true), '') ||
                        COALESCE(current_setting('request.path', true), ''),
                        -- Last resort: use a session-based identifier
                        'anon-session'
                    ),
                    'UTF8'
                )
            ),
            'hex'
        )
    );
$function$;