

# Grant Admin Access to beltovbogdan@gmail.com

## Problem Identified
The user `beltovbogdan@gmail.com` is:
- In the email whitelist in `AuthContext.tsx` (line 11)
- Exists in `auth.users` table
- **Missing from `user_roles` table** — This is why they see "Access Restricted"

The system requires BOTH:
1. Email in whitelist (passes `isAuthorized` check)
2. Admin role in database (passes `isAdmin` check)

## Solution
Insert the admin role record into the `user_roles` table for this user.

## Implementation Steps

### Step 1: Get the user ID for beltovbogdan@gmail.com
Query the auth.users table to find the user's UUID

### Step 2: Insert admin role
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-id>', 'admin');
```

### Step 3: Verify access
After the insert, the user should be able to access /admin without the "Access Restricted" screen.

---

## Technical Details

**Why this happened:** The user was recently created (as seen in auth logs showing signup for beltovbogdan@gmail.com), but the automatic admin role trigger was previously removed for security reasons. Admin roles must now be manually assigned.

**Security note:** This is the correct behavior — admin access requires explicit database-level assignment, not just being on the email whitelist.

