import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

import { getCorsHeaders } from "../_shared/cors.ts";


// Parse admin emails from environment variable (comma-separated)
const ADMIN_EMAILS_RAW = Deno.env.get("ADMIN_NOTIFICATION_EMAILS") || "";
const ADMIN_EMAILS = ADMIN_EMAILS_RAW
  .split(",")
  .map((email) => email.trim())
  .filter((email) => email.length > 0 && email.includes("@"));

const ADMIN_PHONE = Deno.env.get("ADMIN_PHONE_NUMBER") || "";
const HIGH_VALUE_THRESHOLD = 1000;

interface LeadData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  estimated_quote: number | null;
  move_date: string | null;
  move_from_address: string | null;
  move_to_address: string | null;
  property_type: string | null;
  specialty_items: string[] | null;
  lead_source: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
}

function formatCurrency(amount: number | null): string {
  if (!amount) return "Pending";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimestamp(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    timeZone: "America/Denver",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " MST";
}

function getLeadSource(lead: LeadData): string {
  if (lead.utm_campaign) return `Campaign: ${lead.utm_campaign}`;
  if (lead.utm_source) return `Source: ${lead.utm_source}`;
  return lead.lead_source || "Direct Website";
}

function isHighValue(quote: number | null): boolean {
  return (quote || 0) >= HIGH_VALUE_THRESHOLD;
}

function generateEmailHTML(lead: LeadData): string {
  const isHigh = isHighValue(lead.estimated_quote);
  const urgencyBadge = isHigh 
    ? '<span style="background: #DC2626; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; margin-left: 8px;">HIGH VALUE</span>'
    : '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-radius: 12px 12px 0 0; padding: 24px; text-align: center; border-bottom: 3px solid #F59E0B;">
      <div style="color: #F59E0B; font-size: 12px; font-weight: 600; letter-spacing: 2px; margin-bottom: 8px;">
        🏠 NEW LEAD ALERT ${urgencyBadge}
      </div>
      <div style="color: #F8FAFC; font-size: 24px; font-weight: bold;">
        ${lead.full_name}
      </div>
      <div style="color: #94A3B8; font-size: 14px; margin-top: 4px;">
        ${formatTimestamp(lead.created_at)}
      </div>
    </div>

    <!-- Quote Summary -->
    <div style="background: #1E293B; padding: 24px; border-left: 1px solid #334155; border-right: 1px solid #334155;">
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 8px; padding: 20px; text-align: center;">
        <div style="color: #0F172A; font-size: 14px; font-weight: 600; margin-bottom: 4px;">QUOTE AMOUNT</div>
        <div style="color: #0F172A; font-size: 36px; font-weight: bold;">${formatCurrency(lead.estimated_quote)}</div>
        <div style="color: #0F172A; font-size: 12px; opacity: 0.8; margin-top: 4px;">
          ${lead.property_type || "Moving"} Service
        </div>
      </div>
    </div>

    <!-- Contact Details -->
    <div style="background: #1E293B; padding: 24px; border-left: 1px solid #334155; border-right: 1px solid #334155;">
      <div style="color: #94A3B8; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 12px;">CONTACT INFORMATION</div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Phone</td>
          <td style="padding: 8px 0; text-align: right;">
            <a href="tel:${lead.phone}" style="color: #F59E0B; text-decoration: none; font-weight: 600;">${lead.phone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Email</td>
          <td style="padding: 8px 0; text-align: right;">
            <a href="mailto:${lead.email}" style="color: #60A5FA; text-decoration: none;">${lead.email}</a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Move Details -->
    <div style="background: #1E293B; padding: 24px; border-left: 1px solid #334155; border-right: 1px solid #334155;">
      <div style="color: #94A3B8; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 12px;">MOVE DETAILS</div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Move Date</td>
          <td style="padding: 8px 0; text-align: right; color: #F8FAFC;">${formatDate(lead.move_date)}</td>
        </tr>
        ${lead.move_from_address ? `
        <tr>
          <td style="padding: 8px 0; color: #64748B; font-size: 14px;">From</td>
          <td style="padding: 8px 0; text-align: right; color: #F8FAFC; font-size: 13px;">${lead.move_from_address}</td>
        </tr>
        ` : ''}
        ${lead.move_to_address ? `
        <tr>
          <td style="padding: 8px 0; color: #64748B; font-size: 14px;">To</td>
          <td style="padding: 8px 0; text-align: right; color: #F8FAFC; font-size: 13px;">${lead.move_to_address}</td>
        </tr>
        ` : ''}
        ${lead.specialty_items && lead.specialty_items.length > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Special Items</td>
          <td style="padding: 8px 0; text-align: right; color: #FBBF24; font-size: 13px;">${lead.specialty_items.join(', ')}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Lead Source -->
    <div style="background: #1E293B; padding: 16px 24px; border-left: 1px solid #334155; border-right: 1px solid #334155;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #64748B; font-size: 13px;">Lead Source</span>
        <span style="color: #94A3B8; font-size: 13px; background: #334155; padding: 4px 12px; border-radius: 4px;">${getLeadSource(lead)}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div style="background: #1E293B; padding: 24px; border-left: 1px solid #334155; border-right: 1px solid #334155;">
      <a href="tel:${lead.phone}" style="display: block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #0F172A; text-decoration: none; padding: 16px 24px; border-radius: 8px; font-weight: bold; text-align: center; font-size: 16px; margin-bottom: 12px;">
        📞 Call Customer Now
      </a>
      <a href="https://handledly.com/admin/leads" style="display: block; background: #334155; color: #F8FAFC; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; text-align: center; font-size: 14px;">
        📋 View in Dashboard
      </a>
    </div>

    <!-- Footer -->
    <div style="background: #0F172A; border-radius: 0 0 12px 12px; padding: 16px 24px; border: 1px solid #334155; border-top: none; text-align: center;">
      <div style="color: #64748B; font-size: 11px;">
        Lead ID: ${lead.id.slice(0, 8)}... • Handledly Moving Services
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateSMSMessage(lead: LeadData): string {
  const firstName = lead.full_name.split(' ')[0];
  const amount = formatCurrency(lead.estimated_quote);
  const moveInfo = lead.move_date ? `Moving ${new Date(lead.move_date).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}` : "";
  const route = lead.move_from_address && lead.move_to_address 
    ? `${lead.move_from_address.split(',')[0]} → ${lead.move_to_address.split(',')[0]}`
    : "";

  return `🏠 NEW HIGH-VALUE LEAD
${amount} quote from ${firstName}
${moveInfo}${route ? ` | ${route}` : ''}
📞 ${lead.phone}`;
}

async function sendSMS(phone: string, message: string): Promise<boolean> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromPhone || !phone) {
    console.log("SMS credentials not configured or no admin phone");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          To: phone,
          From: fromPhone,
          Body: message,
        }),
      }
    );

    const result = await response.json();
    if (result.error_code) {
      console.error("Twilio SMS error:", result.message);
      return false;
    }
    console.log("SMS sent successfully:", result.sid);
    return true;
  } catch (error) {
    console.error("SMS send error:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // AUTH: Only allow internal calls (database triggers via pg_net)
  const authHeader = req.headers.get('Authorization');
  const expectedAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authHeader || !expectedAnonKey || !authHeader.includes(expectedAnonKey)) {
    console.warn('[notify-admin-new-lead] Unauthorized request rejected');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Fetch full lead data
    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (fetchError || !lead) {
      throw new Error(`Failed to fetch lead: ${fetchError?.message || "Not found"}`);
    }

    console.log(`Processing notification for lead: ${lead.full_name} (${lead.id})`);

    // Initialize Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Determine urgency
    const highValue = isHighValue(lead.estimated_quote);
    const subjectEmoji = highValue ? "🔥" : "🏠";
    const subject = `${subjectEmoji} New Lead: ${lead.full_name} — ${formatCurrency(lead.estimated_quote)} Quote`;

    // Send email to all admins
    const emailResults = await Promise.allSettled(
      ADMIN_EMAILS.map((email) =>
        resend.emails.send({
          from: "Handledly Alerts <noreply@handledly.com>",
          to: email,
          subject: subject,
          html: generateEmailHTML(lead),
        })
      )
    );

    const successfulEmails = emailResults.filter(
      (r) => r.status === "fulfilled"
    ).length;
    console.log(`Sent ${successfulEmails}/${ADMIN_EMAILS.length} notification emails`);

    // Send SMS for high-value leads
    let smsSent = false;
    if (highValue && ADMIN_PHONE) {
      smsSent = await sendSMS(ADMIN_PHONE, generateSMSMessage(lead));
    }

    return new Response(
      JSON.stringify({
        success: true,
        leadId: lead.id,
        emailsSent: successfulEmails,
        smsSent: smsSent,
        isHighValue: highValue,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("[notify-admin-new-lead] Error:", error);
    // Sanitized error response - no internal details
    return new Response(
      JSON.stringify({ error: 'Notification delivery failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
