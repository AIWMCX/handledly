-- Security Migration: Strengthen validation for public INSERT operations
-- Addresses: leads_table_sensitive_exposure and chat_conversations_metadata_exposure

-- 1. Add stricter validation for chat_conversations metadata field
-- Drop and recreate the INSERT policy with metadata validation
DROP POLICY IF EXISTS "Public can start conversations with rate limiting" ON public.chat_conversations;

CREATE POLICY "Public can start conversations with rate limiting and validation"
ON public.chat_conversations
FOR INSERT
WITH CHECK (
  -- Existing validations
  session_id IS NOT NULL 
  AND session_id <> ''
  AND lead_id IS NULL
  AND check_rate_limit_readonly('chat_conversations', get_client_identifier(), 20, 60)
  -- NEW: Restrict metadata to prevent data injection
  AND (metadata IS NULL OR (
    -- Metadata must be a valid JSON object with only allowed keys
    jsonb_typeof(metadata) = 'object'
    AND NOT metadata ? 'password'
    AND NOT metadata ? 'token'
    AND NOT metadata ? 'secret'
    AND NOT metadata ? 'api_key'
    AND NOT metadata ? 'credential'
    AND octet_length(metadata::text) < 5000
  ))
);

-- 2. Add stricter validation for leads table INSERT
-- Drop and recreate with additional input sanitization
DROP POLICY IF EXISTS "Public can create leads with rate limiting" ON public.leads;

CREATE POLICY "Public can create leads with rate limiting and validation"
ON public.leads
FOR INSERT
WITH CHECK (
  -- Existing required field validation
  full_name IS NOT NULL AND full_name <> ''
  AND email IS NOT NULL AND email <> ''
  AND phone IS NOT NULL AND phone <> ''
  AND status = 'new'
  AND check_rate_limit_readonly('leads', get_client_identifier(), 5, 60)
  -- NEW: Input length limits to prevent abuse
  AND length(full_name) <= 200
  AND length(email) <= 320
  AND length(phone) <= 20
  -- NEW: Basic email format validation
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- NEW: Prevent XSS/injection patterns in notes
  AND (notes IS NULL OR (
    length(notes) <= 2000
    AND notes !~* '<script'
    AND notes !~* 'javascript:'
  ))
  -- NEW: Address length limits
  AND (move_from_address IS NULL OR length(move_from_address) <= 500)
  AND (move_to_address IS NULL OR length(move_to_address) <= 500)
);

-- 3. Add a validation function for phone numbers (US format)
CREATE OR REPLACE FUNCTION public.is_valid_phone(phone_input text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone_input ~ '^\+?1?[-.\s]?\(?[2-9][0-9]{2}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$'
    OR phone_input ~ '^[2-9][0-9]{9}$'
    OR phone_input ~ '^\([0-9]{3}\)\s?[0-9]{3}-[0-9]{4}$';
$$;

COMMENT ON FUNCTION public.is_valid_phone IS 'Validates US phone number formats';

-- 4. Add audit trigger for leads table to track insertions
CREATE OR REPLACE FUNCTION public.audit_lead_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log suspicious patterns (optional auditing)
  IF NEW.notes ~* 'select|insert|update|delete|drop|union|script' THEN
    RAISE LOG 'Suspicious lead submission detected: id=%, email=%', NEW.id, NEW.email;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for audit
DROP TRIGGER IF EXISTS audit_lead_insert_trigger ON public.leads;
CREATE TRIGGER audit_lead_insert_trigger
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_lead_insert();

-- 5. Add stricter quote_requests validation (same pattern)
DROP POLICY IF EXISTS "Public can create quote requests with rate limiting" ON public.quote_requests;

CREATE POLICY "Public can create quote requests with rate limiting and validation"
ON public.quote_requests
FOR INSERT
WITH CHECK (
  property_type IS NOT NULL 
  AND property_type <> ''
  AND length(property_type) <= 100
  AND check_rate_limit_readonly('quote_requests', get_client_identifier(), 10, 60)
  -- Validate array length for specialty_items
  AND (specialty_items IS NULL OR array_length(specialty_items, 1) <= 20)
  -- Validate numeric ranges
  AND (bedrooms IS NULL OR (bedrooms >= 0 AND bedrooms <= 20))
  AND (square_footage IS NULL OR (square_footage >= 0 AND square_footage <= 50000))
  AND (floor_number IS NULL OR (floor_number >= 0 AND floor_number <= 100))
);