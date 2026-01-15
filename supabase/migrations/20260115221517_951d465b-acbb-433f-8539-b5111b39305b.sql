-- Add verification_token column to leads table for secure edge function calls
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS verification_token TEXT;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_leads_verification_token ON public.leads(verification_token);

-- Create index for timestamp-based token expiry checks
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);