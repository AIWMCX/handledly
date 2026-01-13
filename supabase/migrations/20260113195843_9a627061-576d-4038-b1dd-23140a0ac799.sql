-- Grant admin role to aiwmcceo@aiwmccom.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('c075947b-9e84-4bd9-927d-fd9948298673', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Function to auto-assign admin role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();