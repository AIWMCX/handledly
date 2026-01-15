-- SEC-001: CRITICAL - Drop the auto-admin trigger that grants admin to all signups
-- This is a major security vulnerability that must be disabled before launch

-- Drop the trigger first (must happen before function)
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user_role();