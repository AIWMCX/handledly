# Incident Response Runbook
## Handledly Moving SaaS - Operations Manual

**Version:** 1.0.0  
**Last Updated:** January 25, 2026  
**Owner:** Operations Team

---

## 📞 Emergency Contact Directory

### On-Call Admin Contacts

| Role | Email | Escalation Time |
|------|-------|-----------------|
| **Primary Admin** | aiwmcsrm@gmail.com | Immediate |
| **Secondary Admin** | nevulis22@gmail.com | +15 minutes |
| **Tertiary Admin** | saych.88@gmail.com | +30 minutes |

### Vendor Support Contacts

| Service | Support URL | Status Page |
|---------|-------------|-------------|
| **Lovable Cloud** | support@lovable.dev | N/A |
| **Supabase** | supabase.com/support | status.supabase.com |
| **ElevenLabs** | help.elevenlabs.io | N/A |
| **Twilio** | twilio.com/console | status.twilio.com |
| **Resend** | resend.com/support | N/A |
| **IONOS (DNS)** | ionos.com/help | N/A |

### Business Contacts

| Role | Contact |
|------|---------|
| **Business Phone** | (878) 218-7397 |
| **Business Email** | hello@handledly.com |
| **Development Agency** | AIWMC AI Agency LLC |

---

## 🚨 Escalation Ladder

```
┌─────────────────────────────────────────────────────────────────┐
│  L1 (0-15 min)    │ Primary Admin                              │
│                   │ • Check logs, restart services              │
│                   │ • Basic troubleshooting                     │
├───────────────────┼────────────────────────────────────────────┤
│  L2 (15-30 min)   │ Secondary Admin                            │
│                   │ • Database queries                          │
│                   │ • API/Webhook verification                  │
├───────────────────┼────────────────────────────────────────────┤
│  L3 (30-60 min)   │ Developer Escalation                       │
│                   │ • Code-level fixes via Lovable              │
│                   │ • Edge function modifications               │
├───────────────────┼────────────────────────────────────────────┤
│  L4 (60+ min)     │ Vendor Support                             │
│                   │ • Open tickets with Supabase/ElevenLabs     │
│                   │ • Infrastructure issues                     │
└───────────────────┴────────────────────────────────────────────┘
```

---

## 📊 Severity Classification

| Severity | Description | Response Time | Notification |
|----------|-------------|---------------|--------------|
| **SEV-1** | Complete system outage, lead loss occurring | 15 minutes | All admins, call immediately |
| **SEV-2** | Core feature broken (calls/emails failing) | 30 minutes | Primary + Secondary admin |
| **SEV-3** | Partial degradation, workaround exists | 2 hours | Primary admin |
| **SEV-4** | Cosmetic issues, no business impact | 24 hours | Log for next sprint |

### Severity Examples

| Severity | Example Incidents |
|----------|-------------------|
| SEV-1 | Website down, Database unreachable, All leads failing |
| SEV-2 | AI calls not triggering, Emails not sending, Webhooks broken |
| SEV-3 | Chat slow/degraded, Minor webhook delays, Single function errors |
| SEV-4 | UI glitches, Log noise, Styling issues |

---

## 🔧 Common Failure Scenarios

### Scenario 1: Website Completely Down

**Severity:** SEV-1  
**Symptoms:**
- Users see error page or timeout
- Admin dashboard inaccessible
- No new leads being captured

**Diagnosis Steps:**
1. Check Lovable Cloud status in your Lovable dashboard
2. Check Supabase status page at status.supabase.com
3. Verify DNS resolution: `dig handledly.com`
4. Test from different network/device

**Recovery Procedures:**

| Cause | Action |
|-------|--------|
| Lovable outage | Wait for status update, monitor @lovable on Twitter |
| Supabase outage | Check Lovable Cloud View for errors |
| DNS issue | Contact IONOS domain support |
| SSL certificate | Check certificate expiry in browser |

**Immediate Fallback:**
- Direct customers to call business phone: **(878) 218-7397**
- Post update on social media if extended outage (>30 min)

---

### Scenario 2: AI Confirmation Calls Not Triggering

**Severity:** SEV-2  
**Symptoms:**
- Leads stuck in "pending" or "calling" status
- No phone calls received after quote submission
- Admin dashboard shows 0% call completion

**Diagnosis Steps:**

