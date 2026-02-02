
# Security Hardening Plan: Protection, Performance & Scalability

## Executive Summary

Based on the security audit, your system is **already well-secured** for production launch. Most critical security measures are in place. This plan addresses the **3 remaining warnings** shown in the screenshot plus additional performance/scalability enhancements.

---

## Current Security Status

| Finding | Status | Action |
|---------|--------|--------|
| Edge Functions Unauthenticated Access | ✅ **FIXED** | Verification tokens + 5-min expiry implemented |
| Chat Widget Broken Functions | ✅ **IGNORED** | Expected behavior by design |
| .env Not Gitignored | ✅ **N/A** | Managed by Lovable, only public keys |
| Email Lookup Function Exposure | ✅ **FIXED** | Admin-only restriction in migration |
| **Extension in Public Schema** | ⚠️ **NEEDS FIX** | `pg_net` extension in public schema |
| Business Contact Info Accessible | ℹ️ **BY DESIGN** | Public business info via secure function |
| Chat Messages Could Be Accessed | ℹ️ **BY DESIGN** | Write-only for public, read-only for admins |

---

## Implementation Tasks

### Task 1: Move pg_net Extension to Extensions Schema

**Why**: The `pg_net` extension is currently installed in the `public` schema. Extensions in public are exposed through APIs and can leak internal functions.

**Solution**:
```sql
-- Move pg_net from public to extensions schema
ALTER EXTENSION pg_net SET SCHEMA extensions;
```

**Risk**: Low - this is a system extension used internally, relocation is seamless.

---

### Task 2: Mark Already-Resolved Warnings as Ignored (Housekeeping)

The security scanner shows 3 warnings that are actually **by design**:

1. **Business Contact Info Publicly Accessible** - Intentional for customer-facing pages
2. **Customer Chat Messages Could Be Accessed** - Already secured (write-only public, read-only admin)
3. **Extension in Public** - Will be fixed in Task 1

I'll update the security findings to mark the first two as ignored with proper justifications so they don't appear as false positives in future audits.

---

### Task 3: Add Webhook Signature Validation Fallback

**Current**: `handle-call-status` logs a warning if `ELEVENLABS_WEBHOOKS_SECRET` is missing but still processes webhooks.

**Enhancement**: Make HMAC validation mandatory in production (fail closed rather than fail open).

```typescript
// In handle-call-status/index.ts
if (!webhookSecret) {
  console.error('[handle-call-status] CRITICAL: ELEVENLABS_WEBHOOKS_SECRET not configured');
  return new Response(
    JSON.stringify({ error: 'Webhook validation not configured' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

---

### Task 4: Add Request Size Limits to Edge Functions

**Why**: Prevent denial-of-service via large payload attacks.

**Enhancement**: Add body size validation at the start of each edge function.

```typescript
// Add to all edge functions
const MAX_BODY_SIZE = 100 * 1024; // 100KB limit
const bodyText = await req.text();

if (bodyText.length > MAX_BODY_SIZE) {
  return new Response(
    JSON.stringify({ error: 'Request too large' }),
    { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**Apply to**:
- `send-quote-email`
- `trigger-confirmation-call`
- `ai-chat`
- `send-sms-notification`

---

### Task 5: Add IP-Based Rate Limiting to Circuit-Sensitive Functions

**Current**: Rate limiting uses session identifiers which can be spoofed.

**Enhancement**: Add IP-based tracking as a secondary rate limit layer.

```typescript
// Enhanced rate limiting for edge functions
const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                 req.headers.get('x-real-ip') || 'unknown';

// Check IP-based rate limit
const { count } = await supabase
  .from('rate_limit_tracker')
  .select('*', { count: 'exact', head: true })
  .eq('identifier', clientIp)
  .eq('table_name', 'edge_function:trigger-confirmation-call')
  .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

if (count >= 10) { // 10 calls per hour per IP
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

---

### Task 6: Add Security Response Headers

**Why**: Modern browser security headers prevent XSS, clickjacking, and other attacks.

**Enhancement**: Add security headers to all edge function responses.

```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Merge into all responses
return new Response(body, {
  headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
});
```

---

## Performance & Scalability Enhancements

### Task 7: Add Database Connection Pooling Headers

**Why**: Supabase client connections should specify pooling mode for high-throughput.

**Enhancement**: Ensure edge functions use transaction pooling mode.

```typescript
// Edge function client initialization
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});
```

---

### Task 8: Add Logging for Cost Tracking Performance

**Why**: Cost tracking can become a bottleneck under high load.

**Enhancement**: Make cost tracking fire-and-forget with error logging.

```typescript
// Non-blocking cost tracking
void supabase.rpc('record_service_cost', {
  p_service_type: 'confirmation_call',
  p_cost: 0.15,
  p_lead_id: data.leadId
}).catch(err => console.error('[cost-tracking] Failed:', err));
```

---

## Implementation Order

1. **Task 1**: Move pg_net extension (database migration)
2. **Task 2**: Update security findings (API call)
3. **Task 3**: Mandatory webhook validation (code change)
4. **Task 4**: Request size limits (code change)
5. **Task 5**: IP-based rate limiting (code change)
6. **Task 6**: Security headers (code change)
7. **Task 7**: Connection pooling (code verification)
8. **Task 8**: Non-blocking cost tracking (code change)

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/handle-call-status/index.ts` | Mandatory HMAC, size limits, security headers |
| `supabase/functions/trigger-confirmation-call/index.ts` | Size limits, IP rate limiting, security headers |
| `supabase/functions/send-quote-email/index.ts` | Size limits, security headers |
| `supabase/functions/ai-chat/index.ts` | Size limits, security headers |
| `supabase/functions/send-sms-notification/index.ts` | Size limits, security headers |
| `supabase/functions/_shared/security.ts` | **NEW** - Shared security utilities |

---

## Technical Notes

### Why These Changes Matter for Production

1. **Extension in Public**: Exposes internal database functions through the API, creating potential attack surface
2. **Webhook Validation**: Fail-open behavior allows spoofed webhooks to update lead statuses
3. **Request Size Limits**: Without limits, attackers can consume server resources with large payloads
4. **IP Rate Limiting**: Defense-in-depth against distributed attacks
5. **Security Headers**: Browser-level protections against common web vulnerabilities

### Backward Compatibility

All changes are backward compatible:
- Extension relocation is transparent to application code
- Rate limiting only affects abusive traffic
- Security headers don't break legitimate requests
- Size limits are generous (100KB) for normal operations
