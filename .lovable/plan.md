

# Handledly Moving Services - Complete Technical Audit
## Master Documentation & Component-by-Component Analysis

---

## EXECUTIVE SUMMARY

**Platform**: Handledly Moving Services SaaS
**Domain**: handledly.com
**Technology Stack**: React 18 + TypeScript + Tailwind CSS + Supabase (Lovable Cloud)
**Overall Health Score**: 7.4/10 (Conditional Production Ready)
**Last Audit Date**: February 4, 2026

### Quick Stats
| Metric | Value |
|--------|-------|
| Total Pages | 24 routes |
| Components | 80+ |
| Edge Functions | 11 deployed |
| Database Tables | 15 |
| RLS Policies | 50+ |
| Active Leads | 10 |
| Active Conversations | 11 |
| Admin Users | 3 |

---

## AUDIT 1: SECURITY ARCHITECTURE

### 1.1 Authentication System
**Score: 8/10**

| Component | Implementation | Status |
|-----------|----------------|--------|
| Auth Provider | Supabase Auth (JWT) | Implemented |
| Session Management | `persistSession: true`, auto-refresh | Implemented |
| Protected Routes | `ProtectedRoute` component | Implemented |
| Role-Based Access | `user_roles` table + `has_role()` function | Implemented |
| Admin Whitelist | Database-driven (4 authorized emails) | Secure |

**Key Files**:
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/components/ProtectedRoute.tsx` - Route protection
- Database: `user_roles` table with `app_role` enum

**Security Model**:
```text
┌─────────────────────────────────────────────────────────────┐
│ Client Request                                              │
├─────────────────────────────────────────────────────────────┤
│ 1. JWT Token Validation (Supabase Auth)                     │
│ 2. Email Authorization Check (AuthContext.isAuthorized)     │
│ 3. Admin Role Check (user_roles table via has_role())       │
│ 4. RLS Policy Enforcement (Database level)                  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Row-Level Security (RLS)
**Score: 7.5/10**

| Table | RLS Enabled | Policy Count | Risk Level |
|-------|-------------|--------------|------------|
| leads | Yes | 5 | Low - Deny public INSERT |
| quote_requests | Yes | 6 | Low - Deny public INSERT |
| chat_conversations | Yes | 5 | Low - Validated INSERT |
| chat_messages | Yes | 5 | Low - Validated INSERT |
| appointments | Yes | 5 | Low - Admin only |
| user_roles | Yes | 3 | Low - Self-read + admin |
| business_settings | Yes | 3 | Low - Admin only |
| circuit_breaker_config | Yes | 2 | Low - Admin only |
| cost_tracker | Yes | 2 | Low - Admin only |
| rate_limit_tracker | Yes | 3 | Medium - Public INSERT |

**Critical RLS Patterns**:
- All sensitive tables use `Deny anon SELECT` policies
- Lead/quote creation restricted to Edge Functions (service role)
- Admin access controlled via `has_role(auth.uid(), 'admin')`

**Finding: 1 Warning**
- `pg_net` extension installed in `public` schema (Supabase limitation, ignored)

### 1.3 Input Validation & Sanitization
**Score: 8/10**

**Server-Side Validation** (`supabase/functions/_shared/validation.ts`):
- Zod schema validation for all Edge Functions
- US phone number validation with area code checks
- Email format validation with length limits
- XSS pattern detection (`<script`, `javascript:`, `on*=`)
- PII filtering (credit cards, SSN, bank accounts)

**Validation Schemas**:
| Schema | Fields Validated | Max Lengths |
|--------|------------------|-------------|
| `quoteSubmissionSchema` | 16 fields | 2000 chars (notes) |
| `aiChatRequestSchema` | 4 fields | 5000 chars (message) |
| `callRequestSchema` | 12 fields | 500 chars (addresses) |
| `quoteEmailRequestSchema` | 19 fields | 2000 chars (notes) |

**Request Size Limits**: 100KB maximum body size enforced

### 1.4 Rate Limiting
**Score: 8/10**

