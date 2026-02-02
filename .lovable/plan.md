
# Jack v4.1 Optimization + Launch Readiness Checklist PDF

## Overview
This plan addresses two critical launch-day requirements:
1. **Jack v4.1 Optimization**: Enhance frontend visibility of Iron Law pricing, specialty flat fees, and enable Jack to receive pre-filled data from web form submissions
2. **Launch Readiness Checklist PDF**: Create a comprehensive print-ready PDF that covers all pricing, Jack scripts, and customer journey elements for launch-day verification

---

## Part 1: Jack v4.1 Optimization

### 1.1 Iron Law Visibility on Homepage

**Current State**: The homepage `PricingDisplay.tsx` shows the Heavy Items tab with a generic $169/hr rate. The Iron Law ($189/hr for 200+ lb items) is not prominently displayed.

**Enhancement**: Add a prominent Iron Law warning badge in the Heavy Items section that clearly distinguishes:
- $189/hr WITH TRUCK (default for 200+ lb items)
- $169/hr for Pool Tables (NOT Iron Law)

**Files to Modify**:
- `src/components/PricingDisplay.tsx` - Add Iron Law warning section with visual distinction

**Visual Design**:
```text
┌─────────────────────────────────────────────────┐
│ ⚠️ 200LB IRON LAW                               │
│ Items 200+ lbs require 3 movers @ $189/hr       │
│ Pianos • Gun Safes • Hot Tubs                   │
├─────────────────────────────────────────────────┤
│ ✓ Pool Tables NOT Iron Law → $169/hr            │
└─────────────────────────────────────────────────┘
```

### 1.2 Specialty Flat Fees Display

**Current State**: The Heavy Items tab lists items but doesn't show individual flat fees (Piano $150-350, Safe $100-250, Pool Table $350-550).

**Enhancement**: Replace generic list with detailed specialty pricing cards showing:
- Item type with icon
- Flat fee range
- Hourly rate
- Iron Law indicator

**Files to Modify**:
- `src/components/PricingDisplay.tsx` - Expand Heavy Items tab with detailed fee grid

**Visual Design**:
```text
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 🎹 Piano Moving  │ │ 🔐 Safe Moving   │ │ 🎱 Pool Table    │
│ $150-$350 flat   │ │ $100-$250 flat   │ │ $350-$550 flat   │
│ $189/hr (3 crew) │ │ $189/hr (3 crew) │ │ $169/hr (2-3)    │
│ ⚠️ IRON LAW      │ │ ⚠️ IRON LAW      │ │ ✓ NOT Iron Law   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 1.3 Jack Pre-Fill from Web Form (Contextual Updates)

**Current State**: When a user submits the web quote form, Jack doesn't receive any context about the submission. If the user then calls via the Voice Agent, Jack starts cold.

**Enhancement**: Enable Jack to receive contextual data from web form submissions via `conversation.sendContextualUpdate()`. When a quote is submitted:
1. Store quote data in sessionStorage
2. When VoiceAgent connects, send context to Jack with quote details
3. Jack can then reference: "I see you just submitted a quote for a 3-bedroom move on March 15th..."

**Files to Modify**:
- `src/pages/Quote.tsx` - Store quote data on submission
- `src/components/VoiceAgent.tsx` - Send contextual update when connecting

**Technical Implementation**:
```typescript
// Quote.tsx - After successful submission
sessionStorage.setItem('recentQuote', JSON.stringify({
  quoteNumber: quoteNumber,
  firstName: firstName,
  serviceType: data.serviceType,
  moveDate: data.moveDate,
  bedrooms: data.bedrooms,
  estimatedTotal: quote.total,
}));

