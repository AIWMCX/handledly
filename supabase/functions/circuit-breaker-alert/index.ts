import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Admin emails to notify
const ADMIN_EMAILS = [
  "aiwmcsrm@gmail.com",
  "nevulis22@gmail.com",
  "saych.88@gmail.com",
];

interface CircuitBreakerAlertRequest {
  serviceName: string;
  tripReason: string;
  currentSpend: number;
  limit: number;
  limitType: "hourly" | "daily";
  trippedAt: string;
}

function generateAlertEmail(data: CircuitBreakerAlertRequest): string {
  const limitTypeLabel = data.limitType === "hourly" ? "Hourly" : "Daily";
  const emoji = data.limitType === "hourly" ? "⏰" : "📅";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Circuit Breaker Alert - ${data.serviceName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0C0A09; color: #FAFAF9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0C0A09;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #DC2626;">
                🚨 CIRCUIT BREAKER TRIPPED
              </h1>
              <p style="margin: 10px 0 0; font-size: 14px; color: #A8A29E;">
                Cost Protection System Alert
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C1917 0%, #292524 100%); border-radius: 16px; border: 2px solid #DC2626; padding: 40px;">
              
              <!-- Alert Badge -->
              <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #DC2626; border-radius: 12px;">
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #FAFAF9;">
                  ${data.serviceName.toUpperCase()} SERVICE DISABLED
                </p>
              </div>
              
              <!-- Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0C0A09; border-radius: 12px; border: 1px solid #44403C; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #DC2626; font-weight: 700;">
                      📊 ALERT DETAILS
                    </h3>
                    
                    <div style="margin-bottom: 18px;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; font-weight: 600;">🔧 SERVICE</p>
                      <p style="margin: 0; font-size: 18px; color: #FAFAF9; font-weight: 600;">${data.serviceName}</p>
                    </div>
                    
                    <div style="margin-bottom: 18px;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; font-weight: 600;">⚠️ REASON</p>
                      <p style="margin: 0; font-size: 16px; color: #DC2626; font-weight: 500;">${data.tripReason}</p>
                    </div>
                    
                    <div style="margin-bottom: 18px;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; font-weight: 600;">${emoji} ${limitTypeLabel.toUpperCase()} SPEND</p>
                      <p style="margin: 0; font-size: 20px; color: #FAFAF9;">
                        <span style="color: #DC2626; font-weight: 700;">$${data.currentSpend.toFixed(2)}</span>
                        <span style="color: #78716C;"> / </span>
                        <span style="color: #22C55E;">$${data.limit.toFixed(2)}</span>
                        <span style="color: #78716C;"> limit</span>
                      </p>
                    </div>
                    
                    <div>
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; font-weight: 600;">🕐 TRIGGERED AT</p>
                      <p style="margin: 0; font-size: 16px; color: #FAFAF9;">
                        ${new Date(data.trippedAt).toLocaleString("en-US", { 
                          weekday: "long", year: "numeric", month: "long", day: "numeric",
                          hour: "2-digit", minute: "2-digit", timeZoneName: "short"
                        })}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- What This Means -->
              <div style="margin-bottom: 30px; padding: 20px; background-color: #0C0A09; border-radius: 8px; border-left: 4px solid #F59E0B;">
                <h3 style="margin: 0 0 10px; font-size: 14px; color: #F59E0B; text-transform: uppercase;">What This Means</h3>
                <ul style="margin: 0; padding-left: 20px; color: #A8A29E; line-height: 1.8;">
                  <li>The <strong style="color: #FAFAF9;">${data.serviceName}</strong> service has been <strong style="color: #DC2626;">automatically disabled</strong></li>
                  <li>New requests to this service will be blocked until limits reset</li>
                  <li>${data.limitType === "hourly" ? "Hourly limits reset every hour on the hour" : "Daily limits reset at midnight UTC"}</li>
                  <li>You can manually reset the circuit breaker in the Admin Dashboard</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px;">
                    <a href="https://handledly.com/admin/cost-monitoring" 
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #0C0A09; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 8px;">
                      🔧 MANAGE IN ADMIN DASHBOARD
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #78716C;">
                This is an automated alert from the Handledly Cost Protection System
              </p>
              <p style="margin: 0; font-size: 12px; color: #44403C;">
                © ${new Date().getFullYear()} Handledly Moving Services
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // AUTH: Only allow internal calls (database triggers via pg_net)
  const authHeader = req.headers.get('Authorization');
  const expectedAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authHeader || !expectedAnonKey || !authHeader.includes(expectedAnonKey)) {
    console.warn('[circuit-breaker-alert] Unauthorized request rejected');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data: CircuitBreakerAlertRequest = await req.json();
    
    // Validate required fields
    if (!data.serviceName || !data.tripReason || data.currentSpend === undefined || data.limit === undefined) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("[circuit-breaker-alert] Sending alert for:", data.serviceName);
    
    // Send email to all admins
    const emailPromises = ADMIN_EMAILS.map(email => 
      resend.emails.send({
        from: "Handledly Alerts <alerts@handledly.com>",
        to: [email],
        subject: `🚨 ALERT: ${data.serviceName} Circuit Breaker Tripped`,
        html: generateAlertEmail(data),
      })
    );
    
    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === "fulfilled").length;
    const failedCount = results.filter(r => r.status === "rejected").length;
    
    console.log(`[circuit-breaker-alert] Sent ${successCount}/${ADMIN_EMAILS.length} emails`);
    
    if (failedCount > 0) {
      const failures = results
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map(r => r.reason);
      console.error("[circuit-breaker-alert] Some emails failed:", failures);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: successCount,
        emailsFailed: failedCount
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("[circuit-breaker-alert] Error:", error);
    // Sanitized error response
    return new Response(
      JSON.stringify({ success: false, error: 'Alert delivery failed' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
