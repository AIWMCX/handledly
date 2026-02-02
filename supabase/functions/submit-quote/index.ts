import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

// Validate US phone number
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

// Check for XSS patterns
function containsXSS(text: string): boolean {
  if (!text) return false;
  return /<script|javascript:|on\w+=/i.test(text);
}

// Sanitize text input
function sanitize(text: string | undefined | null, maxLength: number): string | null {
  if (!text) return null;
  const trimmed = text.trim().slice(0, maxLength);
  if (containsXSS(trimmed)) return null;
  return trimmed;
}

// Quote calculation (mirror of client-side logic)
interface QuoteResult {
  hourlyRate: number;
  crewSize: number;
  estimatedHours: number;
  laborCost: number;
  specialtyFee: number;
  total: number;
}

const IRON_LAW_SERVICES = ['piano-moving', 'safe-moving', 'piano', 'heavy-over-200'];
const IRON_LAW_RATE = 189;
const HEAVY_ITEMS_RATE = 169;

const HOURLY_RATES: Record<string, number> = {
  'labor-2-movers': 139,
  'labor-3-movers': 169,
  'labor-4-movers': 239,
  'moving-2-movers': 159,
  'moving-3-movers': 189,
  'moving-3-movers-2-trucks': 209,
  'moving-4-movers': 259,
  'heavy-items': 169,
  'iron-law-minimum': 189,
};

function isIronLawService(serviceType: string): boolean {
  return IRON_LAW_SERVICES.includes(serviceType);
}

function calculateQuote(
  serviceType: string,
  bedrooms: number,
  crewConfig: string,
  estimatedHours: number
): QuoteResult {
  const isIronLaw = isIronLawService(serviceType);
  
  // Determine crew size
  let crewSize: number;
  if (isIronLaw) {
    crewSize = 3;
  } else if (crewConfig.includes('4')) {
    crewSize = 4;
  } else if (crewConfig.includes('3')) {
    crewSize = 3;
  } else {
    crewSize = 2;
  }
  
  // Determine hourly rate
  let hourlyRate: number;
  if (isIronLaw) {
    hourlyRate = IRON_LAW_RATE;
  } else if (serviceType === 'heavy-items' || serviceType === 'pool-table' || serviceType === 'junk-removal') {
    hourlyRate = HEAVY_ITEMS_RATE;
  } else {
    hourlyRate = HOURLY_RATES[crewConfig] || HOURLY_RATES['moving-2-movers'];
  }
  
  const laborCost = hourlyRate * estimatedHours;
  const specialtyFee = 0; // Calculate separately if specialty items provided
  const total = laborCost + specialtyFee;
  
  return {
    hourlyRate,
    crewSize,
    estimatedHours,
    laborCost,
    specialtyFee,
    total,
  };
}

Deno.serve(async (req: Request) => {
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

    // Extract and validate required fields
    const fullName = sanitize(body.fullName, 200);
    const email = sanitize(body.email, 320);
    const phone = sanitize(body.phone, 30);
    const serviceType = sanitize(body.serviceType, 100);
    
    if (!fullName || !email || !phone || !serviceType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Extract optional fields
    const moveFromAddress = sanitize(body.moveFromAddress, 500);
    const moveToAddress = sanitize(body.moveToAddress, 500);
    const moveDate = body.moveDate || null;
    const notes = sanitize(body.notes, 2000);
    const bedrooms = Math.min(Math.max(0, parseInt(body.bedrooms) || 0), 20);
    const preferEmailOnly = body.preferEmailOnly === true;
    const hasStairs = body.hasStairs === true;
    const crewSize = Math.min(Math.max(2, parseInt(body.crewSize) || 2), 6);
    const estimatedHours = Math.min(Math.max(2, parseInt(body.estimatedHours) || 3), 12);
    
    // UTM tracking
    const leadSource = sanitize(body.lead_source, 100) || 'website';
    const utmSource = sanitize(body.utm_source, 200);
    const utmMedium = sanitize(body.utm_medium, 200);
    const utmCampaign = sanitize(body.utm_campaign, 200);
    const utmContent = sanitize(body.utm_content, 200);
    const utmTerm = sanitize(body.utm_term, 200);

    // Calculate quote server-side
    const crewConfig = isIronLawService(serviceType) ? 'moving-3-movers' : 
                       crewSize >= 4 ? 'moving-4-movers' :
                       crewSize >= 3 ? 'moving-3-movers' : 'moving-2-movers';
    
    const quote = calculateQuote(serviceType, bedrooms, crewConfig, estimatedHours);

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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
