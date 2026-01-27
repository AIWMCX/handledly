-- Phase 1: Database Performance Optimization
-- Create indexes CONCURRENTLY to avoid table locks (note: CONCURRENTLY not supported in migrations, using standard CREATE INDEX)

-- Composite index for admin dashboard filtering (leads by status + call status)
CREATE INDEX IF NOT EXISTS idx_leads_status_call_status 
ON public.leads (status, confirmation_call_status);

-- Index for recent activity queries (sorted by updated_at DESC)
CREATE INDEX IF NOT EXISTS idx_leads_updated_desc 
ON public.leads (updated_at DESC);

-- Index for conversation_id lookups (webhook matching)
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id 
ON public.leads (conversation_id) 
WHERE conversation_id IS NOT NULL;

-- Index for call_sid lookups (webhook matching fallback)
CREATE INDEX IF NOT EXISTS idx_leads_call_sid 
ON public.leads (call_sid) 
WHERE call_sid IS NOT NULL;

-- Index for call retry queue - pending items only (cron job performance)
CREATE INDEX IF NOT EXISTS idx_call_retry_queue_pending 
ON public.call_retry_queue (status, scheduled_for) 
WHERE status = 'scheduled';

-- Index for chat messages by conversation and role (AI quality reviews)
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_role 
ON public.chat_messages (conversation_id, role);

-- Index for chat conversations by lead linkage
CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead_id 
ON public.chat_conversations (lead_id) 
WHERE lead_id IS NOT NULL;

-- Index for cost tracker aggregation queries
CREATE INDEX IF NOT EXISTS idx_cost_tracker_service_date 
ON public.cost_tracker (service_type, created_at DESC);

-- Phase 6: Lead Archival System
-- Create archive table with same structure as leads
CREATE TABLE IF NOT EXISTS public.leads_archive (
  LIKE public.leads INCLUDING ALL
);

-- Add archived_at timestamp to archive table
ALTER TABLE public.leads_archive 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on archive table
ALTER TABLE public.leads_archive ENABLE ROW LEVEL SECURITY;

-- Archive table RLS policies (admin only)
CREATE POLICY "Admins can manage leads archive" 
ON public.leads_archive 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create archival function for leads older than 90 days with completed/cancelled/lost status
CREATE OR REPLACE FUNCTION public.archive_old_leads()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archived_count integer;
BEGIN
  WITH moved AS (
    DELETE FROM public.leads
    WHERE created_at < now() - INTERVAL '90 days'
      AND status IN ('completed', 'cancelled', 'lost')
    RETURNING *
  )
  INSERT INTO public.leads_archive (
    id, move_date, bedrooms, has_specialty_items, estimated_quote, 
    created_at, updated_at, confirmation_call_time, email_sent, email_sent_at,
    prefer_email_only, call_duration_seconds, call_ended_at, call_retry_count,
    next_retry_at, call_transcript, confirmation_call_status, call_notes,
    conversation_id, call_sid, call_summary, verification_token, lead_source,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    full_name, email, phone, move_from_address, move_to_address,
    property_type, specialty_items, status, notes, archived_at
  )
  SELECT 
    id, move_date, bedrooms, has_specialty_items, estimated_quote,
    created_at, updated_at, confirmation_call_time, email_sent, email_sent_at,
    prefer_email_only, call_duration_seconds, call_ended_at, call_retry_count,
    next_retry_at, call_transcript, confirmation_call_status, call_notes,
    conversation_id, call_sid, call_summary, verification_token, lead_source,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    full_name, email, phone, move_from_address, move_to_address,
    property_type, specialty_items, status, notes, now()
  FROM moved;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$;