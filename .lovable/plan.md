
# Remove shcherbakou.edu@gmail.com from Admin Access

## Current Status

The user `shcherbakou.edu@gmail.com` has already been deleted from the authentication system (auth.users table was deleted on Feb 2, 2026). However, the email still appears in the code whitelist and needs to be removed for complete security.

**Current Active Admins in Database:**
- `nevulis22@gmail.com` (since Jan 13, 2026)
- `beltovbogdan@gmail.com` (since Jan 29, 2026)

**Emails to KEEP in whitelist:**
- `saych.88@gmail.com`
- `nevulis22@gmail.com`  
- `beltovbogdan@gmail.com`

---

## Changes Required

### File 1: `src/contexts/AuthContext.tsx`

**Current (lines 7-12):**
```typescript
const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  'shcherbakou.edu@gmail.com',  // ← REMOVE
  'saych.88@gmail.com',
  'nevulis22@gmail.com',
  'beltovbogdan@gmail.com',
] as const;
```

**Updated:**
```typescript
const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  'saych.88@gmail.com',
  'nevulis22@gmail.com',
  'beltovbogdan@gmail.com',
] as const;
```

Also update the comment on line 6 from "Only these 3 accounts" to "Only these 3 accounts" (no change needed, it's already correct).

---

### File 2: `src/pages/admin/UserManagement.tsx`

**Current (lines 16-21):**
```typescript
const AUTHORIZED_ADMIN_EMAILS = [
  'shcherbakou.edu@gmail.com',  // ← REMOVE
  'saych.88@gmail.com',
  'nevulis22@gmail.com',
  'beltovbogdan@gmail.com',
] as const;
```

**Updated:**
```typescript
const AUTHORIZED_ADMIN_EMAILS = [
  'saych.88@gmail.com',
  'nevulis22@gmail.com',
  'beltovbogdan@gmail.com',
] as const;
```

---

## Re-Adding the User with New Password

After I remove the email from the whitelist:

1. **Sign up again** at `/auth` with `shcherbakou.edu@gmail.com` using a new password
2. **Add to whitelist** - I'll need to add the email back to the code whitelist
3. **Grant admin role** - Use the User Management panel (`/admin/users`) to grant admin access

---

## Implementation Order

1. Remove `shcherbakou.edu@gmail.com` from both whitelist arrays
2. User signs up fresh at `/auth` with new password
3. Add email back to whitelist (code change)
4. Grant admin role via User Management panel

---

## Security Notes

- The dual-layer security (whitelist + database role) ensures complete protection
- Even if someone had the old password, they cannot access the system because the auth.users record was deleted
- The new signup will create a fresh user ID with no prior associations
