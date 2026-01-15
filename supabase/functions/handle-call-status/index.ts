import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallStatusWebhook {
  // ElevenLabs webhook fields
  conversation_id?: string;
  call_sid?: string;
  status?: string;
  duration?: number;
  transcript?: string;
  
  // Twilio webhook fields (if coming directly from Twilio)
  CallSid?: string;
  CallStatus?: string;
  CallDuration?: string;
  To?: string;
  From?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received call status webhook');
    console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));

    const contentType = req.headers.get('content-type') || '';
    let data: CallStatusWebhook;

    // Parse based on content type (Twilio sends form-urlencoded, ElevenLabs sends JSON)
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries()) as unknown as CallStatusWebhook;
      console.log('Received Twilio form data:', JSON.stringify(data));
    } else {
      data = await req.json();
      console.log('Received JSON webhook data:', JSON.stringify(data));
    }

    // Normalize the data (handle both ElevenLabs and Twilio field names)
    const callSid = data.call_sid || data.CallSid;
    const status = data.status || data.CallStatus;
    const duration = data.duration || (data.CallDuration ? parseInt(data.CallDuration) : null);
    const transcript = data.transcript || null;
    const conversationId = data.conversation_id || null;

    console.log(`Processing call status update - SID: ${callSid}, Status: ${status}`);

    if (!callSid && !conversationId) {
      console.warn('No call_sid or conversation_id provided');
      return new Response(
        JSON.stringify({ warning: 'No call identifier provided' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Map call status to our internal status
    let internalStatus: string;
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'complete':
        internalStatus = 'completed';
        break;
      case 'no-answer':
      case 'no_answer':
        internalStatus = 'no_answer';
        break;
      case 'busy':
        internalStatus = 'busy';
        break;
      case 'failed':
      case 'error':
        internalStatus = 'failed';
        break;
      case 'canceled':
      case 'cancelled':
        internalStatus = 'canceled';
        break;
      case 'in-progress':
      case 'ringing':
        internalStatus = 'calling';
        break;
      default:
        internalStatus = status || 'unknown';
    }

    // Find the lead by searching call_notes for the call_sid or conversation_id
    // Since we store the call details in call_notes as JSON, we need to search for it
    const { data: leads, error: searchError } = await supabase
      .from('leads')
      .select('id, call_notes, call_transcript')
      .or(`call_notes.ilike.%${callSid}%,call_notes.ilike.%${conversationId}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (searchError) {
      console.error('Error searching for lead:', searchError);
      throw searchError;
    }

    if (!leads || leads.length === 0) {
      console.warn(`No lead found matching call_sid: ${callSid} or conversation_id: ${conversationId}`);
      return new Response(
        JSON.stringify({ warning: 'No matching lead found', callSid, conversationId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the first matching lead
    const lead = leads[0];
    console.log(`Found lead ${lead.id}, updating with status: ${internalStatus}`);

    // Parse existing call notes and append status update
    let existingNotes: Record<string, unknown> = {};
    try {
      existingNotes = lead.call_notes ? JSON.parse(lead.call_notes) : {};
    } catch {
      existingNotes = { previous_notes: lead.call_notes };
    }

    const previousUpdates = Array.isArray(existingNotes.status_updates) 
      ? existingNotes.status_updates 
      : [];

    const updatedNotes = {
      ...existingNotes,
      status_updates: [
        ...previousUpdates,
        {
          status: internalStatus,
          timestamp: new Date().toISOString(),
          duration,
          raw_status: status,
        }
      ],
      final_status: internalStatus,
      call_duration: duration,
    };

    // Build update object
    const updateData: Record<string, unknown> = {
      confirmation_call_status: internalStatus,
      call_notes: JSON.stringify(updatedNotes),
    };

    // Add transcript if provided
    if (transcript) {
      updateData.call_transcript = transcript;
    }

    // Update with completion time if call is finished
    if (['completed', 'no_answer', 'busy', 'failed', 'canceled'].includes(internalStatus)) {
      updateData.confirmation_call_time = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', lead.id);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      throw updateError;
    }

    console.log(`Successfully updated lead ${lead.id} with call status: ${internalStatus}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Call status updated',
        leadId: lead.id,
        status: internalStatus,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in handle-call-status:', error);
    // SEC-002: Sanitized error response - no internal details exposed
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
