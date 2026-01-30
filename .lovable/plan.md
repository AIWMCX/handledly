

# Fix: Automatic Iron Law Enforcement for Heavy Item Quotes

## Problem Summary

When a customer submits a quote for **Safe Moving**, **Piano Moving**, **Pool Table Moving**, or any **Heavy Items** service, the system currently calculates the quote using:
- **2 movers** (should be 3)
- **$169/hour** (should be $179/hour)

This violates the **200lb Iron Law** which mandates:
- Minimum 3 movers
- Rate of $179/hour
- Truck included

The AI agent (Jack) correctly identified and adjusted this during the call, but the **initial quote email was wrong**.

---

## Technical Changes Required

### 1. Update Quote Calculator (`src/lib/quoteCalculator.ts`)

Modify `estimateCrewSize()` and `getHourlyRate()` to automatically enforce Iron Law for heavy item services:

```text
Current behavior (WRONG):
- heavy-items → 2 movers @ $169/hr

Fixed behavior (CORRECT):
- piano-moving → 3 movers @ $179/hr (Iron Law)
- pool-table → 3 movers @ $179/hr (Iron Law)
- safe-moving → 3 movers @ $179/hr (Iron Law)
- heavy-items → 3 movers @ $179/hr (Iron Law)
```

Add a new function to detect Iron Law services and a `subType` input to enforce based on service type.

### 2. Update Quote Page (`src/pages/Quote.tsx`)

Modify `mapToCalcServiceType()` and `mapCrewConfig()` to pass sub-type information and auto-apply Iron Law crew configuration:

```text
When serviceType is:
- piano-moving
- pool-table
- safe-moving
- heavy-items

Force:
- crewConfig = 'moving-3-movers'
- Pass subType to calculator for $179/hr rate
```

### 3. Update Quote Form Wizard (`src/components/conversion/QuoteFormWizard.tsx`)

Fix the estimate preview rates in `estimatedQuote` useMemo (lines 265-288):

```text
Current (wrong):
- 'safe-moving': 199
- 'piano-moving': 249
- 'pool-table': 299

Should be (Iron Law rate):
- 'safe-moving': 179
- 'piano-moving': 179
- 'pool-table': 179
- 'heavy-items': 179

And force crewSize = 3 for these services in the preview
```

### 4. Add Iron Law Notice to Email Template

In `supabase/functions/send-quote-email/index.ts`, add a visual indicator when Iron Law applies:

```text
If serviceType is piano/pool-table/safe/heavy-items:
Add banner: "⚠️ IRON LAW: 200+ lb items require 3-mover crew @ $179/hr for safety"
```

---

## Implementation Steps

| Step | File | Change |
|------|------|--------|
| 1 | `quoteCalculator.ts` | Add `isIronLawService()` function |
| 2 | `quoteCalculator.ts` | Update `estimateCrewSize()` to return 3 for Iron Law services |
| 3 | `quoteCalculator.ts` | Update `calculateQuote()` to use $179/hr for Iron Law services |
| 4 | `Quote.tsx` | Force `crewConfig = 'moving-3-movers'` for Iron Law services |
| 5 | `QuoteFormWizard.tsx` | Fix preview rates and crew size for Iron Law services |
| 6 | `send-quote-email/index.ts` | Add Iron Law notice banner |

---

## Expected Result After Fix

When customer selects "Safe Moving" and submits quote:

| Before (Wrong) | After (Correct) |
|----------------|-----------------|
| 2 Movers + Truck | **3 Movers + Truck** |
| $169/hour | **$179/hour** |
| No Iron Law notice | **Iron Law badge in email** |
| Jack has to manually adjust | **Quote is correct from start** |

---

## Verification Checklist

After implementation:
- [ ] Submit Safe Moving quote → Email shows 3 movers @ $179/hr
- [ ] Submit Piano Moving quote → Email shows 3 movers @ $179/hr
- [ ] Submit Pool Table quote → Email shows 3 movers @ $179/hr
- [ ] Preview in wizard shows correct Iron Law rate
- [ ] Email includes Iron Law safety notice
- [ ] Jack confirmation call receives correct pre-adjusted data

