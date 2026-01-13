-- Create a function to get user ID by email (requires service role, but we'll use security definer)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_input text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE email = lower(email_input) LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated;