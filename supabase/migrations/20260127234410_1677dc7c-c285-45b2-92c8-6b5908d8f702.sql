-- Create trigger function to notify admins on new leads
CREATE OR REPLACE FUNCTION public.notify_on_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the notification edge function asynchronously via pg_net
  SELECT net.http_post(
    url := 'https://spguevrimwpqygvcxrsk.supabase.co/functions/v1/notify-admin-new-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VldnJpbXdwcXlndmN4cnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDQ3OTMsImV4cCI6MjA4MzU4MDc5M30.beVDC_B7n7rLG0TX_k0x_yM1cktAqVVN9QIBDAwOMEU'
    ),
    body := jsonb_build_object('leadId', NEW.id)
  ) INTO request_id;
  
  RAISE LOG 'New lead notification triggered for lead %: request_id=%', NEW.id, request_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires after new lead is inserted
DROP TRIGGER IF EXISTS on_new_lead_notify ON public.leads;
CREATE TRIGGER on_new_lead_notify
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_lead();