
# Implementation Plan: Quote Calculator Consolidation, CORS Hardening, ChatWidget Refactoring & Database Indexes

## Executive Summary

This plan addresses 4 major improvements across edge functions, frontend components, and database performance. The changes eliminate duplicate business logic (~150 lines), improve API security, enhance code maintainability, and optimize query performance.

---

## Task 1: Create Shared Quote Calculator Module for Edge Functions

### Problem

Quote calculation logic is currently duplicated in 3 locations:
- `src/lib/quoteCalculator.ts` (client-side) - 290 lines, comprehensive
- `supabase/functions/submit-quote/index.ts` (lines 42-114) - 73 lines, partial copy
- `supabase/functions/ai-chat/index.ts` (system prompt) - Embedded in AI context

This causes maintenance burden and potential pricing inconsistencies.

### Solution

Create a single source of truth in `supabase/functions/_shared/quote-calculator.ts` that mirrors the client-side logic.

### Files to Create/Modify

**New file: `supabase/functions/_shared/quote-calculator.ts`**

```text
Content:
- HOURLY_RATES constant object (matching client-side)
- IRON_LAW_SERVICES array
- IRON_LAW_RATE, IRON_LAW_LABOR_ONLY_RATE, HEAVY_ITEMS_RATE constants
- SPECIALTY_RATES for flat fees
- isIronLawService() helper function
- calculateQuote() main function with interface types
- Helper functions: estimateCrewSize(), estimateHours(), getHourlyRate()

Size: ~120 lines
```

**Modify: `supabase/functions/submit-quote/index.ts`**

```text
Changes:
- Remove duplicate quote calculation code (lines 42-114)
- Import { calculateQuote, isIronLawService, HOURLY_RATES } from "../_shared/quote-calculator.ts"
- Use imported function instead of local implementation

Lines affected: ~70 lines removed, 3 lines added
```

### Benefits

- Single source of truth for pricing logic
- Easier maintenance when rates change
- Guaranteed consistency between web form and AI chat submissions

---

## Task 2: Implement Domain-Specific CORS in Edge Functions

### Current State

The `supabase/functions/_shared/cors.ts` file already has proper domain-specific CORS implementation with `isAllowedOrigin()` function.

However, `supabase/functions/submit-quote/index.ts` uses a hardcoded wildcard CORS header:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // INSECURE
  ...
};
```

### Solution

Update `submit-quote/index.ts` to use the shared CORS utility.

### Files to Modify

**Modify: `supabase/functions/submit-quote/index.ts`**

```text
Changes:
- Import { getCorsHeaders } from "../_shared/cors.ts"
- Replace hardcoded corsHeaders constant with dynamic getCorsHeaders(req)
- Update all Response objects to use corsHeaders from function call

Lines affected: 4-8 (remove hardcoded), multiple Response calls
```

### Security Impact

- Restricts API access to:
  - `https://handledly.com`
  - `https://www.handledly.com`
  - `https://*.lovable.app` (preview domains)
  - `https://*.lovableproject.com` (project domains)
- Blocks cross-origin requests from unauthorized domains

---

## Task 3: Refactor ChatWidget.tsx into Sub-Components

### Current State

`ChatWidget.tsx` is 589 lines with mixed concerns:
- Header UI (connection status)
- Message list rendering
- Quick action buttons
- Conversion prompts
- Quote confirmation card
- Input area with send button
- Both "inline" and "floating" variant logic

### Solution

Extract into 5 focused sub-components while preserving all functionality.

### New File Structure

```text
src/components/ChatWidget/
├── index.tsx              # Main orchestrator (re-exports ChatWidget)
├── ChatHeader.tsx         # Header with agent avatar & status
├── ChatMessages.tsx       # Message list with typing indicator
├── ChatInput.tsx          # Input field + send button + phone CTA
├── QuoteConfirmationCard.tsx  # Quote submitted confirmation UI
├── ConversionPrompt.tsx   # Proactive conversion banner
├── QuickActions.tsx       # Quick action buttons
└── types.ts               # Shared types and interfaces
```

### Component Breakdown

**`types.ts`** (~25 lines)
```text
- ChatWidgetProps interface
- Message interface (re-export from useAIChat)
- QuoteSubmission interface
- ConversionPrompt interface
```

**`ChatHeader.tsx`** (~45 lines)
```text
Props: isConnected, isLoading, onClose (optional for floating)
- Agent avatar with golden gradient
- "Jack - Moving Specialist" title
- Connection status indicator (green pulse/connecting/offline)
- Close button (floating variant only)
```

**`ChatMessages.tsx`** (~90 lines)
```text
Props: messages, isLoading, messagesEndRef
- Empty state UI
- Loading spinner (initial)
- Message bubbles with avatar & timestamp
- Typing indicator (3 bouncing dots)
```

**`ChatInput.tsx`** (~55 lines)
```text
Props: value, onChange, onSend, disabled, isQuoteSubmitted
- Input field with placeholder
- Send button with gradient
- Phone CTA link below input
```

