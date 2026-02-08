import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

function getEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Handledly Moving Services</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFFBF5; color: #1E3A5F;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFBF5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1E3A5F;">
                🏠 HANDLEDLY
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94A3B8; letter-spacing: 2px; text-transform: uppercase;">Moving Services</p>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td style="background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding-top: 30px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #94A3B8;">
                Handledly Moving Services · Denver, Colorado
              </p>
              <p style="margin: 0 0 8px; font-size: 13px; color: #94A3B8;">
                <a href="tel:+18782187397" style="color: #F9B233; text-decoration: none; font-weight: 600;">(878) 218-7397</a>
                &nbsp;·&nbsp;
                <a href="mailto:hello@handledly.com" style="color: #F9B233; text-decoration: none;">hello@handledly.com</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #CBD5E1;">
                You received this email because you requested a moving quote from Handledly.
                <br>If you no longer wish to receive follow-up emails, simply reply with "unsubscribe".
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── TOUCH 1: "Your Quote is Waiting" (1 hour) ───────────────────────────────
function generateTouch1Email(lead: any, quoteData: any): { subject: string; html: string } {
  const firstName = lead.full_name?.split(' ')[0] || 'there';
  const serviceLabel = SERVICE_LABELS[lead.property_type] || lead.property_type || 'Moving';
  const quoteAmount = lead.estimated_quote 
    ? `$${Number(lead.estimated_quote).toLocaleString('en-US')}` 
    : 'your personalized quote';
  const quoteNumber = quoteData?.quote_number || '';
  const moveDate = lead.move_date
    ? new Date(lead.move_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null;

  const content = `
    <!-- Warm Greeting -->
    <p style="margin: 0 0 20px; font-size: 22px; color: #1E3A5F; font-weight: 600;">
      Hi ${firstName} 👋
    </p>
    
    <p style="margin: 0 0 20px; font-size: 16px; color: #64748B; line-height: 1.7;">
      Just checking in! We noticed you recently requested a moving quote from our team, and we wanted to make sure you had everything you need.
    </p>
    
    <!-- Quote Recap Box -->
    <div style="background: linear-gradient(135deg, #FFFBF5 0%, #FEF3C7 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #F9B233;">
      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #92400E; font-weight: 700;">YOUR QUOTE RECAP</p>
      ${quoteNumber ? `<p style="margin: 0 0 12px; font-size: 14px; color: #64748B;">Quote #${quoteNumber}</p>` : ''}
      <p style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #1E3A5F;">${quoteAmount}</p>
      <p style="margin: 0; font-size: 15px; color: #64748B;">
        ${serviceLabel}${moveDate ? ` · ${moveDate}` : ''}
      </p>
    </div>
    
    <p style="margin: 0 0 24px; font-size: 16px; color: #64748B; line-height: 1.7;">
      Your quote includes <strong style="color: #1E3A5F;">everything</strong> — professional crew, truck, fuel, moving blankets, and furniture disassembly. <strong style="color: #F9B233;">No hidden fees, ever.</strong>
    </p>
    
    <!-- CTA Buttons -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding-bottom: 12px;">
          <a href="tel:+18782187397" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F9B233 0%, #F59E0B 100%); color: #1E3A5F; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 10px; box-shadow: 0 4px 12px rgba(245,158,11,0.35);">
            📞 Call to Confirm — (878) 218-7397
          </a>
        </td>
      </tr>
      <tr>
        <td align="center">
          <a href="https://handledly.com/quote" style="display: inline-block; padding: 12px 32px; background: #FFFFFF; color: #1E3A5F; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px; border: 2px solid #E2E8F0;">
            🔄 Update My Quote
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0; font-size: 14px; color: #94A3B8; text-align: center;">
      Questions? Just reply to this email — a real person will get back to you.
    </p>
  `;

  return {
    subject: `${firstName}, your ${quoteAmount} moving quote is waiting!`,
    html: getEmailWrapper(content),
  };
}

// ─── TOUCH 2: "Spots Are Filling Up" (24 hours) ──────────────────────────────
function generateTouch2Email(lead: any, quoteData: any): { subject: string; html: string } {
  const firstName = lead.full_name?.split(' ')[0] || 'there';
  const serviceLabel = SERVICE_LABELS[lead.property_type] || lead.property_type || 'Moving';
  const quoteAmount = lead.estimated_quote 
    ? `$${Number(lead.estimated_quote).toLocaleString('en-US')}` 
    : 'your quote';
  const moveDate = lead.move_date
    ? new Date(lead.move_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null;

  const content = `
    <p style="margin: 0 0 20px; font-size: 22px; color: #1E3A5F; font-weight: 600;">
      Hey ${firstName} — quick update 📋
    </p>
    
    <p style="margin: 0 0 20px; font-size: 16px; color: #64748B; line-height: 1.7;">
      We're reaching out because our Denver-area schedule is filling up fast${moveDate ? ` around <strong style="color: #1E3A5F;">${moveDate}</strong>` : ''}. We'd hate for you to miss your preferred time slot.
    </p>
    
    <!-- Urgency Banner -->
    <div style="background: #FEF2F2; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #FECACA;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td width="40" style="vertical-align: top; font-size: 24px;">⏰</td>
          <td style="padding-left: 8px;">
            <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #DC2626;">Limited Availability This Week</p>
            <p style="margin: 0; font-size: 13px; color: #7F1D1D; line-height: 1.5;">
              We currently have <strong>3 morning slots</strong> and <strong>2 afternoon slots</strong> open. These typically fill within 48 hours.
            </p>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Quote Reminder -->
    <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #E2E8F0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8;">YOUR QUOTE</p>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #F9B233;">${quoteAmount}</p>
          </td>
          <td align="right">
            <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8;">SERVICE</p>
            <p style="margin: 0; font-size: 15px; color: #1E3A5F; font-weight: 500;">${serviceLabel}</p>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Why Handledly -->
    <p style="margin: 0 0 12px; font-size: 15px; color: #1E3A5F; font-weight: 600;">
      Why families choose Handledly:
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr><td style="padding: 6px 0; font-size: 14px; color: #64748B;">✅ <strong style="color: #1E3A5F;">Flat hourly rate</strong> — no surprise charges</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: #64748B;">✅ <strong style="color: #1E3A5F;">Licensed & insured</strong> — your belongings are protected</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: #64748B;">✅ <strong style="color: #1E3A5F;">5-star rated</strong> — trusted by hundreds of Denver families</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: #64748B;">✅ <strong style="color: #1E3A5F;">Same-day booking</strong> — we're flexible with your schedule</td></tr>
    </table>
    
    <!-- CTA -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding-bottom: 12px;">
          <a href="tel:+18782187397" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F9B233 0%, #F59E0B 100%); color: #1E3A5F; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 10px; box-shadow: 0 4px 12px rgba(245,158,11,0.35);">
            📞 Lock In Your Date — (878) 218-7397
          </a>
        </td>
      </tr>
      <tr>
        <td align="center">
          <p style="margin: 0; font-size: 13px; color: #94A3B8;">or reply to this email — we'll get right back to you</p>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `${firstName}, spots are filling up for your move! ⏰`,
    html: getEmailWrapper(content),
  };
}

