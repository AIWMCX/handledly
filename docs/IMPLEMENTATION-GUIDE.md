# IMPLEMENTATION GUIDE: 200LB IRON LAW & PRICING UPDATE
## Handledly Moving - Version 3.0 Update

---

## OVERVIEW

This guide provides step-by-step instructions for updating ALL Handledly systems to implement:
1. **200lb Iron Law** (from 300lb)
2. **New February 2026 pricing**
3. **Complete consistency across frontend, backend, and AI systems**

**Target Launch Date**: February 1, 2026

---

## PRE-IMPLEMENTATION CHECKLIST

Before making any changes:

- [ ] Backup entire codebase
- [ ] Create new git branch: `feature/200lb-iron-law-pricing-v3`
- [ ] Review all files in this guide
- [ ] Allocate 45-60 minutes for implementation
- [ ] Schedule testing time post-implementation

---

## PHASE 1: CREATE MASTER DOCUMENTS (FOUNDATION)

### Step 1.1: Add Master Pricing Document

**File to create**: `docs/MASTER-PRICING-PROMPT.md`

**Action**: Copy the complete MASTER-PRICING-PROMPT.md content

**Purpose**: Single source of truth for all pricing and Iron Law rules

**Verification**: File exists and contains all 10 sections

---

### Step 1.2: Update Jack Knowledge Base

**File to create/replace**: `docs/jack-knowledge-base.md`

**Action**: Replace existing knowledge base with JACK-AI-KNOWLEDGE-BASE-v3.md

**Key Changes**:
- Version 2.0 → Version 3.0
- 300lb → 200lb throughout
- $149/hr → $139/hr (labor only, 2 movers)
- $149/hr → $159/hr (2 movers + truck)
- Updated all specialty item pricing
- Updated all scripts and examples

**Verification**: Search for "300" in file — should return 0 results (except in change log)

---

### Step 1.3: Add Quick Reference

**File to create**: `docs/JACK-QUICK-REFERENCE.md`

**Action**: Add quick reference cheat sheet

**Purpose**: Fast lookup for critical pricing and scripts

---

### Step 1.4: Add Colorado Scripts

**File to create**: `docs/COLORADO-SCRIPTS.md`

**Action**: Add Colorado-specific scripts guide

**Purpose**: Local knowledge and situational handling

---

## PHASE 2: UPDATE CORE CALCULATOR

### Step 2.1: Fix Quote Calculator

**File**: `src/lib/quoteCalculator.ts`

**Lines to change**: 231-232

**Current**:
```typescript
'safe-small': { 
  label: 'Gun Safe (Under 300lbs)', 
  basePrice: 100 
},
'safe-large': { 
  label: 'Gun Safe (300-800lbs)', 
  basePrice: 175 
}
```

**Updated**:
```typescript
'safe-small': { 
  label: 'Gun Safe (Under 200lbs)', 
  basePrice: 100 
},
'safe-large': { 
  label: 'Gun Safe (200-800lbs)', 
  basePrice: 175 
}
```

**Also check for**:
- Any references to `HEAVY_ITEM_THRESHOLD = 300`
- Should be `HEAVY_ITEM_THRESHOLD = 200`

**Verification**:
```bash
grep -n "300.*lb" src/lib/quoteCalculator.ts
# Should return 0 results
```

---

## PHASE 3: UPDATE FRONTEND COMPONENTS

### Step 3.1: Fix Services Page

**File**: `src/pages/Services.tsx`

**Change #1 - Lines 74-81** (Heavy Items Categories):

**Current**:
```typescript
{
  name: 'Heavy Items (Under 300 lbs)',
  rate: '$169/hour'
},
{
  name: 'Heavy Items (300+ lbs)',
  rate: '$179/hour'
}
```

**Updated**:
```typescript
{
  name: 'Heavy Items (Under 200 lbs)',
  rate: '$169/hour'
},
{
  name: 'Heavy Items (200+ lbs)',
  rate: '$179/hour'
}
```

