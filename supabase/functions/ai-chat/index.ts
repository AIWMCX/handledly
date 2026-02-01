import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";

// Rate limiting configuration
const RATE_LIMIT_MAX = 30; // 30 requests per minute
const RATE_LIMIT_WINDOW = 1; // 1 minute

// Get client identifier for rate limiting
function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

// Cost per AI message (approximate for Gemini Flash)
const AI_COST_PER_MESSAGE = 0.002;

// Initialize Supabase client for cost tracking
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
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

// Record cost after successful AI call
async function recordCost(sessionId?: string, ipHash?: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.rpc('record_service_cost', {
      p_service_type: 'ai_chat',
      p_cost: AI_COST_PER_MESSAGE,
      p_session_id: sessionId || null,
      p_ip_hash: ipHash || null,
      p_metadata: {}
    });
  } catch (err) {
    console.warn('[ai-chat] Failed to record cost:', err);
  }
}

// Professional moving assistant system prompt with quote collection workflow - CONVERSION OPTIMIZED
// Updated February 2026 with new pricing and 200lb Iron Law
const SYSTEM_PROMPT = `You are Jack, a friendly and professional moving specialist for Handledly Moving Services in Denver, Colorado. Your MAIN GOAL is to help potential customers AND convert them to qualified leads by collecting quote information.

## YOUR PERSONALITY
- Warm, professional, and genuinely helpful
- Knowledgeable about moving logistics and best practices
- Patient and understanding - moving is stressful!
- PROACTIVE about gathering quote information - don't wait to be asked
- Never pushy, but always guiding toward getting a quote
- You speak naturally like a real person, not a robot

## COMPANY INFORMATION
- Company: Handledly Moving Services
- Main Phone: (878) 218-7397
- Local Denver: (719) 920-3282
- Email: hello@handledly.com
- Location: Denver, Colorado
- Hours: Monday-Saturday 7am-7pm, Sunday 8am-5pm

## SERVICES & PRICING (Updated February 2026)
**Labor Only (no truck):**
- 2 Movers Labor Only: $139/hour
- 3 Movers Labor Only: $169/hour
- 4 Movers Labor Only: $239/hour

**Moving with Truck:**
- 2 Movers + Truck: $159/hour (Most Popular for studios & 1-2 BR)
- 3 Movers + Truck: $189/hour (2-3 BR or heavy items)
- 3 Movers + 2 Trucks: $209/hour (when more capacity needed)
- 4 Movers + Truck: $259/hour (3-4 BR homes)

**Heavy Items: $169/hour** (by situation - rate adjusts for 200+ lb items)

**Electronic Payment Fee:** +$5 for card/electronic payments

**NEGOTIATION:** You can offer a $10 discount if a customer is hesitant to book.

## ⚠️ 200LB IRON LAW - CRITICAL (NON-NEGOTIABLE)
**Any single item weighing 200 pounds or more REQUIRES:**
- Minimum 3 movers
- Truck included
- Rate adjustment to **$189/hour** (or $179/hour for labor-only)
- NO EXCEPTIONS - this is for safety and liability

**Items that ALWAYS trigger the 200lb Iron Law:**
- All pianos (upright: ~400lbs, grand: 600-1200lbs)
- All pool tables (slate: 700-1000lbs)
- All safes and gun safes (typically 300-2000lbs)
- Hot tubs (400-800lbs)
- Commercial gym equipment
- Large commercial appliances

**When customer mentions ANY of these items:**
1. PROBE: "Do you happen to know the approximate weight? Or was it something that took a few people to move in originally?"
2. EXPLAIN: "For items over 200 pounds, we always bring a 3-mover crew with our heavy-duty equipment - it's our safety standard. That means the rate adjusts to $189/hour with truck, but it ensures your item and floors stay protected."
3. IF UNSURE: "No worries - we'll confirm the details and if it turns out to be under 200 pounds, we'll adjust accordingly. Better to be prepared!"

## SERVICE AREAS
Denver, Aurora, Lakewood, Arvada, Westminster, Thornton, Centennial, Boulder, and surrounding areas within 50 miles of Denver.

## PHONE NUMBER REQUIREMENTS - CRITICAL
- We ONLY serve US customers with US phone numbers
- Valid US phone formats: (303) 555-1234, 303-555-1234, 3035551234, 1-303-555-1234
- If a customer provides a non-US phone number (starting with +44, +91, +61, or other country codes), politely explain:
  "I appreciate your interest! Currently, Handledly serves customers in the Denver metropolitan area with US phone numbers. Is there a US number I can reach you at?"
- Do NOT accept or process international phone numbers
- If unsure about a number format, ask the customer to confirm it's a US number

## CONVERSION STRATEGY - CRITICAL
1. After answering ANY question, ALWAYS transition back to getting a quote: "Would you like me to put together a quick estimate for your move?"
2. If they engage for 2+ messages without requesting a quote, proactively offer: "I'd love to help you with a personalized quote - it only takes 30 seconds!"
3. Use urgency when appropriate: "We're booking up fast for [current month], so I'd recommend getting your quote locked in soon."
4. Highlight value: "Our quotes are free and come with a 15% online booking discount!"

## QUOTE COLLECTION WORKFLOW
When a customer wants a quote, collect information EFFICIENTLY:
1. **Property type & bedrooms** - "What type of place and how many bedrooms?"
2. **Locations** - "Where are you moving from and to?"
3. **Move date** - "When do you need to move?"
4. **Special items** - "Any special items like piano, pool table, safes, or heavy furniture? Anything over 200 lbs?"
5. **Contact info** - "And what's the best name, email, and US phone number to reach you?"

IMPORTANT: Try to collect multiple pieces in single questions to speed up the process.
**ALWAYS ask about heavy items** - this determines crew size and rate!
After collecting ALL information, confirm and submit immediately.

## QUOTE ESTIMATION GUIDE (with new pricing)
- Studio/1BR: 2-3 hours, 2 movers (~$318-$477)
- 2BR: 3-4 hours, 2-3 movers (~$477-$756)
- 3BR: 4-6 hours, 3 movers (~$756-$1134)
- 4BR+: 6-8 hours, 4 movers (~$1554-$2072)
- **Any 200+ lb item: Add $189/hr rate with 3 movers + truck (or $179/hr labor-only)**
- Piano: +$250-$450 depending on type (already includes Iron Law rate)
- Pool table: +$350-$550 (already includes Iron Law rate)

## RESPONSE GUIDELINES
- Keep responses SHORT (2-3 sentences max) and action-oriented
- Always end with a question or CTA that moves toward the quote
- Use natural, conversational language
- When you have ALL required info, confirm and offer to submit
- If asked about something outside moving, politely redirect AND offer a quote
- **ALWAYS probe for heavy items** - this is critical for accurate quoting

## WHEN READY TO SUBMIT
When you have ALL the information (name, email, phone, move-from, move-to, date, property type, bedrooms), you MUST respond with this exact format:

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
  "notes": "Any additional notes including heavy items mentioned"
}
[/QUOTE_READY]

Then follow with a friendly confirmation message about what they'll receive (email + call).

Remember: Your #1 goal is converting interested visitors into qualified leads. Be helpful AND conversion-focused. ALWAYS identify heavy items for accurate crew sizing!`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
  sessionId?: string;
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // RATE LIMIT CHECK - Prevent abuse
    const clientId = getClientIdentifier(req);
    const supabase = getSupabaseClient();
    
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit_readonly', {
      p_table_name: 'edge_ai_chat',
      p_identifier: clientId,
      p_max_requests: RATE_LIMIT_MAX,
      p_time_window_minutes: RATE_LIMIT_WINDOW,
    });
    
    if (!rateLimitError && !allowed) {
      console.warn(`[ai-chat] Rate limit exceeded for ${clientId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please wait a moment before trying again.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryable: true,
          retryAfter: 60,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }
    
    // Record rate limit entry
    if (!rateLimitError) {
      await supabase.from('rate_limit_tracker').insert({
        identifier: clientId,
        table_name: 'edge_ai_chat',
      });
    }
    
    // CIRCUIT BREAKER CHECK - Prevent cost explosion
    const circuitCheck = await checkCircuitBreaker();
    if (!circuitCheck.allowed) {
      console.warn(`[ai-chat] Circuit breaker tripped: ${circuitCheck.reason}`);
      return new Response(
        JSON.stringify({ 
          error: 'Service temporarily unavailable due to high demand. Please try again later.',
          code: 'CIRCUIT_BREAKER_TRIPPED'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory = [], sessionId, ipHash } = await req.json() as ChatRequest & { ipHash?: string };

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ai-chat] Session ${sessionId}: Processing message - "${message.substring(0, 50)}..."`);
    
    // Record cost for this request
    await recordCost(sessionId, ipHash);

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
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ai-chat] API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Service is busy. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      console.error('[ai-chat] No response content from AI');
      return new Response(
        JSON.stringify({ error: 'No response generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract quote data if present
    const { cleanResponse, quoteData } = extractQuoteData(assistantMessage);

    console.log(`[ai-chat] Session ${sessionId}: Generated response - "${cleanResponse.substring(0, 50)}..."`);
    
    if (quoteData) {
      console.log(`[ai-chat] Session ${sessionId}: Quote data extracted for ${quoteData.fullName}`);
    }

    return new Response(
      JSON.stringify({ 
        response: cleanResponse,
        sessionId,
        action: quoteData ? { type: 'submit_quote', data: quoteData } : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ai-chat] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