1. **Check Edge Function Logs:**
   - Go to Lovable Cloud → Edge Functions → `trigger-confirmation-call`
   - Look for errors in the last hour

2. **Verify ElevenLabs Status:**
   - Check API credits at elevenlabs.io dashboard
   - Verify API key is valid

3. **Database Query:**
```sql
-- Check recent leads with call status
SELECT 
  id, 
  full_name, 
  confirmation_call_status, 
  call_notes,
  call_retry_count,
  created_at 
FROM leads 
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;
```

**Recovery Procedures:**

| Error | Solution |
|-------|----------|
| 401/403 from ElevenLabs | Regenerate API key in ElevenLabs dashboard, update secret |
| 429 Rate Limited | Wait 1 hour, call rate will normalize |
| Timeout errors | Check edge function timeout settings |
| "calling" stuck >5 min | Automatic timeout function will mark as "timeout" |

**Manual Fallback:**
- Call customers directly from admin dashboard
- Use lead phone numbers visible in Leads page

**Automated Protections Already in Place:**
- ✅ 3-tier retry system (15 min → 2 hr → 24 hr)
- ✅ SMS fallback if call fails completely
- ✅ Admin email alert on failure

---

### Scenario 3: AI Chat Not Responding

**Severity:** SEV-2  
**Symptoms:**
- Chat widget shows loading indefinitely
- "Service temporarily unavailable" message
- Chat messages not sending

**Diagnosis Steps:**

1. **Check Edge Function Logs:**
   - Go to Lovable Cloud → Edge Functions → `ai-chat`
   - Look for rate limits or API errors

2. **Verify API Key:**
   - Check LOVABLE_API_KEY exists in Lovable Cloud secrets

3. **Test Edge Function:**
```bash
curl -X POST https://spguevrimwpqygvcxrsk.functions.supabase.co/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, test message","sessionId":"test-123"}'
```

**Recovery Procedures:**

| Error | Solution |
|-------|----------|
| AI Gateway down | Chat is degraded; quote form still works |
| Rate limited | Reduce traffic or wait for limit reset |
| Invalid API key | Regenerate key in Lovable Cloud secrets |

**User Fallback:**
- Quote form on `/quote` remains fully functional
- Direct users to call **(878) 218-7397**

---

### Scenario 4: Quote Confirmation Emails Not Sending

**Severity:** SEV-2  
**Symptoms:**
- Leads don't receive quote confirmation emails
- `email_sent` column shows `false` in database
- No Resend activity in dashboard

**Diagnosis Steps:**

1. **Check Edge Function Logs:**
   - Go to Lovable Cloud → Edge Functions → `send-quote-email`

2. **Check Resend Dashboard:**
   - Login to resend.com
   - Check Emails → Recent sends

3. **Verify Domain Status:**
   - Check resend.com/domains for handledly.com verification

