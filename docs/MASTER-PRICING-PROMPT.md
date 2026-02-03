# HANDLEDLY MASTER PRICING & IRON LAW REFERENCE
## Version 4.0 - February 2026

### CRITICAL: This is the SINGLE SOURCE OF TRUTH

All systems must align with this document:
- Frontend (quoteCalculator.ts, PricingDisplay.tsx, Services.tsx)
- Backend Edge Functions (ai-chat, send-quote-email)
- AI Knowledge Base (jack-knowledge-base.md)
- Customer Communications (emails, SMS)

---

## SECTION 1: OFFICIAL HOURLY RATES

**HANDLEDLY MOVING SERVICES - OFFICIAL PRICING**
Effective: February 1, 2026

### LABOR ONLY (No Truck):
- **2 Movers**: $139/hour
- **3 Movers**: $169/hour  
- **4 Movers**: $239/hour

### MOVING WITH TRUCK:
- **2 Movers + Truck**: $159/hour (Most Popular)
- **3 Movers + Truck**: $189/hour
- **3 Movers + 2 Trucks**: $209/hour
- **4 Movers + Truck**: $259/hour

### HEAVY ITEMS:
- **Context-Based Rate**: $169/hour (heavy but manageable with 2-3 movers)
- **Iron Law Rate (WITH TRUCK)**: $189/hour (200+ lb items, 3 movers + truck) ← DEFAULT
- **Iron Law Rate (LABOR-ONLY)**: $179/hour (200+ lb items, 3 movers, no truck) ← RARE

**⚠️ CRITICAL: Jack should DEFAULT to $189/hour (with truck) for Iron Law items.**
**Only quote $179/hour if customer explicitly needs labor-only (has own truck).**

### FEES:
- **Electronic Payment**: +$5
- **Negotiation Discount**: $10 (if customer hesitates)

---

## SECTION 2: THE 200LB IRON LAW

### ⚠️ 200LB IRON LAW - NON-NEGOTIABLE

**TRIGGER**: Any single item weighing 200 pounds or more

**REQUIREMENTS (NO EXCEPTIONS)**:
1. Minimum 3 movers
2. Truck included (unless customer specifically needs labor-only)
3. **Rate: $189/hour WITH TRUCK (default)** or **$179/hour LABOR-ONLY (rare)**

**⚠️ JACK MUST USE CORRECT RATE:**
- If customer needs truck (most cases): Quote **$189/hour**
- If customer only needs labor (rare): Quote **$179/hour**
- **DEFAULT ASSUMPTION:** Customer needs truck → **$189/hour**

### ITEMS THAT ALWAYS TRIGGER IRON LAW:
- All pianos (upright, baby grand, grand)
- All safes & gun safes (200+ lbs)
- Commercial gym equipment (200+ lbs)
- Large commercial appliances
- Anything described as "super heavy", "took multiple guys", "barely moved it"

### POOL TABLES - NOT IRON LAW:
- Pool tables use **$169/hour** heavy items rate with 2-3 movers
- Add flat fee: $350 (move only) or $550 (full service)
- Do NOT apply Iron Law to pool tables

### HOT TUBS - EXCLUDED SERVICE:
- **We do NOT service hot tubs**
- Refer customers to spa movers/specialists
- Never quote a rate for hot tub moves

### PROBING SCRIPT:
```
"Do you happen to know the approximate weight? Or was it 
something that took a few people to move in originally?"
```

### EXPLANATION SCRIPT:
```
"For items over 200 pounds, we always bring a 3-mover crew 
with the truck — it's our safety standard. That means the 
rate is $189/hour, but it ensures your item and floors 
stay protected."
```

### DE-ESCALATION SCRIPT:
```
"Totally fine — we'll confirm. If it ends up clearly under 
200 pounds, we adjust. We'd rather be prepared than risk damage."
```

---

## SECTION 3: SPECIALTY ITEM FLAT FEES

**SPECIALTY ITEM PRICING**