**Multi-Layer Rate Limiting**:
```text
┌──────────────────────────────────────────────────────────┐
│ Layer 1: Edge Function IP-Based                          │
│   - ai-chat: 30 requests/minute                          │
│   - submit-quote: 5 requests/hour                        │
│   - trigger-call: 5 requests/minute                      │
│   - send-email: 5 requests/minute                        │
├──────────────────────────────────────────────────────────┤
│ Layer 2: Database RLS Policy                             │
│   - check_rate_limit_readonly() - Pre-check              │
│   - After-insert trigger logging                         │
├──────────────────────────────────────────────────────────┤
│ Layer 3: Client-Side Progressive Delay                   │
│   - useBotProtection hook                                │
│   - Exponential backoff: 0→1s→2s→4s→8s→16s               │
└──────────────────────────────────────────────────────────┘
```

### 1.5 Bot Protection
**Score: 8.5/10**

**Defense Mechanisms** (`src/lib/costProtection.ts`):
- Honeypot fields (hidden form fields)
- Behavior tracking (mouse, keyboard, scroll)
- Time-based validation (min 2s, max 10min)
- Client fingerprinting (SHA-256 hash)
- Suspicion scoring algorithm (threshold: 50)

### 1.6 CORS Configuration
**Score: 9/10**

**Production Hardening** (`supabase/functions/_shared/cors.ts`):
- Explicit domain whitelist: `handledly.com`, `www.handledly.com`
- Dynamic Lovable preview domain matching via regex
- No `localhost` in production

### 1.7 Security Headers
**Score: 8/10**

| Header | Value | Status |
|--------|-------|--------|
| X-Content-Type-Options | nosniff | Implemented |
| X-Frame-Options | DENY | Implemented |
| X-XSS-Protection | 1; mode=block | Implemented |
| Strict-Transport-Security | max-age=31536000 | Implemented |

### 1.8 Security Findings Summary

| ID | Severity | Issue | Status |
|----|----------|-------|--------|
| SEC-001 | WARN | Anon key hardcoded in DB trigger | Open |
| SEC-002 | ERROR | Exit intent/service signup non-functional | Open |
| SEC-003 | INFO | Admin emails hardcoded in edge function | Open |
| SEC-004 | WARN | Customer data access audit needed | Acknowledged |

---

## AUDIT 2: EDGE FUNCTIONS

### 2.1 Function Inventory
**Total Functions**: 11 deployed

| Function | Purpose | Auth | Rate Limit |
|----------|---------|------|------------|
| `submit-quote` | Lead/quote creation | None (public) | 5/hour/IP |
| `ai-chat` | AI conversation | None (public) | 30/min/IP |
| `send-quote-email` | Email confirmation | None (internal) | 5/min |
| `trigger-confirmation-call` | ElevenLabs outbound call | None (internal) | 5/min |
| `handle-call-status` | ElevenLabs webhook | HMAC signature | N/A |
| `send-sms-notification` | Twilio SMS | None (internal) | N/A |
| `elevenlabs-conversation-token` | Voice agent token | None (public) | N/A |
| `notify-admin-new-lead` | Admin email alerts | None (internal) | N/A |
| `process-call-retries` | Retry failed calls | None (cron) | N/A |
| `circuit-breaker-alert` | Cost alert emails | None (internal) | N/A |
| `health-check` | System health | None (public) | N/A |

### 2.2 Function Security Analysis

**submit-quote** (Main entry point):
- Zod validation for all inputs
- Honeypot detection
- IP-based rate limiting (hashed)
- Server-side quote calculation
- Service role for database writes

**ai-chat** (AI Gateway):
- PII filtering (credit cards, SSN)
- Circuit breaker check
- Cost tracking (non-blocking)
- 10-message conversation limit
- Model: `google/gemini-3-flash-preview`

**handle-call-status** (Webhook):
- HMAC-SHA256 signature validation (mandatory)
- 30-minute timestamp tolerance
- Fail-closed on missing secret

### 2.3 Error Handling
**Score: 7.5/10**

