-- =====================================================
-- AI COST PROTECTION FRAMEWORK
-- Prevents cost explosions from spam, viral traffic, API abuse
-- =====================================================

-- 1. Cost Tracking Table - Monitor all AI/call usage
CREATE TABLE public.cost_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  service_type TEXT NOT NULL, -- 'ai_chat', 'confirmation_call', 'sms', 'email'
  estimated_cost NUMERIC(10, 4) NOT NULL DEFAULT 0,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_hash TEXT, -- Anonymized IP for abuse detection
  success BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.cost_tracker ENABLE ROW LEVEL SECURITY;

-- Only admins can read cost data
CREATE POLICY "Admins can manage cost tracker"
ON public.cost_tracker
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Circuit Breaker Configuration - Auto-disable services when limits hit
CREATE TABLE public.circuit_breaker_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE, -- 'ai_chat', 'confirmation_call', 'sms', 'email'
  enabled BOOLEAN DEFAULT true,
  daily_limit NUMERIC(10, 2) NOT NULL DEFAULT 50.00, -- Daily cost limit in USD
  hourly_limit NUMERIC(10, 2) NOT NULL DEFAULT 10.00, -- Hourly cost limit
  current_daily_spend NUMERIC(10, 2) DEFAULT 0,
  current_hourly_spend NUMERIC(10, 2) DEFAULT 0,
  last_reset_daily TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_reset_hourly TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tripped BOOLEAN DEFAULT false, -- If true, service is disabled
  tripped_at TIMESTAMP WITH TIME ZONE,
  trip_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.circuit_breaker_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage circuit breaker"
ON public.circuit_breaker_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default circuit breaker configs
INSERT INTO public.circuit_breaker_config (service_name, daily_limit, hourly_limit) VALUES
  ('ai_chat', 25.00, 5.00),        -- AI chat: $25/day, $5/hour
  ('confirmation_call', 100.00, 20.00), -- Calls: $100/day, $20/hour
  ('sms', 20.00, 5.00),            -- SMS: $20/day, $5/hour
  ('email', 10.00, 2.00);          -- Email: $10/day, $2/hour

-- 3. Honeypot Detection Log - Track bot/spam attempts
CREATE TABLE public.honeypot_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_hash TEXT NOT NULL,
  page TEXT,
  detection_type TEXT NOT NULL, -- 'hidden_field', 'timing', 'pattern', 'fingerprint'
  detection_data JSONB DEFAULT '{}'::jsonb,
  blocked BOOLEAN DEFAULT true
);

ALTER TABLE public.honeypot_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view honeypot detections"
ON public.honeypot_detections
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public insert for detection logging
CREATE POLICY "Public can log honeypot detections"
ON public.honeypot_detections
FOR INSERT
WITH CHECK (true);

