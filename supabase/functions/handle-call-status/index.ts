import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, elevenlabs-signature',
};

// ElevenLabs webhook payload structures
interface ElevenLabsWebhook {
  type: 'post_call_transcription' | 'call_initiation_failure' | 'post_call_audio';
  event_timestamp: number;
  data: PostCallTranscriptionData | CallInitiationFailureData;
}

interface PostCallTranscriptionData {
  agent_id: string;
  conversation_id: string;
  status: 'done' | 'busy' | 'no-answer' | 'unknown';
  transcript: TranscriptEntry[];
  metadata: {
    call_duration_secs: number;
    start_time_unix_secs: number;
    end_time_unix_secs?: number;
  };
  analysis?: {
    transcript_summary?: string;
    call_successful?: 'success' | 'failure' | 'unknown';
    data_collected?: Record<string, unknown>;
  };
  call_sid?: string;
}

interface CallInitiationFailureData {
  agent_id: string;
  conversation_id?: string;
  call_sid?: string;
  failure_reason: 'busy' | 'no-answer' | 'unknown' | 'invalid-number' | 'network-error';
  to_number?: string;
}

interface TranscriptEntry {
  role: 'agent' | 'user';
  message: string;
  timestamp?: number;
}

// HMAC Signature Validation
async function validateHmacSignature(
  body: string,
  signatureHeader: string | null,
  secret: string
): Promise<{ valid: boolean; reason?: string }> {
  if (!signatureHeader) {
    return { valid: false, reason: 'No signature header provided' };
  }

  // Parse the signature header: "t=timestamp,v0=hash"
  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(',')) {
    const [key, value] = part.split('=');
    if (key && value) {
      parts[key] = value;
    }
  }

  const timestamp = parts['t'];
  const providedHash = parts['v0'];

  if (!timestamp || !providedHash) {
    return { valid: false, reason: 'Invalid signature format' };
  }

  // Validate timestamp (within 30 minutes to prevent replay attacks)
  const timestampNum = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  const tolerance = 30 * 60; // 30 minutes

  if (Math.abs(now - timestampNum) > tolerance) {
    return { valid: false, reason: 'Timestamp too old or in the future' };
  }

  // Compute expected signature: HMAC-SHA256(secret, "timestamp.body")
  const signedPayload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );

  // Convert to hex
  const expectedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison
  if (expectedHash.length !== providedHash.length) {
    return { valid: false, reason: 'Hash length mismatch' };
  }

  let mismatch = 0;
  for (let i = 0; i < expectedHash.length; i++) {
    mismatch |= expectedHash.charCodeAt(i) ^ providedHash.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return { valid: false, reason: 'Hash mismatch' };
  }

  return { valid: true };
}

// Format transcript array to readable text
function formatTranscript(transcript: TranscriptEntry[]): string {
  if (!transcript || !Array.isArray(transcript)) {
    return '';
  }

  return transcript
    .map(entry => {
      const speaker = entry.role === 'agent' ? 'Jack' : 'Customer';
      return `${speaker}: ${entry.message}`;
    })
    .join('\n\n');
}