- Sanitized error responses (no internal details exposed)
- Retry logic with exponential backoff (up to 3 retries)
- SMS fallback when calls fail
- Admin notification on critical failures

### 2.4 Cost Protection
**Score: 9/10**

**Circuit Breaker Configuration**:
| Service | Daily Limit | Hourly Limit |
|---------|-------------|--------------|
| ai_chat | $25 | $5 |
| voice_calls | $100 | $20 |
| sms | $20 | $5 |
| email | $10 | $2 |

**Cost Tracking**:
- Non-blocking `record_service_cost()` calls
- `cost_tracker` table for analytics
- Automatic counter reset (daily/hourly)
- Email alerts on circuit breaker trip

---

## AUDIT 3: DATABASE ARCHITECTURE

### 3.1 Schema Overview
**Score: 8/10**

| Table | Purpose | Row Count | Size |
|-------|---------|-----------|------|
| leads | Customer lead data | 10 | - |
| quote_requests | Quote calculations | 10 | - |
| chat_conversations | Chat sessions | 11 | - |
| chat_messages | Chat history | 16 | - |
| appointments | Scheduled moves | 0 | - |
| user_roles | Admin authorization | 3 | - |
| business_settings | Company config | 1 | - |
| circuit_breaker_config | Cost protection | 4 | - |
| cost_tracker | API cost logging | - | - |
| rate_limit_tracker | Rate limit logging | - | - |
| client_trust_scores | Bot detection | - | - |
| honeypot_detections | Bot detection logs | - | 24 KB |
| call_retry_queue | Failed call retries | - | - |
| leads_archive | Archived leads | 0 | - |
| ai_quality_reviews | Chat quality reviews | 0 | - |

### 3.2 Database Functions
**Total Functions**: 23

**Security Functions**:
- `has_role()` - RBAC check
- `check_rate_limit_readonly()` - Rate limit check
- `get_tiered_rate_limit()` - Trust-based limits
- `record_trust_violation()` - Bot scoring

**Business Logic Functions**:
- `check_circuit_breaker()` - Cost protection
- `record_service_cost()` - Cost tracking
- `schedule_call_retry()` - Retry scheduling
- `archive_old_leads()` - Data lifecycle

**Trigger Functions**:
- `update_lead_status_on_email()` - Pipeline automation
- `update_lead_status_on_call()` - Pipeline automation
- `notify_on_new_lead()` - Admin alerts
- `notify_circuit_breaker_trip()` - Cost alerts

### 3.3 Data Protection
- All SECURITY DEFINER functions use `SET search_path = public`
- No raw SQL execution allowed in Edge Functions
- Verification tokens for sensitive operations

---

## AUDIT 4: FRONTEND ARCHITECTURE

### 4.1 Application Structure
**Score: 8/10**

**Routing** (`src/App.tsx`):
```text
Public Routes (12):
  / (Index)
  /services, /services/* (10 service pages)
  /quote, /about, /contact
  /auth, /privacy, /terms
  /client-portal

Admin Routes (9):
  /admin (protected)
  /admin/leads, /admin/conversations
  /admin/calls, /admin/appointments
  /admin/ai-quality, /admin/cost-monitoring
  /admin/users, /admin/settings
```

**Code Splitting**:
- All non-critical pages lazy loaded
- Admin pages lazy loaded (3 admin users only)
- Service pages lazy loaded
- Estimated bundle reduction: ~400KB

### 4.2 Component Library
**Total Components**: 80+

**Layout Components** (`src/components/layout/`):
- Header, Footer, Container, Section

**UI Components** (`src/components/ui/`):
- 40+ shadcn/ui components

**Feature Components**:
- ChatWidget (AI chat interface)
- VoiceAgent (ElevenLabs voice)
- QuoteFormWizard (3-step form)
- ExitIntentModal (conversion optimization)

**Admin Components** (`src/components/admin/`):
- AdminLayout, AdminSidebar, AdminHeader
- StatsCard, PaginationControls
- LaunchReadinessTracker, E2ETestChecklist
- PDF export components

