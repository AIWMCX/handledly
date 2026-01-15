-- Clean up duplicate chat_conversations policy
DROP POLICY IF EXISTS "Public can create chat conversations with rate limiting" ON public.chat_conversations;