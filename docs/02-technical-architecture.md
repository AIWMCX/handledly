# Technical Architecture Documentation

## System Overview

Handledly Moving SaaS is built on a modern, serverless architecture optimized for performance, scalability, and maintainability.

---

## 1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React SPA)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Pages     │ │ Components  │ │   Hooks     │ │      State Mgmt         │ │
│  │   (24)      │ │   (80+)     │ │    (10)     │ │ React Query + Context   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE (Backend-as-a-Service)                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Edge Functions (6)                              │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │  │
│  │  │   ai-chat   │ │ send-email  │ │ trigger-call│ │ handle-status   │   │  │
│  │  │  (Gemini)   │ │  (Resend)   │ │ (ElevenLabs)│ │   (Webhook)     │   │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │  │
│  │  ┌─────────────┐ ┌─────────────┐                                       │  │
│  │  │  send-sms   │ │ eleven-token│                                       │  │
│  │  │  (Twilio)   │ │ (Voice Auth)│                                       │  │
│  │  └─────────────┘ └─────────────┘                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        PostgreSQL Database                             │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │  │
│  │  │  leads  │ │ quotes  │ │  chats  │ │ appoint │ │  rate_limit     │   │  │
│  │  │  (21)   │ │         │ │         │ │  ments  │ │  _tracker       │   │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘   │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────────────────────────────┐   │  │
│  │  │business │ │  user   │ │              RLS Policies               │   │  │
│  │  │settings │ │  roles  │ │         (Admin-only access)             │   │  │
│  │  └─────────┘ └─────────┘ └─────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THIRD-PARTY SERVICES                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │  ElevenLabs │ │   Twilio    │ │   Resend    │ │    Google Analytics     │ │
│  │  Voice AI   │ │  SMS/Voice  │ │   Email     │ │         GA4             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | Latest | Component library |
| React Router | 6.30.1 | Routing |
| React Query | 5.83.0 | Server state |
| Framer Motion | 12.26.1 | Animations |
| React Hook Form | 7.61.1 | Form handling |
| Zod | 3.25.76 | Validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | 2.90.1 | Backend-as-a-Service |
| PostgreSQL | 14.x | Database |
| Deno | Latest | Edge function runtime |

### AI & Communication
| Technology | Purpose |
|------------|---------|
| Lovable AI (Gemini 3 Flash) | Chat AI |
| ElevenLabs Conversational AI | Voice agent |
| Twilio | SMS & voice infrastructure |
| Resend | Email delivery |

---

## 3. Data Flow Diagrams

### Quote Request Flow
```
User Action                 Frontend                   Backend                   External
    │                          │                          │                          │
    │  Fill Quote Form         │                          │                          │
    │─────────────────────────>│                          │                          │
    │                          │  Validate (Zod)          │                          │
    │                          │  Calculate Quote         │                          │
    │                          │                          │                          │
    │                          │  INSERT leads            │                          │
    │                          │─────────────────────────>│                          │
    │                          │  INSERT quote_requests   │                          │
    │                          │─────────────────────────>│                          │
    │                          │                          │                          │
    │                          │  Invoke send-quote-email │                          │
    │                          │─────────────────────────>│  Send Email (Resend)     │
    │                          │                          │─────────────────────────>│
    │                          │                          │                          │
    │                          │  Invoke trigger-call     │  Initiate Call           │
    │                          │─────────────────────────>│  (ElevenLabs+Twilio)     │
    │                          │                          │─────────────────────────>│
    │                          │                          │                          │
    │  Show Confirmation       │                          │                          │
    │<─────────────────────────│                          │                          │
    │                          │                          │                          │
    │  Receive Email           │                          │                          │
    │<────────────────────────────────────────────────────────────────────────────────│
    │                          │                          │                          │
    │  Receive Phone Call      │                          │                          │
    │<────────────────────────────────────────────────────────────────────────────────│
```