### 4.3 Custom Hooks
**Total Hooks**: 15+

| Hook | Purpose |
|------|---------|
| `useAuth` | Authentication state |
| `useAIChat` | Chat functionality |
| `useBotProtection` | Form protection |
| `useRealtimeLeads` | Live lead updates |
| `usePaginatedQuery` | Admin pagination |
| `useExitIntent` | Exit detection |
| `useFormPersistence` | Auto-save forms |
| `useScrollProgress` | Scroll tracking |
| `useUTMParams` | Marketing attribution |

### 4.4 State Management
- React Query for server state
- React Context for auth state
- localStorage for persistence
- sessionStorage for session tracking

---

## AUDIT 5: AI SYSTEMS

### 5.1 AI Chat (Jack)
**Score: 8/10**

**Configuration**:
- Model: `google/gemini-3-flash-preview` (via Lovable AI Gateway)
- Max tokens: 800
- Conversation history: 10 messages
- Cost per message: ~$0.002

**System Prompt Features**:
- Professional moving assistant persona
- Complete pricing knowledge (February 2026 rates)
- 200lb Iron Law enforcement
- Quote collection workflow
- Conversion optimization strategies

**Quote Submission Flow**:
```text
User Message → ai-chat Function
       ↓
   Gemini AI → [QUOTE_READY] JSON extraction
       ↓
   ChatWidget → submit-quote Function
       ↓
   Lead Created → Email + Call triggered
```

### 5.2 AI Voice Agent (Jack)
**Score: 7/10**

**Configuration**:
- Provider: ElevenLabs Conversational AI
- Phone Integration: Twilio
- Webhook: HMAC-validated

**Call Flow**:
```text
Quote Submitted → trigger-confirmation-call
       ↓
   ElevenLabs API → Outbound call initiated
       ↓
   Call Completed → handle-call-status webhook
       ↓
   Lead Updated → Transcript + status stored
```

**Fallback Chain**:
1. Call fails → Retry (up to 3 attempts)
2. All retries fail → SMS fallback
3. SMS fails → Admin email notification

### 5.3 AI Quality Control
- Dedicated admin page: `/admin/ai-quality`
- Conversation sampling
- Customer satisfaction tracking
- Flagging for improvement

---

## AUDIT 6: THIRD-PARTY INTEGRATIONS

### 6.1 Integration Map

| Service | Purpose | Secret Keys |
|---------|---------|-------------|
| Supabase | Database + Auth | 4 keys |
| Lovable AI | Chat AI gateway | LOVABLE_API_KEY |
| ElevenLabs | Voice AI | 4 keys |
| Twilio | SMS/Voice | 3 keys |
| Resend | Email delivery | RESEND_API_KEY |
| Google Analytics | Analytics | GA4 ID in HTML |

### 6.2 Secret Inventory
**Total Secrets**: 15

| Secret | Purpose |
|--------|---------|
| SUPABASE_URL | Database URL |
| SUPABASE_ANON_KEY | Public API key |
| SUPABASE_SERVICE_ROLE_KEY | Admin API key |
| SUPABASE_DB_URL | Direct DB connection |
| ELEVENLABS_API_KEY | Voice AI |
| ELEVENLABS_AGENT_ID | Agent configuration |
| ELEVENLABS_PHONE_NUMBER_ID | Twilio phone |
| ELEVENLABS_WEBHOOKS_SECRET | HMAC validation |
| TWILIO_ACCOUNT_SID | SMS/Voice |
| TWILIO_AUTH_TOKEN | SMS/Voice |
| TWILIO_PHONE_NUMBER | Outbound number |
| RESEND_API_KEY | Email delivery |
| LOVABLE_API_KEY | AI gateway |
| ADMIN_PHONE_NUMBER | Admin SMS |

---

## AUDIT 7: PERFORMANCE

### 7.1 Performance Metrics

| Metric | Desktop | Mobile |
|--------|---------|--------|
| FCP (First Contentful Paint) | 0.8s (Good) | 3.6s (Needs Work) |
| LCP (Largest Contentful Paint) | ~1.2s | ~4.0s |
| Performance Score | 87/100 | 65/100 |