**Change #2 - Line 177** (Price Badge):

**Current**:
```typescript
<Badge>From $149/hr</Badge>
```

**Updated**:
```typescript
<Badge>From $139/hr</Badge>
```

**Verification**:
```bash
grep -n "300.*lb\|149" src/pages/Services.tsx
# Should return 0 results
```

---

### Step 3.2: Fix Pricing Display Component

**File**: `src/components/PricingDisplay.tsx`

**Lines to change**: 140-141

**Current**:
```typescript
{ 
  name: 'Safes (Under 300 lbs)', 
  price: '$100' 
},
{ 
  name: 'Safes (300+ lbs)', 
  price: '$175+' 
}
```

**Updated**:
```typescript
{ 
  name: 'Safes (Under 200 lbs)', 
  price: '$100' 
},
{ 
  name: 'Safes (200+ lbs)', 
  price: '$175+' 
}
```

**Verification**:
```bash
grep -n "300.*lb" src/components/PricingDisplay.tsx
# Should return 0 results
```

---

## PHASE 4: UPDATE AI EDGE FUNCTIONS

### Step 4.1: Update AI Chat Function

**File**: `supabase/functions/ai-chat/index.ts` (or similar)

**Action**: Update system prompt to reference new knowledge base

**Key changes**:
- Load from `docs/jack-knowledge-base.md` (updated version)
- Ensure 200lb Iron Law is in prompt
- Verify pricing table is current

**Example**:
```typescript
const systemPrompt = `
You are Jack, an AI moving coordinator for Handledly Moving Services.

${await loadKnowledgeBase('docs/jack-knowledge-base.md')}

CRITICAL RULES:
- 200lb Iron Law is NON-NEGOTIABLE
- Always probe for heavy items
- Rates: 2M+T = $159/hr, 3M+T = $189/hr, Iron Law = $179/hr
- Always provide quote numbers

[...]
`;
```

---

### Step 4.2: Update Quote Email Template

**File**: `supabase/functions/send-quote-email/template.ts` (or similar)

**Changes**:
- Update pricing table in email
- Change 300lb → 200lb in Iron Law explanation
- Update rates: $149 → $139, $149 → $159

**Example template section**:
```html
<h3>Our Rates (February 2026)</h3>
<ul>
  <li>2 Movers (Labor Only): $139/hour</li>
  <li>2 Movers + Truck: $159/hour ⭐ Most Popular</li>
  <li>3 Movers + Truck: $189/hour</li>
  <li>Heavy Items (200+ lbs): $179/hour</li>
</ul>

<h3>200lb Iron Law</h3>
<p>
  For items weighing 200 pounds or more (pianos, safes, pool tables, 
  hot tubs), we require a minimum of 3 movers with truck at $179/hour. 
  This is our safety standard to protect your property and our team.
</p>
```

---

## PHASE 5: SEARCH & DESTROY REMAINING ISSUES

### Step 5.1: Global Search for "300"

**Command**:
```bash
grep -r "300.*lb" src/ docs/ supabase/
```

**Expected results**:
- Should find ONLY:
  - Change logs referencing old 300lb rule
  - Comments explaining the migration
  
**Action**: Fix any remaining 300lb references

---

### Step 5.2: Global Search for "$149"

**Command**:
```bash
grep -r "\$149" src/ docs/ supabase/
```

**Expected results**:
- Should find ONLY:
  - Change logs
  - Historical documentation
  
**Action**: Fix any remaining $149 references

---

### Step 5.3: Global Search for "300 lbs" (with space)

**Command**:
```bash
grep -r "300 lbs\|300 lb\|300lbs\|300lb" src/ docs/ supabase/
```

**Action**: Fix any variations

---

## PHASE 6: TESTING & VERIFICATION

### Step 6.1: Frontend Testing

