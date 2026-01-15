-- Update business_settings defaults to Handledly brand
ALTER TABLE public.business_settings 
  ALTER COLUMN company_name SET DEFAULT 'Handledly Moving Services';

ALTER TABLE public.business_settings 
  ALTER COLUMN email SET DEFAULT 'hello@handledly.com';

-- Update existing rows with legacy data
UPDATE public.business_settings 
SET company_name = 'Handledly Moving Services',
    email = 'hello@handledly.com'
WHERE company_name = 'Denver Elite Moving' OR email = 'info@denverelitemoving.com';

-- Add UTM tracking columns for marketing attribution
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_source text DEFAULT 'website';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_term text;