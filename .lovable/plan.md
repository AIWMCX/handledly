
# Set Password for shcherbakou.edu@gmail.com

## Current Situation
- **User**: `shcherbakou.edu@gmail.com` (UUID: `16faa6a9-abe4-4204-925a-ff231be73cf8`)
- **Admin role**: Granted in `user_roles` table
- **Email whitelist**: Included in `AuthContext.tsx`
- **Issue**: Password unknown/not working - need to set it to `HANDLEDLY2024`

## Solution
Create a one-time edge function to reset the password using the Supabase Admin API:

### Step 1: Create Edge Function
Create `supabase/functions/admin-set-password/index.ts` that uses the service role key to update the user's password:

```text
┌─────────────────────────────────────────┐
│  admin-set-password Edge Function       │
├─────────────────────────────────────────┤
│  Input: user_id, new_password           │
│  Uses: SUPABASE_SERVICE_ROLE_KEY        │
│  Method: supabase.auth.admin            │
│         .updateUserById()               │
└─────────────────────────────────────────┘
```

### Step 2: Set the Password
Call the edge function with:
- User ID: `16faa6a9-abe4-4204-925a-ff231be73cf8`
- New Password: `HANDLEDLY2024`

### Step 3: Verify Login
Confirm the user can log in at `/auth` with:
- Email: `shcherbakou.edu@gmail.com`
- Password: `HANDLEDLY2024`

### Step 4: Security Cleanup
After confirming login works, delete the edge function since it's only needed once.

## Technical Details

The edge function will:
1. Accept a secure request (admin-only, with authorization check)
2. Use `supabase.auth.admin.updateUserById()` to set the new password
3. Return success/failure status

## Expected Result
After implementation, `shcherbakou.edu@gmail.com` will be able to log in with password `HANDLEDLY2024` and access the admin dashboard.
