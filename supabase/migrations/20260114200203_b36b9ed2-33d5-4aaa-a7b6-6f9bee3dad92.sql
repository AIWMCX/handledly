
-- =====================================================
-- FIX RLS POLICIES - Remove impractical created_at check
-- The default value handles this, explicit check breaks inserts
-- =====================================================

-- Drop and recreate leads policy without created_at check
DROP POLICY IF EXISTS "Public can create leads with validation" ON public.leads;

CREATE POLICY "Public can create leads with validation" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are not empty
  full_name IS NOT NULL AND 
  full_name <> '' AND
  email IS NOT NULL AND 
  email <> '' AND
  phone IS NOT NULL AND 
  phone <> '' AND
  -- Ensure status starts as 'new'
  status = 'new'
);

-- Drop and recreate quote_requests policy without created_at check
DROP POLICY IF EXISTS "Public can create quote requests with validation" ON public.quote_requests;

CREATE POLICY "Public can create quote requests with validation" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (
  -- Ensure property_type is provided
  property_type IS NOT NULL AND 
  property_type <> ''
);

-- Drop and recreate chat_conversations policy without created_at check
DROP POLICY IF EXISTS "Public can create chat conversations with validation" ON public.chat_conversations;

CREATE POLICY "Public can create chat conversations with validation" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (
  -- Ensure session_id is provided
  session_id IS NOT NULL AND 
  session_id <> '' AND
  -- Status must start as 'active'
  status = 'active'
);

-- Drop and recreate chat_messages policy without created_at check
DROP POLICY IF EXISTS "Public can create chat messages with validation" ON public.chat_messages;

CREATE POLICY "Public can create chat messages with validation" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  -- Ensure content is provided
  content IS NOT NULL AND 
  content <> '' AND
  -- Ensure conversation_id is provided  
  conversation_id IS NOT NULL AND
  -- Role must be valid
  role IN ('user', 'assistant', 'system')
);
