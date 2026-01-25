-- P1: Fix RLS policy for rate_limit_tracker - Add explicit deny for anonymous SELECT
CREATE POLICY "Deny anon SELECT on rate_limit_tracker"
ON public.rate_limit_tracker
FOR SELECT
USING (false);

-- P1: Create lead status automation functions and triggers

-- Function to automatically update lead status based on actions
CREATE OR REPLACE FUNCTION public.update_lead_status_on_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When email is marked as sent, update status to 'contacted' if still 'new'
  IF NEW.email_sent = TRUE AND OLD.email_sent = FALSE AND NEW.status = 'new' THEN
    NEW.status := 'contacted';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to update lead status when call completes
CREATE OR REPLACE FUNCTION public.update_lead_status_on_call()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When call completes successfully, update status to 'qualified'
  IF NEW.confirmation_call_status = 'completed' AND OLD.confirmation_call_status != 'completed' THEN
    IF NEW.status IN ('new', 'contacted') THEN
      NEW.status := 'qualified';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to update lead status when appointment is created
CREATE OR REPLACE FUNCTION public.update_lead_status_on_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When an appointment is created, update the linked lead status to 'booked'
  UPDATE public.leads
  SET status = 'booked', updated_at = now()
  WHERE id = NEW.lead_id
    AND status NOT IN ('booked', 'completed', 'cancelled');
  
  RETURN NEW;
END;
$$;

-- Create triggers for automatic lead status progression
DROP TRIGGER IF EXISTS trigger_lead_status_email ON public.leads;
CREATE TRIGGER trigger_lead_status_email
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_status_on_email();

DROP TRIGGER IF EXISTS trigger_lead_status_call ON public.leads;
CREATE TRIGGER trigger_lead_status_call
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_status_on_call();

DROP TRIGGER IF EXISTS trigger_lead_status_appointment ON public.appointments;
CREATE TRIGGER trigger_lead_status_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_status_on_appointment();

-- Add performance indexes for common admin queries
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_move_date ON public.leads(move_date) WHERE move_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_email_sent ON public.leads(email_sent, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_lead_scheduled ON public.appointments(lead_id, scheduled_date);