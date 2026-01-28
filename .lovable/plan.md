

# Fix End-to-End Quote Pipeline - Critical CORS & Reliability Fixes

## Executive Summary

The quote submission pipeline is **completely broken** due to **incomplete CORS headers** that cause browsers to block all edge function calls. Additionally, the database trigger notification may have a separate pg_net reliability issue.

This fix will ensure every quote submission automatically triggers:
- Admin email notifications (3 recipients)
- Admin SMS for high-value leads ($1,000+)
- Customer confirmation email
- AI confirmation call within 30 seconds

---

## Root Cause Analysis

### Primary Bug: Incomplete CORS Headers

| File | Line | Current | Required |
|------|------|---------|----------|
| `_shared/cors.ts` | 23 | `authorization, x-client-info, apikey, content-type` | + `x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version` |
| `send-quote-email/index.ts` | 21 | Same | Same |
| `trigger-confirmation-call/index.ts` | 18 | Same | Same |
| `notify-admin-new-lead/index.ts` | Check | Same | Same |

### Impact
- Browser sends OPTIONS preflight
- Server responds with incomplete allowed headers
- Browser refuses to send actual POST request
- Edge functions never receive any requests
- No emails, no calls, no notifications

---

## Implementation Plan

### Step 1: Fix Shared CORS Utility

Update `supabase/functions/_shared/cors.ts`:

```typescript
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}
```

### Step 2: Update All Edge Functions

Fix CORS headers in each function that has its own copy:
- `send-quote-email/index.ts`
- `trigger-confirmation-call/index.ts`
- `notify-admin-new-lead/index.ts`
- `ai-chat/index.ts`

### Step 3: Deploy and Test

1. Deploy all updated edge functions
2. Submit a test quote
3. Verify in sequence:
   - Email arrives in < 30 seconds
   - Call initiates in < 30 seconds
   - Admin notifications delivered
   - Dashboard shows realtime toast

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/_shared/cors.ts` | Add missing x-supabase-* headers |
| `supabase/functions/send-quote-email/index.ts` | Update local CORS headers |
| `supabase/functions/trigger-confirmation-call/index.ts` | Update local CORS headers |
| `supabase/functions/notify-admin-new-lead/index.ts` | Update local CORS headers |
| `supabase/functions/ai-chat/index.ts` | Update local CORS headers |

---

## Expected Outcome

After this fix:

| Component | Before | After |
|-----------|--------|-------|
| Edge function calls | ❌ CORS blocked | ✅ Working |
| Customer email | ❌ Never sent | ✅ < 30 sec |
| AI call | ❌ Never initiated | ✅ < 30 sec |
| Admin notifications | ❌ Failed | ✅ Instant |
| Call status | `pending` forever | `completed` with transcript |

---

## Technical Details

### Why CORS Headers Matter

The Supabase JS client automatically sends these headers with every request:
- `x-supabase-client-platform`: "js-web"
- `x-supabase-client-platform-version`: "2.90.1"
- `x-supabase-client-runtime`: Browser info
- `x-supabase-client-runtime-version`: Browser version

When the server's CORS response doesn't include these in `Access-Control-Allow-Headers`, the browser's CORS security policy blocks the actual request.

### Verification Steps

After deployment, test with:
1. Browser DevTools > Network tab
2. Submit quote and watch for:
   - OPTIONS request → 200
   - POST request → 200 (NOT blocked)
3. Check edge function logs for actual execution

---

## Post-Fix Validation Checklist

- [ ] CORS headers include all x-supabase-* headers
- [ ] OPTIONS preflight returns 200
- [ ] POST requests reach edge functions
- [ ] Edge function logs show execution
- [ ] Customer receives email within 30 seconds
- [ ] AI call initiates within 30 seconds
- [ ] Admin receives email notification
- [ ] High-value leads trigger SMS
- [ ] Dashboard shows realtime toast