// ─── TOUCH 3: "We'd Love to Help" (72 hours) ─────────────────────────────────
function generateTouch3Email(lead: any, quoteData: any): { subject: string; html: string } {
  const firstName = lead.full_name?.split(' ')[0] || 'there';
  const serviceLabel = SERVICE_LABELS[lead.property_type] || lead.property_type || 'Moving';
  const quoteAmount = lead.estimated_quote 
    ? `$${Number(lead.estimated_quote).toLocaleString('en-US')}` 
    : 'your quote';

  const content = `
    <p style="margin: 0 0 20px; font-size: 22px; color: #1E3A5F; font-weight: 600;">
      ${firstName}, one last thing... 💛
    </p>
    
    <p style="margin: 0 0 20px; font-size: 16px; color: #64748B; line-height: 1.7;">
      We know moving is stressful, and the last thing you need is more emails. So this is our final check-in — we just want to make sure you're taken care of.
    </p>
    
    <p style="margin: 0 0 24px; font-size: 16px; color: #64748B; line-height: 1.7;">
      Your <strong style="color: #F9B233;">${quoteAmount}</strong> quote for <strong style="color: #1E3A5F;">${serviceLabel}</strong> is still valid and ready whenever you are.
    </p>
    
    <!-- Personal Touch Box -->
    <div style="background: #F0FDF4; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #BBF7D0;">
      <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #166534;">
        🤝 Here's what we can do for you:
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #15803D;">
            <strong>→</strong> Adjust your quote if your plans changed
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #15803D;">
            <strong>→</strong> Answer any questions about the moving process
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #15803D;">
            <strong>→</strong> Help you plan the perfect moving day timeline
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #15803D;">
            <strong>→</strong> Provide packing tips specific to your home
          </td>
        </tr>
      </table>
    </div>
    
    <!-- CTA Options -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <td align="center" style="padding-bottom: 12px;">
          <a href="tel:+18782187397" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F9B233 0%, #F59E0B 100%); color: #1E3A5F; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 10px; box-shadow: 0 4px 12px rgba(245,158,11,0.35);">
            📞 Let's Talk — (878) 218-7397
          </a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 12px;">
          <a href="https://handledly.com/quote" style="display: inline-block; padding: 12px 32px; background: #FFFFFF; color: #1E3A5F; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px; border: 2px solid #E2E8F0;">
            🔄 Get a New Quote
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Warm Sign-off -->
    <div style="border-top: 1px solid #E2E8F0; padding-top: 20px;">
      <p style="margin: 0 0 8px; font-size: 15px; color: #64748B; line-height: 1.7;">
        Whatever you decide, we wish you the best with your move. If you ever need us down the road, we're just a call away.
      </p>
      <p style="margin: 0; font-size: 15px; color: #1E3A5F; font-weight: 600;">
        Warmly,<br>
        The Handledly Team 🏠
      </p>
    </div>
  `;

  return {
    subject: `${firstName}, your moving quote is still ready 💛`,
    html: getEmailWrapper(content),
  };
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('[send-follow-up-email] RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    console.log('[send-follow-up-email] Starting follow-up email processing...');

    // Fetch all scheduled follow-ups that are due
    const now = new Date().toISOString();
    const { data: pendingFollowUps, error: fetchError } = await supabase
      .from('lead_follow_ups')
      .select(`
        id,
        lead_id,
        touch_number,
        scheduled_for
      `)
      .eq('email_status', 'scheduled')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(20); // Process max 20 per invocation to avoid timeouts

    if (fetchError) {
      console.error('[send-follow-up-email] Error fetching follow-ups:', fetchError);
      return new Response(JSON.stringify({ error: 'Database query failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!pendingFollowUps || pendingFollowUps.length === 0) {
      console.log('[send-follow-up-email] No pending follow-ups');
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[send-follow-up-email] Processing ${pendingFollowUps.length} follow-ups`);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const followUp of pendingFollowUps) {
      try {
        // Fetch the lead data
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('id, full_name, email, phone, property_type, estimated_quote, move_date, move_from_address, move_to_address, status, prefer_email_only')
          .eq('id', followUp.lead_id)
          .single();

        if (leadError || !lead) {
          console.warn(`[send-follow-up-email] Lead ${followUp.lead_id} not found, marking as skipped`);
          await supabase.from('lead_follow_ups').update({
            email_status: 'skipped',
            error_message: 'Lead not found or deleted',
          }).eq('id', followUp.id);
          skipped++;
          continue;
        }

        // Skip if lead has already progressed beyond 'new' or 'contacted'
        if (['qualified', 'booked', 'completed', 'cancelled', 'lost'].includes(lead.status)) {
          console.log(`[send-follow-up-email] Skipping lead ${lead.id} - status is ${lead.status}`);
          await supabase.from('lead_follow_ups').update({
            email_status: 'skipped',
            error_message: `Lead already ${lead.status}`,
          }).eq('id', followUp.id);
          skipped++;
          continue;
        }

        // Skip if no valid email
        if (!lead.email || lead.email === 'N/A' || !lead.email.includes('@')) {
          console.log(`[send-follow-up-email] Skipping lead ${lead.id} - invalid email`);
          await supabase.from('lead_follow_ups').update({
            email_status: 'skipped',
            error_message: 'Invalid email address',
          }).eq('id', followUp.id);
          skipped++;
          continue;
        }

        // Fetch quote data for additional context
        const { data: quoteData } = await supabase
          .from('quote_requests')
          .select('quote_number, total_quote, property_type')
          .eq('lead_id', lead.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Generate the appropriate email template
        let emailContent: { subject: string; html: string };
        
        switch (followUp.touch_number) {
          case 1:
            emailContent = generateTouch1Email(lead, quoteData);
            break;
          case 2:
            emailContent = generateTouch2Email(lead, quoteData);
            break;
          case 3:
            emailContent = generateTouch3Email(lead, quoteData);
            break;
          default:
            console.warn(`[send-follow-up-email] Unknown touch number: ${followUp.touch_number}`);
            continue;
        }

        console.log(`[send-follow-up-email] Sending touch ${followUp.touch_number} to ${lead.email} (Lead: ${lead.full_name})`);

        // Send the email via Resend with retry
        let emailSent = false;
        let lastError = '';

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { error: sendError } = await resend.emails.send({
              from: 'Handledly Moving Services <noreply@handledly.com>',
              replyTo: 'hello@handledly.com',
              to: [lead.email],
              subject: emailContent.subject,
              html: emailContent.html,
            });

            if (sendError) {
              throw new Error(JSON.stringify(sendError));
            }

            emailSent = true;
            break;
          } catch (err: any) {
            lastError = err.message || String(err);
            console.warn(`[send-follow-up-email] Attempt ${attempt} failed for ${lead.email}: ${lastError}`);
            if (attempt < 3) {
              await new Promise(r => setTimeout(r, 1500 * attempt));
            }
          }
        }

        if (emailSent) {
          await supabase.from('lead_follow_ups').update({
            email_status: 'sent',
            sent_at: new Date().toISOString(),
          }).eq('id', followUp.id);
          
          console.log(`[send-follow-up-email] ✅ Touch ${followUp.touch_number} sent to ${lead.email}`);
          sent++;
        } else {
          await supabase.from('lead_follow_ups').update({
            email_status: 'failed',
            error_message: lastError.substring(0, 500),
          }).eq('id', followUp.id);
          
          console.error(`[send-follow-up-email] ❌ Failed to send touch ${followUp.touch_number} to ${lead.email}: ${lastError}`);
          failed++;
        }

        // Small delay between emails to respect rate limits
        await new Promise(r => setTimeout(r, 500));

      } catch (error: any) {
        console.error(`[send-follow-up-email] Error processing follow-up ${followUp.id}:`, error);
        await supabase.from('lead_follow_ups').update({
          email_status: 'failed',
          error_message: (error.message || String(error)).substring(0, 500),
        }).eq('id', followUp.id);
        failed++;
      }
    }

    const result = { processed: pendingFollowUps.length, sent, skipped, failed };
    console.log('[send-follow-up-email] Processing complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[send-follow-up-email] Fatal error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