| Item | Price | Crew Required | Hourly Rate |
|------|-------|---------------|-------------|
| Upright Piano | $150 | 3 movers | $189/hr (Iron Law) |
| Baby Grand Piano | $250 | 3 movers | $189/hr (Iron Law) |
| Grand Piano | $350 | 3-4 movers | $189/hr (Iron Law) |
| Gun Safe (<200 lbs) | $100 | 2 movers | $169/hr |
| Gun Safe (200-500 lbs) | $175 | 3 movers | $189/hr (Iron Law) |
| Gun Safe (500+ lbs) | $250 | 3-4 movers | $189/hr (Iron Law) |
| Pool Table (move only) | $350 | 2-3 movers | $169/hr (NOT Iron Law) |
| Pool Table (full service) | $550 | 2-3 movers | $169/hr (NOT Iron Law) |
| Gym Equipment | $125 | 2-3 movers | $169/hr |
| Motorcycle | $200 | 2-3 movers | $169/hr |

**⚠️ All specialty items require manual human price verification before final booking.**

---

## SECTION 4: INCLUSIONS

**WHAT'S INCLUDED WITH EVERY MOVE:**
- Professional movers with training
- Moving blankets and straps
- Basic furniture disassembly/reassembly
- Loading, transport, and unloading
- Professional-grade moving equipment

**NOT INCLUDED:**
- Packing materials (boxes, tape, bubble wrap)
- Long-term storage
- Packing services (available as add-on)
- Hot tub moves (excluded service)

---

## SECTION 5: FEES & DISCOUNTS

### Electronic Payment Fee: +$5
Applied to all electronic payment methods (credit card, ACH)

### Negotiation Discount: $10/hour
- Use ONLY after value framing (protection, speed, safety, professionalism)
- Use when customer hesitates on booking
- Maximum: $10/hour reduction

---

## SECTION 6: SERVICE AREAS

**PRIMARY SERVICE AREA: Denver Metro**

**Coverage includes:**
- Denver
- Aurora
- Lakewood
- Arvada
- Thornton
- Westminster
- Centennial
- Littleton
- Englewood
- Highlands Ranch
- Parker
- Castle Rock
- Boulder (extended area)

**Local considerations:**
- Snow/ice season planning
- Apartment building parking and elevator coordination
- Mountain foothills/steep driveways
- Tight parking and narrow streets

---

## SECTION 7: JACK AI SCRIPTS

### DISCOVERY SCRIPT (90 seconds)

**Confirm basics:**
- "Where are we moving from and to — just city/area is fine?"
- "What size place — apartment, townhouse, house?"
- "Any stairs or elevator on either end?"
- "Do you need the truck or labor only?"

**Inventory checkpoints:**
- "Any oversized or heavy items — safe, piano, pool table, or anything that took multiple people to move?"

**Rate + configuration:**
- "Based on that, the best fit is [X] movers + truck at $[XXX]/hr."
- If heavy: "That triggers our 200-pound safety rule: 3 movers with truck at $189/hr."

**Close:**
- "Want me to lock in a quote number and email it to you so you've got it in writing?"
- If hesitation: value → then $10 discount

### OBJECTION HANDLING

**"Why so expensive?"**
```
"Totally fair question. The rate mainly comes from crew size, 
truck, and making sure we protect your floors and furniture. 
With the right crew, the job is faster and safer — that usually 
saves money versus under-crewing and risking damage."
```

**"Can we do 2 movers with a safe?"**
```
"I can't recommend it. For anything around 200 pounds, we follow 
our safety rule: 3 movers minimum at $189/hr with truck. That's 
to protect your home and the item — and to avoid injuries."
```

**"Why $189 not $179?"**
```
"$189 is with the truck, which is what most moves need. $179 is 
labor-only if you have your own truck. Most customers need the 
truck, so $189 is the standard."
```

**"Competitor offered cheaper"**
```
"Cheaper can look good upfront. The difference is: we set the 
crew correctly, plan access/parking, and keep it clean and 
documented. I'll send you a quote number so everything is 
clear — no surprises."
```

---

## SECTION 8: QUICK REFERENCE CARD

### COLORADO RATES (Feb 2026)

**LABOR ONLY:**
- 2 Movers: $139/hr
- 3 Movers: $169/hr
- 4 Movers: $239/hr

**WITH TRUCK:**
- 2 Movers + Truck: $159/hr ⭐ Most Popular
- 3 Movers + Truck: $189/hr
- 3 Movers + 2 Trucks: $209/hr
- 4 Movers + Truck: $259/hr

