# Edge Functions Documentation

## Overview

The Handledly platform uses 6 Supabase Edge Functions (Deno runtime) to handle backend logic securely.

---

## 1. Edge Function Inventory

| Function | Purpose | Trigger | External APIs |
|----------|---------|---------|---------------|
| ai-chat | AI conversation | HTTP POST | Lovable AI (Gemini) |
| send-quote-email | Email delivery | HTTP POST | Resend |
| trigger-confirmation-call | Voice call initiation | HTTP POST | ElevenLabs, Twilio |
| handle-call-status | Webhook handler | HTTP POST (webhook) | - |
| send-sms-notification | SMS delivery | HTTP POST | Twilio |
| elevenlabs-conversation-token | Voice auth token | HTTP POST | ElevenLabs |

---

## 2. ai-chat

**File**: `supabase/functions/ai-chat/index.ts`
**Lines**: 248
**Purpose**: Conversational AI assistant for quote collection

### Request Schema
```typescript
interface ChatRequest {
  message: string;                    // User message
  conversationHistory?: Message[];    // Previous messages (max 10)
  sessionId?: string;                 // Browser session ID
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

### Response Schema
```typescript
interface ChatResponse {
  response: string;                   // AI response text
  sessionId: string;                  // Session ID
  action: {                           // Optional action
    type: 'submit_quote';
    data: QuoteData;
  } | null;
}
```

### System Prompt Overview
The AI (Jack) is configured as a Denver moving specialist with:
- Company info (phone: 878-218-7397)
- Pricing structure ($139-$259/hour based on crew, Iron Law rate $179/hr for 200+ lb items)
- Quote collection workflow (7 steps)
- Quote estimation guide by bedroom count

### Quote Extraction
When all info is collected, AI responds with:
```
[QUOTE_READY]
{
  "fullName": "...",
  "email": "...",
  "phone": "...",
  ...
}
[/QUOTE_READY]
```

This is parsed and returned as an `action` for the frontend to handle.

### API Integration
```typescript
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-3-flash-preview',
    messages,
    stream: false,
    max_tokens: 800,
  }),
});
```

---

## 3. send-quote-email

**File**: `supabase/functions/send-quote-email/index.ts`
**Lines**: 554
**Purpose**: Send branded HTML quote confirmation emails

### Request Schema
```typescript
interface QuoteEmailRequest {
  leadId: string;
  verificationToken?: string;
  conversationId?: string;
  firstName: string;
  lastName: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  crewSize: number;
  hourlyRate: number;
  estimatedHours: number;
  laborCost: number;
  specialtyFee: number;
  totalQuote: number;
  quoteNumber?: string;
  moveDate?: string;
  moveFrom?: string;
  moveTo?: string;
  specialtyItems?: string[];
  notes?: string;
}
```

### Email Template Features
- Branded header with Handledly logo
- Quote number badge
- Move details section (from/to/date)
- Price breakdown table
- "Everything Included" checklist
- CTA buttons (call, schedule)
- 30-second call notice

### Sender Configuration
```typescript
{
  from: 'Handledly Moving Services <noreply@handledly.com>',
  replyTo: 'hello@handledly.com',
  subject: `Your Moving Quote: $${totalQuote} - Handledly Moving Services`
}
```

### Retry Logic
```typescript
async function sendEmailWithRetry(emailData: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await resend.emails.send(emailData);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}
```

---

## 4. trigger-confirmation-call

**File**: `supabase/functions/trigger-confirmation-call/index.ts`
**Lines**: 609
**Purpose**: Initiate AI voice confirmation calls with failsafes

### Request Schema
```typescript
interface CallRequest {
  leadId: string;
  verificationToken?: string;
  firstName?: string;
  lastName?: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  totalQuote: number;
  quoteNumber?: string;
  moveDate?: string;
  moveFrom?: string;
  moveTo?: string;
  crewSize: number;
  estimatedHours: number;
}
```

### ElevenLabs Integration
```typescript
const response = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
  method: 'POST',
  headers: {
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    agent_id: ELEVENLABS_AGENT_ID,
    agent_phone_number_id: ELEVENLABS_PHONE_NUMBER_ID,
    to_number: formattedPhone,
    conversation_initiation_client_data: {
      dynamic_variables: {
        customer_name: firstName,
        quote_total: totalQuote.toString(),
        move_date: moveDateFormatted,
        // ... more variables
      }
    }
  }),
});
```

### Retry Logic with Exponential Backoff
```typescript
async function withRetry<T>(fn: () => Promise<T>, options = {}) {
  const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 8000 } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

### Multi-Channel Failsafe
If call fails after retries:
1. **SMS Fallback** → Sends text via Twilio
2. **Admin Email** → Alerts hello@handled.com, aiwmcsrm@gmail.com
3. **Status Update** → Marks lead as 'failed_sms_sent' or 'failed'

