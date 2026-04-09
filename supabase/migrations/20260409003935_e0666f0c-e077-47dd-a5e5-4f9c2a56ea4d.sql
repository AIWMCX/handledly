
-- ============================================
-- MARKETPLACE FOUNDATION SCHEMA
-- ============================================

-- Moving Companies (Supply Side)
CREATE TABLE public.moving_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  
  -- Licensing & Compliance
  dot_number VARCHAR(50),
  mc_number VARCHAR(50),
  state_license VARCHAR(100),
  insurance_policy VARCHAR(100),
  insurance_expires_at DATE,
  insurance_verified BOOLEAN DEFAULT false,
  bbb_rating VARCHAR(10),
  
  -- Business Info
  primary_email VARCHAR(255) NOT NULL,
  primary_phone VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  year_founded INTEGER,
  description TEXT,
  logo_url TEXT,
  
  -- Address
  address_street TEXT,
  address_city TEXT,
  address_state VARCHAR(2),
  address_zip VARCHAR(10),
  address_lat DECIMAL(10,7),
  address_lng DECIMAL(10,7),
  
  -- Service Coverage
  service_states TEXT[] DEFAULT '{}',
  service_zip_codes TEXT[] DEFAULT '{}',
  service_radius_miles INTEGER DEFAULT 50,
  
  -- Pricing
  base_rate_local DECIMAL(10,2),
  base_rate_long_distance DECIMAL(10,2),
  minimum_charge DECIMAL(10,2),
  
  -- Platform Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
  verified_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Ratings & Performance (denormalized for fast reads)
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_moves_completed INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 0,
  cancellation_rate DECIMAL(5,2) DEFAULT 0,
  on_time_rate DECIMAL(5,2) DEFAULT 100,
  
  -- Stripe Connect (future)
  stripe_connect_account_id VARCHAR(255),
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moving_companies_status ON public.moving_companies(status);
CREATE INDEX idx_moving_companies_slug ON public.moving_companies(slug);
CREATE INDEX idx_moving_companies_state ON public.moving_companies USING GIN(service_states);
CREATE INDEX idx_moving_companies_rating ON public.moving_companies(average_rating DESC);

-- Moving Company Users (link auth users to companies)
CREATE TABLE public.moving_company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moving_company_id UUID NOT NULL REFERENCES public.moving_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(moving_company_id, user_id)
);

CREATE INDEX idx_mcu_user ON public.moving_company_users(user_id);
CREATE INDEX idx_mcu_company ON public.moving_company_users(moving_company_id);

-- Customers (Demand Side)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Marketing
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  referral_code VARCHAR(50),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_user ON public.customers(user_id);
CREATE INDEX idx_customers_email ON public.customers(email);

-- Move Requests (Core Transaction)
CREATE TABLE public.move_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  
  -- Move Details
  move_type VARCHAR(50) NOT NULL, -- local, long_distance, international
  move_size VARCHAR(50) NOT NULL, -- studio, 1br, 2br, 3br, 4br_plus, commercial
  
  -- Origin
  origin_street TEXT,
  origin_city TEXT,
  origin_state VARCHAR(2),
  origin_zip VARCHAR(10),
  origin_lat DECIMAL(10,7),
  origin_lng DECIMAL(10,7),
  origin_floor INTEGER,
  origin_elevator BOOLEAN DEFAULT false,
  
  -- Destination
  dest_street TEXT,
  dest_city TEXT,
  dest_state VARCHAR(2),
  dest_zip VARCHAR(10),
  dest_lat DECIMAL(10,7),
  dest_lng DECIMAL(10,7),
  dest_floor INTEGER,
  dest_elevator BOOLEAN DEFAULT false,
  
  -- Distance
  distance_miles DECIMAL(10,2),
  estimated_drive_minutes INTEGER,
  
  -- Timing
  preferred_move_date DATE,
  flexible_dates BOOLEAN DEFAULT false,
  date_range_start DATE,
  date_range_end DATE,
  
  -- Services
  packing_required BOOLEAN DEFAULT false,
  unpacking_required BOOLEAN DEFAULT false,
  storage_required BOOLEAN DEFAULT false,
  storage_duration_days INTEGER,
  specialty_items JSONB DEFAULT '[]',
  
  -- Inventory
  inventory_items JSONB DEFAULT '[]',
  estimated_weight_lbs INTEGER,
  estimated_volume_cuft INTEGER,
  notes TEXT,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_move_requests_customer ON public.move_requests(customer_id);
CREATE INDEX idx_move_requests_status ON public.move_requests(status);
CREATE INDEX idx_move_requests_date ON public.move_requests(preferred_move_date);

