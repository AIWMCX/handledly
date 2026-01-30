-- Create a function to get admin users with their emails
-- This uses SECURITY DEFINER to allow admins to see email addresses
CREATE OR REPLACE FUNCTION public.get_admin_users_with_email()
RETURNS TABLE(
  role_id uuid,
  user_id uuid,
  email text,
  role text,
  role_created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  RETURN QUERY
  SELECT 
    ur.id as role_id,
    ur.user_id,
    u.email::text,
    ur.role::text,
    ur.created_at as role_created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at DESC;
END;
$$;