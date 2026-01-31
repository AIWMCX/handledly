

# Fix: Quote Calculator Preview vs Email Price Mismatch

## Problem Identified

The quote calculator preview in the form wizard shows **$776** (range), but the email/database stores **$537**. 

**Root Cause:** The preview calculation in `QuoteFormWizard.tsx` uses a **crew multiplier** (`crewSize / 2`) that the actual `quoteCalculator.ts` does NOT use.

---

## Calculation Comparison

### Preview Formula (WRONG - uses crew multiplier)
```
$179/hr × 3 hours × (3 movers ÷ 2) = $805
Range: $725 - $886 (displayed as ~$776)
```

### Actual Formula (CORRECT - flat hourly rate)
```
$179/hr × 3 hours = $537
```

The `quoteCalculator.ts` already includes crew cost in the hourly rate (e.g., `moving-3-movers` = $189/hr already covers 3 movers). The preview is double-counting crew.

---

## Solution

Update `QuoteFormWizard.tsx` to match `quoteCalculator.ts` exactly by removing the crew multiplier and using the same logic.

### File: `src/components/conversion/QuoteFormWizard.tsx`

**Current Code (lines 266-296):**
```typescript
const estimatedQuote = useMemo(() => {
  const crewMultiplier = effectiveCrewSize / 2;  // ← PROBLEM
  const low = Math.round(baseRate * hours * crewMultiplier * 0.9);
  const high = Math.round(baseRate * hours * crewMultiplier * 1.1);
});
```

**Fixed Code:**
```typescript
const estimatedQuote = useMemo(() => {
  // Use quoteCalculator directly for consistency
  const quote = calculateQuote({
    serviceType: mapToCalcServiceType(formData.serviceType),
    subType: formData.serviceType,
    bedrooms: formData.bedrooms,
    crewConfig: mapCrewConfig(formData.crewSize, formData.serviceType),
    estimatedHours: formData.estimatedHours,
  });
  
  // Show ±10% range
  const low = Math.round(quote.total * 0.9);
  const high = Math.round(quote.total * 1.1);
  
  return { 
    low, 
    high, 
    isIronLaw: quote.isIronLaw, 
    crewSize: quote.crewSize,
    exact: quote.total 
  };
});
```

---

## Also Update: InstantQuotePreview.tsx

The `InstantQuotePreview.tsx` component has the same issue - it also uses a crew multiplier AND adds extra fees not in the actual quote:

**Current (lines 52-76):**
```typescript
const crewMultiplier = crewSize / 2;
const crewCost = baseRate * hours * crewMultiplier;  // ← crew multiplier
const travelFee = 50;  // ← NOT in actual quote
const stairsFee = hasStairs ? 75 : 0;  // ← NOT in actual quote
```

**Fix:** Import and use `calculateQuote()` from `quoteCalculator.ts` for consistency.

---

## Impact

| Before Fix | After Fix |
|------------|-----------|
| Preview: $725-$886 | Preview: $483-$591 |
| Email: $537 | Email: $537 |
| **Mismatch** | **Match** ✅ |

---

## Files to Modify

1. **`src/components/conversion/QuoteFormWizard.tsx`**
   - Import `calculateQuote` from `@/lib/quoteCalculator`
   - Replace manual calculation with `calculateQuote()` call
   - Remove crew multiplier logic

2. **`src/components/conversion/InstantQuotePreview.tsx`**
   - Import `calculateQuote` from `@/lib/quoteCalculator`
   - Replace manual calculation with `calculateQuote()` call
   - Remove travel fee, stairs fee, crew multiplier (not in actual pricing)

---

## Technical Notes

The `quoteCalculator.ts` is the **source of truth** for pricing. All preview components should use it directly to prevent discrepancies. The current preview components were created separately and drifted from the actual pricing logic.

### Pricing Model (from quoteCalculator.ts)
- Hourly rates INCLUDE crew and truck costs
- No separate travel/stair fees (marketing: "NO HIDDEN FEES")
- Iron Law: 200+ lb items = $179/hr with 3 movers (included in rate)

