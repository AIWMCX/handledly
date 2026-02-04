import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * capture-lead Edge Function
 * Handles lead capture from Exit Intent Modal and Coming Soon Signup
 * Uses service role to bypass RLS for controlled public lead insertion
 */

// Validation schema for lead capture
const captureLeadSchema = z.object({
  email: z.string().email("Invalid email address").max(320).transform(val => val.trim().toLowerCase()),
  phone: z.string().max(30).optional().default(""),
  full_name: z.string().max(200).optional().default("Lead Capture"),
  notes: z.string().max(2000).optional(),
  lead_source: z.string().max(100).optional().default("website"),
  // Honeypot fields
  website_url: z.string().optional(),
  honeypot: z.string().optional(),
});

// Rate limiting check
// deno-lint-ignore no-explicit-any
async function checkRateLimit(supabase: any, ipHash: string): Promise<boolean> {
  const { data } = await supabase.rpc('check_rate_limit_readonly', {
    p_table_name: 'leads',
    p_identifier: ipHash,
    p_max_requests: 10,
    p_time_window_minutes: 60
  });
  return data !== false;
}

// Generate IP hash for rate limiting
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + '-capture-lead');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";
    const ipHash = await hashIP(clientIP);

    // Parse request body
    const body = await req.json();
    
    // Validate input
    const validation = captureLeadSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
      console.log("[capture-lead] Validation failed:", errors);
      return new Response(
        JSON.stringify({ error: "Validation failed", details: errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = validation.data;

    // Honeypot detection - reject if filled
    if (data.website_url || data.honeypot) {
      console.log("[capture-lead] Honeypot triggered, rejecting");
      // Return success to avoid detection
      return new Response(
        JSON.stringify({ success: true, message: "Lead captured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Check rate limit
    const withinLimit = await checkRateLimit(supabase, ipHash);
    if (!withinLimit) {
      console.log("[capture-lead] Rate limit exceeded for IP:", ipHash.substring(0, 8));
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert lead with service role (bypasses RLS)
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || "N/A",
        notes: data.notes,
        lead_source: data.lead_source,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[capture-lead] Database error:", error.message);
      
      // Check for duplicate email (common case)
      if (error.code === "23505") {
        return new Response(
          JSON.stringify({ success: true, message: "Email already registered" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw error;
    }

    console.log("[capture-lead] Lead created:", lead.id);

    return new Response(
      JSON.stringify({ success: true, message: "Lead captured", leadId: lead.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[capture-lead] Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
