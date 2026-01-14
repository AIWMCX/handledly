-- Create a more robust get_client_identifier function that won't fail
-- Uses convert_to() which properly handles text to bytea conversion
CREATE OR REPLACE FUNCTION public.get_client_identifier()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        auth.uid()::TEXT,
        encode(
            sha256(
                convert_to(
                    COALESCE(current_setting('request.headers', true), 'anonymous-' || gen_random_uuid()::text),
                    'UTF8'
                )
            ),
            'hex'
        )
    );
$$;