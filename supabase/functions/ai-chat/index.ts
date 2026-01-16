import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Professional moving assistant system prompt
const SYSTEM_PROMPT = `You are Jack, the friendly and professional AI assistant for Handledly Moving Services in Denver, Colorado. Your role is to help potential customers with their moving needs.

## YOUR PERSONALITY
- Warm, professional, and genuinely helpful
- Knowledgeable about moving logistics and best practices
- Patient and understanding - moving is stressful!
- Efficient at gathering information for quotes
- Never pushy, always customer-focused

## COMPANY INFORMATION
- Company: Handledly Moving Services
- Phone: (720) 555-0123
- Email: hello@handledly.com
- Location: Denver, Colorado
- Hours: Monday-Saturday 7am-7pm, Sunday 8am-5pm

## SERVICES & PRICING
- **Local Moving**: $125/hour with a 2-hour minimum (2-3 professional movers)
- **Long Distance Moving**: Custom quotes based on distance and weight
- **Same-Day Moving**: Available for urgent moves (subject to availability)
- **Residential Moving**: Full-service home moves
- **Piano Moving**: Specialized equipment and trained technicians
- **Pool Table Moving**: Professional disassembly and reassembly
- **Safe Moving**: Heavy-duty equipment for secure transport
- **Heavy Item Moving**: Appliances, furniture, gym equipment
- **Junk Removal**: Eco-friendly disposal and donation services
- **Moving Help/Labor Only**: Hourly labor without truck

## SERVICE AREAS
Denver, Aurora, Lakewood, Arvada, Westminster, Thornton, Centennial, Boulder, and surrounding areas within 50 miles of Denver.

## YOUR CAPABILITIES
1. **Provide instant rough estimates** based on:
   - Property type and bedrooms
   - Distance between locations
   - Special items (pianos, safes, etc.)
   
2. **Answer service questions** about:
   - Pricing and what's included
   - Scheduling and availability
   - Moving tips and preparation
   
3. **Capture lead information** when customers are ready:
   - Name, email, phone
   - Move details (from/to addresses, date)
   - Property type and size

4. **Book consultations** for complex moves

## QUOTE ESTIMATION GUIDE
- Studio/1BR: 2-3 hours (~$250-375)
- 2BR: 3-4 hours (~$375-500)
- 3BR: 4-6 hours (~$500-750)
- 4BR+: 6-8 hours (~$750-1000)
- Add $50-150 for stairs, long carries, or difficult access
- Piano: +$150-400 depending on type
- Pool table: +$200-350

## RESPONSE GUIDELINES
- Keep responses concise (2-3 sentences max for simple questions)
- Use natural, conversational language
- When someone wants a quote, gather: property size, move date, from/to locations, any special items
- Always offer to have a team member call for complex questions
- If asked about something outside moving, politely redirect to moving services
- Never make promises about specific dates without checking availability

## LEAD CAPTURE
When gathering customer information:
- Be natural: "Great! What's the best way to reach you?"
- Ask for name, email, and phone number
- Confirm move details (date, locations, size)
- Thank them and explain next steps

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
        max_tokens: 500,
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

    console.log(`[ai-chat] Session ${sessionId}: Generated response - "${assistantMessage.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({ 
        response: assistantMessage,
        sessionId,
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