-- Quotes (Mover Responses)
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  move_request_id UUID NOT NULL REFERENCES public.move_requests(id) ON DELETE CASCADE,
  moving_company_id UUID NOT NULL REFERENCES public.moving_companies(id) ON DELETE CASCADE,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  packing_price DECIMAL(10,2) DEFAULT 0,
  unpacking_price DECIMAL(10,2) DEFAULT 0,
  storage_price DECIMAL(10,2) DEFAULT 0,
  specialty_items_price DECIMAL(10,2) DEFAULT 0,
  fuel_surcharge DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Quote Type
  quote_type VARCHAR(50) DEFAULT 'binding',
  
  -- Availability
  available_dates JSONB DEFAULT '[]',
  estimated_hours DECIMAL(4,2),
  crew_size INTEGER DEFAULT 2,
  
  -- Terms
  deposit_required DECIMAL(10,2),
  cancellation_policy TEXT,
  notes TEXT,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(move_request_id, moving_company_id)
);

CREATE INDEX idx_quotes_move_request ON public.quotes(move_request_id);
CREATE INDEX idx_quotes_company ON public.quotes(moving_company_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);

-- Bookings (Confirmed Transactions)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  
  move_request_id UUID NOT NULL REFERENCES public.move_requests(id),
  quote_id UUID NOT NULL REFERENCES public.quotes(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  moving_company_id UUID NOT NULL REFERENCES public.moving_companies(id),
  
  -- Confirmed Details
  move_date DATE NOT NULL,
  move_time TIME,
  estimated_duration_hours DECIMAL(4,2),
  crew_size INTEGER DEFAULT 2,
  
  -- Pricing
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  balance_due DECIMAL(10,2),
  
  -- Commission
  platform_commission_rate DECIMAL(5,2) DEFAULT 1.50,
  platform_commission_amount DECIMAL(10,2),
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  
  -- Move Status
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  
  -- Tracking
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  actual_duration_minutes INTEGER,
  
  -- Completion
  completion_confirmed_at TIMESTAMPTZ,
  payout_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_company ON public.bookings(moving_company_id);
CREATE INDEX idx_bookings_date ON public.bookings(move_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Reviews (Trust & Reputation)
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  moving_company_id UUID NOT NULL REFERENCES public.moving_companies(id),
  
  -- Ratings (1-5)
  overall_rating INTEGER NOT NULL,
  professionalism_rating INTEGER,
  care_of_items_rating INTEGER,
  communication_rating INTEGER,
  value_rating INTEGER,
  
  -- Content
  review_text TEXT,
  photos JSONB DEFAULT '[]',
  
  -- Company Response
  company_response TEXT,
  company_responded_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  flagged_reason VARCHAR(255),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_company ON public.reviews(moving_company_id);
CREATE INDEX idx_reviews_rating ON public.reviews(overall_rating);

-- Disputes
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  
  filed_by_type VARCHAR(50) NOT NULL,
  filed_by_id UUID NOT NULL,
  against_type VARCHAR(50) NOT NULL,
  against_id UUID NOT NULL,
  
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]',
  
  amount_disputed DECIMAL(10,2),
  resolution_amount DECIMAL(10,2),
  
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  resolution_type VARCHAR(50),
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_disputes_booking ON public.disputes(booking_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);

-- ============================================
-- CRM TABLES (Free for Movers)
-- ============================================

CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moving_company_id UUID NOT NULL REFERENCES public.moving_companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  source VARCHAR(100) DEFAULT 'handledly',
  tags JSONB DEFAULT '[]',
  notes TEXT,
  stage VARCHAR(50) DEFAULT 'lead',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_contacts_company ON public.crm_contacts(moving_company_id);

CREATE TABLE public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moving_company_id UUID NOT NULL REFERENCES public.moving_companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to VARCHAR(255),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_tasks_company ON public.crm_tasks(moving_company_id);
CREATE INDEX idx_crm_tasks_status ON public.crm_tasks(status);

CREATE TABLE public.crm_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moving_company_id UUID NOT NULL REFERENCES public.moving_companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  direction VARCHAR(20) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_comms_company ON public.crm_communications(moving_company_id);

-- ============================================
-- UPDATED ROLE ENUM
-- ============================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mover';

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE public.moving_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moving_company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_communications ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's company ID
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT moving_company_id FROM public.moving_company_users
  WHERE user_id = _user_id LIMIT 1;
$$;

-- ---- MOVING COMPANIES ----
-- Public can view active companies
CREATE POLICY "Anyone can view active companies"
ON public.moving_companies FOR SELECT
USING (status = 'active');

-- Company users can view/edit their own
CREATE POLICY "Company users can view own company"
ON public.moving_companies FOR SELECT
TO authenticated
USING (id = get_user_company_id(auth.uid()));

CREATE POLICY "Company users can update own company"
ON public.moving_companies FOR UPDATE
TO authenticated
USING (id = get_user_company_id(auth.uid()));

-- Admins can manage all
CREATE POLICY "Admins manage all companies"
ON public.moving_companies FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone authenticated can create (signup flow)
CREATE POLICY "Authenticated users can create companies"
ON public.moving_companies FOR INSERT
TO authenticated
WITH CHECK (true);

-- ---- MOVING COMPANY USERS ----
CREATE POLICY "Users can see own company memberships"
ON public.moving_company_users FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company owners can manage members"
ON public.moving_company_users FOR ALL
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins manage company users"
ON public.moving_company_users FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ---- CUSTOMERS ----
CREATE POLICY "Customers can view own profile"
ON public.customers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Customers can update own profile"
ON public.customers FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Customers can create own profile"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage customers"
ON public.customers FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ---- MOVE REQUESTS ----
CREATE POLICY "Customers see own move requests"
ON public.move_requests FOR SELECT
TO authenticated
USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create move requests"
ON public.move_requests FOR INSERT
TO authenticated
WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can update own move requests"
ON public.move_requests FOR UPDATE
TO authenticated
USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- Movers can see all pending/active move requests (to submit quotes)
CREATE POLICY "Movers can view available move requests"
ON public.move_requests FOR SELECT
TO authenticated
USING (
  get_user_company_id(auth.uid()) IS NOT NULL
  AND status IN ('pending', 'quoted')
);

CREATE POLICY "Admins manage move requests"
ON public.move_requests FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ---- QUOTES ----
CREATE POLICY "Customers see quotes for their moves"
ON public.quotes FOR SELECT
TO authenticated
USING (
  move_request_id IN (
    SELECT mr.id FROM public.move_requests mr
    JOIN public.customers c ON c.id = mr.customer_id
    WHERE c.user_id = auth.uid()
  )
);

CREATE POLICY "Movers see own quotes"
ON public.quotes FOR SELECT
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Movers can create quotes"
ON public.quotes FOR INSERT
TO authenticated
WITH CHECK (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Movers can update own quotes"
ON public.quotes FOR UPDATE
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins manage quotes"
ON public.quotes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ---- BOOKINGS ----
CREATE POLICY "Customers see own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Movers see own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Movers can update own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins manage bookings"
ON public.bookings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ---- REVIEWS ----
-- Public can read all published reviews
CREATE POLICY "Anyone can read published reviews"
ON public.reviews FOR SELECT
USING (status = 'published');

CREATE POLICY "Customers can create reviews for their bookings"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  AND booking_id IN (SELECT id FROM public.bookings WHERE customer_id = reviews.customer_id AND status = 'completed')
);

CREATE POLICY "Company can respond to reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins manage reviews"
ON public.reviews FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ---- DISPUTES ----
CREATE POLICY "Involved parties can view disputes"
ON public.disputes FOR SELECT
TO authenticated
USING (
  filed_by_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  OR filed_by_id = get_user_company_id(auth.uid())
  OR against_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  OR against_id = get_user_company_id(auth.uid())
);

CREATE POLICY "Customers can file disputes"
ON public.disputes FOR INSERT
TO authenticated
WITH CHECK (
  filed_by_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);

CREATE POLICY "Admins manage disputes"
ON public.disputes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ---- CRM TABLES (Company-scoped) ----
CREATE POLICY "Company users manage own CRM contacts"
ON public.crm_contacts FOR ALL
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins manage CRM contacts"
ON public.crm_contacts FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company users manage own CRM tasks"
ON public.crm_tasks FOR ALL
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins manage CRM tasks"
ON public.crm_tasks FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company users manage own CRM comms"
ON public.crm_communications FOR ALL
TO authenticated
USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins manage CRM comms"
ON public.crm_communications FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers for all new tables
CREATE TRIGGER update_moving_companies_updated_at
  BEFORE UPDATE ON public.moving_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_move_requests_updated_at
  BEFORE UPDATE ON public.move_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON public.crm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION: Update company ratings on new review
-- ============================================
CREATE OR REPLACE FUNCTION public.update_company_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.moving_companies
  SET
    average_rating = (
      SELECT COALESCE(AVG(overall_rating), 0)
      FROM public.reviews
      WHERE moving_company_id = NEW.moving_company_id AND status = 'published'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE moving_company_id = NEW.moving_company_id AND status = 'published'
    ),
    updated_at = now()
  WHERE id = NEW.moving_company_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_company_ratings_on_review
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_company_ratings();

-- ============================================
-- FUNCTION: Update moves completed on booking completion
-- ============================================
CREATE OR REPLACE FUNCTION public.update_company_moves_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.moving_companies
    SET total_moves_completed = total_moves_completed + 1, updated_at = now()
    WHERE id = NEW.moving_company_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_moves_on_booking_complete
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_company_moves_completed();