-- 4. Enhanced Rate Limiting - Tiered limits based on trust score
CREATE TABLE public.client_trust_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_identifier TEXT NOT NULL UNIQUE,
  trust_score INTEGER DEFAULT 100, -- 0-100, starts at 100
  total_requests INTEGER DEFAULT 0,
  blocked_requests INTEGER DEFAULT 0,
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  flags JSONB DEFAULT '[]'::jsonb, -- Array of violation flags
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_trust_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trust scores"
ON public.client_trust_scores
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Function: Check circuit breaker status
CREATE OR REPLACE FUNCTION public.check_circuit_breaker(p_service_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_row circuit_breaker_config%ROWTYPE;
BEGIN
  SELECT * INTO config_row 
  FROM circuit_breaker_config 
  WHERE service_name = p_service_name;
  
  IF NOT FOUND THEN
    RETURN TRUE; -- Allow if no config exists
  END IF;
  
  -- Check if tripped
  IF config_row.tripped THEN
    RETURN FALSE;
  END IF;
  
  -- Check if enabled
  IF NOT config_row.enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check daily limit
  IF config_row.current_daily_spend >= config_row.daily_limit THEN
    UPDATE circuit_breaker_config 
    SET tripped = true, tripped_at = now(), trip_reason = 'Daily limit exceeded'
    WHERE service_name = p_service_name;
    RETURN FALSE;
  END IF;
  
  -- Check hourly limit
  IF config_row.current_hourly_spend >= config_row.hourly_limit THEN
    UPDATE circuit_breaker_config 
    SET tripped = true, tripped_at = now(), trip_reason = 'Hourly limit exceeded'
    WHERE service_name = p_service_name;
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 6. Function: Record cost and update circuit breaker
CREATE OR REPLACE FUNCTION public.record_service_cost(
  p_service_type TEXT,
  p_cost NUMERIC,
  p_lead_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_row circuit_breaker_config%ROWTYPE;
BEGIN
  -- Reset counters if needed
  UPDATE circuit_breaker_config
  SET 
    current_daily_spend = CASE 
      WHEN last_reset_daily < date_trunc('day', now()) THEN 0 
      ELSE current_daily_spend 
    END,
    last_reset_daily = CASE 
      WHEN last_reset_daily < date_trunc('day', now()) THEN now() 
      ELSE last_reset_daily 
    END,
    current_hourly_spend = CASE 
      WHEN last_reset_hourly < date_trunc('hour', now()) THEN 0 
      ELSE current_hourly_spend 
    END,
    last_reset_hourly = CASE 
      WHEN last_reset_hourly < date_trunc('hour', now()) THEN now() 
      ELSE last_reset_hourly 
    END,
    tripped = CASE 
      WHEN last_reset_hourly < date_trunc('hour', now()) THEN false 
      ELSE tripped 
    END,
    updated_at = now()
  WHERE service_name = p_service_type;
  
  -- Record the cost
  INSERT INTO cost_tracker (service_type, estimated_cost, lead_id, session_id, ip_hash, metadata)
  VALUES (p_service_type, p_cost, p_lead_id, p_session_id, p_ip_hash, p_metadata);
  
  -- Update circuit breaker spend
  UPDATE circuit_breaker_config
  SET 
    current_daily_spend = current_daily_spend + p_cost,
    current_hourly_spend = current_hourly_spend + p_cost,
    updated_at = now()
  WHERE service_name = p_service_type;
  
  RETURN TRUE;
END;
$$;

-- 7. Function: Get tiered rate limit based on trust score
CREATE OR REPLACE FUNCTION public.get_tiered_rate_limit(
  p_identifier TEXT,
  p_base_limit INTEGER DEFAULT 5
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trust_score INTEGER;
BEGIN
  SELECT cts.trust_score INTO trust_score
  FROM client_trust_scores cts
  WHERE client_identifier = p_identifier;
  
  IF NOT FOUND THEN
    -- New client, insert with default score
    INSERT INTO client_trust_scores (client_identifier)
    VALUES (p_identifier)
    ON CONFLICT (client_identifier) DO NOTHING;
    RETURN p_base_limit;
  END IF;
  
  -- Tiered limits based on trust score
  -- Score 90-100: 2x base limit (trusted)
  -- Score 70-89: 1.5x base limit (normal)
  -- Score 50-69: 1x base limit (cautious)
  -- Score 25-49: 0.5x base limit (suspicious)
  -- Score 0-24: 0.25x base limit (restricted)
  
  IF trust_score >= 90 THEN
    RETURN p_base_limit * 2;
  ELSIF trust_score >= 70 THEN
    RETURN CEIL(p_base_limit * 1.5);
  ELSIF trust_score >= 50 THEN
    RETURN p_base_limit;
  ELSIF trust_score >= 25 THEN
    RETURN CEIL(p_base_limit * 0.5);
  ELSE
    RETURN CEIL(p_base_limit * 0.25);
  END IF;
END;
$$;

-- 8. Function: Decrease trust score on violation
CREATE OR REPLACE FUNCTION public.record_trust_violation(
  p_identifier TEXT,
  p_violation_type TEXT,
  p_penalty INTEGER DEFAULT 10
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_score INTEGER;
BEGIN
  INSERT INTO client_trust_scores (client_identifier, trust_score, blocked_requests, flags)
  VALUES (p_identifier, 100 - p_penalty, 1, jsonb_build_array(p_violation_type))
  ON CONFLICT (client_identifier) DO UPDATE
  SET 
    trust_score = GREATEST(0, client_trust_scores.trust_score - p_penalty),
    blocked_requests = client_trust_scores.blocked_requests + 1,
    flags = client_trust_scores.flags || jsonb_build_array(p_violation_type),
    updated_at = now()
  RETURNING trust_score INTO new_score;
  
  RETURN new_score;
END;
$$;

-- 9. Indexes for performance
CREATE INDEX idx_cost_tracker_service_date ON public.cost_tracker (service_type, created_at);
CREATE INDEX idx_cost_tracker_session ON public.cost_tracker (session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_honeypot_ip_hash ON public.honeypot_detections (ip_hash, created_at);
CREATE INDEX idx_trust_scores_identifier ON public.client_trust_scores (client_identifier);

-- 10. Function: Get daily cost summary for admin dashboard
CREATE OR REPLACE FUNCTION public.get_cost_summary(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  service_type TEXT,
  total_cost NUMERIC,
  request_count BIGINT,
  avg_cost NUMERIC,
  date DATE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ct.service_type,
    SUM(ct.estimated_cost) as total_cost,
    COUNT(*) as request_count,
    AVG(ct.estimated_cost) as avg_cost,
    DATE(ct.created_at) as date
  FROM cost_tracker ct
  WHERE ct.created_at >= now() - (p_days || ' days')::INTERVAL
  GROUP BY ct.service_type, DATE(ct.created_at)
  ORDER BY date DESC, service_type;
$$;