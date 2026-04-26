
-- ============================================================
-- PHASE 1+2+5: Marketplace pipeline foundation
-- ============================================================

-- 1. Add lead_id to move_requests for cross-linking with Handledly direct leads
ALTER TABLE public.move_requests
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_move_requests_lead_id ON public.move_requests(lead_id);
CREATE INDEX IF NOT EXISTS idx_move_requests_status ON public.move_requests(status);
CREATE INDEX IF NOT EXISTS idx_move_requests_customer_id ON public.move_requests(customer_id);

-- 2. Add quote_number to quotes
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS quote_number text;

-- 3. Auto-generate quote_number trigger
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'Q-';
  i int;
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;
    NEW.quote_number := result;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quotes_set_quote_number ON public.quotes;
CREATE TRIGGER quotes_set_quote_number
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_quote_number();

-- 4. Auto-generate booking_number trigger (in case it isn't set)
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'BK-';
  i int;
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;
    NEW.booking_number := result;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_set_booking_number ON public.bookings;
CREATE TRIGGER bookings_set_booking_number
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_booking_number();

-- 5. RLS: quotes table
-- Drop existing policies if any to redefine cleanly
DROP POLICY IF EXISTS "Movers can submit quotes for active requests" ON public.quotes;
DROP POLICY IF EXISTS "Movers can read own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Movers can update own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Customers can read quotes on own requests" ON public.quotes;
DROP POLICY IF EXISTS "Customers can update quotes on own requests" ON public.quotes;
DROP POLICY IF EXISTS "Admins manage quotes" ON public.quotes;

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage quotes"
  ON public.quotes
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Movers can submit quotes for active requests"
  ON public.quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    moving_company_id = get_user_company_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.move_requests mr
      WHERE mr.id = move_request_id
        AND mr.status IN ('pending', 'quoted')
    )
  );

CREATE POLICY "Movers can read own quotes"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Movers can update own quotes"
  ON public.quotes
  FOR UPDATE
  TO authenticated
  USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Customers can read quotes on own requests"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (
    move_request_id IN (
      SELECT mr.id FROM public.move_requests mr
      JOIN public.customers c ON c.id = mr.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update quotes on own requests"
  ON public.quotes
  FOR UPDATE
  TO authenticated
  USING (
    move_request_id IN (
      SELECT mr.id FROM public.move_requests mr
      JOIN public.customers c ON c.id = mr.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

-- 6. Trigger: when a customer accepts a quote, create a booking and update statuses
CREATE OR REPLACE FUNCTION public.handle_quote_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id uuid;
  v_move_date date;
BEGIN
  -- Only act when quote transitions into 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    -- Look up customer + move date from the move request
    SELECT mr.customer_id, COALESCE(mr.preferred_move_date, mr.date_range_start, CURRENT_DATE + INTERVAL '14 days')::date
      INTO v_customer_id, v_move_date
      FROM public.move_requests mr
      WHERE mr.id = NEW.move_request_id;

    -- Create the booking
    INSERT INTO public.bookings (
      booking_number,
      move_request_id,
      quote_id,
      customer_id,
      moving_company_id,
      move_date,
      total_price,
      crew_size,
      estimated_duration_hours,
      status
    ) VALUES (
      '', -- trigger will populate
      NEW.move_request_id,
      NEW.id,
      v_customer_id,
      NEW.moving_company_id,
      v_move_date,
      NEW.total_price,
      COALESCE(NEW.crew_size, 2),
      NEW.estimated_hours,
      'confirmed'
    );

    -- Mark all OTHER quotes on the same request as superseded
    UPDATE public.quotes
      SET status = 'rejected', rejected_at = now()
      WHERE move_request_id = NEW.move_request_id
        AND id <> NEW.id
        AND status NOT IN ('accepted', 'rejected');

    -- Move the request to booked
    UPDATE public.move_requests
      SET status = 'booked', updated_at = now()
      WHERE id = NEW.move_request_id;

    -- Set accepted_at timestamp on this quote
    NEW.accepted_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quotes_on_acceptance ON public.quotes;
CREATE TRIGGER quotes_on_acceptance
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_quote_acceptance();

-- 7. Trigger: when a new quote is submitted, bump move_request from 'pending' → 'quoted'
CREATE OR REPLACE FUNCTION public.handle_new_quote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.move_requests
    SET status = 'quoted', updated_at = now()
    WHERE id = NEW.move_request_id
      AND status = 'pending';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quotes_after_insert_bump_request ON public.quotes;
CREATE TRIGGER quotes_after_insert_bump_request
  AFTER INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_quote();

-- 8. Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'move_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.move_requests;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'quotes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;

ALTER TABLE public.move_requests REPLICA IDENTITY FULL;
ALTER TABLE public.quotes REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
