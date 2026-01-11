import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallRequest {
  leadId: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  totalQuote: number;
  moveDate?: string;
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
};

// Format phone number to E.164 format for Twilio
function formatToE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
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
      console.error('ELEVENLABS_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ELEVENLABS_AGENT_ID) {
      console.error('ELEVENLABS_AGENT_ID is not configured');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs agent ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ELEVENLABS_PHONE_NUMBER_ID) {
      console.error('ELEVENLABS_PHONE_NUMBER_ID is not configured');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs phone number ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: CallRequest = await req.json();
    console.log(`Initiating confirmation call to ${data.phone} for lead ${data.leadId}`);

    const serviceLabel = SERVICE_LABELS[data.serviceType] || data.serviceType;
    const moveDateFormatted = data.moveDate 
      ? new Date(data.moveDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'not yet scheduled';

    // Format phone number to E.164
    const formattedPhone = formatToE164(data.phone);
    console.log(`Formatted phone number: ${formattedPhone}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build dynamic variables for the AI agent
    const dynamicVariables = {
      customer_name: data.customerName,
      quote_total: data.totalQuote.toString(),
      service_type: serviceLabel,
      crew_size: data.crewSize.toString(),
      estimated_hours: data.estimatedHours.toString(),
      move_date: moveDateFormatted,
    };

    console.log('Making ElevenLabs outbound call with variables:', dynamicVariables);

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
    console.log(`ElevenLabs API response status: ${response.status}`);
    console.log(`ElevenLabs API response: ${responseText}`);

    if (!response.ok) {
      console.error('ElevenLabs outbound call failed:', responseText);
      
      // Update lead with failure status
      await supabase
        .from('leads')
        .update({
          confirmation_call_status: 'failed',
          call_notes: JSON.stringify({
            error: responseText,
            attempted_at: new Date().toISOString(),
            phone: formattedPhone,
          }),
        })
        .eq('id', data.leadId);

      return new Response(
        JSON.stringify({ 
          error: 'Failed to initiate outbound call', 
          details: responseText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the successful response
    let callResult;
    try {
      callResult = JSON.parse(responseText);
    } catch {
      callResult = { raw_response: responseText };
    }

    console.log('Outbound call initiated successfully:', callResult);

    // Update the lead with call details
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        confirmation_call_status: 'calling',
        confirmation_call_time: new Date().toISOString(),
        call_notes: JSON.stringify({
          conversation_id: callResult.conversation_id || callResult.call_sid || null,
          call_sid: callResult.call_sid || callResult.callSid || null,
          initiated_at: new Date().toISOString(),
          phone: formattedPhone,
          dynamic_variables: dynamicVariables,
          api_response: callResult,
        }),
      })
      .eq('id', data.leadId);

    if (updateError) {
      console.error('Error updating lead after call initiation:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation call initiated',
        leadId: data.leadId,
        conversationId: callResult.conversation_id || null,
        callSid: callResult.call_sid || callResult.callSid || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in trigger-confirmation-call:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
