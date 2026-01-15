-- Fix the rate limiting system properly
-- The issue is that check_rate_limit tries to INSERT during RLS policy evaluation,
-- but some contexts are read-only. Solution: use a trigger to record, and a pure check function for RLS.

-- Step 1: Create a pure read-only rate check function (no INSERT)
CREATE OR REPLACE FUNCTION public.check_rate_limit_readonly(
  p_table_name text, 
  p_identifier text, 
  p_max_requests integer DEFAULT 10, 
  p_time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT COALESCE(
      (SELECT COUNT(*) FROM public.rate_limit_tracker rt
       WHERE rt.identifier = p_identifier
         AND rt.table_name = p_table_name
         AND rt.created_at > now() - (p_time_window_minutes || ' minutes')::INTERVAL
      ) < p_max_requests,
      TRUE
    );
$function$;

-- Step 2: Create trigger function to record rate limit after successful insert
CREATE OR REPLACE FUNCTION public.record_rate_limit_on_leads_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.rate_limit_tracker (identifier, table_name)
    VALUES (get_client_identifier(), 'leads');
    RETURN NEW;
END;
$function$;

-- Step 3: Create the trigger on leads table
DROP TRIGGER IF EXISTS record_leads_rate_limit ON public.leads;
CREATE TRIGGER record_leads_rate_limit
    AFTER INSERT ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.record_rate_limit_on_leads_insert();

-- Step 4: Update the leads INSERT policy to use the readonly check
DROP POLICY IF EXISTS "Public can create leads with rate limiting" ON public.leads;
CREATE POLICY "Public can create leads with rate limiting" 
ON public.leads 
FOR INSERT 
TO public 
WITH CHECK (
    -- Validate required fields
    (full_name IS NOT NULL AND full_name <> '') AND
    (email IS NOT NULL AND email <> '') AND
    (phone IS NOT NULL AND phone <> '') AND
    (status = 'new') AND
    -- Rate limit check (read-only, no writes)
    check_rate_limit_readonly('leads', get_client_identifier(), 5, 60)
);

-- Step 5: Do the same for quote_requests
CREATE OR REPLACE FUNCTION public.record_rate_limit_on_quotes_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.rate_limit_tracker (identifier, table_name)
    VALUES (get_client_identifier(), 'quote_requests');
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS record_quotes_rate_limit ON public.quote_requests;
CREATE TRIGGER record_quotes_rate_limit
    AFTER INSERT ON public.quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.record_rate_limit_on_quotes_insert();

-- Update quote_requests INSERT policy
DROP POLICY IF EXISTS "Public can create quote requests with rate limiting" ON public.quote_requests;
CREATE POLICY "Public can create quote requests with rate limiting" 
ON public.quote_requests 
FOR INSERT 
TO public 
WITH CHECK (
    (property_type IS NOT NULL AND property_type <> '') AND
    check_rate_limit_readonly('quote_requests', get_client_identifier(), 10, 60)
);

-- Step 6: Do the same for chat_conversations
CREATE OR REPLACE FUNCTION public.record_rate_limit_on_chat_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.rate_limit_tracker (identifier, table_name)
    VALUES (get_client_identifier(), 'chat_conversations');
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS record_chat_rate_limit ON public.chat_conversations;
CREATE TRIGGER record_chat_rate_limit
    AFTER INSERT ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.record_rate_limit_on_chat_insert();

-- Update chat_conversations INSERT policy
DROP POLICY IF EXISTS "Public can start conversations with rate limiting" ON public.chat_conversations;
CREATE POLICY "Public can start conversations with rate limiting" 
ON public.chat_conversations 
FOR INSERT 
TO public 
WITH CHECK (
    (session_id IS NOT NULL AND session_id <> '') AND
    check_rate_limit_readonly('chat_conversations', get_client_identifier(), 20, 60)
);