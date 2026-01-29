

# Grant Admin Access to shcherbakou.edu@gmail.com

## Current Status
- **User exists**: `shcherbakou.edu@gmail.com` (UUID: `16faa6a9-abe4-4204-925a-ff231be73cf8`)
- **Created**: January 29, 2026 at 02:12 AM
- **In email whitelist**: Yes (line 7 of AuthContext.tsx)
- **Has admin role in database**: No (missing from `user_roles` table)

## The Problem
Just like with beltovbogdan@gmail.com, the user passes the email whitelist check but fails the database admin role check. Both are required for admin access.

## Solution
Insert the admin role record into the `user_roles` table:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('16faa6a9-abe4-4204-925a-ff231be73cf8', 'admin');
```

## After Approval
Once this is executed, `shcherbakou.edu@gmail.com` will be able to:
1. Log in at `/auth`
2. Access the admin dashboard at `/admin`
3. Manage leads, appointments, conversations, and all admin features

## Password Note
The password you set when creating this account remains unchanged. If forgotten, use the "Forgot Password" flow or let me know and I can help reset it.

