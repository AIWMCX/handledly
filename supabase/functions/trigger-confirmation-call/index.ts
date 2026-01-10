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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const ELEVENLABS_AGENT_ID = Deno.env.get('ELEVENLABS_AGENT_ID');
    
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

    const data: CallRequest = await req.json();
    console.log(`Initiating confirmation call to ${data.phone} for lead ${data.leadId}`);

    const serviceLabel = SERVICE_LABELS[data.serviceType] || data.serviceType;
    const moveDateFormatted = data.moveDate 
      ? new Date(data.moveDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'not yet scheduled';

    // Build context for the AI agent
    const callContext = {
      customer_name: data.customerName,
      quote_total: data.totalQuote,
      service_type: serviceLabel,
      crew_size: data.crewSize,
      estimated_hours: data.estimatedHours,
      move_date: moveDateFormatted,
      call_purpose: "Confirm quote details and offer to schedule the move",
      greeting: `Hi ${data.customerName}, this is Denver Premium Moving calling to follow up on the moving quote you just received.`,
      key_points: [
        `Quote total: $${data.totalQuote}`,
        `Service: ${serviceLabel}`,
        `${data.crewSize} movers with truck at our flat hourly rate`,
        `Estimated ${data.estimatedHours} hours`,
        `Move date: ${moveDateFormatted}`,
        "Remind them: NO hidden fees, everything is included"
      ]
    };

    // For now, we'll store the call intent and context in the database
    // The actual outbound call would require Twilio or similar integration
    // which needs phone number verification and additional setup
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the lead with call scheduling info
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        confirmation_call_status: 'scheduled',
        call_notes: JSON.stringify({
          scheduled_at: new Date().toISOString(),
          context: callContext,
          phone: data.phone,
        }),
      })
      .eq('id', data.leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      throw updateError;
    }

    console.log('Call scheduled for lead:', data.leadId);

    // Note: To enable actual outbound calling, you would need to:
    // 1. Set up a Twilio account with verified phone numbers
    // 2. Connect ElevenLabs to Twilio for voice synthesis
    // 3. Use the ElevenLabs Outbound Call API with Twilio credentials
    //
    // Example API call (requires additional setup):
    // const response = await fetch(
    //   'https://api.elevenlabs.io/v1/convai/conversation/call',
    //   {
    //     method: 'POST',
    //     headers: {
    //       'xi-api-key': ELEVENLABS_API_KEY,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       agent_id: ELEVENLABS_AGENT_ID,
    //       to: data.phone,
    //       from: BUSINESS_PHONE, // Requires verified Twilio number
    //       twilio_config: { ... },
    //       conversation_config_override: {
    //         agent: {
    //           first_message: callContext.greeting,
    //           prompt: { prompt: JSON.stringify(callContext) }
    //         }
    //       }
    //     }),
    //   }
    // );

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation call scheduled',
        leadId: data.leadId,
        note: 'Outbound calling requires Twilio integration. Call context has been saved.',
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
