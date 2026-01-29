

# Fix: US-Only Phone Validation Bug

## Problem
The `formatPhoneInput()` function in `src/lib/phoneValidation.ts` strips all non-digits before validation can check for international prefixes. This allows numbers like `+447911123456` to bypass validation and be formatted as `(447) 911-1234`.

## Solution

### 1. Update formatPhoneInput() to Block International Numbers First

**File**: `src/lib/phoneValidation.ts`

Before stripping non-digits, check for international prefixes:
- If input starts with `+` followed by non-`1` digit → return empty string (block)
- If input matches any blocked country prefix → return empty string (block)
- Only then proceed with formatting

### 2. Add Early Validation in handlePhoneChange()

**File**: `src/components/conversion/QuoteFormWizard.tsx`

Before formatting, check if the RAW input contains international prefixes and show immediate error feedback.

### 3. Strengthen Edge Function Validation

**File**: `supabase/functions/trigger-confirmation-call/index.ts`

Add check for obviously invalid area codes (like 447, 449, etc. which don't exist in the US).

## Files to Modify

1. `src/lib/phoneValidation.ts` - Add prefix check before formatting
2. `src/components/conversion/QuoteFormWizard.tsx` - Early raw input validation
3. `supabase/functions/trigger-confirmation-call/index.ts` - Additional area code validation

## Expected Outcome

- International numbers blocked at input time
- Clear "US only" error message shown immediately
- No international calls ever reach ElevenLabs/Twilio APIs

