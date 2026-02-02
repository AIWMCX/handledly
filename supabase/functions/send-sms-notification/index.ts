import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { 
  validateRequestSize, 
  secureJsonResponse, 
  secureErrorResponse,
  securityHeaders 
} from "../_shared/security.ts";

interface SMSRequest {
  leadId: string;
  verificationToken: string;
  customerName: string;
  phone: string;
  totalQuote: number;
  quoteNumber: string;
  serviceType?: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    // VALIDATE REQUEST SIZE (100KB limit)
    const { body: bodyText, error: sizeError } = await validateRequestSize(req, corsHeaders);
    if (sizeError) return sizeError;

    const { leadId, verificationToken, customerName, phone, totalQuote, quoteNumber } = 
      JSON.parse(bodyText) as SMSRequest;

    console.log(`Processing SMS notification for lead: ${leadId}`);

    // Validate required fields
    if (!leadId || !verificationToken || !phone) {
      console.error("Missing required fields");
      return secureErrorResponse("Missing required fields", corsHeaders, 400);
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Verify the token matches the lead and lead was created recently (5 min window)
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, verification_token, created_at, notes")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      console.error("Lead not found:", leadError);
      return secureErrorResponse("Lead not found", corsHeaders, 404);
    }

    // Verify token
    if (lead.verification_token !== verificationToken) {
      console.error("Invalid verification token");
      return secureErrorResponse("Invalid verification token", corsHeaders, 403);
    }

    // Verify timing (5 minute window)
    const createdAt = new Date(lead.created_at);
    const now = new Date();
    const timeDiffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (timeDiffMinutes > 5) {
      console.error("Verification window expired");
      return secureErrorResponse("Verification window expired", corsHeaders, 403);
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("Twilio credentials not configured");
      return secureErrorResponse("SMS service not configured", corsHeaders, 500);
    }

    // Format phone number (ensure E.164 format)
    const cleanPhone = phone.replace(/\D/g, "");
    
    // CRITICAL: Validate US phone number before sending SMS
    const isValidUS = (cleanPhone.length === 10 && cleanPhone[0] !== '0' && cleanPhone[0] !== '1') ||
                      (cleanPhone.length === 11 && cleanPhone.startsWith('1') && cleanPhone[1] !== '0' && cleanPhone[1] !== '1');
    
    if (!isValidUS) {
      console.warn(`[send-sms-notification] Skipping SMS - non-US phone number detected: ${phone}`);
      return secureJsonResponse(
        { 
          success: false, 
          skipped: true,
          reason: "Non-US phone number not supported",
          message: "SMS only available for US phone numbers" 
        },
        corsHeaders
      );
    }
    
    const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`;

    // Compose SMS message
    const firstName = customerName.split(" ")[0] || "there";
    const formattedQuote = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(totalQuote);

    const messageBody = `Hi ${firstName}! 🏠 Thanks for requesting a quote from Handledly Moving. Your estimate: ${formattedQuote} (Quote #${quoteNumber}). We'll call you shortly to confirm details. Questions? Reply to this text or call (878) 218-7397. - The Handledly Team`;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhoneNumber,
        Body: messageBody,
      }),
    });

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.text();
      console.error("Twilio API error:", errorData);
      
      // Log error to lead notes (non-blocking)
      supabase
        .from("leads")
        .update({
          notes: lead.notes 
            ? `${lead.notes}\n[SMS Error: ${errorData}]` 
            : `[SMS Error: ${errorData}]`,
        })
        .eq("id", leadId)
        .then(({ error: updateErr }) => {
          if (updateErr) console.error('[send-sms-notification] Failed to update lead notes:', updateErr.message);
        });

      return secureJsonResponse(
        { error: "Failed to send SMS", details: errorData },
        corsHeaders,
        500
      );
    }

    const twilioData = await twilioResponse.json();
    console.log("SMS sent successfully:", twilioData.sid);

    // Update lead notes with SMS confirmation (non-blocking)
    supabase
      .from("leads")
      .update({
        notes: lead.notes 
          ? `${lead.notes}\n[SMS sent: ${new Date().toISOString()}]` 
          : `[SMS sent: ${new Date().toISOString()}]`,
      })
      .eq("id", leadId)
      .then(({ error: updateErr }) => {
        if (updateErr) console.error('[send-sms-notification] Failed to update lead notes:', updateErr.message);
      });

    return secureJsonResponse(
      { 
        success: true, 
        messageSid: twilioData.sid,
        message: "SMS notification sent successfully" 
      },
      corsHeaders
    );

  } catch (error: unknown) {
    console.error("Error sending SMS:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return secureErrorResponse("Internal server error", corsHeaders, 500);
  }
});
