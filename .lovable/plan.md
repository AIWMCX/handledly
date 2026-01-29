

# Master Prompt & System-Wide Pricing/Iron Law Update

## Executive Summary

This plan creates a **comprehensive Master Prompt** that serves as the single source of truth for all pricing and the **200lb Iron Law**, then updates ALL remaining inconsistencies across frontend, backend, edge functions, and documentation to ensure 100% consistency before the February 1st launch.

---

## Part 1: Current State Analysis

### Critical Inconsistencies Found

| Location | Issue | Current | Should Be |
|----------|-------|---------|-----------|
| `jack-knowledge-base.md` (line 590) | Heavy item probe | "300+ lbs?" | "200+ lbs?" |
| `jack-knowledge-base.md` (line 616) | Rate quote | "$149 to $179" | "$159 to $179" |
| `jack-knowledge-base.md` (lines 729-746) | Quick Reference | $149/hr, 300lb rule | $159/hr, 200lb Iron Law |
| `jack-knowledge-base.md` (lines 815, 884-885, 926) | References | 300 lbs | 200 lbs |
| `jack-knowledge-base.md` (lines 1333-1350) | Quick Reference #2 | Same issues | Same fixes |
| `src/pages/Services.tsx` (lines 74-81) | Heavy Items | "Under 300 lbs", "300+ lbs" | "Under 200 lbs", "200+ lbs" |
| `src/pages/Services.tsx` (line 177) | Badge | "From $149/hr" | "From $139/hr" |
| `src/components/PricingDisplay.tsx` (lines 140-141) | Safes | "300 lbs" | "200 lbs" |
| `src/lib/quoteCalculator.ts` (lines 231-232) | SPECIALTY_ITEMS | "Under 300lbs", "300-800lbs" | "Under 200lbs", "200-800lbs" |

---

## Part 2: Master Prompt Document

Create a new file `docs/MASTER-PRICING-PROMPT.md` that serves as the **single source of truth** for:

### 2.1 Complete Pricing Table (February 2026)

```text
HANDLEDLY MOVING SERVICES - OFFICIAL PRICING
=============================================
Effective: February 1, 2026

LABOR ONLY (No Truck):
- 2 Movers: $139/hour
- 3 Movers: $169/hour  
- 4 Movers: $239/hour

MOVING WITH TRUCK:
- 2 Movers + Truck: $159/hour (Most Popular)
- 3 Movers + Truck: $189/hour
- 3 Movers + 2 Trucks: $209/hour
- 4 Movers + Truck: $259/hour

HEAVY ITEMS:
- Base Rate: $169/hour (by situation)
- Iron Law Rate: $179/hour (200+ lb items)

FEES:
- Electronic Payment: +$5
- Negotiation Discount: $10 (if customer hesitates)
```

### 2.2 The 200lb Iron Law (CRITICAL)

```text
⚠️ 200LB IRON LAW - NON-NEGOTIABLE
==================================

TRIGGER: Any single item weighing 200 pounds or more

REQUIREMENTS (NO EXCEPTIONS):
1. Minimum 3 movers
2. Truck included
3. Rate: $179/hour

ITEMS THAT ALWAYS TRIGGER IRON LAW:
- All pianos (upright, baby grand, grand)
- All pool tables (slate)
- All safes & gun safes (200+ lbs)
- Hot tubs
- Commercial gym equipment
- Large commercial appliances

PROBING SCRIPT:
"Do you happen to know the approximate weight? Or was it 
something that took a few people to move in originally?"

EXPLANATION SCRIPT:
"For items over 200 pounds, we always bring a 3-mover crew 
with our heavy-duty equipment - it's our safety standard. 
That means the rate adjusts to $179/hour, but it ensures 
your item and floors stay protected."
```

### 2.3 Specialty Item Flat Fees

```text
SPECIALTY ITEM PRICING
======================
Upright Piano:      $150 (requires 3 movers)
Baby Grand Piano:   $250 (requires 3 movers)
Grand Piano:        $350 (requires 3-4 movers)
Gun Safe (<200 lbs): $100 (2 movers)
Gun Safe (200-500 lbs): $175 (3 movers @ $179/hr)
Gun Safe (500+ lbs):    $250 (3-4 movers)
Pool Table (move only): $350 (3 movers)
Pool Table (full):      $550 (3 movers)
Hot Tub:           $400 (4 movers)
Gym Equipment:     $125
Motorcycle:        $200
```

---

## Part 3: Files to Update

### 3.1 Core Quote Calculator
**File**: `src/lib/quoteCalculator.ts`

**Lines 231-232** - Fix SPECIALTY_ITEMS labels:
- `'safe-small'`: Change "Under 300lbs" → "Under 200lbs"
- `'safe-large'`: Change "300-800lbs" → "200-800lbs"

### 3.2 Services Page
**File**: `src/pages/Services.tsx`

**Lines 74-81** - Fix heavy items categories:
- "Heavy Items (Under 300 lbs)" → "Heavy Items (Under 200 lbs)"
- "Heavy Items (300+ lbs)" → "Heavy Items (200+ lbs)"

**Line 177** - Fix price badge:
- "From $149/hr" → "From $139/hr"

### 3.3 Pricing Display
**File**: `src/components/PricingDisplay.tsx`

