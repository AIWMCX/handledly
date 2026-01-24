-- Fix 1: Restrict get_user_id_by_email to admins only (prevents email enumeration)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_input text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  RETURN (SELECT id FROM auth.users WHERE email = lower(email_input) LIMIT 1);
END;
$$;

-- Fix 2: Create call timeout mechanism for stuck calls
CREATE OR REPLACE FUNCTION public.timeout_stale_calls()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.leads
  SET 
    confirmation_call_status = 'timeout',
    call_notes = COALESCE(call_notes, '') || ' | Auto-timeout at ' || NOW()::text
  WHERE 
    confirmation_call_status = 'calling'
    AND confirmation_call_time < NOW() - INTERVAL '5 minutes';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Fix 3: Add indexes for webhook lookups (performance optimization)
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id ON public.leads(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_call_sid ON public.leads(call_sid) WHERE call_sid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_confirmation_call_status ON public.leads(confirmation_call_status) WHERE confirmation_call_status = 'calling';