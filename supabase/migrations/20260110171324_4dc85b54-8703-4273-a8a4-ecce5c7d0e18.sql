-- Add call tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS confirmation_call_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS confirmation_call_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS call_notes TEXT,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS prefer_email_only BOOLEAN DEFAULT false;