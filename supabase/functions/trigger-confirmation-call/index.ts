import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

const SERVICE_LABELS: Record<string, string> = {
  'apartment-condo': 'Apartment & Condo Moving',
  'house-townhouse': 'House & Townhouse Moving',
  'labor-only': 'Labor / Moving Help',
  'commercial': 'Commercial / Office Moving',
  'heavy-items': 'Heavy Items Moving',
  'pool-table': 'Pool Table Moving',
  'junk-removal': 'Junk Removal',
  'same-day': 'Same-Day Moving',
  'local-moving': 'Local Moving',
  'residential': 'Residential Moving',
  'long-distance': 'Long Distance Moving',
  'piano-moving': 'Piano Moving',
  'safe-moving': 'Safe Moving',
  'moving-help': 'Moving Help / Labor Only',
};

// Format phone number to E.164 format for Twilio
function formatToE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

// The actual call triggering logic
async function executeCall(data: CallRequest): Promise<void> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  const ELEVENLABS_AGENT_ID = Deno.env.get('ELEVENLABS_AGENT_ID');
  const ELEVENLABS_PHONE_NUMBER_ID = Deno.env.get('ELEVENLABS_PHONE_NUMBER_ID');
  
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID || !ELEVENLABS_PHONE_NUMBER_ID) {
    console.error('[trigger-confirmation-call] Missing ElevenLabs configuration');
    return;
  }

  // Parse first name from data
  const firstName = data.firstName || data.customerName?.split(' ')[0] || 'Friend';
  const lastName = data.lastName || data.customerName?.split(' ').slice(1).join(' ') || '';
  
  const serviceLabel = SERVICE_LABELS[data.serviceType] || data.serviceType;
  const moveDateFormatted = data.moveDate 
    ? new Date(data.moveDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : 'not yet scheduled';

  const formattedPhone = formatToE164(data.phone);
  console.log(`[trigger-confirmation-call] Executing call to ${formattedPhone} for lead ${data.leadId}`);

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Build dynamic variables for the AI agent
  const dynamicVariables = {
    customer_name: firstName,
    customer_first_name: firstName,
    customer_last_name: lastName,
    customer_full_name: data.customerName,
    quote_total: data.totalQuote.toString(),
    quote_number: data.quoteNumber || 'pending',
    service_type: serviceLabel,
    crew_size: data.crewSize.toString(),
    estimated_hours: data.estimatedHours.toString(),
    move_date: moveDateFormatted,
    move_from: data.moveFrom || 'to be confirmed',
    move_to: data.moveTo || 'to be confirmed',
  };

  console.log('[trigger-confirmation-call] Making ElevenLabs outbound call with variables:', dynamicVariables);

  try {
    // Make the actual outbound call via ElevenLabs Twilio integration
    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/twilio/outbound-call',
      {
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
            dynamic_variables: dynamicVariables
          }
        }),
      }
    );

    const responseText = await response.text();
    console.log(`[trigger-confirmation-call] ElevenLabs API response status: ${response.status}`);
    console.log(`[trigger-confirmation-call] ElevenLabs API response: ${responseText}`);

    if (!response.ok) {
      console.error('[trigger-confirmation-call] ElevenLabs outbound call failed:', responseText);
      
      // Update lead with failure status
      await supabase
        .from('leads')
        .update({
          confirmation_call_status: 'failed',
          call_notes: JSON.stringify({
            error: responseText,
            attempted_at: new Date().toISOString(),
            phone: formattedPhone,
            delay_seconds: 0,
          }),
        })
        .eq('id', data.leadId);
      return;
    }

    // Parse the successful response
    let callResult;
    try {
      callResult = JSON.parse(responseText);
    } catch {
      callResult = { raw_response: responseText };
    }

    console.log('[trigger-confirmation-call] Outbound call initiated successfully:', callResult);

    // Extract conversation_id and call_sid from response
    const conversationId = callResult.conversation_id || null;
    const callSid = callResult.call_sid || callResult.callSid || null;

    console.log(`[trigger-confirmation-call] Storing conversation_id: ${conversationId}, call_sid: ${callSid}`);

    // Update the lead with call details - store in dedicated columns for reliable webhook matching
    await supabase
      .from('leads')
      .update({
        confirmation_call_status: 'calling',
        confirmation_call_time: new Date().toISOString(),
        // Store in dedicated indexed columns for fast webhook lookup
        conversation_id: conversationId,
        call_sid: callSid,
        // Keep call_notes for debugging/audit trail
        call_notes: JSON.stringify({
          initiated_at: new Date().toISOString(),
          phone: formattedPhone,
          delay_seconds: 0,
          dynamic_variables: dynamicVariables,
          api_response: callResult,
        }),
      })
      .eq('id', data.leadId);

  } catch (error) {
    console.error('[trigger-confirmation-call] Error executing call:', error);
    
    // Update lead with error status - reuse existing supabase client from outer scope
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const errorSupabase = createClient(supabaseUrl, supabaseKey);
      
      await errorSupabase
        .from('leads')
        .update({
          confirmation_call_status: 'failed',
          call_notes: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            attempted_at: new Date().toISOString(),
          }),
        })
        .eq('id', data.leadId);
    } catch (updateError) {
      console.error('[trigger-confirmation-call] Failed to update lead with error status:', updateError);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const ELEVENLABS_AGENT_ID = Deno.env.get('ELEVENLABS_AGENT_ID');
    const ELEVENLABS_PHONE_NUMBER_ID = Deno.env.get('ELEVENLABS_PHONE_NUMBER_ID');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('[trigger-confirmation-call] ELEVENLABS_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ELEVENLABS_AGENT_ID) {
      console.error('[trigger-confirmation-call] ELEVENLABS_AGENT_ID is not configured');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs agent ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ELEVENLABS_PHONE_NUMBER_ID) {
      console.error('[trigger-confirmation-call] ELEVENLABS_PHONE_NUMBER_ID is not configured');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs phone number ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: CallRequest = await req.json();
    console.log(`[trigger-confirmation-call] Received request for lead ${data.leadId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // SEC-001: Verify token and lead freshness before initiating call
    if (data.verificationToken) {
      const { data: lead, error: verifyError } = await supabase
        .from('leads')
        .select('id, verification_token, confirmation_call_status, created_at')
        .eq('id', data.leadId)
        .single();

      if (verifyError || !lead) {
        console.error('[trigger-confirmation-call] Lead verification failed:', verifyError?.message);
        return new Response(
          JSON.stringify({ error: 'Invalid request' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify token matches
      if (lead.verification_token !== data.verificationToken) {
        console.error('[trigger-confirmation-call] Token mismatch for lead:', data.leadId);
        return new Response(
          JSON.stringify({ error: 'Invalid request' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if call was already initiated (prevent replay)
      if (lead.confirmation_call_status && lead.confirmation_call_status !== 'failed') {
        console.log('[trigger-confirmation-call] Call already scheduled for lead:', data.leadId);
        return new Response(
          JSON.stringify({ success: true, message: 'Call already scheduled' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check lead freshness (created within last 5 minutes)
      const createdAt = new Date(lead.created_at);
      const now = new Date();
      const ageMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      if (ageMinutes > 5) {
        console.error('[trigger-confirmation-call] Lead too old:', ageMinutes, 'minutes');
        return new Response(
          JSON.stringify({ error: 'Request expired' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`[trigger-confirmation-call] Will call ${data.phone} immediately`);

    // Update lead status to "pending" immediately
    await supabase
      .from('leads')
      .update({
        confirmation_call_status: 'pending',
        call_notes: JSON.stringify({
          scheduled_for: new Date().toISOString(),
          delay_seconds: 0,
        }),
      })
      .eq('id', data.leadId);

    // Execute call immediately in background using EdgeRuntime.waitUntil
    // This allows the response to return immediately while the call executes
    // @ts-ignore - EdgeRuntime is available in Deno Deploy/Supabase Edge Functions
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil((async () => {
        console.log(`[trigger-confirmation-call] Executing call to ${data.phone} immediately`);
        await executeCall(data);
      })());
    } else {
      // Fallback for environments without EdgeRuntime.waitUntil - execute inline
      console.log('[trigger-confirmation-call] EdgeRuntime.waitUntil not available, executing call inline');
      await executeCall(data);
    }

    // Return immediately to the client
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation call initiated',
        leadId: data.leadId,
        initiatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[trigger-confirmation-call] Error:', error);
    // SEC-002: Sanitized error response - no internal details exposed
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
