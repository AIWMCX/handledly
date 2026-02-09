import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { 
  validateRequestSize, 
  secureJsonResponse, 
  secureErrorResponse,
  getClientIp,
  securityHeaders 
} from "../_shared/security.ts";
import { aiChatRequestSchema, validateRequest } from "../_shared/validation.ts";

// Rate limiting configuration
const RATE_LIMIT_MAX = 30; // 30 requests per minute
const RATE_LIMIT_WINDOW = 1; // 1 minute

// Cost per AI message (approximate for Gemini Flash)
const AI_COST_PER_MESSAGE = 0.002;

// Initialize Supabase client for cost tracking
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
};

// Check if circuit breaker allows this request
async function checkCircuitBreaker(): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('check_circuit_breaker', {
      p_service_name: 'ai_chat'
    });
    
    if (error) {
      console.warn('[ai-chat] Circuit breaker check failed:', error.message);
      return { allowed: true }; // Fail open
    }
    
    return { allowed: data === true, reason: data ? undefined : 'Circuit breaker tripped' };
  } catch (err) {
    console.warn('[ai-chat] Circuit breaker error:', err);
    return { allowed: true }; // Fail open
  }
}

// Record cost after successful AI call (non-blocking)
function recordCostAsync(sessionId?: string, ipHash?: string): void {
  const supabase = getSupabaseClient();
  supabase.rpc('record_service_cost', {
    p_service_type: 'ai_chat',
    p_cost: AI_COST_PER_MESSAGE,
    p_session_id: sessionId || null,
    p_ip_hash: ipHash || null,
    p_metadata: {}
  }).then(({ error }) => {
    if (error) console.warn('[ai-chat] Failed to record cost:', error.message);
  });
}

