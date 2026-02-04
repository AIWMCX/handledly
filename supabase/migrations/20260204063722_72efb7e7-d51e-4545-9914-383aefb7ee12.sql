-- Performance indexes for production scale

-- 1. Leads dashboard filtering - optimizes status + date ordering for admin dashboard
CREATE INDEX IF NOT EXISTS idx_leads_status_created 
ON public.leads (status, created_at DESC);

-- 2. Rate limiting lookups - critical path optimization for every API request
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracker_lookup 
ON public.rate_limit_tracker (identifier, table_name, created_at DESC);

-- 3. Call retry queue processing - partial index for failed calls only
CREATE INDEX IF NOT EXISTS idx_leads_call_retry 
ON public.leads (confirmation_call_status, next_retry_at)
WHERE confirmation_call_status IN ('failed', 'failed_sms_sent', 'timeout');

-- 4. Chat session lookups - optimizes conversation retrieval by session
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session 
ON public.chat_conversations (session_id, created_at DESC);