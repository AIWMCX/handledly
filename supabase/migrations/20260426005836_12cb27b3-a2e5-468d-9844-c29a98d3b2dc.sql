-- 1. Add confirmation call tracking to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS confirmation_call_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS confirmation_call_time timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_call_notes text,
  ADD COLUMN IF NOT EXISTS confirmation_call_summary text,
  ADD COLUMN IF NOT EXISTS confirmation_call_sid text;

-- 2. Add confirmation call tracking to move_requests
ALTER TABLE public.move_requests
  ADD COLUMN IF NOT EXISTS confirmation_call_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS confirmation_call_time timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_call_notes text,
  ADD COLUMN IF NOT EXISTS broadcast_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_broadcast_at timestamptz;

-- 3. Mover broadcasts table — tracks which movers were notified for which request
CREATE TABLE IF NOT EXISTS public.mover_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  move_request_id uuid NOT NULL REFERENCES public.move_requests(id) ON DELETE CASCADE,
  moving_company_id uuid NOT NULL REFERENCES public.moving_companies(id) ON DELETE CASCADE,
  broadcast_at timestamptz NOT NULL DEFAULT now(),
  viewed_at timestamptz,
  responded_at timestamptz,
  response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (move_request_id, moving_company_id)
);

CREATE INDEX IF NOT EXISTS idx_mover_broadcasts_company ON public.mover_broadcasts(moving_company_id);
CREATE INDEX IF NOT EXISTS idx_mover_broadcasts_request ON public.mover_broadcasts(move_request_id);

ALTER TABLE public.mover_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage broadcasts"
  ON public.mover_broadcasts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Movers see own broadcasts"
  ON public.mover_broadcasts FOR SELECT TO authenticated
  USING (moving_company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Movers update own broadcasts"
  ON public.mover_broadcasts FOR UPDATE TO authenticated
  USING (moving_company_id = get_user_company_id(auth.uid()));

-- 4. Realtime for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE public.mover_broadcasts;

-- 5. Function: broadcast a move_request to all matching active+verified movers (statewide for launch)
CREATE OR REPLACE FUNCTION public.broadcast_move_request(_move_request_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_state text;
  v_count integer := 0;
BEGIN
  -- Resolve destination state for matching (statewide for launch)
  SELECT origin_state INTO v_state
  FROM public.move_requests WHERE id = _move_request_id;

  IF v_state IS NULL THEN
    v_state := 'CO';
  END IF;

  INSERT INTO public.mover_broadcasts (move_request_id, moving_company_id)
  SELECT _move_request_id, mc.id
  FROM public.moving_companies mc
  WHERE mc.status = 'active'
    AND COALESCE(mc.onboarding_completed, false) = true
    AND (
      v_state = ANY (mc.service_states)
      OR mc.service_states = '{}'::text[]
      OR mc.service_states IS NULL
    )
  ON CONFLICT (move_request_id, moving_company_id) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE public.move_requests
    SET broadcast_count = COALESCE(broadcast_count, 0) + v_count,
        last_broadcast_at = now(),
        updated_at = now()
    WHERE id = _move_request_id;

  RETURN v_count;
END;
$$;

-- 6. Trigger: auto-broadcast when a new move_request is created
CREATE OR REPLACE FUNCTION public.auto_broadcast_new_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.broadcast_move_request(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_broadcast_new_request ON public.move_requests;
CREATE TRIGGER trg_auto_broadcast_new_request
  AFTER INSERT ON public.move_requests
  FOR EACH ROW EXECUTE FUNCTION public.auto_broadcast_new_request();

-- 7. Movers can view broadcast move requests (in addition to existing pending/quoted policy)
DROP POLICY IF EXISTS "Movers can view broadcast move requests" ON public.move_requests;
CREATE POLICY "Movers can view broadcast move requests"
  ON public.move_requests FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT move_request_id FROM public.mover_broadcasts
      WHERE moving_company_id = get_user_company_id(auth.uid())
    )
  );

-- 8. Quotes: movers can insert quotes against move_requests they were broadcast
DROP POLICY IF EXISTS "Movers can submit quotes" ON public.quotes;
CREATE POLICY "Movers can submit quotes"
  ON public.quotes FOR INSERT TO authenticated
  WITH CHECK (
    moving_company_id = get_user_company_id(auth.uid())
    AND move_request_id IN (
      SELECT move_request_id FROM public.mover_broadcasts
      WHERE moving_company_id = get_user_company_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Movers can view their own quotes" ON public.quotes;
CREATE POLICY "Movers can view their own quotes"
  ON public.quotes FOR SELECT TO authenticated
  USING (moving_company_id = get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Movers can update their own quotes" ON public.quotes;
CREATE POLICY "Movers can update their own quotes"
  ON public.quotes FOR UPDATE TO authenticated
  USING (moving_company_id = get_user_company_id(auth.uid()) AND status NOT IN ('accepted', 'rejected'));

-- 9. Customers can view quotes for their own move requests (already implicit via FK, make explicit)
DROP POLICY IF EXISTS "Customers see own quotes" ON public.quotes;
CREATE POLICY "Customers see own quotes"
  ON public.quotes FOR SELECT TO authenticated
  USING (
    move_request_id IN (
      SELECT id FROM public.move_requests WHERE customer_id IN (
        SELECT id FROM public.customers WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Customers can accept own quotes" ON public.quotes;
CREATE POLICY "Customers can accept own quotes"
  ON public.quotes FOR UPDATE TO authenticated
  USING (
    move_request_id IN (
      SELECT id FROM public.move_requests WHERE customer_id IN (
        SELECT id FROM public.customers WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins manage quotes" ON public.quotes;
CREATE POLICY "Admins manage quotes"
  ON public.quotes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));