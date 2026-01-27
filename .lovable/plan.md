

# Add Admin SMS Alerts & Test End-to-End Quote Flow

## Summary

Add the `ADMIN_PHONE_NUMBER` secret to enable SMS alerts for high-value leads ($1,000+), then test the complete quote submission flow to verify the database trigger automatically sends admin notification emails.

---

## Current State

| Component | Status |
|-----------|--------|
| `notify-admin-new-lead` edge function | ✅ Deployed and ready |
| Database trigger `on_new_lead_notify` | ✅ Active on leads table |
| `ADMIN_PHONE_NUMBER` secret | ❌ Not configured |
| Resend email integration | ✅ Configured |
| Twilio SMS integration | ✅ Credentials ready |

---

## Implementation Plan

### Step 1: Add ADMIN_PHONE_NUMBER Secret

Prompt you to add your admin phone number for SMS alerts:
- Format: `+1XXXXXXXXXX` (US format with country code)
- This phone will receive SMS for leads with quotes >= $1,000
- SMS content includes: quote amount, customer name, move date, and phone number

### Step 2: Deploy Updated Edge Function

Redeploy the `notify-admin-new-lead` function to ensure it picks up the new secret.

### Step 3: Test End-to-End Flow

Submit a test quote through the system to verify:

1. **Quote form submission** triggers database INSERT
2. **Database trigger** fires and calls `notify-admin-new-lead`
3. **Email notification** sent to all 3 admin addresses
4. **SMS notification** sent if quote >= $1,000
5. **Email + AI call flow** continues as normal

### Step 4: Verify Notifications Received

Check:
- Edge function logs for successful execution
- Email delivery to admin inboxes
- SMS delivery to admin phone (if high-value)
- Dashboard realtime toast notification

---

## Test Scenarios

| Test | Quote Value | Expected Notifications |
|------|-------------|----------------------|
| Standard lead | $500 | Email only (3 admins) |
| High-value lead | $1,500+ | Email + SMS |

---

## Files to Modify

| File | Change |
|------|--------|
| None | Just adding a secret and testing |

---

## Expected Outcome

After implementation:
- Admin team receives instant email alerts for every new lead
- Admin phone receives SMS for high-value leads ($1,000+)
- Complete visibility into lead pipeline within seconds of submission
- No more missed high-value opportunities