// VoiceAgent.tsx - After connection
const recentQuote = sessionStorage.getItem('recentQuote');
if (recentQuote) {
  const quote = JSON.parse(recentQuote);
  conversation.sendContextualUpdate(
    `Customer ${quote.firstName} just submitted quote ${quote.quoteNumber} for a ${quote.bedrooms}-bedroom ${quote.serviceType} on ${quote.moveDate}. Estimated total: $${quote.estimatedTotal}.`
  );
}
```

---

## Part 2: Launch Readiness Checklist PDF

### 2.1 PDF Component Structure

**File to Create**: `src/components/admin/pdf/LaunchReadinessChecklistPDF.tsx`

A comprehensive 4-page PDF covering every launch verification item:

**Page 1: Pricing Verification Checklist**
```text
┌─────────────────────────────────────────────────────────────┐
│ PRICING VERIFICATION CHECKLIST                              │
├─────────────────────────────────────────────────────────────┤
│ [ ] Labor Only rates match: $139 / $169 / $239             │
│ [ ] Truck rates match: $159 / $189 / $259                  │
│ [ ] Iron Law @ $189/hr WITH TRUCK displays correctly       │
│ [ ] Iron Law @ $179/hr LABOR-ONLY noted                    │
│ [ ] Pool Table @ $169/hr (NOT Iron Law) confirmed          │
│ [ ] Electronic payment +$5 fee shows                       │
│ [ ] Specialty flat fees visible:                           │
│     - Pianos: $150 / $250 / $350                           │
│     - Safes: $100 / $175 / $250                            │
│     - Pool Tables: $350 / $550                             │
│     - Hot Tub: $400                                        │
│ [ ] Quote format HD-XXXXX everywhere                       │
└─────────────────────────────────────────────────────────────┘
```

**Page 2: Jack AI Voice Agent Checklist**
```text
┌─────────────────────────────────────────────────────────────┐
│ JACK AI VOICE AGENT VERIFICATION                            │
├─────────────────────────────────────────────────────────────┤
│ ELEVENLABS DASHBOARD:                                       │
│ [ ] Voice = Matt (deep, professional)                       │
│ [ ] Speed = 1.1                                             │
│ [ ] Turn Eagerness = Patient                                │
│ [ ] System prompt v4.0 uploaded                             │
│ [ ] RAG Knowledge Base v4.0 uploaded                        │
│ [ ] "Publish" clicked (live configuration)                  │
│                                                             │
│ JACK RESPONSE TESTS:                                        │
│ [ ] Test: "Piano" → quotes $189/hr (not $179)              │
│ [ ] Test: "Pool table" → quotes $169/hr (not $189)         │
│ [ ] Test: "Gun safe 300 lbs" → quotes $189/hr              │
│ [ ] Test: 6-point confirmation before ending call           │
│ [ ] Test: HD-XXXXX quote format used                        │
│                                                             │
│ DISCOVERY FLOW (90 seconds):                                │
│ [ ] Location (from/to)                                      │
│ [ ] Size (bedrooms)                                         │
│ [ ] Access (stairs/elevator)                                │
│ [ ] Truck need                                              │
│ [ ] Heavy items probe (CRITICAL)                            │
│ [ ] Quote + close                                           │
│                                                             │
│ 6-POINT CONFIRMATION:                                       │
│ [ ] First name                                              │
│ [ ] Last name                                               │
│ [ ] Quote number (HD-XXXXX)                                 │
│ [ ] Move date                                               │
│ [ ] Destination                                             │
│ [ ] Estimate amount                                         │
└─────────────────────────────────────────────────────────────┘
```

**Page 3: Customer Journey Verification**
```text
┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER JOURNEY VERIFICATION                               │
├─────────────────────────────────────────────────────────────┤
│ HOMEPAGE (/):                                               │
│ [ ] "$159/hr" rate displays in hero                         │
│ [ ] "Get Instant Quote" CTA works                           │
│ [ ] VoiceAgent floating button visible                      │
│ [ ] ChatWidget accessible                                   │
│ [ ] Pricing section shows all tiers                         │
│                                                             │
│ QUOTE PAGE (/quote):                                        │
│ [ ] 3-step wizard loads                                     │
│ [ ] Service type selection works                            │
│ [ ] Date picker works (no timezone issues)                  │
│ [ ] Phone validation (US only)                              │
│ [ ] Form submits successfully                               │
│ [ ] Quote confirmation shows HD-XXXXX                       │
│ [ ] Email sent notification appears                         │
│ [ ] 30-second call countdown works                          │
│                                                             │
│ EMAIL CONFIRMATION:                                         │
│ [ ] Subject contains HD-XXXXX quote number                  │
│ [ ] Branding correct (Handledly, not HM-)                   │
│ [ ] Pricing breakdown accurate                              │
│ [ ] No mention of "USDOT" or "BBB A+"                       │
│                                                             │
│ AI CALLBACK:                                                │
│ [ ] Call triggers after 30 seconds                          │
│ [ ] Jack receives quote context                             │
│ [ ] Professional greeting                                   │
└─────────────────────────────────────────────────────────────┘
```

**Page 4: Admin Dashboard & Edge Functions**
```text
┌─────────────────────────────────────────────────────────────┐
│ ADMIN & TECHNICAL VERIFICATION                              │
├─────────────────────────────────────────────────────────────┤
│ ADMIN DASHBOARD (/admin):                                   │
│ [ ] Login works                                             │
│ [ ] Leads table loads                                       │
│ [ ] Quote requests visible                                  │
│ [ ] Pricing Cheat Sheet PDF downloads                       │
│                                                             │
│ EDGE FUNCTIONS:                                             │
│ [ ] ai-chat - Responds to queries                           │
│ [ ] send-quote-email - Emails sent                          │
│ [ ] trigger-confirmation-call - Calls trigger               │
│ [ ] elevenlabs-conversation-token - Token generated         │
│                                                             │
│ SECRETS CONFIGURED:                                         │
│ [ ] ELEVENLABS_API_KEY                                      │
│ [ ] ELEVENLABS_AGENT_ID                                     │
│ [ ] RESEND_API_KEY                                          │
│ [ ] FROM_EMAIL                                              │
│ [ ] ADMIN_EMAIL                                             │
│                                                             │
│ EXTERNAL ACTIVATIONS (MANUAL):                              │
│ [ ] Google Ads pixel in index.html                          │
│ [ ] Facebook Pixel in index.html                            │
│ [ ] ElevenLabs "Publish" clicked                            │
│                                                             │
│ POST-LAUNCH MONITORING:                                     │
│ SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;      │
│ SELECT * FROM quote_requests ORDER BY created_at DESC;      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Download Hook

