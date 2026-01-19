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

// SMS fallback when call fails - ensures customer always gets confirmation
async function sendSmsFallback(
  data: CallRequest,
  failureReason: string
): Promise<boolean> {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.error('[trigger-confirmation-call] Twilio not configured for SMS fallback');
    return false;
  }

  const firstName = data.firstName || data.customerName?.split(' ')[0] || 'there';
  const formattedQuote = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(data.totalQuote);

  const messageBody = `Hi ${firstName}! Thanks for your quote request from Handledly Moving. Your estimate: ${formattedQuote} (Quote #${data.quoteNumber || 'pending'}). We tried calling but couldn't reach you. Reply to this text or call (878) 218-7397 to confirm. - The Handledly Team`;

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const formattedPhone = formatToE164(data.phone);

    console.log(`[trigger-confirmation-call] Sending SMS fallback to ${formattedPhone}`);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhoneNumber,
        Body: messageBody,
      }),
    });

    if (response.ok) {
      console.log('[trigger-confirmation-call] SMS fallback sent successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('[trigger-confirmation-call] SMS fallback failed:', errorText);
      return false;
    }
  } catch (error) {
    console.error('[trigger-confirmation-call] SMS fallback error:', error);
    return false;
  }
}

// Send admin notification when call fails for manual follow-up
async function sendAdminNotification(
  data: CallRequest,
  failureReason: string,
  smsFallbackSent: boolean
): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    console.error('[trigger-confirmation-call] RESEND_API_KEY not configured for admin notification');
    return false;
  }

  const firstName = data.firstName || data.customerName?.split(' ')[0] || 'Customer';
  const formattedQuote = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(data.totalQuote);

  const adminEmails = ['aiwmcsrm@gmail.com', 'hello@handled.com'];

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">🚨 Call Failed - Manual Follow-up Required</h2>
      
      <div style="background: #FEF2F2; border: 1px solid #FECACA; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; color: #DC2626; font-weight: bold;">
          The automated confirmation call failed. Please follow up manually.
        </p>
        ${smsFallbackSent 
          ? '<p style="margin: 8px 0 0; color: #059669;">✅ SMS fallback was sent successfully</p>'
          : '<p style="margin: 8px 0 0; color: #DC2626;">❌ SMS fallback also failed</p>'}
      </div>
      
      <h3>Lead Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${data.customerName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Quote:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${formattedQuote}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Quote #:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${data.quoteNumber || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${SERVICE_LABELS[data.serviceType] || data.serviceType}</td></tr>
      </table>
      
      <div style="margin-top: 20px; padding: 16px; background: #F3F4F6; border-radius: 8px;">
        <h4 style="margin: 0 0 8px; color: #374151;">Failure Reason:</h4>
        <code style="display: block; padding: 8px; background: #E5E7EB; border-radius: 4px; font-size: 12px; word-break: break-all;">${failureReason}</code>
      </div>
      
      <div style="margin-top: 24px; text-align: center;">
        <a href="tel:${data.phone}" style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #000; text-decoration: none; font-weight: bold; border-radius: 8px;">
          📞 Call ${firstName} Now
        </a>
      </div>
      
      <p style="margin-top: 24px; font-size: 12px; color: #6B7280;">
        Lead ID: ${data.leadId}<br>
        Timestamp: ${new Date().toISOString()}
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Handledly Alerts <alerts@handledly.com>',
        to: adminEmails,
        subject: `🚨 URGENT: Call Failed - ${firstName} - Quote ${data.quoteNumber || 'N/A'}`,
        html: emailHtml,
      }),
    });

    if (response.ok) {
      console.log('[trigger-confirmation-call] Admin notification sent successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('[trigger-confirmation-call] Admin notification failed:', errorText);
      return false;
    }
  } catch (error) {
    console.error('[trigger-confirmation-call] Admin notification error:', error);
    return false;
  }
}