**`QuoteConfirmationCard.tsx`** (~50 lines)
```text
Props: quoteSubmission, onViewConfirmation
- Success checkmark icon
- Quote number display
- Email/call confirmation status
- Total quote display
- "View Full Confirmation" button
```

**`ConversionPrompt.tsx`** (~40 lines)
```text
Props: prompt, onAction, onDismiss
- Sparkles icon
- Prompt text message
- CTA button (gradient gold)
- "Later" dismiss button
```

**`QuickActions.tsx`** (~35 lines)
```text
Props: actions, onAction
- Priority actions (gold outline)
- Secondary actions (muted)
- Icon + label button layout
```

**`index.tsx`** (~200 lines)
```text
- State management (open, inputValue, etc.)
- useAIChat hook integration
- Event handlers (open, close, send, etc.)
- Variant logic (inline vs floating)
- Composition of sub-components
```

### Migration Strategy

1. Create `types.ts` with shared interfaces
2. Extract each component one at a time
3. Update main `index.tsx` to import and compose
4. Keep backward-compatible export: `export { ChatWidget } from './ChatWidget'`
5. Update existing import in `src/App.tsx` if needed

### Benefits

- Reduces main component from 589 lines to ~200 lines
- Each sub-component is testable in isolation
- Clear separation of concerns
- Easier to modify individual UI pieces

---

## Task 4: Add Critical Database Indexes

### Current Issues

1. **Admin Dashboard**: Queries leads by status and created_at for filtering
2. **Rate Limiting**: Lookups on `rate_limit_tracker` by identifier + table_name + created_at

Without indexes, these queries perform full table scans as data grows.

### Indexes to Add

**Index 1: `idx_leads_status_created`**
```sql
CREATE INDEX IF NOT EXISTS idx_leads_status_created 
ON public.leads (status, created_at DESC);
```

**Purpose**: Optimizes admin dashboard queries like:
```sql
SELECT * FROM leads 
WHERE status = 'new' 
ORDER BY created_at DESC 
LIMIT 20;
```

**Index 2: `idx_rate_limit_tracker_lookup`**
```sql
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracker_lookup 
ON public.rate_limit_tracker (identifier, table_name, created_at DESC);
```

**Purpose**: Optimizes rate limit checks:
```sql
SELECT COUNT(*) FROM rate_limit_tracker 
WHERE identifier = $1 
  AND table_name = $2 
  AND created_at > now() - interval '1 hour';
```

**Index 3: `idx_leads_confirmation_call_status`**
```sql
CREATE INDEX IF NOT EXISTS idx_leads_confirmation_call_status 
ON public.leads (confirmation_call_status) 
WHERE confirmation_call_status IN ('calling', 'failed', 'timeout');
```

**Purpose**: Partial index for call retry queue processing.

**Index 4: `idx_chat_conversations_session`**
```sql
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session 
ON public.chat_conversations (session_id, created_at DESC);
```

**Purpose**: Optimizes conversation lookups by session.

### Migration SQL

```sql
-- Performance indexes for production scale
-- Non-blocking with CONCURRENTLY keyword

-- 1. Leads dashboard filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status_created 
ON public.leads (status, created_at DESC);

-- 2. Rate limiting lookups (critical path)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limit_tracker_lookup 
ON public.rate_limit_tracker (identifier, table_name, created_at DESC);

-- 3. Call retry queue processing (partial index)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_call_retry 
ON public.leads (confirmation_call_status, next_retry_at)
WHERE confirmation_call_status IN ('failed', 'failed_sms_sent', 'timeout');

-- 4. Chat session lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_conversations_session 
ON public.chat_conversations (session_id, created_at DESC);
```

### Performance Impact

| Query | Before | After |
|-------|--------|-------|
| leads WHERE status ORDER BY created_at | Full scan | Index seek |
| rate_limit_tracker COUNT(*) | ~50ms at 100K rows | <5ms |
| leads WHERE call_status IN (...) | Full scan | Partial index |

---

## Implementation Order

1. **Database indexes** (safest, zero code changes) - Deploy first
2. **Shared quote calculator** - Backend consolidation
3. **CORS hardening** - Security improvement
4. **ChatWidget refactor** - Frontend cleanup (largest change)

---

## Technical Details

### Risk Assessment

| Task | Risk | Mitigation |
|------|------|------------|
| Database indexes | Low | CONCURRENTLY prevents locking |
| Quote calculator | Medium | Unit test parity before deployment |
| CORS update | Low | Lovable domains already whitelisted |
| ChatWidget refactor | Medium | Component-by-component extraction |

### Testing Checklist

- [ ] Quote submission via web form produces correct totals
- [ ] AI chat quote extraction matches web form pricing
- [ ] CORS rejects requests from unauthorized origins
- [ ] ChatWidget inline variant works on Contact page
- [ ] ChatWidget floating variant opens/closes correctly
- [ ] Quote confirmation card displays after submission
- [ ] Admin dashboard loads within 2 seconds

