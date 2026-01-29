

# US-Only Phone Validation & Quality Assurance Implementation

## Overview

This plan implements strict US phone number validation across all customer touchpoints to prevent international calls and ensure only high-quality, local Denver-area leads enter the system. Additionally, we'll enhance the customer experience to reinforce Handledly's brand values: **Quality, Performance, Technical Excellence, and Honesty**.

---

## Part 1: US Phone Number Validation

### 1.1 Create Shared Phone Validation Utility

**File**: `src/lib/phoneValidation.ts`

```text
┌─────────────────────────────────────────────────────────────┐
│  isValidUSPhone(phone: string): boolean                      │
│  - Strips all non-digits                                     │
│  - Validates 10-digit US format OR 11-digit starting with 1 │
│  - Rejects international formats (non +1 prefixes)          │
├─────────────────────────────────────────────────────────────┤
│  formatUSPhone(phone: string): string                        │
│  - Returns clean E.164 format (+1XXXXXXXXXX)                │
│  - Returns null if invalid                                  │
├─────────────────────────────────────────────────────────────┤
│  getPhoneDisplayFormat(phone: string): string                │
│  - Returns (XXX) XXX-XXXX for display                       │
└─────────────────────────────────────────────────────────────┘
```

Key validation rules:
- **Accept**: 10-digit numbers, 11-digit starting with "1", +1 prefixed
- **Reject**: Numbers starting with 0, 1 (non-US), international prefixes
- **Block**: Country codes like +44, +91, +61, etc.

### 1.2 Update Quote Form Wizard

**File**: `src/components/conversion/QuoteFormWizard.tsx`

Changes:
- Add real-time phone validation with visual feedback
- Show US flag icon + "(US Only)" hint in phone field
- Block form progression if phone is invalid
- Display friendly error: "We currently serve US customers only. Please enter a 10-digit US phone number."

### 1.3 Update API Validation Utility

**File**: `src/lib/apiUtils.ts`

Enhance `validateQuoteData()`:
- Import and use `isValidUSPhone()` 
- Add explicit US-only error message
- Block submission for international numbers

### 1.4 Harden Edge Functions

**File**: `supabase/functions/trigger-confirmation-call/index.ts`

Add validation before attempting call:
```text
function isValidUSPhoneForCall(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Must be exactly 10 digits (US local) or 11 starting with 1
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith('1')) return true;
  return false;
}
```

If invalid, skip call and log: "Skipping call - non-US phone number detected"

**File**: `supabase/functions/send-sms-notification/index.ts`

Same validation - only send SMS to verified US numbers.

### 1.5 Update AI Chat System Prompt

**File**: `supabase/functions/ai-chat/index.ts`

Add to Jack's instructions:
```text
## PHONE NUMBER REQUIREMENTS
- We only serve US customers with US phone numbers
- If a customer provides a non-US phone number, politely explain:
  "I appreciate your interest! Currently, Handledly serves customers 
  in the Denver metropolitan area with US phone numbers. Is there a 
  US number I can reach you at?"
- Valid formats: (303) 555-1234, 303-555-1234, 3035551234
- Do NOT accept numbers starting with +44, +91, or other country codes
```

---

## Part 2: Quality & Trust Enhancements

### 2.1 Phone Input UX Improvements

**File**: `src/components/conversion/QuoteFormWizard.tsx`

Add to phone input field:
- Auto-format as user types: `(303) 555-1234`
- Show checkmark when valid US number detected
- Show "🇺🇸 US Phone Only" subtle label
- Real-time validation feedback

### 2.2 Trust Messaging Updates

**File**: `src/pages/Quote.tsx`

Enhance trust indicators:
- Add "Denver Local Since 2020" badge
- Include "Colorado-Owned & Operated" messaging
- Emphasize "We Answer Our Phones" differentiator

### 2.3 Jack's Personality Refinement

Ensure Jack maintains these qualities in all interactions:
- **Honest**: Never oversells or makes false promises
- **Professional**: Respects customer's time
- **Local Expert**: References Denver neighborhoods and logistics
- **Helpful**: Always provides value even if customer doesn't book

---

## Part 3: Database Tracking

### 3.1 Add Phone Validation Tracking

Consider adding to `leads` table (optional migration):
- `phone_validated: boolean` - Confirms US number verified
- `phone_country_code: text` - Store detected country (always 'US' for valid)

This enables reporting on rejected international attempts.

---

## Implementation Sequence

| Step | Component | Priority |
|------|-----------|----------|
| 1 | Create `phoneValidation.ts` utility | HIGH |
| 2 | Update `QuoteFormWizard.tsx` with validation | HIGH |
| 3 | Update `apiUtils.ts` validation | HIGH |
| 4 | Harden `trigger-confirmation-call` edge function | HIGH |
| 5 | Harden `send-sms-notification` edge function | MEDIUM |
| 6 | Update AI chat system prompt | MEDIUM |
| 7 | Add phone input formatting/UX | MEDIUM |
| 8 | Update trust messaging | LOW |

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| International call attempts | Possible | Blocked |
| Invalid phone submissions | Accepted | Rejected with friendly message |
| User experience | Plain input | Formatted with validation feedback |
| Jack's responses | May accept any number | Politely requests US number |
| Cost protection | Partial | Complete (no international API calls) |

---

## Brand Values Reinforced

1. **Quality**: Every lead is validated before entering the system
2. **Performance**: No wasted API calls to invalid numbers
3. **Technical Excellence**: Proper E.164 formatting and validation
4. **Honesty**: Clear upfront messaging about US-only service

---

## Files to Modify

1. `src/lib/phoneValidation.ts` (NEW)
2. `src/lib/apiUtils.ts`
3. `src/components/conversion/QuoteFormWizard.tsx`
4. `supabase/functions/trigger-confirmation-call/index.ts`
5. `supabase/functions/send-sms-notification/index.ts`
6. `supabase/functions/ai-chat/index.ts`
7. `src/pages/Quote.tsx` (trust messaging)