4. **Database Query:**
```sql
-- Find leads missing email confirmation
SELECT id, full_name, email, email_sent, email_sent_at, created_at 
FROM leads 
WHERE email_sent = false 
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Recovery Procedures:**

| Error | Solution |
|-------|----------|
| 401 API error | Check/regenerate RESEND_API_KEY in secrets |
| Domain unverified | Re-add DNS records in IONOS (SPF, DKIM) |
| Emails bouncing | Verify recipient email is valid |
| Rate limited | Wait for Resend limit reset |

**Manual Recovery:**
- Use Resend dashboard to manually resend emails
- Export lead emails and send via business email

---

### Scenario 5: SMS Notifications Failing

**Severity:** SEV-3  
**Symptoms:**
- No SMS alerts for new leads
- SMS fallback not working when calls fail
- Twilio errors in logs

**Diagnosis Steps:**

1. **Check Twilio Console:**
   - Login to twilio.com/console
   - Check Messages → Logs

2. **Verify Credentials:**
   - Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

3. **Check Account Balance:**
   - Twilio requires prepaid credits

**Recovery Procedures:**

| Error | Solution |
|-------|----------|
| Insufficient funds | Add credits to Twilio account |
| Number suspended | Contact Twilio support |
| Auth failure (401) | Regenerate auth token in Twilio console |
| Invalid phone format | Check phone number formatting |

---

### Scenario 6: Database Connection Issues

**Severity:** SEV-1  
**Symptoms:**
- All operations failing with connection errors
- "Connection refused" or timeout in logs
- Admin dashboard shows loading forever

**Diagnosis Steps:**

1. Check Lovable Cloud View for database status
2. Check status.supabase.com for outages
3. Review postgres_logs in analytics:
```sql
SELECT identifier, timestamp, event_message 
FROM postgres_logs
ORDER BY timestamp DESC
LIMIT 50;
```

**Recovery Procedures:**

| Error | Solution |
|-------|----------|
| Supabase outage | Monitor status page; no action possible |
| Connection pool exhausted | Reduce concurrent connections |
| Slow queries | Check for missing indexes, long-running queries |

**During Outage:**
- Direct all customer calls to **(878) 218-7397**
- Manually record leads for later entry

---

### Scenario 7: Webhook Not Processing (Call Status)

**Severity:** SEV-2  
**Symptoms:**
- Calls complete but lead status never updates
- `call_transcript` remains empty
- Leads stuck in "calling" status

**Diagnosis Steps:**

1. **Check Edge Function Logs:**
   - Go to `handle-call-status` function logs
   - Look for HMAC validation errors

2. **Verify Webhook Configuration:**
   - Webhook URL should be:
   ```
   https://spguevrimwpqygvcxrsk.functions.supabase.co/handle-call-status
   ```
   - Must be configured in ElevenLabs Agent settings

3. **Check Webhook Secret:**
   - Verify ELEVENLABS_WEBHOOKS_SECRET matches ElevenLabs config

**Recovery Procedures:**

| Error | Solution |
|-------|----------|
| Webhook not configured | Add URL in ElevenLabs Agent dashboard |
| HMAC validation failed | Regenerate webhook secret on both sides |
| Lead not found | Check conversation_id/call_sid lookup |

**Manual Recovery:**
```sql
-- Mark stuck leads as timeout if older than 1 hour
UPDATE leads 
SET confirmation_call_status = 'timeout',
    call_notes = 'Manually updated - webhook processing issue'
WHERE confirmation_call_status = 'calling' 
  AND created_at < NOW() - INTERVAL '1 hour';
```

---

### Scenario 8: Rate Limit Attack / Spam

**Severity:** SEV-2  
**Symptoms:**
- Spike in fake/spam leads
- rate_limit_tracker filling rapidly
- Edge function costs increasing

**Diagnosis Steps:**

```sql
-- Identify abusive sources
SELECT 
  identifier, 
  table_name, 
  COUNT(*) as request_count,
  MIN(created_at) as first_request,
  MAX(created_at) as last_request
FROM rate_limit_tracker 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY identifier, table_name
ORDER BY request_count DESC
LIMIT 20;
```

**Recovery Procedures:**

1. Identify the abusive IP/identifier from query above
2. If using CDN, block IP at CDN level
3. Temporarily tighten rate limits:
```sql
-- Current limits: 5 leads/hr, 10 quotes/hr, 20 chats/hr
-- Consider reducing during attack
```

**Prevention:**
- Rate limits are enforced at database level via RLS
- Cleanup runs daily via cron job

---

### Scenario 9: Admin Dashboard Inaccessible

**Severity:** SEV-3  
**Symptoms:**
- Authorized admins can't log in
- "Access denied" or redirect after authentication
- Admin pages return 403

**Diagnosis Steps:**

1. **Verify Email in Whitelist:**
   - Check AuthContext.tsx for AUTHORIZED_ADMIN_EMAILS
   - Current list: aiwmcsrm@gmail.com, nevulis22@gmail.com, saych.88@gmail.com

2. **Check User Roles Table:**
```sql
SELECT 
  u.email, 
  u.id as user_id,
  r.role 
