import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * submit-move-request
 * Authenticated customers submit a marketplace move request.
 * Creates / reuses a customer row, inserts move_requests, optionally links to a lead.
 */

interface Body {
  // Required
  moveType: string;          // 'local' | 'long-distance' | 'same-day' | etc.
  moveSize: string;          // 'studio' | '1-bedroom' | '2-bedroom' | etc.
  originZip: string;
  destZip: string;

  // Optional
  originCity?: string;
  originState?: string;
  destCity?: string;
  destState?: string;
  preferredMoveDate?: string;
  flexibleDates?: boolean;
  notes?: string;
  estimatedHours?: number;
  bedrooms?: number;

  // Customer profile (used to create/upsert the customer row if missing)
  fullName?: string;
  phone?: string;

  // Optional cross-link to a Handledly direct lead created by submit-quote
  leadId?: string;

  // UTM
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

function isZip(z: unknown): z is string {
  return typeof z === "string" && /^\d{5}$/.test(z);
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth client (validates the user JWT)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Body = await req.json();

    // Basic validation
    if (!body.moveType || !body.moveSize) {
      return new Response(JSON.stringify({ error: "moveType and moveSize are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!isZip(body.originZip) || !isZip(body.destZip)) {
      return new Response(JSON.stringify({ error: "Origin and destination ZIP must be 5 digits" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client (RLS-bypassing for managed inserts)
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // 1. Ensure a customer row exists for this auth user
    let { data: customer } = await admin
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!customer) {
      const [first, ...rest] = (body.fullName ?? "").trim().split(" ");
      const { data: created, error: createErr } = await admin
        .from("customers")
        .insert({
          user_id: user.id,
          email: user.email ?? "",
          first_name: first || null,
          last_name: rest.join(" ") || null,
          phone: body.phone ?? null,
          utm_source: body.utm_source ?? null,
          utm_medium: body.utm_medium ?? null,
          utm_campaign: body.utm_campaign ?? null,
        })
        .select("id")
        .single();
      if (createErr || !created) {
        console.error("[submit-move-request] customer create failed", createErr);
        return new Response(JSON.stringify({ error: "Could not create customer profile" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      customer = created;
    }

    // 2. Insert the move request
    const { data: moveRequest, error: mrErr } = await admin
      .from("move_requests")
      .insert({
        customer_id: customer.id,
        lead_id: body.leadId ?? null,
        move_type: body.moveType,
        move_size: body.moveSize,
        origin_zip: body.originZip,
        origin_city: body.originCity ?? null,
        origin_state: body.originState ?? null,
        dest_zip: body.destZip,
        dest_city: body.destCity ?? null,
        dest_state: body.destState ?? null,
        preferred_move_date: body.preferredMoveDate ?? null,
        flexible_dates: body.flexibleDates ?? false,
        notes: body.notes ?? null,
        status: "pending",
      })
      .select("id, status, created_at")
      .single();

    if (mrErr || !moveRequest) {
      console.error("[submit-move-request] insert failed", mrErr);
      return new Response(JSON.stringify({ error: "Could not create move request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[submit-move-request] created ${moveRequest.id} for customer ${customer.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        moveRequestId: moveRequest.id,
        status: moveRequest.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[submit-move-request] unexpected error", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
