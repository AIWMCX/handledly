-- =====================================================
-- PHASE 2-4: AI Quality, Call Retry, Realtime & Pagination
-- =====================================================

-- 1. Add columns to chat_conversations for quality monitoring
ALTER TABLE public.chat_conversations 
  ADD COLUMN IF NOT EXISTS quality_reviewed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5);

-- 2. Add columns to leads for call retry tracking
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS call_retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE;

-- 3. Create AI Quality Reviews table
CREATE TABLE public.ai_quality_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  reviewed_by UUID NOT NULL,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  accuracy_score INTEGER CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  review_notes TEXT,
  flagged_for_improvement BOOLEAN DEFAULT false,
  improvement_category TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on ai_quality_reviews
ALTER TABLE public.ai_quality_reviews ENABLE ROW LEVEL SECURITY;

-- Admin-only access for ai_quality_reviews
CREATE POLICY "Admins can manage AI quality reviews"
  ON public.ai_quality_reviews FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create Call Retry Queue table
CREATE TABLE public.call_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  retry_attempt INTEGER NOT NULL DEFAULT 1,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'completed', 'exhausted', 'cancelled')),
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(lead_id, retry_attempt)
);

-- Enable RLS on call_retry_queue
ALTER TABLE public.call_retry_queue ENABLE ROW LEVEL SECURITY;

-- Admin-only access for call_retry_queue
CREATE POLICY "Admins can manage call retry queue"
  ON public.call_retry_queue FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for efficient cron job queries
CREATE INDEX idx_call_retry_queue_scheduled 
  ON public.call_retry_queue(scheduled_for, status) 
  WHERE status = 'scheduled';

-- Index for pagination on leads
CREATE INDEX IF NOT EXISTS idx_leads_created_desc ON public.leads(created_at DESC);

-- Index for pagination on chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_desc ON public.chat_conversations(created_at DESC);

-- 5. Create function to schedule call retries
CREATE OR REPLACE FUNCTION public.schedule_call_retry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  retry_intervals integer[] := ARRAY[900, 7200, 86400]; -- 15min, 2hr, 24hr in seconds
  current_retry integer;
  next_interval integer;
BEGIN
  -- Only trigger on status change to failed states
  IF (NEW.confirmation_call_status IN ('failed', 'failed_sms_sent', 'timeout') 
      AND (OLD.confirmation_call_status IS NULL OR OLD.confirmation_call_status != NEW.confirmation_call_status)) THEN
    
    current_retry := COALESCE(NEW.call_retry_count, 0);
    
    -- Check if retries still available (max 3)
    IF current_retry < 3 THEN
      next_interval := retry_intervals[current_retry + 1];
      
      -- Schedule the retry
      INSERT INTO public.call_retry_queue (lead_id, retry_attempt, scheduled_for)
      VALUES (NEW.id, current_retry + 1, NOW() + (next_interval || ' seconds')::INTERVAL)
      ON CONFLICT (lead_id, retry_attempt) DO NOTHING;
      
      -- Update lead with next retry time
      NEW.next_retry_at := NOW() + (next_interval || ' seconds')::INTERVAL;
      NEW.call_retry_count := current_retry + 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic retry scheduling
DROP TRIGGER IF EXISTS trigger_schedule_call_retry ON public.leads;
CREATE TRIGGER trigger_schedule_call_retry
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.schedule_call_retry();

-- 6. Enable Realtime for leads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- 7. Cron job to process call retries every 5 minutes
SELECT cron.schedule(
  'process-call-retries',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://spguevrimwpqygvcxrsk.supabase.co/functions/v1/process-call-retries',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VldnJpbXdwcXlndmN4cnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDQ3OTMsImV4cCI6MjA4MzU4MDc5M30.beVDC_B7n7rLG0TX_k0x_yM1cktAqVVN9QIBDAwOMEU'
    ),
    body:='{}'::jsonb
  );
  $$
);