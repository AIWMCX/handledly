-- Create leads table for storing customer inquiries
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  move_from_address TEXT,
  move_to_address TEXT,
  move_date DATE,
  property_type TEXT, -- apartment, house, condo, office, retail, storage
  bedrooms INTEGER,
  has_specialty_items BOOLEAN DEFAULT false,
  specialty_items TEXT[], -- piano, antiques, art, safe
  estimated_quote DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, scheduled, completed, lost
  notes TEXT,
  call_transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table for scheduled moves
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  move_type TEXT NOT NULL, -- residential, commercial, specialty
  estimated_duration INTEGER, -- hours
  crew_size INTEGER DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_requests table for tracking quote calculations
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  property_type TEXT NOT NULL,
  bedrooms INTEGER,
  square_footage INTEGER,
  distance_zone TEXT, -- downtown, metro, extended
  has_stairs BOOLEAN DEFAULT false,
  floor_number INTEGER,
  specialty_items TEXT[],
  base_price DECIMAL(10,2),
  distance_fee DECIMAL(10,2),
  specialty_fee DECIMAL(10,2),
  stairs_fee DECIMAL(10,2),
  total_quote DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settings table for business configuration
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'Denver Elite Moving',
  phone_number TEXT NOT NULL DEFAULT '(720) 555-0123',
  email TEXT DEFAULT 'info@denverelitemoving.com',
  address TEXT DEFAULT '1234 Market Street, Denver, CO 80202',
  service_areas TEXT[] DEFAULT ARRAY['Denver', 'Aurora', 'Lakewood', 'Arvada', 'Westminster', 'Thornton', 'Centennial', 'Boulder'],
  base_rate_per_hour DECIMAL(10,2) DEFAULT 125.00,
  minimum_hours INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default business settings
INSERT INTO public.business_settings (company_name, phone_number) 
VALUES ('Denver Elite Moving', '(720) 555-0123');

-- Enable Row Level Security (public read for settings, admin for others)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Public can read business settings
CREATE POLICY "Anyone can read business settings" 
ON public.business_settings 
FOR SELECT 
USING (true);

-- Quote requests are public (anyone can get a quote)
CREATE POLICY "Anyone can create quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (true);

-- Leads can be created publicly (from website forms)
CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read leads" 
ON public.leads 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update leads" 
ON public.leads 
FOR UPDATE 
USING (true);

-- Appointments are linked to leads
CREATE POLICY "Anyone can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read appointments" 
ON public.appointments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();