### AI Chat Flow
```
User                        ChatWidget                  ai-chat Edge Fn           Lovable AI
  │                             │                            │                        │
  │  Type Message               │                            │                        │
  │────────────────────────────>│                            │                        │
  │                             │  POST /ai-chat             │                        │
  │                             │───────────────────────────>│                        │
  │                             │                            │  API Call              │
  │                             │                            │───────────────────────>│
  │                             │                            │                        │
  │                             │                            │  AI Response           │
  │                             │                            │<───────────────────────│
  │                             │                            │                        │
  │                             │                            │  Parse [QUOTE_READY]   │
  │                             │                            │  if present            │
  │                             │  Response + Action         │                        │
  │                             │<───────────────────────────│                        │
  │                             │                            │                        │
  │  Display Response           │                            │                        │
  │<────────────────────────────│                            │                        │
  │                             │                            │                        │
  │                             │  If action: submit_quote   │                        │
  │                             │  → Trigger quote flow      │                        │
```

---

## 4. Infrastructure Topology

### Lovable Cloud (Managed)
```
┌─────────────────────────────────────────────────────────┐
│                    Lovable Cloud                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Global CDN Edge Network                 │ │
│  │        (Static assets, React bundle)                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Supabase Project                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │  Database   │  │    Auth     │  │   Storage   │  │ │
│  │  │  (Postgres) │  │  (GoTrue)   │  │   (S3)      │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────┐│ │
│  │  │              Edge Functions (Deno)               ││ │
│  │  │  Auto-scaling, cold start optimized              ││ │
│  │  └─────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Environment Configuration
| Environment | Purpose | URL |
|-------------|---------|-----|
| Preview | Development/Testing | `id-preview--*.lovable.app` |
| Production | Live site | `handledly.com` |

### Secrets Management
| Secret | Usage |
|--------|-------|
| SUPABASE_URL | Database connection |
| SUPABASE_ANON_KEY | Public API key |
| SUPABASE_SERVICE_ROLE_KEY | Admin operations |
| ELEVENLABS_API_KEY | Voice AI |
| ELEVENLABS_AGENT_ID | Agent configuration |
| ELEVENLABS_PHONE_NUMBER_ID | Outbound calls |
| ELEVENLABS_WEBHOOKS_SECRET | HMAC validation |
| TWILIO_ACCOUNT_SID | SMS/Voice |
| TWILIO_AUTH_TOKEN | Authentication |
| TWILIO_PHONE_NUMBER | Sender number |
| RESEND_API_KEY | Email delivery |
| LOVABLE_API_KEY | Chat AI |

---

## 5. Security Architecture

### Authentication Flow
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │    │ Frontend │    │ Supabase │    │ Database │
│          │    │   Auth   │    │   Auth   │    │          │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │  Login        │               │               │
     │──────────────>│               │               │
     │               │  signIn()     │               │
     │               │──────────────>│               │
     │               │               │  Verify       │
     │               │               │──────────────>│
     │               │  JWT Token    │               │
     │               │<──────────────│               │
     │  Store Token  │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │  API Request  │               │               │
     │──────────────>│               │               │
     │               │  Request + JWT│               │
     │               │──────────────────────────────>│
     │               │               │  RLS Check    │
     │               │               │<──────────────│
     │  Response     │               │               │
     │<──────────────────────────────────────────────│
```

### RLS (Row-Level Security) Model
| Table | Anonymous | Authenticated | Admin |
|-------|-----------|---------------|-------|
| leads | INSERT (rate limited) | INSERT | ALL |
| quote_requests | INSERT (rate limited) | INSERT | ALL |
| chat_conversations | INSERT (rate limited) | INSERT | ALL |
| chat_messages | INSERT (validated) | INSERT | ALL |
| appointments | NONE | NONE | ALL |
| business_settings | NONE | NONE | SELECT, UPDATE |
| user_roles | NONE | SELECT own | ALL |
| rate_limit_tracker | INSERT | INSERT | ALL |

