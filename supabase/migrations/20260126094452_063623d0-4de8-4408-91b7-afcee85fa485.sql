-- Create a function that sends circuit breaker alerts via HTTP
CREATE OR REPLACE FUNCTION public.notify_circuit_breaker_trip()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  limit_type text;
  request_id bigint;
BEGIN
  -- Only trigger when tripped changes from false to true
  IF NEW.tripped = TRUE AND (OLD.tripped IS NULL OR OLD.tripped = FALSE) THEN
    -- Get Supabase URL from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Determine limit type
    IF NEW.trip_reason ILIKE '%hourly%' THEN
      limit_type := 'hourly';
    ELSE
      limit_type := 'daily';
    END IF;
    
    -- Make HTTP request to edge function using pg_net
    SELECT net.http_post(
      url := 'https://spguevrimwpqygvcxrsk.supabase.co/functions/v1/circuit-breaker-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VldnJpbXdwcXlndmN4cnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDQ3OTMsImV4cCI6MjA4MzU4MDc5M30.beVDC_B7n7rLG0TX_k0x_yM1cktAqVVN9QIBDAwOMEU'
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
$$;

-- Create trigger on circuit_breaker_config table
DROP TRIGGER IF EXISTS on_circuit_breaker_trip ON public.circuit_breaker_config;

CREATE TRIGGER on_circuit_breaker_trip
  AFTER UPDATE ON public.circuit_breaker_config
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_circuit_breaker_trip();