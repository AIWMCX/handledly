-- Create trigger function for chat_conversations rate limiting
CREATE OR REPLACE FUNCTION public.record_rate_limit_on_chat_insert()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.rate_limit_tracker (identifier, table_name)
    VALUES (get_client_identifier(), 'chat_conversations');
    RETURN NEW;
END;
$$;

-- Create the trigger for chat_conversations
DROP TRIGGER IF EXISTS chat_conversations_rate_limit_trigger ON public.chat_conversations;
CREATE TRIGGER chat_conversations_rate_limit_trigger
  AFTER INSERT ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.record_rate_limit_on_chat_insert();

-- Create trigger function for chat_messages rate limiting
CREATE OR REPLACE FUNCTION public.record_rate_limit_on_chat_message_insert()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.rate_limit_tracker (identifier, table_name)
    VALUES (get_client_identifier(), 'chat_messages');
    RETURN NEW;
END;
$$;

-- Create the trigger for chat_messages
DROP TRIGGER IF EXISTS chat_messages_rate_limit_trigger ON public.chat_messages;
CREATE TRIGGER chat_messages_rate_limit_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.record_rate_limit_on_chat_message_insert();