**Lines 140-141** - Fix safes labels:
- "Safes (Under 300 lbs)" → "Safes (Under 200 lbs)"
- "Safes (300+ lbs)" → "Safes (200+ lbs)"

### 3.4 Jack Knowledge Base (Major Update)
**File**: `docs/jack-knowledge-base.md`

**Updates Required:**

1. **Line 590**: Change "300+ lbs" → "200+ lbs"
2. **Line 616**: Change "$149 to $179" → "$159 to $179"
3. **Lines 729-746 (Quick Reference #1)**: 
   - "$149/hr" → "$159/hr"
   - "$179/hr" → "$189/hr" (for 3 movers)
   - "$209/hr" → "$259/hr" (for 4 movers)
   - "300LB RULE" → "200LB IRON LAW"
   - "300 lbs" → "200 lbs"
   - "Safe (300+ lbs)" → "Safe (200+ lbs)"
4. **Line 815**: "One item over 300 lbs" → "One item over 200 lbs"
5. **Lines 884-885**: "300 lbs" → "200 lbs", "300lb rule" → "200lb Iron Law"
6. **Line 926**: "300+ lbs Case" → "200+ lbs Case"
7. **Line 930**: "$149 to $179" → "$159 to $179"
8. **Lines 1333-1350 (Quick Reference #2)**: Same updates as Quick Reference #1
9. **Line 1375**: "January 2026" → "February 2026"
10. **Line 1376**: "Version: 2.0" → "Version: 3.0"

---

## Part 4: New Master Prompt Document Structure

Create `docs/MASTER-PRICING-PROMPT.md`:

```markdown
# HANDLEDLY MASTER PRICING & IRON LAW REFERENCE
## Version 3.0 - February 2026

### CRITICAL: This is the SINGLE SOURCE OF TRUTH

All systems must align with this document:
- Frontend (quoteCalculator.ts, PricingDisplay.tsx, Services.tsx)
- Backend Edge Functions (ai-chat, send-quote-email)
- AI Knowledge Base (jack-knowledge-base.md)
- Customer Communications (emails, SMS)

---

## SECTION 1: OFFICIAL HOURLY RATES

[Complete pricing table]

## SECTION 2: THE 200LB IRON LAW

[Complete Iron Law specification]

## SECTION 3: SPECIALTY ITEMS

[Complete specialty fees]

## SECTION 4: INCLUSIONS

[What's included with every move]

## SECTION 5: FEES & DISCOUNTS

[Electronic payment, negotiation discount]

## SECTION 6: SERVICE AREAS

[Denver Metro coverage]

## SECTION 7: JACK AI SCRIPTS

[Standardized probing and explanation scripts]

## SECTION 8: QUICK REFERENCE CARD

[Updated quick reference with correct rates]

## CHANGE LOG
- v3.0 (Feb 2026): Updated to 200lb Iron Law, new pricing
- v2.0 (Jan 2026): Initial production release
```

---

## Part 5: Implementation Order

### Phase 1: Create Master Document (Foundation)
```text
[1] Create docs/MASTER-PRICING-PROMPT.md
```

### Phase 2: Update Core Calculator
```text
[2] Fix src/lib/quoteCalculator.ts SPECIALTY_ITEMS (300→200)
```

### Phase 3: Update Frontend
```text
[3] Fix src/pages/Services.tsx (300→200, $149→$139)
[4] Fix src/components/PricingDisplay.tsx (300→200)
```

### Phase 4: Update Knowledge Base
```text
[5] Fix docs/jack-knowledge-base.md (all 10+ locations)
```

### Phase 5: Verification
```text
[6] Search codebase for remaining "300" references
[7] Search codebase for remaining "$149" references
[8] Test quote calculator
[9] Test AI chat responses
```

---

## Part 6: Technical Summary

| File | Changes | Priority |
|------|---------|----------|
| `docs/MASTER-PRICING-PROMPT.md` | CREATE new master document | CRITICAL |
| `src/lib/quoteCalculator.ts` | Lines 231-232 (300→200) | HIGH |
| `src/pages/Services.tsx` | Lines 74-81, 177 (300→200, $149→$139) | HIGH |
| `src/components/PricingDisplay.tsx` | Lines 140-141 (300→200) | HIGH |
| `docs/jack-knowledge-base.md` | 10+ locations, version bump | CRITICAL |

**Total files**: 5 (1 new, 4 updates)
**Estimated time**: 30-40 minutes

---

## Part 7: Post-Implementation Verification

### Automated Checks
1. `grep -r "300.*lb" src/` should return 0 results
2. `grep -r "\$149" src/` should return 0 results
3. All pricing displays show correct rates

### Manual Verification
1. Visit `/services` - confirm heavy items show 200lb threshold
2. Visit homepage pricing section - confirm all rates correct
3. Test AI chat - ask about heavy safe, confirm $179/hr rate
4. Submit test quote with heavy item - verify correct calculation

---

## Summary

This plan ensures:
- **Single source of truth** via `MASTER-PRICING-PROMPT.md`
- **100% consistency** across all 5 affected files
- **Zero 300lb references** remaining in codebase
- **Zero $149 references** remaining in codebase
- **Professional, polished** launch on February 1st

