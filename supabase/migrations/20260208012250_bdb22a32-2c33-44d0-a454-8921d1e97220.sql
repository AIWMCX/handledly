
-- ============================================
-- 1. SECURE SIGNATURES & JOB-PHOTOS STORAGE BUCKETS
-- ============================================

-- Update signatures bucket with file size limit (2MB)
UPDATE storage.buckets 
SET file_size_limit = 2097152, -- 2MB in bytes
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
WHERE id = 'signatures';

-- Update job-photos bucket with file size limit (2MB)
UPDATE storage.buckets 
SET file_size_limit = 2097152, -- 2MB in bytes
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
WHERE id = 'job-photos';

-- ============================================
-- 2. ADD MISSING PERFORMANCE INDEXES
-- ============================================

-- Index for admin dashboard: leads ordered by created_at DESC
CREATE INDEX IF NOT EXISTS idx_leads_created_desc 
ON public.leads(created_at DESC);

-- Index for cost tracker time-series queries
CREATE INDEX IF NOT EXISTS idx_cost_tracker_service_created 
ON public.cost_tracker(service_type, created_at DESC);

-- Partial index for chat_messages analytics (user messages only)
CREATE INDEX IF NOT EXISTS idx_chat_messages_role_user 
ON public.chat_messages(role) WHERE role = 'user';

-- ============================================
-- 3. STORE ANON KEY IN VAULT FOR TRIGGERS
-- ============================================

-- Store the anon key in Supabase Vault so triggers don't need hardcoded values
SELECT vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VldnJpbXdwcXlndmN4cnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDQ3OTMsImV4cCI6MjA4MzU4MDc5M30.beVDC_B7n7rLG0TX_k0x_yM1cktAqVVN9QIBDAwOMEU',
  'supabase_anon_key',
  'Supabase anon key for use in database triggers'
);

-- ============================================
-- 4. REPLACE HARDCODED KEYS IN TRIGGERS WITH VAULT LOOKUPS
-- ============================================

-- Fix notify_on_new_lead trigger function
CREATE OR REPLACE FUNCTION public.notify_on_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  request_id bigint;
  anon_key text;
BEGIN
  -- Retrieve anon key from Vault instead of hardcoding
  SELECT decrypted_secret INTO anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_anon_key'
  LIMIT 1;

  IF anon_key IS NULL THEN
    RAISE LOG 'Vault secret supabase_anon_key not found, skipping notification for lead %', NEW.id;
    RETURN NEW;
  END IF;

  SELECT net.http_post(
    url := 'https://spguevrimwpqygvcxrsk.supabase.co/functions/v1/notify-admin-new-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('leadId', NEW.id)
  ) INTO request_id;
  
  RAISE LOG 'New lead notification triggered for lead %: request_id=%', NEW.id, request_id;
  
  RETURN NEW;
END;
$function$;

-- Fix notify_circuit_breaker_trip trigger function
CREATE OR REPLACE FUNCTION public.notify_circuit_breaker_trip()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  request_id bigint;
  limit_type text;
  anon_key text;
BEGIN
  -- Only trigger when tripped changes from false to true
  IF NEW.tripped = TRUE AND (OLD.tripped IS NULL OR OLD.tripped = FALSE) THEN
    -- Retrieve anon key from Vault instead of hardcoding
    SELECT decrypted_secret INTO anon_key
    FROM vault.decrypted_secrets
    WHERE name = 'supabase_anon_key'
    LIMIT 1;

    IF anon_key IS NULL THEN
      RAISE LOG 'Vault secret supabase_anon_key not found, skipping circuit breaker alert for %', NEW.service_name;
      RETURN NEW;
    END IF;

    -- Determine limit type
    IF NEW.trip_reason ILIKE '%hourly%' THEN
      limit_type := 'hourly';
    ELSE
      limit_type := 'daily';
    END IF;
    
    SELECT net.http_post(
      url := 'https://spguevrimwpqygvcxrsk.supabase.co/functions/v1/circuit-breaker-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object(
        'serviceName', NEW.service_name,
        'tripReason', COALESCE(NEW.trip_reason, 'Unknown'),
        'currentSpend', CASE 
          WHEN limit_type = 'hourly' THEN NEW.current_hourly_spend 
          ELSE NEW.current_daily_spend 
        END,
        'limit', CASE 
          WHEN limit_type = 'hourly' THEN NEW.hourly_limit 
          ELSE NEW.daily_limit 
        END,
        'limitType', limit_type,
        'trippedAt', COALESCE(NEW.tripped_at::text, now()::text)
      )
    ) INTO request_id;
    
    RAISE LOG 'Circuit breaker alert sent for %: request_id=%', NEW.service_name, request_id;
  END IF;
  
  RETURN NEW;
END;
$function$;
