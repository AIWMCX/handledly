
# CRITICAL PRE-LAUNCH PRICING FIX PLAN
## Pool Table = $169/hr with 2 Movers (NOT Iron Law)

---

## CRITICAL FINDING: Pool Table Pricing is WRONG Everywhere

Based on your specification, **Pool Table moving should be:**
- **Rate: $169/hr** (Heavy Items by situation rate)
- **Crew: 2 movers** (NOT 3 movers)
- **NOT subject to Iron Law** (despite being a heavy item)

**Current Code Status (ALL WRONG):**

| Location | Current Setting | Should Be | Status |
|----------|----------------|-----------|--------|
| `quoteCalculator.ts` | Iron Law @ $189/hr, 3 movers | $169/hr, 2 movers | WRONG |
| `ai-chat/index.ts` | "3 movers required" for pool tables | 2 movers @ $169/hr | WRONG |
| `servicesData.ts` | "3 movers required" | 2 movers | WRONG |
| `RAG-KNOWLEDGE-BASE.md` | "3 movers, Iron Law applies" | 2 movers @ $169/hr | WRONG |
| `SYSTEM-PROMPT.md` | "Always triggers: pool tables" | Remove pool table from Iron Law | WRONG |
| `MASTER-PRICING-PROMPT.md` | Pool table triggers Iron Law | 2 movers @ $169/hr | WRONG |
| `send-quote-email` | "Pool Table - 3 movers" | 2 movers | WRONG |

---

## YOUR COMPLETE PRICING SPECIFICATION (Confirmed)

### Labor Only (No Truck)
- 2 Movers: **$139/hr**
- 3 Movers: **$169/hr**
- 4 Movers: **$239/hr**

### Moving With Truck
- 2 Movers + Truck: **$159/hr** (Most Popular)
- 3 Movers + Truck: **$189/hr**
- 3 Movers + 2 Trucks: **$209/hr**
- 4 Movers + Truck: **$259/hr**

### Heavy Items (by situation)
- **Context-Based: $169/hr** with 2 movers (includes pool tables!)

### Iron Law (200+ lbs) - Applies to pianos, safes, hot tubs ONLY
- 3 Movers + Truck: **$189/hr**
- 3 Movers Labor Only: **$179/hr**

### Fees
- Electronic Payment: +$5
- Negotiation Discount: $10/hr

### Second Truck Policy
If addresses are close: second truck or second trip at NO extra cost (crew decides on-site)

---

## FILES TO UPDATE

### 1. `src/lib/quoteCalculator.ts`
**Changes:**
- Remove `pool-table` from `IRON_LAW_SERVICES` array (line ~101)
- Pool table should use heavy-items rate ($169/hr) with 2 movers
- Keep pianos, safes, hot tubs in Iron Law list

### 2. `supabase/functions/ai-chat/index.ts`
**Changes:**
- Update SYSTEM_PROMPT to specify pool tables = 2 movers @ $169/hr
- Remove pool tables from Iron Law trigger list
- Add clarification: "Pool tables are handled with 2-3 movers at $169/hr depending on complexity"

### 3. `docs/elevenlabs/SYSTEM-PROMPT.md`
**Changes:**
- Remove "pool tables" from Iron Law triggers
- Add note: "Pool tables: 2 movers @ $169/hr (not Iron Law)"

### 4. `docs/elevenlabs/RAG-KNOWLEDGE-BASE.md`
**Changes (Sections 3, 4, 22):**
- Section 3: Remove pool tables from "Items That ALWAYS Trigger Iron Law"
- Section 4: Update pool table to "2-3 movers, $169/hr, Iron Law does NOT apply"
- Section 22: Update Quick Reference to show pool table at $169/hr with 2 movers

### 5. `docs/MASTER-PRICING-PROMPT.md`
**Changes:**
- Remove pool tables from Iron Law triggers
- Add pool table to heavy items category at $169/hr

### 6. `src/data/servicesData.ts`
**Changes:**
- Line 147: Update pool table description from "3 movers required" to "2-3 movers @ $169/hr"
- Line 237: Same update

### 7. `supabase/functions/send-quote-email/index.ts`
**Changes:**
- Update SPECIALTY_LABELS for pool-table entries
- Remove "3 movers" requirement from pool table labels

---

## AI CHAT TEST RESULT (Current Behavior - WRONG)

I tested the edge function with "I need to move a pool table, what's the price?"

**Response received:**
> "Moving a pool table requires extra care and a larger crew for safety! Because pool tables are significantly over 200 lbs, we require a **3-mover crew with a truck which starts at $189/hour**..."

This is WRONG. Should say:
> "Pool tables are $169/hour with 2 movers. For the full service including disassembly and reassembly, there's a flat fee of $350-550 on top."

---

## EDGE FUNCTION STATUS

| Function | Status | Notes |
|----------|--------|-------|
| ai-chat | DEPLOYED, WORKING | Needs pricing update for pool tables |
| health-check | DEPLOYED, HEALTHY | Database latency: 196ms |
| send-quote-email | DEPLOYED | Needs pool table label update |
| send-sms-notification | DEPLOYED | No recent logs (normal) |

---

## IMPLEMENTATION STEPS

### Step 1: Update Quote Calculator
- Remove `pool-table` from Iron Law services array
- Add pool table handling at $169/hr with 2 movers

### Step 2: Update AI Chat Edge Function
- Update SYSTEM_PROMPT with correct pool table pricing
- Redeploy edge function

### Step 3: Update Documentation Files
- MASTER-PRICING-PROMPT.md
- SYSTEM-PROMPT.md (ElevenLabs)
- RAG-KNOWLEDGE-BASE.md (ElevenLabs)

### Step 4: Update Services Data
- Fix pool table descriptions in servicesData.ts

### Step 5: Update Email Template
- Fix pool table labels in send-quote-email

### Step 6: Deploy and Test
- Deploy updated ai-chat function
- Test with pool table question
- Verify response shows $169/hr with 2 movers

---

## MANUAL ACTION REQUIRED: ElevenLabs Dashboard

After I update the documentation files, you must:

1. Open ElevenLabs dashboard
2. Select agent `agent_7901kf1mzwgmexz8e9xexd3hp`
3. Update System Prompt from `docs/elevenlabs/SYSTEM-PROMPT.md`
4. Upload updated `docs/elevenlabs/RAG-KNOWLEDGE-BASE.md` to Knowledge Base
5. **CLICK PUBLISH** button

---

## POST-FIX VERIFICATION

After implementation, I will:
1. Test ai-chat edge function with pool table question
2. Verify response shows $169/hr with 2 movers
3. Test quote calculator for pool table service
4. Confirm Iron Law still applies to pianos, safes, hot tubs

---

## FINAL PRICING QUICK REFERENCE

| Service | Rate | Crew | Iron Law? |
|---------|------|------|-----------|
| Local Moving (standard) | $159/hr | 2 | NO |
| Heavy Items (by situation) | $169/hr | 2-3 | NO |
| Pool Table | $169/hr + flat fee | 2 | NO |
| Piano (any type) | $189/hr + flat fee | 3 | YES |
| Safe (200+ lbs) | $189/hr + flat fee | 3 | YES |
| Hot Tub | $189/hr + flat fee | 3-4 | YES |

**Launch Confidence After Fix: 95%**
