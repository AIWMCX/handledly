

# Admin Notification System for New Leads

## Summary

Create a real-time admin notification system that instantly alerts the team when new leads come in, providing quote details, call status updates, and enabling rapid response to high-value leads.

---

## Current State Analysis

### Existing Infrastructure Identified
| Component | Location | Status |
|-----------|----------|--------|
| **Supabase Realtime** | `leads` table has realtime enabled | ✅ Active |
| **Admin Email List** | Defined in `circuit-breaker-alert` and `trigger-confirmation-call` | 3 admins |
| **Resend Integration** | `RESEND_API_KEY` configured | ✅ Ready |
| **Twilio SMS** | `TWILIO_*` credentials configured | ✅ Ready |
| **Client Realtime Hook** | `useRealtimeLeads.ts` with toasts | ✅ Works for logged-in admins |

### Current Gaps
1. **No email alerts for new leads** — Only call failures trigger admin emails
2. **No SMS alerts for urgent leads** — High-value quotes go unnoticed
3. **In-app toasts require admin login** — Missed if not in dashboard
4. **No tiered urgency system** — All leads treated equally

---

## Implementation Plan

### Part 1: New Lead Notification Edge Function

Create a new `notify-admin-new-lead` edge function that sends formatted email and optional SMS alerts when new leads are created.

**File:** `supabase/functions/notify-admin-new-lead/index.ts`

**Notification Logic:**
- Send email alert to all admin addresses immediately
- For high-value leads (>$1,000), also send SMS notification
- Include one-click action links in email
- Rich HTML template matching existing brand style

**Data Included:**
| Field | Example |
|-------|---------|
| Lead Name | "Sarah Johnson" |
| Phone (clickable) | (720) 555-1234 |
| Email (clickable) | sarah@email.com |
| Quote Amount | $1,247 |
| Quote Number | QR-2026-0127-A3F2 |
| Service Type | "Local Moving" |
| Move Date | "February 15, 2026" |
| Move From/To | Addresses |
| Lead Source | UTM campaign or "website" |
| Timestamp | "Jan 27, 2:45 PM MST" |

### Part 2: Database Trigger for Auto-Notification

Create a PostgreSQL trigger that fires on `leads` INSERT and calls the notification edge function.

**Approach:** Use `pg_net` HTTP extension to invoke the edge function asynchronously (non-blocking).

```sql
-- Trigger function
CREATE FUNCTION notify_on_new_lead() RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://spguevrimwpqygvcxrsk.supabase.co/functions/v1/notify-admin-new-lead',
    headers := jsonb_build_object(...),
    body := jsonb_build_object('leadId', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger
CREATE TRIGGER on_new_lead_notify
  AFTER INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_lead();
```

### Part 3: Enhanced useRealtimeLeads Hook

Upgrade the existing hook to provide richer notifications for logged-in admins.

**Enhancements:**
- Include quote amount in toast notification
- Show move date if available
- Add visual urgency indicator for high-value leads
- Play notification sound for immediate attention
- Add "Call Now" action button

### Part 4: Admin Notification Preferences (Optional)

Store notification preferences per admin in the database.

**New Table:** `admin_notification_preferences`
| Column | Type | Default |
|--------|------|---------|
| user_id | uuid | FK → auth.users |
| email_new_leads | boolean | true |
| sms_high_value_threshold | numeric | 1000 |
| sms_enabled | boolean | false |
| phone_number | text | null |

---

## Email Template Design

The notification email will follow the existing Handledly brand style (dark theme with gold accents):

**Subject Line:** `🏠 New Lead: [Name] — $[Amount] Quote Request`

**Structure:**
1. **Header Badge:** "NEW LEAD ALERT" with timestamp
2. **Quote Summary Box:** Amount, quote number, service type
3. **Contact Details Table:** Name, phone (tap-to-call), email
4. **Move Details:** Date, addresses, specialty items
5. **Lead Source:** UTM parameters or "Direct Website"
6. **Action Buttons:**
   - "📞 Call Customer Now" (primary CTA)
   - "📋 View in Dashboard" (link to /admin/leads)
7. **Footer:** Lead ID, submission timestamp

---

## SMS Notification (High-Value Leads)

For leads with `estimated_quote >= $1,000`, send SMS to designated admin phone.

**Message Format:**
```
🏠 NEW HIGH-VALUE LEAD
$1,247 quote from Sarah J.
Moving 2/15 from Denver → Boulder
📞 (720) 555-1234
Reply STOP to unsubscribe
```

---

## Technical Architecture

```text
┌─────────────────┐
│  Quote Wizard   │
│  (Frontend)     │
└────────┬────────┘
         │ INSERT
         ▼
┌─────────────────┐
│   leads table   │
│   (Supabase)    │
└────────┬────────┘
         │ TRIGGER (pg_net)
         ▼
┌─────────────────────────────┐
│ notify-admin-new-lead       │
│ Edge Function               │
│ ─────────────────────────── │
│ 1. Fetch full lead data     │
│ 2. Format email HTML        │
│ 3. Send via Resend          │
│ 4. If quote >= $1k, SMS     │
│ 5. Log notification status  │
└─────────────────────────────┘
         │
         ├──────────┬──────────┐
         ▼          ▼          ▼
     [Email]    [SMS]    [Dashboard Toast]
     Resend     Twilio   useRealtimeLeads
```

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `supabase/functions/notify-admin-new-lead/index.ts` | Edge function for email/SMS alerts |

### Modified Files
| File | Change |
|------|--------|
| `src/hooks/useRealtimeLeads.ts` | Enhanced toast notifications with quote details |
| `supabase/config.toml` | Add function config for `notify-admin-new-lead` |

### Database Migrations
| Change | Purpose |
|--------|---------|
| Create `notify_on_new_lead()` trigger function | Auto-invoke notifications |
| Create `on_new_lead_notify` trigger | Fire on INSERT |

---

## Security Considerations

1. **Edge function authentication:** Uses service role key internally (no public auth required)
2. **Admin email list:** Hardcoded in function (matches existing pattern)
3. **Rate limiting:** Inherits from `leads` table INSERT rate limits
4. **SMS phone validation:** Only send to verified admin phones

---

## Notification Priority Matrix

| Lead Value | Email | SMS | In-App Toast |
|------------|-------|-----|--------------|
| < $500 | ✅ | ❌ | ✅ |
| $500 - $999 | ✅ | ❌ | ✅ + Sound |
| $1,000+ | ✅ | ✅ | ✅ + Sound + Badge |

---

## Expected Outcomes

| Metric | Target |
|--------|--------|
| Admin response time | <5 minutes for high-value leads |
| Notification delivery rate | 99%+ (Resend + Twilio) |
| False positive alerts | 0% (only real leads trigger) |
| Email open rate | >80% (urgent subject lines) |

---

## Implementation Sequence

1. Create `notify-admin-new-lead` edge function with email template
2. Add database trigger to auto-invoke on new leads
3. Enhance `useRealtimeLeads` hook for richer in-app notifications
4. Test end-to-end with a quote submission
5. Deploy and monitor first 24 hours of notifications