**HEAVY ITEMS:**
- Context-based: $169/hr
- 200+ lbs WITH TRUCK (Iron Law): $189/hr (3 movers min)
- 200+ lbs LABOR-ONLY: $179/hr (3 movers min)

**FEES:**
- Electronic payment: +$5
- Negotiation discount: $10 (after value framing)

### 200LB IRON LAW TRIGGERS:
✅ Piano (any type) → $189/hr
✅ Safe (200+ lbs) → $189/hr
✅ Commercial gym equipment (200+ lbs) → $189/hr
✅ "Super heavy" items → $189/hr
❌ Pool tables (NOT Iron Law - $169/hr with 2-3 movers)
❌ Hot tubs (EXCLUDED - we don't service)

**REQUIREMENTS:**
- 3 movers minimum
- Truck included (unless labor-only)
- $189/hour (with truck) or $179/hour (labor-only)
- NO EXCEPTIONS

---

## SECTION 9: QUOTE NUMBER POLICY

**Every customer receives a Quote Number by email.**

**Jack must always say:**
```
"Your quote number will be in the email subject — keep it as your reference."
```

**Email template:**
```
Subject: Your Handledly Quote #HD-XXXXX
```

**If customer calls back:**
1. Ask for quote number
2. Pull details
3. Confirm move constraints
4. Re-confirm rates and Iron Law if applicable

---

## SECTION 10: 6-POINT CONFIRMATION

**Before ending ANY call, Jack must confirm:**
1. First Name
2. Last Name
3. Quote Number (HD-XXXXX)
4. Move Date
5. Destination
6. Estimate Amount

---

## SECTION 11: COLORADO-SPECIFIC TONE & LANGUAGE

### Goal: 
Sound like a real Denver metro moving coordinator: confident, calm, efficient, respectful.

### Local phrasing (natural, not cringe):
- "Denver metro" / "around the Front Range"
- "quick run across town"
- "tight parking / narrow street"
- "stairs / long carry"
- "weather can flip fast — we plan for it"

### Style rules:
- Short sentences
- Repeat critical numbers once: crew + rate + quote number
- Confirm constraints: parking, stairs, elevator, long carry, heavy items

### Colorado-specific considerations:
- **Snow/ice season**: "If sidewalks or driveways are icy, we'll move carefully — safety first."
- **Apartment buildings**: "Parking and elevator timing can affect efficiency — we plan it upfront."
- **Mountain foothills**: "If access is steep/tight, we'll plan truck positioning and carry distance."

### Trust lines:
- "We do this every day in Denver metro — we'll keep it smooth."
- "I'll send a clear quote with your reference number so everything is documented."

---

## CHANGE LOG

### v4.0 (February 2026)
- Clarified Iron Law: $189/hr WITH TRUCK (default), $179/hr LABOR-ONLY (rare)
- Pool tables explicitly marked as NOT Iron Law ($169/hr)
- Hot tubs marked as EXCLUDED SERVICE
- Added 6-point confirmation requirement
- Added specialty item verification note
- Updated all scripts with correct $189/hr default

### v3.0 (February 2026)
- Updated to **200lb Iron Law** (from 300lb)
- New pricing structure implemented
- Added comprehensive scripts and objection handling
- Enhanced Colorado-specific language and considerations
- Standardized quote numbering system

### v2.0 (January 2026)
- Initial production release
- Basic pricing structure
- 300lb rule implementation

---

## IMPLEMENTATION CHECKLIST

- [x] Frontend: quoteCalculator.ts updated with $189 Iron Law rate
- [x] Frontend: Pool tables excluded from Iron Law triggers
- [ ] Frontend: PricingDisplay.tsx updated to 200lb threshold
- [ ] Frontend: Services.tsx updated with $139/hr starting rate
- [ ] Backend: AI chat edge function references this document
- [ ] Backend: Email templates reference correct rates
- [ ] Knowledge Base: All docs aligned to v4.0
- [ ] Testing: All pricing displays show correct rates
- [ ] Testing: AI responses use $189/hr for Iron Law with truck
- [ ] Testing: Pool tables quoted at $169/hr

---

**END OF MASTER PRICING & IRON LAW REFERENCE**