**Services Page**:
- [ ] Visit `/services`
- [ ] Verify heavy items show "200+ lbs"
- [ ] Verify starting price shows "$139/hr"
- [ ] Check pricing table displays correct rates

**Pricing Component**:
- [ ] Check homepage pricing section
- [ ] Verify all rates match new pricing
- [ ] Verify safes show "200 lbs" threshold

**Quote Calculator**:
- [ ] Test quote with no heavy items → correct rate
- [ ] Test quote with safe (200+ lbs) → $179/hr applies
- [ ] Test quote with piano → 3 movers + $179/hr

---

### Step 6.2: AI Chat Testing

**Test Case 1: Simple Move**
```
User: "I need to move a 2-bedroom apartment"
Expected: Jack quotes $159/hr for 2 movers + truck
```

**Test Case 2: Heavy Item (Piano)**
```
User: "I have an upright piano"
Expected: Jack triggers Iron Law, explains 200lb rule, quotes $179/hr
```

**Test Case 3: Safe (Under 200)**
```
User: "I have a small gun safe, maybe 150 pounds"
Expected: Jack confirms under 200lbs, quotes $100 flat fee with 2 movers
```

**Test Case 4: Safe (200+)**
```
User: "I have a gun safe, around 300 pounds"
Expected: Jack applies Iron Law, 3 movers minimum, $179/hr
```

**Test Case 5: Unclear Weight**
```
User: "I have a really heavy dresser"
Expected: Jack probes: "Do you know the weight, or did it take 
multiple people to move originally?"
```

---

### Step 6.3: Email Testing

**Test quote email generation**:
- [ ] Generate test quote
- [ ] Verify email shows correct rates
- [ ] Verify 200lb Iron Law explanation is present
- [ ] Verify quote number format (HD-XXXXX)

---

## PHASE 7: DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] All code changes committed to feature branch
- [ ] All tests passing
- [ ] Frontend builds successfully
- [ ] Edge functions deploy successfully
- [ ] Documentation updated

### Deployment Steps

1. **Merge to main**:
   ```bash
   git checkout main
   git merge feature/200lb-iron-law-pricing-v3
   ```

2. **Deploy frontend**:
   ```bash
   npm run build
   npm run deploy # or your deployment command
   ```

3. **Deploy edge functions**:
   ```bash
   supabase functions deploy ai-chat
   supabase functions deploy send-quote-email
   ```

4. **Update documentation site** (if separate):
   - Upload new knowledge base
   - Update pricing pages
   - Update FAQ

### Post-Deployment Verification

- [ ] Production site shows correct pricing
- [ ] Test AI chat in production
- [ ] Submit test quote and verify email
- [ ] Check all public-facing pages for accuracy

---

## PHASE 8: TEAM COMMUNICATION

### Internal Announcement

**To**: All team members  
**Subject**: CRITICAL UPDATE: New Pricing & 200lb Iron Law (Effective Feb 1)

**Message**:
```
Team,

Effective February 1, 2026, we have TWO major changes:

1. NEW PRICING:
   - Labor only 2M: $139/hr (was $149/hr)
   - 2M + Truck: $159/hr (was $149/hr)
   - All other rates updated (see full pricing doc)

2. 200LB IRON LAW (was 300lb):
   - Trigger: Any item 200+ lbs
   - Requirements: 3 movers minimum, truck, $179/hr
   - NO EXCEPTIONS

Items that trigger Iron Law:
- All pianos
- Pool tables
- Safes 200+ lbs
- Hot tubs
- Commercial gym equipment

Jack AI has been updated. Please review the new knowledge base:
[Link to docs/jack-knowledge-base.md]

Questions? Slack me.
```

---

### Customer Communication (If Needed)

**For pending quotes**:
- Update any quotes in pipeline with new pricing
- Notify customers of rate changes (if quoting in advance)
- Honor old quotes if already accepted

