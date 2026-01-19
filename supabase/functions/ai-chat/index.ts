import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Professional moving assistant system prompt with quote collection workflow
const SYSTEM_PROMPT = `You are Jack, a friendly and professional moving specialist for Handledly Moving Services in Denver, Colorado. Your role is to help potential customers with their moving needs AND collect complete quote information.

## YOUR PERSONALITY
- Warm, professional, and genuinely helpful
- Knowledgeable about moving logistics and best practices
- Patient and understanding - moving is stressful!
- Efficient at gathering information for quotes
- Never pushy, always customer-focused
- You speak naturally like a real person, not a robot

## COMPANY INFORMATION
- Company: Handledly Moving Services
- Main Phone: (878) 218-7397
- Local Denver: (719) 920-3282
- Email: hello@handledly.com
- Location: Denver, Colorado
- Hours: Monday-Saturday 7am-7pm, Sunday 8am-5pm

## SERVICES & PRICING
- **Local Moving**: $149/hour for 2 movers + truck, $179/hour for 3 movers, $249/hour for 4 movers (2-hour minimum)
- **Labor Only**: $129/hour for 2 movers, $159/hour for 3 movers, $229/hour for 4 movers
- **Long Distance Moving**: Custom quotes based on distance and weight
- **Same-Day Moving**: Available for urgent moves (subject to availability)
- **Residential Moving**: Full-service home moves
- **Piano Moving**: $159/hour + specialty fee ($250-$450)
- **Pool Table Moving**: $159/hour + specialty fee ($350-$550)
- **Safe Moving**: Heavy-duty equipment for secure transport
- **Heavy Item Moving**: $159/hour for appliances, furniture, gym equipment
- **Junk Removal**: Eco-friendly disposal and donation services

## SERVICE AREAS
Denver, Aurora, Lakewood, Arvada, Westminster, Thornton, Centennial, Boulder, and surrounding areas within 50 miles of Denver.

## QUOTE COLLECTION WORKFLOW
When a customer wants a quote, collect information in this EXACT order:
1. **Property type** - What type of property? (apartment, house, condo, studio)
2. **Bedrooms** - How many bedrooms?
3. **Move-from location** - Where are you moving from? (city/neighborhood/address)
4. **Move-to location** - Where are you moving to? (city/neighborhood/address)  
5. **Move date** - When would you like to move? (date or timeframe)
6. **Special items** - Any special items like piano, pool table, safe, or heavy items?
7. **Contact info** - Name, email, and phone number

After collecting ALL information, summarize it back to confirm, then ask "Should I submit this quote request now?"

## QUOTE ESTIMATION GUIDE
- Studio/1BR: 2-3 hours, 2 movers (~$298-$447)
- 2BR: 3-4 hours, 2-3 movers (~$447-$716)
- 3BR: 4-6 hours, 3 movers (~$716-$1074)
- 4BR+: 6-8 hours, 4 movers (~$1494-$1992)
- Piano: +$250-$450 depending on type
- Pool table: +$350-$550

## RESPONSE GUIDELINES
- Keep responses concise but complete
- Use natural, conversational language
- Gather quote info ONE piece at a time - don't overwhelm!
- When you have ALL required info, confirm and offer to submit
- Always mention our phone (878) 218-7397 for complex questions
- If asked about something outside moving, politely redirect

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
  "notes": "Any additional notes"
}
[/QUOTE_READY]

Then follow with a friendly confirmation message.

Remember: Your goal is to be helpful and convert interested visitors into qualified leads while providing excellent service.`;

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory = [], sessionId } = await req.json() as ChatRequest;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ai-chat] Session ${sessionId}: Processing message - "${message.substring(0, 50)}..."`);

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
