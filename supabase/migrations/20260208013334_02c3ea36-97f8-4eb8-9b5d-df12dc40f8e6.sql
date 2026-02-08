-- Create lead_follow_ups table to track drip email sequences
CREATE TABLE public.lead_follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  touch_number INTEGER NOT NULL CHECK (touch_number BETWEEN 1 AND 3),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  email_status TEXT NOT NULL DEFAULT 'scheduled',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, touch_number)
);

-- Enable RLS
ALTER TABLE public.lead_follow_ups ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage lead follow-ups"
ON public.lead_follow_ups FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Deny anonymous access
CREATE POLICY "Deny anon SELECT on lead_follow_ups"
ON public.lead_follow_ups FOR SELECT
USING (false);

-- Index for efficient cron queries
CREATE INDEX idx_lead_follow_ups_pending ON public.lead_follow_ups(scheduled_for)
WHERE email_status = 'scheduled';

CREATE INDEX idx_lead_follow_ups_lead ON public.lead_follow_ups(lead_id);

-- Trigger: Auto-schedule follow-ups when a new lead is created
CREATE OR REPLACE FUNCTION public.schedule_lead_follow_ups()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only schedule for web/chat leads (not voice_agent leads which get calls)
  IF NEW.lead_source IN ('website', 'chat', 'exit_intent', 'coming_soon') THEN
    -- Touch 1: 1 hour after creation
    INSERT INTO public.lead_follow_ups (lead_id, touch_number, scheduled_for)
    VALUES (NEW.id, 1, NEW.created_at + INTERVAL '1 hour')
    ON CONFLICT (lead_id, touch_number) DO NOTHING;

    -- Touch 2: 24 hours after creation
    INSERT INTO public.lead_follow_ups (lead_id, touch_number, scheduled_for)
    VALUES (NEW.id, 2, NEW.created_at + INTERVAL '24 hours')
    ON CONFLICT (lead_id, touch_number) DO NOTHING;

    -- Touch 3: 72 hours after creation
    INSERT INTO public.lead_follow_ups (lead_id, touch_number, scheduled_for)
    VALUES (NEW.id, 3, NEW.created_at + INTERVAL '72 hours')
    ON CONFLICT (lead_id, touch_number) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_schedule_follow_ups
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.schedule_lead_follow_ups();
