-- Add dedicated columns for proper call tracking (avoids fragile JSON string search)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS call_sid TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS call_duration_seconds INTEGER;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS call_summary TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS call_ended_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id ON public.leads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_call_sid ON public.leads(call_sid);

-- Add comment for documentation
COMMENT ON COLUMN public.leads.conversation_id IS 'ElevenLabs conversation ID for webhook matching';
COMMENT ON COLUMN public.leads.call_sid IS 'Twilio call SID for webhook matching';
COMMENT ON COLUMN public.leads.call_duration_seconds IS 'Total call duration in seconds';
COMMENT ON COLUMN public.leads.call_summary IS 'AI-generated call summary from ElevenLabs';
COMMENT ON COLUMN public.leads.call_ended_at IS 'Timestamp when call ended';