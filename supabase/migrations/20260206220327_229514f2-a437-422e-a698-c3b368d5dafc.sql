
-- =============================================
-- PHASE 1: Complete Business Bundle - Database Foundation
-- 9 new tables + storage bucket + RLS policies
-- =============================================

-- 1. JOBS - Core job/booking record
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'quoted' CHECK (status IN ('quoted', 'booked', 'in_progress', 'completed', 'cancelled')),
  scheduled_date date,
  scheduled_time text,
  estimated_duration numeric, -- hours
  actual_duration numeric, -- hours
  move_from_address text,
  move_to_address text,
  distance_miles numeric,
  property_type text,
  bedrooms integer,
  special_instructions text,
  total_price numeric,
  deposit_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage jobs"
  ON public.jobs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon SELECT on jobs"
  ON public.jobs FOR SELECT
  USING (false);

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for common queries
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_scheduled_date ON public.jobs(scheduled_date);
CREATE INDEX idx_jobs_lead_id ON public.jobs(lead_id);

-- 2. CREW_MEMBERS - Crew personnel records
CREATE TABLE public.crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- nullable, not all crew have app accounts
  full_name text NOT NULL,
  phone text,
  email text,
  role text NOT NULL DEFAULT 'mover' CHECK (role IN ('mover', 'driver', 'lead')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  hourly_rate numeric DEFAULT 25.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage crew members"
  ON public.crew_members FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon SELECT on crew_members"
  ON public.crew_members FOR SELECT
  USING (false);

CREATE TRIGGER update_crew_members_updated_at
  BEFORE UPDATE ON public.crew_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. JOB_CREW_ASSIGNMENTS - Many-to-many: jobs to crew
CREATE TABLE public.job_crew_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  crew_member_id uuid NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  role text DEFAULT 'mover',
  check_in_time timestamptz,
  check_out_time timestamptz,
  hours_worked numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, crew_member_id)
);

ALTER TABLE public.job_crew_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage job crew assignments"
  ON public.job_crew_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon SELECT on job_crew_assignments"
  ON public.job_crew_assignments FOR SELECT
  USING (false);

CREATE INDEX idx_job_crew_job_id ON public.job_crew_assignments(job_id);
CREATE INDEX idx_job_crew_member_id ON public.job_crew_assignments(crew_member_id);

-- 4. JOB_PHOTOS - Before/after photos (URLs only, files in storage)
CREATE TABLE public.job_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  crew_member_id uuid REFERENCES public.crew_members(id) ON DELETE SET NULL,
  photo_url text NOT NULL,
  photo_type text NOT NULL DEFAULT 'before' CHECK (photo_type IN ('before', 'after', 'damage', 'inventory')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage job photos"
  ON public.job_photos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon SELECT on job_photos"
  ON public.job_photos FOR SELECT
  USING (false);

CREATE INDEX idx_job_photos_job_id ON public.job_photos(job_id);

-- 5. JOB_CHECKLISTS - Checklist items per job
CREATE TABLE public.job_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  item_text text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_by uuid REFERENCES public.crew_members(id) ON DELETE SET NULL,
  completed_at timestamptz,
  category text NOT NULL DEFAULT 'pre_move' CHECK (category IN ('pre_move', 'during', 'post_move')),
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage job checklists"
  ON public.job_checklists FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon SELECT on job_checklists"
  ON public.job_checklists FOR SELECT
  USING (false);

CREATE INDEX idx_job_checklists_job_id ON public.job_checklists(job_id);

-- 6. DIGITAL_AGREEMENTS - Customer agreements/waivers
CREATE TABLE public.digital_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  agreement_type text NOT NULL CHECK (agreement_type IN ('service_agreement', 'liability_waiver', 'damage_policy', 'cancellation_policy')),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  signature_url text, -- URL reference to signature stored in storage bucket
  signed_at timestamptz,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_agreements ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage digital agreements"
  ON public.digital_agreements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can INSERT for customer signatures (no auth required)
CREATE POLICY "Public can submit digital agreements"
  ON public.digital_agreements FOR INSERT
  WITH CHECK (
    customer_name IS NOT NULL 
    AND customer_name <> '' 
    AND customer_email IS NOT NULL 
    AND customer_email <> ''
    AND agreement_type IS NOT NULL
  );

-- Deny anonymous reads
CREATE POLICY "Deny anon SELECT on digital_agreements"
  ON public.digital_agreements FOR SELECT
  USING (false);

CREATE INDEX idx_digital_agreements_job_id ON public.digital_agreements(job_id);
CREATE INDEX idx_digital_agreements_lead_id ON public.digital_agreements(lead_id);

-- 7. EQUIPMENT - Fleet and equipment inventory
CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'truck' CHECK (type IN ('truck', 'dolly', 'blankets', 'straps', 'tools', 'other')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  assigned_job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage equipment"
  ON public.equipment FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon SELECT on equipment"
  ON public.equipment FOR SELECT
  USING (false);

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. JOB_FINANCIALS - Per-job cost and margin tracking
CREATE TABLE public.job_financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE UNIQUE,
  revenue numeric NOT NULL DEFAULT 0,
  labor_cost numeric NOT NULL DEFAULT 0,
  fuel_cost numeric NOT NULL DEFAULT 0,
  equipment_cost numeric NOT NULL DEFAULT 0,
  insurance_allocation numeric NOT NULL DEFAULT 0,
  net_profit numeric GENERATED ALWAYS AS (revenue - labor_cost - fuel_cost - equipment_cost - insurance_allocation) STORED,
  margin_percentage numeric GENERATED ALWAYS AS (
    CASE WHEN revenue > 0 
      THEN ((revenue - labor_cost - fuel_cost - equipment_cost - insurance_allocation) / revenue) * 100
      ELSE 0 
    END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage job financials"
  ON public.job_financials FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon SELECT on job_financials"
  ON public.job_financials FOR SELECT
  USING (false);

CREATE TRIGGER update_job_financials_updated_at
  BEFORE UPDATE ON public.job_financials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_job_financials_job_id ON public.job_financials(job_id);

-- 9. ACTIVITY_LOGS - Audit trail for all system actions
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- nullable for system actions
  action text NOT NULL,
  entity_type text NOT NULL, -- 'job', 'lead', 'crew_member', 'equipment', etc.
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage activity logs"
  ON public.activity_logs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon SELECT on activity_logs"
  ON public.activity_logs FOR SELECT
  USING (false);

CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- =============================================
-- STORAGE BUCKET for job photos
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for job photos
CREATE POLICY "Admins can upload job photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'job-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view job photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete job photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'job-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- Also create a signatures bucket for digital agreement signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can upload signatures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Admins can view signatures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'signatures' AND has_role(auth.uid(), 'admin'::app_role));
