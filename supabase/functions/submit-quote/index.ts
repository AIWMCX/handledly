import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { quoteSubmissionSchema, validateRequest } from "../_shared/validation.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { calculateQuoteSimple, isIronLawService, HOURLY_RATES } from "../_shared/quote-calculator.ts";

// Validate email format (backup validation)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

// Validate US phone number (backup validation)
function isValidUSPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return /^[2-9]\d{9}$/.test(cleaned);
  if (cleaned.length === 11 && cleaned.startsWith('1')) return /^1[2-9]\d{9}$/.test(cleaned);
  return false;
}

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
  return phone;
}

// Generate HD-XXXXX quote number
function generateQuoteNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'HD-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Rate limiting check via IP hash
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    const ipHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(clientIP + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.slice(0, 16))
    ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

    // Parse and validate request body
    const body = await req.json();
    
    // Honeypot check - if filled, silently reject
    if (body.website_url || body.honeypot) {
      console.log("[submit-quote] Honeypot triggered, blocking request");
      // Return success to not alert bots
      return new Response(JSON.stringify({ 
        success: true, 
        quoteNumber: generateQuoteNumber(),
        total: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ZOD VALIDATION - Comprehensive input validation
    const validation = validateRequest(quoteSubmissionSchema, body);
    if (!validation.success) {
      console.log("[submit-quote] Validation failed:", validation.errors);
      return new Response(JSON.stringify({ 
        error: validation.errors?.[0] || "Invalid input" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const validatedData = validation.data!;
    
    // Extract validated fields
    const fullName = validatedData.fullName;
    const email = validatedData.email;
    const phone = validatedData.phone; // Already cleaned by schema
    const serviceType = validatedData.serviceType;
    
    // Backup validations (defense in depth)
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidUSPhone(phone)) {
      return new Response(JSON.stringify({ error: "Please enter a valid US phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract optional fields (already validated by zod)
    const moveFromAddress = validatedData.moveFromAddress || null;
    const moveToAddress = validatedData.moveToAddress || null;
    const moveDate = validatedData.moveDate || null;
    const notes = validatedData.notes || null;
    const bedrooms = validatedData.bedrooms ?? 0;
    const preferEmailOnly = validatedData.preferEmailOnly ?? false;
    const hasStairs = validatedData.hasStairs ?? false;
    const crewSize = validatedData.crewSize ?? 2;
    const estimatedHours = validatedData.estimatedHours ?? 3;
    
    // UTM tracking (already validated)
    const leadSource = validatedData.lead_source || 'website';
    const utmSource = validatedData.utm_source || null;
    const utmMedium = validatedData.utm_medium || null;
    const utmCampaign = validatedData.utm_campaign || null;
    const utmContent = validatedData.utm_content || null;
    const utmTerm = validatedData.utm_term || null;

    // Calculate quote using shared module
    const crewConfig = isIronLawService(serviceType) ? 'moving-3-movers' : 
                       crewSize >= 4 ? 'moving-4-movers' :
                       crewSize >= 3 ? 'moving-3-movers' : 'moving-2-movers';
    
    const quote = calculateQuoteSimple(serviceType, bedrooms, crewConfig, estimatedHours);

    // Generate secure server-side tokens
    const leadId = crypto.randomUUID();
    const quoteRequestId = crypto.randomUUID();
    const quoteNumber = generateQuoteNumber();
    const verificationToken = crypto.randomUUID();

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limit (5 leads per hour per IP)
    const { count: recentLeadCount } = await supabaseAdmin
      .from("rate_limit_tracker")
      .select("*", { count: "exact", head: true })
      .eq("identifier", ipHash)
      .eq("table_name", "leads")
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if ((recentLeadCount || 0) >= 5) {
      return new Response(JSON.stringify({ 
        error: "Rate limit exceeded. Please try again later." 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record rate limit entry
    await supabaseAdmin.from("rate_limit_tracker").insert({
      identifier: ipHash,
      table_name: "leads",
    });

    // Insert lead with service role (bypasses RLS)
    const { error: leadError } = await supabaseAdmin.from("leads").insert({
      id: leadId,
      full_name: fullName,
      email: email,
      phone: normalizePhone(phone),
      property_type: serviceType,
      bedrooms: bedrooms,
      move_from_address: moveFromAddress,
      move_to_address: moveToAddress,
      move_date: moveDate,
      notes: notes,
      estimated_quote: quote.total,
      status: "new",
      prefer_email_only: preferEmailOnly,
      has_specialty_items: hasStairs,
      verification_token: verificationToken,
      lead_source: leadSource,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
    });

    if (leadError) {
      console.error("[submit-quote] Lead insert error:", leadError);
      return new Response(JSON.stringify({ error: "Failed to submit quote" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert quote request
    const { error: quoteError } = await supabaseAdmin.from("quote_requests").insert({
      id: quoteRequestId,
      lead_id: leadId,
      property_type: serviceType,
      bedrooms: bedrooms,
      has_stairs: hasStairs,
      floor_number: parseInt(body.floorNumber) || null,
      total_quote: quote.total,
      quote_number: quoteNumber,
    });

    if (quoteError) {
      console.error("[submit-quote] Quote request insert error:", quoteError);
      // Don't fail - lead was created successfully
    }

    // Split name for personalization
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "Friend";
    const lastName = nameParts.slice(1).join(" ") || "";

    console.log(`[submit-quote] Quote submitted: ${quoteNumber} for ${firstName} - $${quote.total}`);

    // Return success with quote details (for client-side use)
    return new Response(JSON.stringify({
      success: true,
      leadId: leadId,
      quoteNumber: quoteNumber,
      verificationToken: verificationToken,
      firstName: firstName,
      lastName: lastName,
      total: quote.total,
      crewSize: quote.crewSize,
      hourlyRate: quote.hourlyRate,
      estimatedHours: quote.estimatedHours,
      laborCost: quote.laborCost,
      specialtyFee: quote.specialtyFee,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[submit-quote] Error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