// The actual call triggering logic
async function executeCall(data: CallRequest): Promise<void> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  const ELEVENLABS_AGENT_ID = Deno.env.get('ELEVENLABS_AGENT_ID');
  const ELEVENLABS_PHONE_NUMBER_ID = Deno.env.get('ELEVENLABS_PHONE_NUMBER_ID');
  
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID || !ELEVENLABS_PHONE_NUMBER_ID) {
    console.error('[trigger-confirmation-call] Missing ElevenLabs configuration:', {
      hasApiKey: !!ELEVENLABS_API_KEY,
      hasAgentId: !!ELEVENLABS_AGENT_ID,
      hasPhoneNumberId: !!ELEVENLABS_PHONE_NUMBER_ID
    });
    return;
  }
  
  console.log(`[trigger-confirmation-call] ElevenLabs config validated - Agent: ${ELEVENLABS_AGENT_ID.substring(0,8)}..., Phone: ${ELEVENLABS_PHONE_NUMBER_ID.substring(0,8)}...`);

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
      
      // TRY SMS FALLBACK
      console.log('[trigger-confirmation-call] Attempting SMS fallback...');
      const smsSent = await sendSmsFallback(data, responseText);
      
      // SEND ADMIN NOTIFICATION
      console.log('[trigger-confirmation-call] Sending admin notification...');
      const adminNotified = await sendAdminNotification(data, responseText, smsSent);
      
      // Update lead with failure status and SMS fallback result
      await supabase
        .from('leads')
        .update({
          confirmation_call_status: smsSent ? 'failed_sms_sent' : 'failed',
          call_notes: JSON.stringify({
            error: responseText,
            attempted_at: new Date().toISOString(),
            phone: formattedPhone,
            sms_fallback: smsSent ? 'sent' : 'failed',
            admin_notified: adminNotified,
          }),
        })
        .eq('id', data.leadId);
      
      if (smsSent) {
        console.log('[trigger-confirmation-call] Customer notified via SMS fallback');
      }
      if (adminNotified) {
        console.log('[trigger-confirmation-call] Admin team notified for manual follow-up');
      }
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
    
    // TRY SMS FALLBACK
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('[trigger-confirmation-call] Attempting SMS fallback after exception...');
    const smsSent = await sendSmsFallback(data, errorMessage);
    
    // SEND ADMIN NOTIFICATION
    console.log('[trigger-confirmation-call] Sending admin notification after exception...');
    const adminNotified = await sendAdminNotification(data, errorMessage, smsSent);
    
    // Update lead with error status and SMS fallback result
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const errorSupabase = createClient(supabaseUrl, supabaseKey);
      
      await errorSupabase
        .from('leads')
        .update({
          confirmation_call_status: smsSent ? 'failed_sms_sent' : 'failed',
          call_notes: JSON.stringify({
            error: errorMessage,
            attempted_at: new Date().toISOString(),
            sms_fallback: smsSent ? 'sent' : 'failed',
            admin_notified: adminNotified,
          }),
        })
        .eq('id', data.leadId);
        
      if (smsSent) {
        console.log('[trigger-confirmation-call] Customer notified via SMS fallback');
      }
      if (adminNotified) {
        console.log('[trigger-confirmation-call] Admin team notified for manual follow-up');
      }
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
        .select('id, verification_token, confirmation_call_status, created_at, call_sid, conversation_id')
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

      // Check if call was already processed (prevent replay)
      // Only block if there's EVIDENCE a call was actually made (has call_sid or conversation_id)
      // OR if status indicates active/completed processing
      if (lead.confirmation_call_status === 'calling' || 
          lead.confirmation_call_status === 'completed' ||
          lead.confirmation_call_status === 'failed_sms_sent' ||
          lead.call_sid || lead.conversation_id) {
        console.log('[trigger-confirmation-call] Call already processed for lead:', data.leadId, {
          status: lead.confirmation_call_status,
          hasCallSid: !!lead.call_sid,
          hasConversationId: !!lead.conversation_id
        });
        return new Response(
          JSON.stringify({ success: true, message: 'Call already processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log if retrying a previously failed attempt
      if (lead.confirmation_call_status === 'pending' || lead.confirmation_call_status === 'failed') {
        console.log('[trigger-confirmation-call] Retrying call for lead:', data.leadId, 'previous status:', lead.confirmation_call_status);
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

    // Execute call synchronously - waitUntil is unreliable for critical operations
    // The call must complete before returning to ensure it actually happens
    console.log(`[trigger-confirmation-call] Executing call synchronously to ${data.phone}`);
    await executeCall(data);

    // Return after call execution completes
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
