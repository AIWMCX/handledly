-- Restrict signatures bucket: 2MB max, PNG/JPEG only
UPDATE storage.buckets 
SET file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg']
WHERE id = 'signatures';

-- Fix follow-up trigger function to include ALL lead sources
CREATE OR REPLACE FUNCTION public.schedule_lead_follow_ups()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Schedule follow-ups for ALL lead sources EXCEPT voice_agent (which get calls)
  IF NEW.lead_source IS NULL OR NEW.lead_source NOT LIKE 'voice_agent%' THEN
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
$function$;