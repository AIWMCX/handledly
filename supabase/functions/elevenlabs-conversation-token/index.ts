import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

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
        JSON.stringify({ error: 'Voice service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ELEVENLABS_AGENT_ID) {
      console.error('ELEVENLABS_AGENT_ID is not configured');
      return new Response(
        JSON.stringify({ error: 'Voice agent not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: check via IP hash
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || "unknown";
    const ipHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(clientIP + "elevenlabs-token-salt")
    );
    const ipHash = Array.from(new Uint8Array(ipHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Allow 10 token requests per hour per IP
    const { data: allowed } = await supabase.rpc('check_rate_limit_readonly', {
      p_table_name: 'elevenlabs_token',
      p_identifier: ipHash,
      p_max_requests: 10,
      p_time_window_minutes: 60,
    });

    if (allowed === false) {
      console.warn(`[elevenlabs-conversation-token] Rate limit exceeded for IP hash: ${ipHash.substring(0, 8)}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record rate limit entry
    await supabase.from('rate_limit_tracker').insert({
      identifier: ipHash,
      table_name: 'elevenlabs_token',
    });

    console.log(`[elevenlabs-conversation-token] Fetching signed URL for agent: ${ELEVENLABS_AGENT_ID.substring(0, 8)}...`);

    // Get signed URL for WebSocket connection
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[elevenlabs-conversation-token] ElevenLabs API error:', response.status, errorText);
      // SEC-002: Sanitized error response - no internal details exposed
      return new Response(
        JSON.stringify({ error: 'Voice service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[elevenlabs-conversation-token] Successfully obtained signed URL');

    // Return both signed_url and agent_id so frontend doesn't need env vars
    return new Response(
      JSON.stringify({ 
        signed_url: data.signed_url,
        agent_id: ELEVENLABS_AGENT_ID 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[elevenlabs-conversation-token] Error:', error);
    // SEC-002: Sanitized error response - no internal details exposed
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
