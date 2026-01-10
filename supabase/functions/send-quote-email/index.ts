import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteEmailRequest {
  leadId: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  crewSize: number;
  hourlyRate: number;
  estimatedHours: number;
  laborCost: number;
  specialtyFee: number;
  totalQuote: number;
  moveDate?: string;
  moveFrom?: string;
  moveTo?: string;
  specialtyItems?: string[];
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
};

const SPECIALTY_LABELS: Record<string, string> = {
  'piano-upright': 'Upright Piano',
  'piano-grand': 'Grand Piano',
  'pool-table-move': 'Pool Table (Move Only)',
  'pool-table-full': 'Pool Table (Full Service)',
  'safe-small': 'Safe (Under 300lbs)',
  'safe-large': 'Safe (300-800lbs)',
  'safe-gun': 'Gun Safe',
  'hot-tub': 'Hot Tub',
  'gym-equipment': 'Gym Equipment',
  'motorcycle': 'Motorcycle',
};

function generateEmailHtml(data: QuoteEmailRequest): string {
  const serviceLabel = SERVICE_LABELS[data.serviceType] || data.serviceType;
  const moveDateFormatted = data.moveDate 
    ? new Date(data.moveDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'To be scheduled';
  
  const specialtyItemsList = data.specialtyItems?.length 
    ? data.specialtyItems.map(item => SPECIALTY_LABELS[item] || item).join(', ')
    : 'None';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Moving Quote from Denver Premium Moving</title>
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
                🏠 DENVER PREMIUM MOVING
              </h1>
              <p style="margin: 10px 0 0; font-size: 16px; color: #D4AF37;">
                Your Quote is Ready
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C1917 0%, #292524 100%); border-radius: 16px; border: 1px solid #44403C; padding: 40px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px; font-size: 18px; color: #FAFAF9;">
                Hi ${data.customerName},
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; color: #A8A29E; line-height: 1.6;">
                Thank you for choosing Denver Premium Moving! Here's your personalized quote with our transparent, flat-rate pricing.
              </p>
              
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
                            CREW SIZE
                          </p>
                          <p style="margin: 0; font-size: 16px; color: #FAFAF9;">
                            ${data.crewSize} Movers + Truck
                          </p>
                        </td>
                        <td width="50%" style="padding-left: 10px;">
                          <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716C;">
                            HOURLY RATE
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
                            EST. HOURS
                          </p>
                          <p style="margin: 0; font-size: 16px; color: #FAFAF9;">
                            ~${data.estimatedHours} hours
                          </p>
                        </td>
                        <td width="50%" style="padding-left: 10px;">
                          <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716C;">
                            MOVE DATE
                          </p>
                          <p style="margin: 0; font-size: 16px; color: #FAFAF9;">
                            ${moveDateFormatted}
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
                  <tr><td style="padding: 5px 0; color: #A8A29E;">✓ Floor & door protection</td></tr>
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
              
              ${data.moveFrom || data.moveTo ? `
              <!-- Move Details -->
              <div style="margin-bottom: 30px; padding: 15px; background-color: #0C0A09; border-radius: 8px; border: 1px solid #44403C;">
                ${data.moveFrom ? `<p style="margin: 0 0 10px; color: #A8A29E;"><strong style="color: #FAFAF9;">From:</strong> ${data.moveFrom}</p>` : ''}
                ${data.moveTo ? `<p style="margin: 0; color: #A8A29E;"><strong style="color: #FAFAF9;">To:</strong> ${data.moveTo}</p>` : ''}
              </div>
              ` : ''}
              
              <!-- CTA Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 5px;">
                    <a href="tel:+13035551234" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #0C0A09; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 8px;">
                      📞 SCHEDULE MY MOVE
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Confirmation Call Notice -->
              <div style="margin-top: 30px; padding: 20px; background-color: #1C1917; border-radius: 8px; border-left: 4px solid #D4AF37;">
                <p style="margin: 0; font-size: 14px; color: #FAFAF9; line-height: 1.6;">
                  <strong>📱 Expect a call from us shortly!</strong><br>
                  <span style="color: #A8A29E;">We'll call to confirm your quote details and help you schedule your move.</span>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #78716C;">
                Denver Premium Moving • Licensed & Insured
              </p>
              <p style="margin: 0 0 10px; font-size: 14px; color: #78716C;">
                📞 (303) 555-1234 • 📧 info@denverpremiummoving.com
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QuoteEmailRequest = await req.json();
    console.log("Sending quote email to:", data.email);

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Denver Premium Moving <onboarding@resend.dev>",
      to: [data.email],
      subject: `Your Moving Quote: $${data.totalQuote} - Denver Premium Moving`,
      html: generateEmailHtml(data),
    });

    console.log("Email sent successfully:", emailResponse);

    // Update lead in database to mark email as sent
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from('leads')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq('id', data.leadId);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-quote-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