// Professional moving assistant system prompt - ANTI-RAMBLING v5.0
// Updated February 2026 with short-burst conversational rules
const SYSTEM_PROMPT = `You are Jack, a friendly and professional moving specialist for Handledly Moving Services in Denver, Colorado.

## 🚨 ANTI-RAMBLING RULES (TOP PRIORITY — FOLLOW ON EVERY MESSAGE)

1. **Maximum 2 short sentences per message. Under 40 words total.**
2. **Ask ONE question per message. Then STOP and wait.**
3. **Never stack multiple questions in one message.**
4. **If you can't say it in one breath, it's too long. Cut it in half.**

### ❌ NEVER DO THIS:
"Hi! I'd love to help you with your move. Where are you moving from and to? What size place is it? Any stairs? Any heavy items like pianos or safes?"

### ✅ ALWAYS DO THIS:
"Hey! Where are you moving from and to?"
[wait for response]
"Nice. What size place?"
[wait for response]
"Any stairs?"

## YOUR PERSONALITY
- Warm, professional, genuinely helpful
- Knowledgeable about moving logistics
- Patient — moving is stressful!
- Never pushy, but always guiding toward a quote
- Speak naturally like a real person, not a robot
- Short bursts. Ping-pong conversation. Not monologues.

## COMPANY INFORMATION
- Company: Handledly Moving Services
- Main Phone: (878) 218-7397
- Local Denver: (719) 920-3282
- Email: hello@handledly.com
- Location: Denver, Colorado
- Hours: Monday-Saturday 7am-7pm, Sunday 8am-5pm

## SERVICES & PRICING (February 2026)
**Labor Only (no truck):**
- 2 Movers: $139/hour
- 3 Movers: $169/hour
- 4 Movers: $239/hour

**Moving with Truck:**
- 2 Movers + Truck: $159/hour (Most Popular)
- 3 Movers + Truck: $189/hour
- 3 Movers + 2 Trucks: $209/hour
- 4 Movers + Truck: $259/hour

**Heavy Items:** $169/hour (adjusts for 200+ lb items)
**Electronic Payment Fee:** +$5
**Negotiation:** Offer $10/hr discount if customer hesitates.

## ⚠️ 200LB IRON LAW (NON-NEGOTIABLE)
Any item 200+ pounds requires:
- Minimum 3 movers
- Truck included
- Rate: **$189/hour** (or $179/hour labor-only)

**Iron Law triggers:** All pianos, safes 200+ lbs, commercial gym equipment 200+ lbs.
**Pool tables are NOT Iron Law:** $169/hour with 2-3 movers + flat fee ($350 move-only / $550 full service).

**Short explanation:** "Over 200 pounds means 3 movers with truck at $189/hr. Safety standard."

## SERVICE AREAS
Denver, Aurora, Lakewood, Arvada, Westminster, Thornton, Centennial, Boulder, and surrounding areas within 50 miles.

## PHONE REQUIREMENTS
US phone numbers only. If non-US: "We only service Denver metro with US phone numbers."

## CONVERSION STRATEGY (Keep it natural — never pushy)
- After answering a question, naturally transition: "Want me to put together a quick estimate?"
- If 3+ messages without quote request: "I can get you a quick quote — takes 30 seconds!"
- Keep it light. One sentence. Not a sales pitch.

## QUOTE COLLECTION (ONE question at a time)
Collect in this order, ONE per message:
1. "What size place and how many bedrooms?"
2. "Where are you moving from and to?"
3. "When do you need to move?"
4. "Any heavy items — piano, pool table, safe?"
5. "What's your name, email, and phone number?"

**CRITICAL: Ask ONE question, get the answer, then ask the next. Never combine.**
**ALWAYS ask about heavy items — determines crew size and rate.**

## QUOTE ESTIMATION
- Studio/1BDR: 2-3 hrs, 2 movers (~$318-$477)
- 2BDR: 3-4 hrs, 2-3 movers (~$477-$756)
- 3BDR: 4-6 hrs, 3 movers (~$756-$1134)
- 4BDR+: 6-8 hrs, 4 movers (~$1554-$2072)
- 200+ lb items: $189/hr with 3 movers + truck

## WHEN READY TO SUBMIT
When you have ALL info (name, email, phone, from, to, date, bedrooms), respond with:

[QUOTE_READY]
{
  "fullName": "Customer Name",
  "email": "email@example.com",
  "phone": "1234567890",
  "moveFromAddress": "From City/Address",
  "moveToAddress": "To City/Address",
  "moveDate": "YYYY-MM-DD or description",
  "serviceType": "local-moving",
  "bedrooms": 2,
  "specialItems": ["piano", "pool-table"],
  "notes": "Any notes including heavy items"
}
[/QUOTE_READY]

Then send a short confirmation: "Awesome! Quote's on its way to your email. We'll give you a quick call to confirm."

Remember: Short messages. ONE question at a time. Ping-pong, not monologue.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
  sessionId?: string;
  ipHash?: string;
}

interface QuoteData {
  fullName: string;
  email: string;
  phone: string;
  moveFromAddress?: string;
  moveToAddress?: string;
  moveDate?: string;
  serviceType?: string;
  bedrooms?: number;
  specialItems?: string[];
  notes?: string;
}

// Extract quote data from AI response if present
function extractQuoteData(response: string): { cleanResponse: string; quoteData: QuoteData | null } {
  const quoteRegex = /\[QUOTE_READY\]([\s\S]*?)\[\/QUOTE_READY\]/;
  const match = response.match(quoteRegex);
  
  if (!match) {
    return { cleanResponse: response, quoteData: null };
  }
  
  try {
    const jsonStr = match[1].trim();
    const quoteData = JSON.parse(jsonStr) as QuoteData;
    
    // Remove the quote block from the response
    const cleanResponse = response.replace(quoteRegex, '').trim();
    
    return { cleanResponse, quoteData };
  } catch (error) {
    console.error('[ai-chat] Failed to parse quote data:', error);
    return { cleanResponse: response, quoteData: null };
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    // VALIDATE REQUEST SIZE (100KB limit)
    const { body: bodyText, error: sizeError } = await validateRequestSize(req, corsHeaders);
    if (sizeError) return sizeError;

    // Parse and validate the request body with zod
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      return secureErrorResponse('Invalid JSON in request body', corsHeaders, 400);
    }

    const validation = validateRequest(aiChatRequestSchema, parsedBody);
    if (!validation.success || !validation.data) {
      console.warn('[ai-chat] Validation failed:', validation.errors);
      return secureJsonResponse(
        { error: 'Invalid request', details: validation.errors },
        corsHeaders,
        400
      );
    }

    const { message, conversationHistory = [], sessionId } = validation.data;

    // RATE LIMIT CHECK - Prevent abuse
    const clientIp = getClientIp(req);
    const supabase = getSupabaseClient();
    
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit_readonly', {
      p_table_name: 'edge_ai_chat',
      p_identifier: clientIp,
      p_max_requests: RATE_LIMIT_MAX,
      p_time_window_minutes: RATE_LIMIT_WINDOW,
    });
    
    if (!rateLimitError && !allowed) {
      console.warn(`[ai-chat] Rate limit exceeded for ${clientIp}`);
      return secureJsonResponse(
        { 
          error: 'Too many requests. Please wait a moment before trying again.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryable: true,
          retryAfter: 60,
        },
        { ...corsHeaders, 'Retry-After': '60' },
        429
      );
    }
    
    // Record rate limit entry (non-blocking)
    if (!rateLimitError) {
      supabase.from('rate_limit_tracker').insert({
        identifier: clientIp,
        table_name: 'edge_ai_chat',
      }).then(({ error }) => {
        if (error) console.warn('[ai-chat] Rate limit tracking failed:', error.message);
      });
    }
    
    // CIRCUIT BREAKER CHECK - Prevent cost explosion
    const circuitCheck = await checkCircuitBreaker();
    if (!circuitCheck.allowed) {
      console.warn(`[ai-chat] Circuit breaker tripped: ${circuitCheck.reason}`);
      return secureJsonResponse(
        { 
          error: 'Service temporarily unavailable due to high demand. Please try again later.',
          code: 'CIRCUIT_BREAKER_TRIPPED'
        },
        corsHeaders,
        503
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return secureErrorResponse('AI service is not configured', corsHeaders, 500);
    }

    if (!message || typeof message !== 'string') {
      return secureErrorResponse('Message is required', corsHeaders, 400);
    }

    console.log(`[ai-chat] Session ${sessionId}: Processing message - "${message.substring(0, 50)}..."`);
    
    // Record cost for this request (non-blocking)
    recordCostAsync(sessionId, clientIp);

    // Build messages array with system prompt and conversation history
    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

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
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ai-chat] API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return secureJsonResponse(
          { error: 'Service is busy. Please try again in a moment.' },
          corsHeaders,
          429
        );
      }
      
      if (response.status === 402) {
        return secureJsonResponse(
          { error: 'Service temporarily unavailable. Please try again later.' },
          corsHeaders,
          402
        );
      }
      
      return secureErrorResponse('Failed to generate response', corsHeaders, 500);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      console.error('[ai-chat] No response content from AI');
      return secureErrorResponse('No response generated', corsHeaders, 500);
    }

    // Extract quote data if present
    const { cleanResponse, quoteData } = extractQuoteData(assistantMessage);

    console.log(`[ai-chat] Session ${sessionId}: Generated response - "${cleanResponse.substring(0, 50)}..."`);
    
    if (quoteData) {
      console.log(`[ai-chat] Session ${sessionId}: Quote data extracted for ${quoteData.fullName}`);
    }

    return secureJsonResponse(
      { 
        response: cleanResponse,
        sessionId,
        action: quoteData ? { type: 'submit_quote', data: quoteData } : null,
      },
      corsHeaders
    );

  } catch (error) {
    console.error('[ai-chat] Error:', error);
    return secureErrorResponse(
      error instanceof Error ? error.message : 'Unknown error occurred',
      corsHeaders,
      500
    );
  }
});