FROM auth.users u
LEFT JOIN user_roles r ON u.id = r.user_id
WHERE u.email IN (
  'aiwmcsrm@gmail.com', 
  'nevulis22@gmail.com', 
  'saych.88@gmail.com'
);
```

**Recovery Procedures:**

| Error | Solution |
|-------|----------|
| Email not in whitelist | Add to AUTHORIZED_ADMIN_EMAILS in code |
| Missing role | Add via database (see below) |
| Session expired | Clear cookies, re-login |

**Add Admin Role Manually:**
```sql
-- Find user ID first
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Add admin role
INSERT INTO user_roles (user_id, role)
VALUES ('<user-uuid-here>', 'admin');
```

---

## 🏥 Health Check Procedures

### Daily Health Checks (5 minutes)

| Check | How to Verify | Expected |
|-------|---------------|----------|
| Site loads | Visit https://handledly.com | Page loads <3s |
| Quote form works | Submit test quote (use test mode) | Success message |
| Admin dashboard | Login at /admin | Dashboard loads |
| Edge function logs | Check Lovable Cloud | No error spikes |

### Weekly Health Checks (15 minutes)

| Check | Target | Query/Location |
|-------|--------|----------------|
| Call completion rate | >80% | Admin Overview page |
| Email delivery rate | >95% | Resend dashboard |
| Stuck leads | 0 | See SQL below |
| AI quality scores | Review | /admin/ai-quality |
| Service credits | Adequate | ElevenLabs, Twilio, Resend |

**Stuck Leads Query:**
```sql
SELECT COUNT(*) as stuck_count
FROM leads 
WHERE confirmation_call_status = 'calling' 
  AND created_at < NOW() - INTERVAL '10 minutes';
```

### Monthly Health Checks

- [ ] Review all edge function error rates
- [ ] Audit rate limit effectiveness
- [ ] Check database size and performance
- [ ] Review AI conversation quality samples
- [ ] Update documentation if needed
- [ ] Verify backup/recovery procedures

---

## 🔑 Quick Reference

### Key URLs

| Resource | URL |
|----------|-----|
| **Live Site** | https://handledly.com |
| **Admin Dashboard** | https://handledly.com/admin |
| **Client Portal** | https://handledly.com/client-portal |
| **Auth Page** | https://handledly.com/auth |
| **Quote Page** | https://handledly.com/quote |

### Portal Access Codes

| Portal | Code |
|--------|------|
| Client Portal | HANDLEDLY2024 |

### Test Mode

To suppress live notifications during testing/troubleshooting:
1. Go to `/admin/settings`
2. Enable "Test Mode" toggle
3. Remember to disable after testing!

### Critical Database Queries

```sql
-- Recent leads overview
SELECT id, full_name, confirmation_call_status, email_sent, created_at 
FROM leads 
ORDER BY created_at DESC 
LIMIT 20;

-- Failed/Timeout leads in last 24h
SELECT * FROM leads 
WHERE confirmation_call_status IN ('failed', 'timeout', 'failed_sms_sent') 
  AND created_at > NOW() - INTERVAL '24 hours';

-- Pending retry queue
SELECT * FROM call_retry_queue 
WHERE status = 'scheduled' 
ORDER BY scheduled_for;

-- Rate limit activity
SELECT table_name, COUNT(*) as requests
FROM rate_limit_tracker 
WHERE created_at > NOW() - INTERVAL '1 hour' 
GROUP BY table_name;

-- Edge function recent calls (via analytics)
SELECT function_id, response.status_code, COUNT(*) 
FROM function_edge_logs
  CROSS JOIN UNNEST(metadata) as m
  CROSS JOIN UNNEST(m.response) as response
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY function_id, response.status_code;
```

---

## 📝 Post-Incident Review Template

After any SEV-1 or SEV-2 incident, complete this template:

```markdown
# Incident Report: [BRIEF TITLE]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** SEV-1 / SEV-2 / SEV-3
**Author:** [Name]

## Summary
[One paragraph describing what happened]

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | Issue first detected |
| HH:MM | Investigation began |
| HH:MM | Root cause identified |
| HH:MM | Fix implemented |
| HH:MM | Service fully restored |

## Impact
- **Leads affected:** X
- **Calls missed:** X  
- **Estimated revenue impact:** $X
- **Customer complaints received:** X

## Root Cause
[Technical explanation of what caused the issue]

## Resolution
[What was done to fix it]

## Prevention Measures
- [ ] Action item 1 - Owner - Due date
- [ ] Action item 2 - Owner - Due date
- [ ] Action item 3 - Owner - Due date

## Lessons Learned
- What went well?
- What could be improved?
- Any process changes needed?
```

---

## 📋 Runbook Maintenance

| Action | Frequency | Owner |
|--------|-----------|-------|
| Review and update contacts | Quarterly | Primary Admin |
| Test recovery procedures | Monthly | Operations |
| Update after incidents | After each SEV-1/2 | Incident Owner |
| Add new scenarios | As discovered | Development Team |

---

*Document Version: 1.0.0*  
*Last Updated: January 25, 2026*  
*Next Review: April 2026*
