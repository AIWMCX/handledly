
# Comprehensive Pricing & "200lb Iron Law" Update Plan

## Executive Summary

This plan implements critical updates to Handledly's pricing structure and enforces the **200lb Iron Law** across all systems before the February 1st, 2026 launch. All changes will be made with precision and thorough cross-verification to ensure zero errors, zero miscommunication, and a polished, professional launch.

---

## Part 1: New Pricing Structure

### Current Pricing vs. New Pricing Comparison

| Service Type | OLD Rate | NEW Rate | Change |
|--------------|----------|----------|--------|
| Labor Only - 2 Movers | $129/hr | **$139/hr** | +$10 |
| 2 Movers + Truck | $149/hr | **$159/hr** | +$10 |
| Heavy Items | $159/hr | **$169/hr** | +$10 |
| Labor Only - 3 Movers | $159/hr | **$169/hr** | +$10 |
| 3 Movers + Truck | $179/hr | **$189/hr** (or $199) | +$10-20 |
| 3 Movers + 2 Trucks | $199/hr | **$209/hr** (or $219) | +$10-20 |
| Labor Only - 4 Movers | $229/hr | **$239/hr** (or $249) | +$10-20 |
| 4 Movers + Truck | $249/hr | **$259/hr** (or $269) | +$10-20 |
| Electronic Payment Fee | $5 | **$5** | No change |

**Negotiation Flexibility**: $10 discount available if customer hesitates on booking.

**Operational Note**: If addresses are close, the second truck can be provided without additional charge, or the crew can make a second trip.

---

## Part 2: The 200lb Iron Law

### The Rule (CRITICAL - MANDATORY)

**Any item weighing 200 pounds or more REQUIRES:**
- Minimum 3 movers
- Truck included
- Rate adjustment to **$179/hr** (Iron Law rate)
- NO EXCEPTIONS

### Change from Previous

| Aspect | OLD Rule | NEW Rule |
|--------|----------|----------|
| Weight Threshold | 300 lbs | **200 lbs** |
| Rate Adjustment | $179/hr | **$179/hr** (unchanged) |
| Crew Requirement | 3+ movers | **3+ movers** (unchanged) |

### Items That Trigger the 200lb Iron Law

- All pianos (upright and grand)
- All pool tables
- All safes and gun safes
- Large appliances (commercial refrigerators, etc.)
- Gym equipment (commercial-grade)
- Hot tubs
- Any item customer describes as "heavy" or "took multiple people to move"

### How Jack Handles 200lb Iron Law

When a customer mentions a heavy item:

1. **Probe**: "Do you happen to know the approximate weight? Or was it something that took a few people to move in originally?"

2. **Apply Rule**: If 200+ lbs OR unclear but sounds heavy:
   > "For items over 200 pounds, we always bring a 3-mover crew with our heavy-duty equipment - it's our safety standard. That means the rate adjusts to $179/hour, but it ensures your item and floors stay protected."

3. **Clarify if Needed**: If customer is unsure:
   > "No worries - we'll confirm the details and if it turns out to be under 200 pounds, we'll adjust accordingly. Better to be prepared!"

---

## Part 3: Files to Update

### 3.1 Core Quote Calculator
**File**: `src/lib/quoteCalculator.ts`

Updates needed:
- `HOURLY_RATES` object: Update all rate values
- `CREW_CONFIGURATIONS` array: Update all rate and description values
- Change references from 300lb to 200lb in `HeavyItemsSubType`
- Update `estimateCrewSize()` to default to 3 movers for heavy items

### 3.2 Pricing Display Component
**File**: `src/components/PricingDisplay.tsx`

Updates needed:
- All displayed rates will automatically update from `quoteCalculator`
- Update Heavy Items section to reflect 200lb rule
- Update descriptions for clarity

### 3.3 Instant Quote Preview
**File**: `src/components/conversion/InstantQuotePreview.tsx`

Updates needed:
- `SERVICE_BASE_RATES` object: Update all rate values
- Ensure heavy-items rate reflects new $169/hr base

### 3.4 Jack Knowledge Base
**File**: `docs/jack-knowledge-base.md`

Updates needed (comprehensive rewrite of relevant sections):
- Section 3: Pricing table updates
- Section 4: Change 300lb Rule to 200lb Iron Law throughout
- Update all example scripts and quote formulas
- Update specialty items table

### 3.5 AI Chat System Prompt
**File**: `supabase/functions/ai-chat/index.ts`

Updates needed:
- `SYSTEM_PROMPT` pricing section: Update all rates
- Add 200lb Iron Law explanation
- Ensure Jack knows to probe for weight on any heavy-sounding items

### 3.6 Services Data
**File**: `src/data/servicesData.ts`

Updates needed:
- Change "Heavy Items (Under 300 lbs)" to "Heavy Items (Under 200 lbs)"
- Change "Heavy Items (300+ lbs)" to "Heavy Items (200+ lbs)"
- Update descriptions accordingly

### 3.7 Send Quote Email
**File**: `supabase/functions/send-quote-email/index.ts`

Updates needed:
- `SPECIALTY_LABELS` object: Update weight references from 300 to 200
- Ensure email displays correct pricing

---

## Part 4: Implementation Checklist

### Phase 1: Core Calculator (Foundation)
```text
[ ] Update HOURLY_RATES in quoteCalculator.ts
[ ] Update CREW_CONFIGURATIONS in quoteCalculator.ts
[ ] Update HeavyItemsSubType enum values (300 -> 200)
[ ] Update SPECIALTY_ITEMS weight labels
[ ] Update estimateCrewSize() for heavy items
```

