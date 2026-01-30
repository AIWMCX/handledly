-- Tighten RLS policy for rate_limit_tracker
DROP POLICY IF EXISTS "Public can insert rate limit records" ON public.rate_limit_tracker;

CREATE POLICY "Public can insert rate limit records with validation" 
ON public.rate_limit_tracker
FOR INSERT
TO public
WITH CHECK (
  identifier IS NOT NULL 
  AND identifier <> '' 
  AND table_name IS NOT NULL 
  AND table_name <> ''
);

-- Tighten RLS policy for honeypot_detections
DROP POLICY IF EXISTS "Public can log honeypot detections" ON public.honeypot_detections;

CREATE POLICY "Public can log honeypot detections with validation" 
ON public.honeypot_detections
FOR INSERT
TO public
WITH CHECK (
  ip_hash IS NOT NULL 
  AND ip_hash <> '' 
  AND detection_type IS NOT NULL 
  AND detection_type <> ''
);