### Rate Limiting Architecture
```
┌──────────────────────────────────────────────────────────┐
│                   Rate Limit System                       │
│  ┌────────────────┐    ┌────────────────┐               │
│  │ check_rate_    │    │ rate_limit_    │               │
│  │ limit_readonly │───>│ tracker table  │               │
│  │ (SQL function) │    │                │               │
│  └────────────────┘    └────────────────┘               │
│                                                          │
│  Limits:                                                 │
│  • leads: 5 per hour per client                          │
│  • quote_requests: 10 per hour per client                │
│  • chat_conversations: 20 per hour per client            │
│                                                          │
│  Client Identification:                                  │
│  • Authenticated: user ID                                │
│  • Anonymous: SHA256(request headers)                    │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Scalability Considerations

### Current Capacity
| Resource | Current Limit | Bottleneck At |
|----------|---------------|---------------|
| Database Connections | 1,000 concurrent | 10,000 users |
| Edge Function Invocations | 500k/month | 50k leads/month |
| Storage | 1GB | N/A (no uploads) |
| Realtime Connections | 200 | 200 admin users |

### Scaling Thresholds
| Users/Month | Expected Load | Action Required |
|-------------|---------------|-----------------|
| 0-1,000 | Light | No changes |
| 1,000-10,000 | Medium | Add monitoring |
| 10,000-50,000 | Heavy | Upgrade Supabase tier |
| 50,000+ | Enterprise | Custom infrastructure |

### Performance Optimizations Implemented
1. **Database Indexes**: Composite indexes on `leads(conversation_id)`, `leads(call_sid)`, `leads(confirmation_call_status)`
2. **Query Optimization**: RLS uses security definer functions to avoid recursive policy checks
3. **Edge Function Cold Starts**: Minimal dependencies, fast boot time
4. **Frontend Bundle**: Code splitting, lazy loading for admin routes
5. **Image Optimization**: SVG icons, optimized assets

---

## 7. Dependency Structure

### Frontend Dependencies
```
react (18.3.1)
├── react-router-dom (routing)
├── @tanstack/react-query (server state)
├── react-hook-form (forms)
├── framer-motion (animations)
└── react-helmet-async (SEO)

@supabase/supabase-js (backend client)
├── realtime-js (websockets)
└── gotrue-js (auth)

tailwindcss (styling)
├── tailwindcss-animate
└── class-variance-authority (variants)

shadcn/ui components (49 total)
├── @radix-ui/* (primitives)
├── cmdk (command menu)
└── vaul (drawer)

lucide-react (icons)
recharts (charts)
@react-pdf/renderer (PDF export)
```

### Edge Function Dependencies
```
deno std library
├── https://deno.land/std@0.168.0/http/server.ts
├── https://deno.land/std@0.190.0/http/server.ts (email)

@supabase/supabase-js (esm.sh)
resend (npm: via esm.sh)
```

---

## 8. Vendor Lock-in Assessment

### Risk Matrix
| Component | Vendor | Lock-in Risk | Migration Path |
|-----------|--------|--------------|----------------|
| Frontend | React | Low | Standard React, portable |
| Backend | Supabase | Medium | Export DB, use Postgres |
| Auth | Supabase Auth | Medium | JWT compatible, exportable |
| Chat AI | Lovable AI | Low | OpenAI-compatible API |
| Voice AI | ElevenLabs | Medium | Twilio-only alternative |
| Email | Resend | Low | Standard SMTP alternative |
| SMS | Twilio | Low | Many alternatives |

### Mitigation Strategies
1. **Database**: Standard PostgreSQL, no proprietary features
2. **Edge Functions**: Deno runtime, easily portable to Cloudflare Workers
3. **AI Chat**: OpenAI-compatible API format, easy to swap models
4. **Storage**: Standard S3-compatible, portable

---

## 9. Architecture Quality Score

### Assessment: 7.5/10

**Strengths**:
- Clean separation between frontend and backend
- Serverless architecture scales automatically
- Security-first design with RLS
- Event-driven AI workflows
- Modern TypeScript throughout

**Weaknesses**:
- No circuit breaker pattern for AI services
- Single region deployment
- No message queue for async tasks
- Limited observability tooling

### Recommendations
1. **Add Circuit Breakers**: Implement fail-fast patterns for ElevenLabs/Twilio
2. **Message Queue**: Consider Supabase Realtime or external queue for async operations
3. **Multi-region**: Evaluate Supabase regional deployments for latency
4. **Monitoring**: Add DataDog or similar APM solution

---

*Last Updated: January 25, 2026*
