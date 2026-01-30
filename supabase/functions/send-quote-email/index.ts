import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

import { getCorsHeaders } from "../_shared/cors.ts";

// Rate limiting configuration
const RATE_LIMIT_MAX = 5; // 5 emails per minute
const RATE_LIMIT_WINDOW = 1;

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

interface QuoteEmailRequest {
  leadId: string;
  verificationToken?: string;
  conversationId?: string; // For server-side lead linkage
  firstName: string;
  lastName: string;
  customerName: string; // Fallback
  email: string;
  phone: string;
  serviceType: string;
  crewSize: number;
  hourlyRate: number;
  estimatedHours: number;
  laborCost: number;
  specialtyFee: number;
  totalQuote: number;
  quoteNumber?: string;
  moveDate?: string;
  moveFrom?: string;
  moveTo?: string;
  specialtyItems?: string[];
  notes?: string;
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

// Updated February 2026 - 200lb Iron Law threshold
const SPECIALTY_LABELS: Record<string, string> = {
  'piano-upright': 'Upright Piano (200+ lbs - 3 movers)',
  'piano-grand': 'Grand Piano (200+ lbs - 3 movers)',
  'pool-table-move': 'Pool Table (Move Only - 3 movers)',
  'pool-table-full': 'Pool Table (Full Service - 3 movers)',
  'safe-small': 'Safe (Under 200lbs)',
  'safe-large': 'Safe (200+ lbs - 3 movers @ $179/hr)',
  'safe-gun': 'Gun Safe (200+ lbs - 3 movers @ $179/hr)',
  'hot-tub': 'Hot Tub (200+ lbs - 3 movers)',
  'gym-equipment': 'Gym Equipment',
  'motorcycle': 'Motorcycle',
};

// Retry logic for reliability with rate limit handling
async function sendEmailWithRetry(emailData: any, maxRetries = 4): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(emailData);
      return result;
    } catch (error: any) {
      console.error(`[send-quote-email] Attempt ${attempt} failed:`, error);
      
      // Check if it's a rate limit error (429)
      const isRateLimit = error?.statusCode === 429 || 
                          error?.name === 'rate_limit_exceeded' ||
                          error?.message?.includes('rate limit');
      
      if (attempt === maxRetries) throw error;
      
      // Wait longer for rate limits (2-8 seconds), shorter for other errors
      const baseDelay = isRateLimit ? 2000 : 1000;
      const delay = baseDelay * attempt;
      console.log(`[send-quote-email] Waiting ${delay}ms before retry...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

function generateEmailHtml(data: QuoteEmailRequest): string {
  // Parse first and last name
  const firstName = data.firstName || data.customerName?.split(' ')[0] || 'Friend';
  const lastName = data.lastName || data.customerName?.split(' ').slice(1).join(' ') || '';
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  
  const serviceLabel = SERVICE_LABELS[data.serviceType] || data.serviceType;
  const moveDateFormatted = data.moveDate 
    ? new Date(data.moveDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'To be scheduled';
  
  const specialtyItemsList = data.specialtyItems?.length 
    ? data.specialtyItems.map(item => SPECIALTY_LABELS[item] || item).join(', ')
    : 'None';

  // IRON LAW: Detect if this service requires 3 movers @ $179/hr
  const IRON_LAW_SERVICES = ['piano-moving', 'pool-table', 'safe-moving', 'heavy-items', 'piano', 'heavy-over-200'];
  const isIronLawService = IRON_LAW_SERVICES.includes(data.serviceType);

  // Iron Law Notice HTML (only shown for 200+ lb item services)
  const ironLawNotice = isIronLawService ? `
              <!-- Iron Law Safety Notice -->
              <div style="margin-bottom: 25px; padding: 16px 20px; background: linear-gradient(135deg, #1C1917 0%, #292524 100%); border-radius: 10px; border: 2px solid #D4AF37;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="40" style="vertical-align: top;">
                      <span style="font-size: 28px;">⚠️</span>
                    </td>
                    <td style="padding-left: 10px;">
                      <p style="margin: 0 0 5px; font-size: 14px; font-weight: 700; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px;">
                        200LB IRON LAW — SAFETY REQUIREMENT
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #A8A29E; line-height: 1.5;">
                        Items 200+ lbs require a <strong style="color: #FAFAF9;">3-mover crew</strong> at our <strong style="color: #FAFAF9;">$179/hr</strong> safety rate. This protects both your belongings and our team. Your quote reflects this requirement.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Moving Quote from Handledly Moving Services</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0C0A09; color: #FAFAF9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0C0A09;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #FAFAF9;">
                🏠 HANDLEDLY
              </h1>
              <p style="margin: 10px 0 0; font-size: 14px; color: #A8A29E;">Moving Services</p>
              <p style="margin: 10px 0 0; font-size: 16px; color: #D4AF37;">
                Your Quote is Ready
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C1917 0%, #292524 100%); border-radius: 16px; border: 1px solid #44403C; padding: 40px;">
              
              ${data.quoteNumber ? `
              <!-- Quote Number Badge -->
              <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #0C0A09; border-radius: 12px; border: 2px solid #D4AF37;">
                <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #78716C;">
                  YOUR QUOTE NUMBER
                </p>
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #D4AF37; letter-spacing: 3px; font-family: monospace;">
                  ${data.quoteNumber}
                </p>
                <p style="margin: 10px 0 0; font-size: 12px; color: #A8A29E;">
                  Reference this number when speaking with our team
                </p>
              </div>
              ` : ''}
              
              ${ironLawNotice}
              
              <!-- Personal Greeting with Appreciation -->
              <p style="margin: 0 0 10px; font-size: 20px; color: #FAFAF9; font-weight: 600;">
                Dear ${fullName},
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; color: #A8A29E; line-height: 1.7;">
                <strong style="color: #D4AF37;">Thank you for choosing Handledly Moving Services!</strong> We truly appreciate your trust in us for your upcoming move. Our team is honored to be part of your moving journey and is committed to making this a stress-free experience.
              </p>
              
              <!-- Move Details Box -->
              ${data.moveFrom || data.moveTo ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0C0A09; border-radius: 12px; border: 1px solid #44403C; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #D4AF37; font-weight: 700;">
                      📋 YOUR MOVE DETAILS
                    </h3>
                    
                    <!-- Move Date -->
                    <div style="margin-bottom: 18px;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; font-weight: 600;">
                        📅 MOVE DATE
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #FAFAF9; font-weight: 500;">
                        ${moveDateFormatted}
                      </p>
                    </div>
                    
                    ${data.moveFrom ? `
                    <!-- From Address -->
                    <div style="margin-bottom: 18px;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; font-weight: 600;">
                        📍 MOVING FROM
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #FAFAF9; font-weight: 500;">
                        ${data.moveFrom}
                      </p>
                    </div>
                    ` : ''}
                    
                    ${data.moveTo ? `
                    <!-- To Address -->
                    <div style="margin-bottom: 0;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; font-weight: 600;">
                        📍 MOVING TO
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #FAFAF9; font-weight: 500;">
                        ${data.moveTo}
                      </p>
                    </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Quote Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0C0A09; border-radius: 12px; border: 1px solid #44403C; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    
                    <!-- Service Type -->
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #44403C;">
                      <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #D4AF37;">
                        SERVICE
                      </p>
                      <p style="margin: 0; font-size: 20px; font-weight: 600; color: #FAFAF9;">
                        ${serviceLabel}
                      </p>
                    </div>
                    
                    <!-- Crew & Rate -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <td width="50%" style="padding-right: 10px;">
                          <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716C;">
                            👥 CREW SIZE
                          </p>
                          <p style="margin: 0; font-size: 16px; color: #FAFAF9;">
                            ${data.crewSize} Movers + Truck
                          </p>
                        </td>
                        <td width="50%" style="padding-left: 10px;">
                          <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716C;">
                            💰 HOURLY RATE
                          </p>
                          <p style="margin: 0; font-size: 16px; color: #D4AF37; font-weight: 600;">
                            $${data.hourlyRate}/hour
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Hours & Date -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <td width="50%" style="padding-right: 10px;">
                          <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716C;">
                            ⏱️ EST. HOURS
                          </p>
                          <p style="margin: 0; font-size: 16px; color: #FAFAF9;">
                            ~${data.estimatedHours} hours
                          </p>
                        </td>
                        <td width="50%" style="padding-left: 10px;">
                          <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716C;">
                            🚚 SERVICE TYPE
                          </p>
                          <p style="margin: 0; font-size: 16px; color: #FAFAF9;">
                            Full Service
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Divider -->
                    <div style="height: 1px; background-color: #44403C; margin: 20px 0;"></div>
                    
                    <!-- Price Breakdown -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #A8A29E;">Labor (${data.estimatedHours} hrs × $${data.hourlyRate})</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #FAFAF9;">$${data.laborCost}</span>
                        </td>
                      </tr>
                      ${data.specialtyFee > 0 ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #A8A29E;">Specialty Items</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #FAFAF9;">+$${data.specialtyFee}</span>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td colspan="2" style="padding-top: 15px; border-top: 2px solid #D4AF37;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <span style="font-size: 18px; font-weight: 600; color: #FAFAF9;">ESTIMATED TOTAL</span>
                              </td>
                              <td align="right">
                                <span style="font-size: 28px; font-weight: 700; color: #D4AF37;">$${data.totalQuote}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- No Hidden Fees Badge -->
              <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0C0A09;">
                  ✓ NO HIDDEN FEES — JUST A FLAT HOURLY RATE
                </p>
              </div>
              
              <!-- What's Included -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px;">
                  Everything Included:
                </h3>
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr><td style="padding: 5px 0; color: #A8A29E;">✓ Professional moving crew</td></tr>
                  <tr><td style="padding: 5px 0; color: #A8A29E;">✓ Moving truck with fuel included</td></tr>
                  <tr><td style="padding: 5px 0; color: #A8A29E;">✓ All packing materials (blankets, wrap, tape)</td></tr>
                  <tr><td style="padding: 5px 0; color: #A8A29E;">✓ Furniture disassembly & reassembly</td></tr>
                  
                  <tr><td style="padding: 5px 0; color: #A8A29E;">✓ NO stair or elevator fees</td></tr>
                  <tr><td style="padding: 5px 0; color: #A8A29E;">✓ NO truck/fuel surcharges</td></tr>
                </table>
              </div>
              
              ${data.specialtyItems?.length ? `
              <!-- Specialty Items -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px; font-size: 14px; color: #78716C; text-transform: uppercase; letter-spacing: 1px;">
                  Specialty Items:
                </h3>
                <p style="margin: 0; color: #FAFAF9;">${specialtyItemsList}</p>
              </div>
              ` : ''}
              
              ${data.notes ? `
              <!-- Additional Notes -->
              <div style="margin-bottom: 30px; padding: 15px; background-color: #0C0A09; border-radius: 8px; border: 1px solid #44403C;">
                <h3 style="margin: 0 0 10px; font-size: 14px; color: #78716C; text-transform: uppercase; letter-spacing: 1px;">
                  Your Notes:
                </h3>
                <p style="margin: 0; color: #A8A29E; font-style: italic;">${data.notes}</p>
              </div>
              ` : ''}
              
              <!-- CTA Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 5px;">
                    <a href="tel:+18782187397" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #0C0A09; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 8px;">
                      📞 SCHEDULE MY MOVE
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Confirmation Call Notice -->
              <div style="margin-top: 30px; padding: 20px; background-color: #1C1917; border-radius: 8px; border-left: 4px solid #D4AF37;">
                <p style="margin: 0; font-size: 14px; color: #FAFAF9; line-height: 1.6;">
                  <strong>📱 Expect a call in ~30 seconds!</strong><br>
                  <span style="color: #A8A29E;">Our friendly team will call to confirm your quote details and help you schedule your move.</span>
                </p>
              </div>
              
              <!-- Closing Appreciation -->
              <div style="text-align: center; padding: 30px 0 0;">
                <p style="margin: 0 0 10px; color: #FAFAF9; font-size: 16px; line-height: 1.6;">
                  We're honored to be part of your moving journey.
                </p>
                <p style="margin: 0; color: #D4AF37; font-size: 18px; font-weight: 600;">
                  Thank you again for choosing Handledly!
                </p>
                <p style="margin: 20px 0 0; color: #A8A29E; font-size: 14px;">
                  Warm regards,<br>
                  <strong style="color: #FAFAF9;">The Handledly Team</strong>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #78716C;">
                Handledly Moving Services • Licensed & Insured • Serving Denver Metro
              </p>
              <p style="margin: 0 0 10px; font-size: 14px; color: #78716C;">
                📞 (878) 218-7397 | (719) 920-3282 • 📧 hello@handledly.com
              </p>
              <p style="margin: 0; font-size: 12px; color: #57534E;">
                Business Hours: Mon-Fri 7am-8pm, Sat 7am-6pm, Sun 8am-5pm
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
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QuoteEmailRequest = await req.json();
    
    // Parse names for logging
    const firstName = data.firstName || data.customerName?.split(' ')[0] || 'Customer';
    const lastName = data.lastName || '';
    
    console.log(`[send-quote-email] Processing request for lead: ${data.leadId}`);

    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // SEC-001: Verify token and lead freshness before sending email
    if (data.verificationToken) {
      const { data: lead, error: verifyError } = await supabase
        .from('leads')
        .select('id, verification_token, email_sent, created_at')
        .eq('id', data.leadId)
        .single();

      if (verifyError || !lead) {
        console.error('[send-quote-email] Lead verification failed:', verifyError?.message);
        return new Response(
          JSON.stringify({ error: 'Invalid request' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify token matches
      if (lead.verification_token !== data.verificationToken) {
        console.error('[send-quote-email] Token mismatch for lead:', data.leadId);
        return new Response(
          JSON.stringify({ error: 'Invalid request' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if email was already sent (prevent replay)
      if (lead.email_sent) {
        console.log('[send-quote-email] Email already sent for lead:', data.leadId);
        return new Response(
          JSON.stringify({ success: true, message: 'Email already sent' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check lead freshness (created within last 5 minutes)
      const createdAt = new Date(lead.created_at);
      const now = new Date();
      const ageMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      if (ageMinutes > 5) {
        console.error('[send-quote-email] Lead too old:', ageMinutes, 'minutes');
        return new Response(
          JSON.stringify({ error: 'Request expired' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // SEC-003: Server-side lead linkage to conversation (RLS prevents client-side updates)
      if (data.conversationId) {
        const { error: linkError } = await supabase
          .from('chat_conversations')
          .update({ lead_id: data.leadId })
          .eq('id', data.conversationId);
        
        if (linkError) {
          console.error('[send-quote-email] Failed to link conversation:', linkError.message);
          // Non-fatal: continue with email sending
        } else {
          console.log('[send-quote-email] Linked lead to conversation:', data.conversationId);
        }
      }
    }

    console.log(`[send-quote-email] Recipient: ${firstName} ${lastName} <${data.email}>`);
    console.log(`[send-quote-email] Quote total: $${data.totalQuote}`);

    // Send the email with retry logic - USING VERIFIED DOMAIN
    const emailResponse = await sendEmailWithRetry({
      from: "Handledly Moving Services <noreply@handledly.com>",
      to: [data.email],
      subject: `Your Moving Quote: $${data.totalQuote} - Handledly Moving Services`,
      html: generateEmailHtml(data),
    });

    // CRITICAL: Check for Resend API errors before marking as success
    if (emailResponse.error) {
      console.error("[send-quote-email] Resend API error:", JSON.stringify(emailResponse.error));
      
      // Update lead with failure status
      await supabase
        .from('leads')
        .update({
          email_sent: false,
          notes: `Email failed: ${emailResponse.error.message || 'Unknown Resend error'}`,
        })
        .eq('id', data.leadId);

      return new Response(JSON.stringify({ 
        success: false, 
        error: emailResponse.error.message || 'Email delivery failed'
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Email sent successfully - log the actual message ID
    console.log("[send-quote-email] Email delivered successfully. Message ID:", emailResponse.data?.id);

    // Update lead in database to mark email as sent
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq('id', data.leadId);

    if (updateError) {
      console.error("[send-quote-email] Error updating lead:", updateError);
    } else {
      console.log(`[send-quote-email] Lead ${data.leadId} marked as email sent`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-quote-email] Error:", error);
    // SEC-002: Sanitized error response - no internal details exposed
    return new Response(
      JSON.stringify({ error: 'Email service temporarily unavailable' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