**File to Create**: `src/hooks/useLaunchReadinessPDF.tsx`
- Generates PDF blob using `pdf().toBlob()`
- Downloads as `handledly-launch-readiness-checklist-2026-02.pdf`
- Shows toast notification on success/failure

### 2.3 Admin Integration

**File to Modify**: `src/pages/admin/Overview.tsx`
- Add "Launch Readiness Checklist" download button alongside existing PDF buttons

---

## Files Summary

| Action | File Path | Description |
|--------|-----------|-------------|
| MODIFY | `src/components/PricingDisplay.tsx` | Add Iron Law visibility, specialty flat fees grid |
| MODIFY | `src/pages/Quote.tsx` | Store quote data in sessionStorage |
| MODIFY | `src/components/VoiceAgent.tsx` | Send contextual update with quote data |
| CREATE | `src/components/admin/pdf/LaunchReadinessChecklistPDF.tsx` | 4-page launch verification PDF |
| CREATE | `src/hooks/useLaunchReadinessPDF.tsx` | PDF generation hook |
| MODIFY | `src/pages/admin/Overview.tsx` | Add Launch Readiness download button |

---

## Technical Notes

### Iron Law Visibility Design
- Warning badge with gold/amber background
- Clear "$189/hr WITH TRUCK" vs "$179/hr LABOR-ONLY" distinction
- Green badge for Pool Table exception ($169/hr)

### Pre-Fill Context for Jack
- Uses `sendContextualUpdate()` method from ElevenLabs SDK
- Context only sent if quote submitted in same session
- Jack receives full context: name, quote number, service, date, estimate

### Launch Checklist PDF Design
- A4 portrait, 4 pages
- High contrast for print readability
- Checkbox format for verification
- Includes SQL snippets for monitoring

---

## Verification Tests After Implementation

1. **Homepage Check**: Verify Iron Law badge shows "$189/hr" prominently
2. **Heavy Items Tab**: Confirm specialty flat fees are visible
3. **Quote Flow**: Submit quote, then call via VoiceAgent - Jack should acknowledge the recent quote
4. **PDF Download**: Download Launch Readiness PDF from admin dashboard
5. **Print Test**: Print PDF and verify all checkboxes are readable