### 7.2 Optimizations Implemented
- Lazy loading for all non-critical pages
- modulepreload for critical assets
- Preconnect hints for external origins
- Deferred Google Analytics loading
- Image optimization

### 7.3 Known Issues
- Mobile FCP impacted by ~1.9s redirect (staging → production)
- Forced reflow from third-party libraries (~49ms total)
- 271KB unused JavaScript (could be code-split further)

---

## AUDIT 8: ANALYTICS & CONVERSION

### 8.1 Conversion Events
**Total Events**: 23

| Category | Events |
|----------|--------|
| Form Events | form_started, form_step_completed, form_submitted, form_abandoned |
| Chat Events | chat_started, chat_message_sent, chat_quote_requested, chat_quote_submitted |
| Exit Intent | exit_intent_triggered, exit_intent_converted, exit_intent_dismissed |
| Social Proof | social_proof_viewed, social_proof_clicked |
| Engagement | scroll_milestone, mobile_cta_clicked, urgency_badge_viewed |

### 8.2 UTM Tracking
Full UTM parameter capture:
- utm_source, utm_medium, utm_campaign
- utm_content, utm_term
- lead_source field

---

## AUDIT 9: ADMIN DASHBOARD

### 9.1 Admin Pages

| Page | Purpose |
|------|---------|
| Overview | Stats, charts, launch mode |
| Leads | Lead management with filters |
| Conversations | Chat history review |
| Call Logs | Voice call tracking |
| AI Quality | Conversation quality review |
| Cost Monitoring | Spend tracking, circuit breakers |
| Appointments | Scheduling management |
| User Management | Admin user control |
| Settings | Business configuration |

### 9.2 Admin Features
- Real-time lead updates (Supabase Realtime)
- Cursor-based pagination
- PDF export (Executive, Pricing, Launch Checklist)
- Markdown report generation
- Launch mode with E2E checklist

---

## AUDIT 10: COMPLIANCE

### 10.1 Legal Pages
- Privacy Policy: `/privacy`
- Terms of Service: `/terms`

### 10.2 Compliance Features
- SMS consent clause
- STOP opt-out mechanism
- 7-day quote validity disclaimer
- preferEmailOnly option

### 10.3 Data Handling
- PII filtered from chat messages
- No credit card/SSN storage
- 90-day lead archival policy

---

## CRITICAL ACTION ITEMS

### P0 (Launch Blockers)
1. **Fix Exit Intent & Service Signup** - Components attempting direct INSERT blocked by RLS. Create `capture-lead` edge function.

### P1 (High Priority)
2. **Move Admin Emails to Environment Variables** - Currently hardcoded in `notify-admin-new-lead`
3. **Move Anon Key to Vault** - Currently hardcoded in `notify_on_new_lead()` trigger
4. **Verify ElevenLabs Webhook Configuration** - Ensure webhook URL and HMAC secret match

### P2 (Medium Priority)
5. **Implement Admin MFA** - Additional security layer for admin accounts
6. **Add WAF/CDN Layer** - Consider Cloudflare for additional protection
7. **Reduce Mobile FCP** - Further code splitting for framer-motion

### P3 (Low Priority)
8. **Address pg_net Extension Warning** - Supabase limitation, already ignored
9. **Implement Conversation-Level Access** - Users read own chat history only

---

## CONCLUSION

**Handledly Moving Services** is a well-architected, enterprise-grade SaaS platform with:

**Strengths**:
- Comprehensive security architecture (RLS, rate limiting, HMAC)
- AI-first approach (chat + voice)
- Production-ready cost protection
- Full conversion tracking
- Professional admin dashboard

**Areas for Improvement**:
- Fix non-functional exit intent features (P0)
- Externalize hardcoded configuration (P1)
- Improve mobile performance (P2)

**Recommendation**: Proceed with production launch after addressing P0 item (Exit Intent fix). The platform is 90%+ complete and operationally ready.