// Map ElevenLabs status to internal status
function mapStatus(status: string, failureReason?: string): string {
  switch (status?.toLowerCase()) {
    case 'done':
      return 'completed';
    case 'busy':
      return 'busy';
    case 'no-answer':
    case 'no_answer':
      return 'no_answer';
    case 'unknown':
    case 'invalid-number':
    case 'network-error':
      return 'failed';
    default:
      // If we have a failure reason, use that
      if (failureReason) {
        switch (failureReason) {
          case 'busy':
            return 'busy';
          case 'no-answer':
            return 'no_answer';
          default:
            return 'failed';
        }
      }
      return status || 'unknown';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[handle-call-status] Received webhook');
    
    // Get raw body for HMAC validation
    const body = await req.text();
    console.log('[handle-call-status] Body length:', body.length);

    // Get signature header
    const signatureHeader = req.headers.get('elevenlabs-signature');
    const webhookSecret = Deno.env.get('ELEVENLABS_WEBHOOKS_SECRET');

    // Validate HMAC signature if secret is configured
    if (webhookSecret) {
      const validation = await validateHmacSignature(body, signatureHeader, webhookSecret);
      if (!validation.valid) {
        console.error('[handle-call-status] HMAC validation failed:', validation.reason);
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('[handle-call-status] HMAC signature validated successfully');
    } else {
      console.warn('[handle-call-status] ELEVENLABS_WEBHOOK_SECRET not configured - skipping HMAC validation');
    }

    // Parse the webhook payload
    let webhook: ElevenLabsWebhook;
    try {
      webhook = JSON.parse(body);
    } catch {
      console.error('[handle-call-status] Failed to parse webhook JSON');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[handle-call-status] Webhook type:', webhook.type);
    console.log('[handle-call-status] Event timestamp:', webhook.event_timestamp);
    console.log('[handle-call-status] Data:', JSON.stringify(webhook.data));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle based on webhook type
    if (webhook.type === 'post_call_transcription') {
      const data = webhook.data as PostCallTranscriptionData;
      
      const conversationId = data.conversation_id;
      const callSid = data.call_sid;
      const status = mapStatus(data.status);
      const duration = data.metadata?.call_duration_secs || null;
      const formattedTranscript = formatTranscript(data.transcript);
      const summary = data.analysis?.transcript_summary || null;

      console.log(`[handle-call-status] Processing post_call_transcription - conversation_id: ${conversationId}, status: ${status}`);

      // Find lead by conversation_id (primary) or call_sid (fallback)
      let lead = null;
      let searchError = null;

      if (conversationId) {
        const result = await supabase
          .from('leads')
          .select('id, confirmation_call_status')
          .eq('conversation_id', conversationId)
          .maybeSingle();
        
        lead = result.data;
        searchError = result.error;
      }

      // Fallback to call_sid if no match
      if (!lead && callSid) {
        const result = await supabase
          .from('leads')
          .select('id, confirmation_call_status')
          .eq('call_sid', callSid)
          .maybeSingle();
        
        lead = result.data;
        searchError = result.error;
      }

      if (searchError) {
        console.error('[handle-call-status] Error searching for lead:', searchError);
        throw searchError;
      }

      if (!lead) {
        console.warn(`[handle-call-status] No lead found for conversation_id: ${conversationId} or call_sid: ${callSid}`);
        return new Response(
          JSON.stringify({ warning: 'No matching lead found', conversationId, callSid }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[handle-call-status] Found lead ${lead.id}, updating with transcript and status: ${status}`);

      // Update lead with call results
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          confirmation_call_status: status,
          call_transcript: formattedTranscript || null,
          call_summary: summary,
          call_duration_seconds: duration,
          call_ended_at: new Date().toISOString(),
          call_notes: JSON.stringify({
            webhook_type: 'post_call_transcription',
            raw_status: data.status,
            call_successful: data.analysis?.call_successful,
            data_collected: data.analysis?.data_collected,
            processed_at: new Date().toISOString(),
          }),
        })
        .eq('id', lead.id);

      if (updateError) {
        console.error('[handle-call-status] Error updating lead:', updateError);
        throw updateError;
      }

      console.log(`[handle-call-status] Successfully updated lead ${lead.id} with call results`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Call transcript processed',
          leadId: lead.id,
          status,
          durationSeconds: duration,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (webhook.type === 'call_initiation_failure') {
      const data = webhook.data as CallInitiationFailureData;
      
      const conversationId = data.conversation_id;
      const callSid = data.call_sid;
      const status = mapStatus('unknown', data.failure_reason);

      console.log(`[handle-call-status] Processing call_initiation_failure - reason: ${data.failure_reason}`);

      // Find lead by conversation_id or call_sid
      let lead = null;
      let searchError = null;

      if (conversationId) {
        const result = await supabase
          .from('leads')
          .select('id, confirmation_call_status')
          .eq('conversation_id', conversationId)
          .maybeSingle();
        
        lead = result.data;
        searchError = result.error;
      }

      if (!lead && callSid) {
        const result = await supabase
          .from('leads')
          .select('id, confirmation_call_status')
          .eq('call_sid', callSid)
          .maybeSingle();
        
        lead = result.data;
        searchError = result.error;
      }

      if (searchError) {
        console.error('[handle-call-status] Error searching for lead:', searchError);
        throw searchError;
      }

      if (!lead) {
        console.warn(`[handle-call-status] No lead found for failed call - conversation_id: ${conversationId}, call_sid: ${callSid}`);
        return new Response(
          JSON.stringify({ warning: 'No matching lead found for failed call', conversationId, callSid }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[handle-call-status] Found lead ${lead.id}, updating with failure status: ${status}`);

      // Update lead with failure status
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          confirmation_call_status: status,
          call_ended_at: new Date().toISOString(),
          call_notes: JSON.stringify({
            webhook_type: 'call_initiation_failure',
            failure_reason: data.failure_reason,
            to_number: data.to_number,
            processed_at: new Date().toISOString(),
          }),
        })
        .eq('id', lead.id);

      if (updateError) {
        console.error('[handle-call-status] Error updating lead:', updateError);
        throw updateError;
      }

      console.log(`[handle-call-status] Successfully updated lead ${lead.id} with failure status`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Call failure processed',
          leadId: lead.id,
          status,
          failureReason: data.failure_reason,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (webhook.type === 'post_call_audio') {
      // Audio webhook - just log for now, could be used for recording storage later
      console.log('[handle-call-status] Received post_call_audio webhook - acknowledging');
      
      return new Response(
        JSON.stringify({ success: true, message: 'Audio webhook acknowledged' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown webhook type
    console.warn(`[handle-call-status] Unknown webhook type: ${webhook.type}`);
    return new Response(
      JSON.stringify({ warning: 'Unknown webhook type', type: webhook.type }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[handle-call-status] Error:', error);
    // SEC-002: Sanitized error response - no internal details exposed
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