### Phase 2: UI Components
```text
[ ] InstantQuotePreview.tsx - SERVICE_BASE_RATES
[ ] PricingDisplay.tsx - Verify auto-updates from calculator
[ ] servicesData.ts - Heavy item descriptions
```

### Phase 3: AI & Documentation
```text
[ ] ai-chat/index.ts - System prompt pricing updates
[ ] ai-chat/index.ts - Add 200lb Iron Law section
[ ] jack-knowledge-base.md - Full pricing table update
[ ] jack-knowledge-base.md - 300lb -> 200lb Iron Law rewrite
```

### Phase 4: Email & Edge Functions
```text
[ ] send-quote-email/index.ts - SPECIALTY_LABELS update
[ ] Deploy updated edge functions
```

### Phase 5: Verification
```text
[ ] Test quote calculator with 2, 3, 4 mover configs
[ ] Test heavy item detection triggers 3-mover minimum
[ ] Test email displays correct rates
[ ] Test Jack responds correctly about 200lb items
[ ] Review all pricing displays on website
```

---

## Part 5: Technical Details

### New HOURLY_RATES Object
```typescript
export const HOURLY_RATES = {
  // Labor Only (no truck)
  'labor-2-movers': 139,
  'labor-3-movers': 169,
  'labor-4-movers': 239, // or 249
  // Moving (with truck)
  'moving-2-movers': 159,
  'moving-3-movers': 189, // or 199
  'moving-3-movers-2-trucks': 209, // or 219
  'moving-4-movers': 259, // or 269
  // Heavy Items (Iron Law rate)
  'heavy-items': 169,
  // Iron Law Rate (200+ lbs)
  'iron-law-minimum': 179,
} as const;
```

### New CREW_CONFIGURATIONS Array
```typescript
export const CREW_CONFIGURATIONS = [
  { value: 'labor-2-movers', label: 'Labor Only - 2 Movers', rate: 139, hasTruck: false, crew: 2, description: 'Loading/unloading help' },
  { value: 'moving-2-movers', label: '2 Movers + Truck', rate: 159, hasTruck: true, crew: 2, description: 'Studios & 1-2 BR', popular: true },
  { value: 'labor-3-movers', label: 'Labor Only - 3 Movers', rate: 169, hasTruck: false, crew: 3, description: 'Larger jobs or 200+ lb items' },
  { value: 'moving-3-movers', label: '3 Movers + Truck', rate: 189, hasTruck: true, crew: 3, description: '2-3 BR or heavy items' },
  { value: 'moving-3-movers-2-trucks', label: '3 Movers + 2 Trucks', rate: 209, hasTruck: true, crew: 3, description: 'When more capacity needed' },
  { value: 'labor-4-movers', label: 'Labor Only - 4 Movers', rate: 239, hasTruck: false, crew: 4, description: 'Large loading projects' },
  { value: 'moving-4-movers', label: '4 Movers + Truck', rate: 259, hasTruck: true, crew: 4, description: '3-4 BR homes' },
] as const;
```

### Jack's Updated Pricing Knowledge
```text
SERVICES & PRICING (Updated February 2026):
- Labor Only - 2 Movers: $139/hour
- 2 Movers + Truck: $159/hour (Most Popular)
- Heavy Items: $169/hour (by situation)
- Labor Only - 3 Movers: $169/hour
- 3 Movers + Truck: $189-199/hour
- 3 Movers + 2 Trucks: $209-219/hour
- Labor Only - 4 Movers: $239-249/hour
- 4 Movers + Truck: $259-269/hour

IRON LAW - 200LB RULE (MANDATORY):
Any item 200+ pounds = 3 movers minimum at $179/hour
This applies to: pianos, pool tables, safes, gun safes, large appliances, gym equipment, hot tubs

NEGOTIATION: $10 discount available if customer hesitates
ELECTRONIC PAYMENT: +$5 processing fee
```

---

## Part 6: Quality Assurance

### Pre-Launch Verification Checklist

1. **Calculator Accuracy**
   - Quote for 2-mover local move shows $159/hr
   - Quote for heavy item auto-upgrades to 3 movers at $179/hr
   - Specialty fees calculate correctly

2. **UI Consistency**
   - PricingDisplay shows all 7 crew configurations with correct rates
   - InstantQuotePreview shows correct base rates
   - All "$149" references removed, replaced with "$159"

3. **Jack's Responses**
   - Jack quotes correct rates when asked
   - Jack applies 200lb Iron Law when customer mentions heavy items
   - Jack politely explains rate adjustments

4. **Email Templates**
   - Quote emails show correct hourly rates
   - Specialty item labels reflect 200lb threshold

5. **Documentation**
   - Jack Knowledge Base fully updated
   - No references to "300lb rule" remain

---

## Summary

| Item | Action | Priority |
|------|--------|----------|
| quoteCalculator.ts | Update all rates + 200lb rule | CRITICAL |
| InstantQuotePreview.tsx | Update SERVICE_BASE_RATES | HIGH |
| servicesData.ts | Update heavy item descriptions | HIGH |
| ai-chat/index.ts | Update system prompt | CRITICAL |
| jack-knowledge-base.md | Full rewrite of pricing + Iron Law | CRITICAL |
| send-quote-email/index.ts | Update specialty labels | HIGH |
| Deploy edge functions | ai-chat, send-quote-email | CRITICAL |

**Total files to modify: 7**
**Estimated implementation time: 45-60 minutes**
**Testing required: Calculator, UI, AI Chat, Email**
