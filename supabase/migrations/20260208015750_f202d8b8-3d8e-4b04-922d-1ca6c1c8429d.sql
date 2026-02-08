-- Add missing indexes identified in audit
-- These improve query performance for admin dashboard and background job processing

-- Index on leads.status for filtered admin queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);

-- Index on leads.confirmation_call_status for pipeline analytics  
CREATE INDEX IF NOT EXISTS idx_leads_call_status ON public.leads (confirmation_call_status);

-- Index on appointments.lead_id for join queries
CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON public.appointments (lead_id);

-- Composite index on call_retry_queue for retry processing (status + scheduled_for)
CREATE INDEX IF NOT EXISTS idx_call_retry_queue_processing 
  ON public.call_retry_queue (status, scheduled_for) 
  WHERE status = 'scheduled';

-- Index on lead_follow_ups for scheduled processing
CREATE INDEX IF NOT EXISTS idx_lead_follow_ups_processing 
  ON public.lead_follow_ups (email_status, scheduled_for) 
  WHERE email_status = 'scheduled';