---

## 5. handle-call-status

**File**: `supabase/functions/handle-call-status/index.ts`
**Lines**: 418
**Purpose**: Process ElevenLabs post-call webhooks

### Webhook Types
```typescript
type WebhookType = 
  | 'post_call_transcription'  // Call completed
  | 'call_initiation_failure'   // Call failed to connect
  | 'post_call_audio';          // Audio recording (acknowledged only)
```

### HMAC Signature Validation
```typescript
async function validateHmacSignature(
  body: string,
  signatureHeader: string | null,  // "t=timestamp,v0=hash"
  secret: string
): Promise<{ valid: boolean; reason?: string }> {
  // Parse timestamp and hash from header
  // Validate timestamp within 30 minutes
  // Compute HMAC-SHA256(secret, "timestamp.body")
  // Constant-time comparison
}
```

### Lead Lookup Strategy
1. Search by `conversation_id` (primary)
2. Fallback to `call_sid`
3. If neither found, return 200 with warning

### Data Updates
```typescript
// On post_call_transcription
await supabase.from('leads').update({
  confirmation_call_status: 'completed' | 'busy' | 'no_answer',
  call_transcript: formatTranscript(data.transcript),
  call_summary: data.analysis?.transcript_summary,
  call_duration_seconds: data.metadata?.call_duration_secs,
  call_ended_at: new Date().toISOString(),
}).eq('id', lead.id);
```

---

## 6. send-sms-notification

**File**: `supabase/functions/send-sms-notification/index.ts`
**Purpose**: Send SMS alerts for new leads

### Request Schema
```typescript
interface SMSRequest {
  leadId: string;
  verificationToken?: string;
  customerName: string;
  phone: string;
  serviceType: string;
  totalQuote: number;
}
```

### Twilio Integration
```typescript
const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
const credentials = btoa(`${sid}:${authToken}`);

await fetch(twilioUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    To: phone,
    From: TWILIO_PHONE_NUMBER,
    Body: messageBody,
  }),
});
```

---

## 7. elevenlabs-conversation-token

**File**: `supabase/functions/elevenlabs-conversation-token/index.ts`
**Purpose**: Generate signed URLs for voice agent WebRTC connections

### Response Schema
```typescript
interface TokenResponse {
  signed_url: string;
  agent_id: string;
}
```

### ElevenLabs Token API
```typescript
const response = await fetch(
  `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
  {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  }
);
```

---

## 8. Security Measures

### All Functions
- CORS headers for browser requests
- OPTIONS preflight handling
- Input validation
- Error sanitization (no internal details exposed)

### Token Verification
```typescript
// Quote-related functions verify:
// 1. Lead exists
// 2. Token matches
// 3. Lead created within 5 minutes
const { data: lead } = await supabase
  .from('leads')
  .select('*')
  .eq('id', leadId)
  .eq('verification_token', verificationToken)
  .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
  .single();
```

### Webhook Security
- HMAC signature validation
- Timestamp replay prevention (30-minute window)
- Constant-time comparison

---

## 9. Environment Variables

| Variable | Function | Purpose |
|----------|----------|---------|
| SUPABASE_URL | All | Database connection |
| SUPABASE_ANON_KEY | All | Public API key |
| SUPABASE_SERVICE_ROLE_KEY | All | Admin operations |
| LOVABLE_API_KEY | ai-chat | Gemini access |
| ELEVENLABS_API_KEY | trigger-call, token | Voice AI |
| ELEVENLABS_AGENT_ID | trigger-call, token | Agent config |
| ELEVENLABS_PHONE_NUMBER_ID | trigger-call | Outbound calls |
| ELEVENLABS_WEBHOOKS_SECRET | handle-call-status | HMAC validation |
| RESEND_API_KEY | send-quote-email | Email delivery |
| TWILIO_ACCOUNT_SID | trigger-call, sms | SMS/Voice |
| TWILIO_AUTH_TOKEN | trigger-call, sms | Authentication |
| TWILIO_PHONE_NUMBER | trigger-call, sms | Sender number |

---

## 10. Cost Estimates

| Function | Trigger Frequency | Cost per Call | Monthly (100 leads) |
|----------|-------------------|---------------|---------------------|
| ai-chat | Per message | ~$0.001 | $10-50 |
| send-quote-email | Per quote | ~$0.001 | $0.10 |
| trigger-confirmation-call | Per quote | ~$0.10-0.20 | $10-20 |
| handle-call-status | Per call | Free (internal) | $0 |
| send-sms-notification | Per quote | ~$0.008 | $0.80 |
| elevenlabs-conversation-token | Per voice session | Free (internal) | $0 |

**Estimated Monthly Total**: $20-75 for 100 leads

---

*Last Updated: January 25, 2026*