**For active customers**:
- No need to proactively announce unless they ask
- Effective date is Feb 1, 2026

---

## PHASE 9: MONITORING & ITERATION

### Week 1 Post-Launch

**Monitor**:
- AI chat conversations (ensure Iron Law triggering correctly)
- Quote conversion rates (watch for pricing objections)
- Customer questions about 200lb rule

**Adjust if needed**:
- Refine Jack's explanation scripts
- Add FAQs if common questions emerge
- Update edge cases in knowledge base

### Week 2-4 Post-Launch

**Gather data**:
- How often Iron Law triggers
- Customer acceptance rate for $179/hr
- Any confusion points

**Iterate**:
- Improve probing scripts if customers surprised by Iron Law
- Adjust value framing if price objections common
- Update training docs based on real conversations

---

## ROLLBACK PLAN (IF NEEDED)

### Emergency Rollback Steps

If critical issues emerge:

1. **Revert git commit**:
   ```bash
   git revert [commit-hash]
   git push
   ```

2. **Redeploy previous version**:
   ```bash
   git checkout [previous-tag]
   npm run deploy
   supabase functions deploy ai-chat
   ```

3. **Restore old knowledge base**:
   - Copy from git history
   - Redeploy edge functions

4. **Communicate rollback**:
   - Internal team notification
   - Update any customer-facing materials

---

## SUCCESS METRICS

### Technical Success
- [ ] Zero "300lb" references in production code
- [ ] Zero "$149" references in production code
- [ ] AI correctly applies 200lb Iron Law
- [ ] All pricing displays accurate

### Business Success
- [ ] Quote conversion rate stable or improved
- [ ] Customer satisfaction maintained
- [ ] Fewer underquoted jobs (due to Iron Law)
- [ ] Clear, consistent customer communication

---

## FREQUENTLY ASKED QUESTIONS

### Why 200lb instead of 300lb?

**Answer**: Safety and service quality. 200lb is the threshold where 2-mover teams become unsafe/inefficient. Lowering from 300lb prevents underquoting and reduces injury risk.

### What if a customer is upset about $179/hr?

**Jack's script**:
```
"I understand. The $179/hour covers the 3-mover crew and heavy-duty 
equipment needed to protect your [item] and your home. It's our 
safety standard — we can't compromise on that."
```

### What if we're unsure if item is 200+?

**Jack's approach**:
- Probe for weight or how many people moved it
- If unclear, assume Iron Law applies
- Better to be prepared than underprepare

### Can we waive Iron Law for loyal customers?

**Answer**: NO. Iron Law is safety-based, not price-based. It protects the customer AND our team. No exceptions.

---

## FINAL CHECKLIST

Before considering this update complete:

### Code
- [ ] All files updated per this guide
- [ ] No 300lb references remain (except change logs)
- [ ] No $149 references remain (except change logs)
- [ ] All tests passing

### Documentation
- [ ] Master pricing document created
- [ ] Jack knowledge base updated to v3
- [ ] Quick reference created
- [ ] Colorado scripts added

### Testing
- [ ] Frontend displays correct pricing
- [ ] AI applies 200lb Iron Law correctly
- [ ] Quote emails show new rates
- [ ] Edge cases handled (unclear weights, etc.)

### Deployment
- [ ] Changes merged to main
- [ ] Frontend deployed
- [ ] Edge functions deployed
- [ ] Production verified

### Communication
- [ ] Team notified
- [ ] Training completed
- [ ] FAQs updated

---

## CONTACT & SUPPORT

**Questions during implementation?**

- Technical: [Dev team contact]
- Business logic: [Operations contact]
- Emergency: [On-call contact]

**Post-implementation issues?**

- Report in: [Slack channel]
- Create ticket: [Issue tracker]

---

**END OF IMPLEMENTATION GUIDE**

Version 3.0 | February 2026 | 200lb Iron Law & New Pricing
