import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RetryQueueItem {
  id: string;
  lead_id: string;
  retry_attempt: number;
  scheduled_for: string;
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  estimated_quote: number | null;
  move_date: string | null;
  move_from_address: string | null;
  move_to_address: string | null;
  verification_token: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[process-call-retries] Starting retry processing...');

    // Get scheduled retries that are due
    const { data: retries, error: fetchError } = await supabase
      .from('call_retry_queue')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(10); // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch retries: ${fetchError.message}`);
    }

    if (!retries || retries.length === 0) {
      console.log('[process-call-retries] No pending retries');
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[process-call-retries] Found ${retries.length} pending retries`);

    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const retry of retries as RetryQueueItem[]) {
      try {
        // Mark as processing
        await supabase
          .from('call_retry_queue')
          .update({ status: 'processing' })
          .eq('id', retry.id);

        // Get lead data
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', retry.lead_id)
          .single();

        if (leadError || !lead) {
          throw new Error(`Lead not found: ${leadError?.message || 'Unknown'}`);
        }

        // Check if lead already has a successful call
        if (lead.confirmation_call_status === 'completed') {
          console.log(`[process-call-retries] Lead ${retry.lead_id} already completed, skipping`);
          await supabase
            .from('call_retry_queue')
            .update({ status: 'cancelled', processed_at: new Date().toISOString() })
            .eq('id', retry.id);
          continue;
        }

        // Generate a new verification token for the retry
        const newToken = crypto.randomUUID();
        await supabase
          .from('leads')
          .update({ 
            verification_token: newToken,
            confirmation_call_status: 'pending',
            confirmation_call_time: null 
          })
          .eq('id', retry.lead_id);

        // Trigger the confirmation call
        const triggerUrl = `${supabaseUrl}/functions/v1/trigger-confirmation-call`;
        const callResponse = await fetch(triggerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            leadId: retry.lead_id,
            verificationToken: newToken,
            isRetry: true,
            retryAttempt: retry.retry_attempt,
          }),
        });

        if (!callResponse.ok) {
          const errorText = await callResponse.text();
          throw new Error(`Call trigger failed: ${errorText}`);
        }

        // Mark retry as completed
        await supabase
          .from('call_retry_queue')
          .update({ 
            status: 'completed', 
            processed_at: new Date().toISOString() 
          })
          .eq('id', retry.id);

        // Update lead with retry info
        await supabase
          .from('leads')
          .update({
            call_notes: `${lead.call_notes || ''} | Retry #${retry.retry_attempt} initiated at ${new Date().toISOString()}`,
          })
          .eq('id', retry.lead_id);

        successCount++;
        console.log(`[process-call-retries] Retry ${retry.id} processed successfully`);

      } catch (retryError: any) {
        console.error(`[process-call-retries] Retry ${retry.id} failed:`, retryError.message);
        
        // Check if max retries reached
        if (retry.retry_attempt >= 3) {
          await supabase
            .from('call_retry_queue')
            .update({ 
              status: 'exhausted', 
              last_error: retryError.message,
              processed_at: new Date().toISOString() 
            })
            .eq('id', retry.id);

          // Update lead to show all retries exhausted
          await supabase
            .from('leads')
            .update({
              call_notes: `All 3 retry attempts exhausted. Last error: ${retryError.message}`,
              next_retry_at: null,
            })
            .eq('id', retry.lead_id);
        } else {
          // Mark as failed but allow the trigger to schedule next retry
          await supabase
            .from('call_retry_queue')
            .update({ 
              status: 'completed', 
              last_error: retryError.message,
              processed_at: new Date().toISOString() 
            })
            .eq('id', retry.id);
        }

        failedCount++;
      }

      processedCount++;
    }

    console.log(`[process-call-retries] Completed: ${processedCount} processed, ${successCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        succeeded: successCount,
        failed: failedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[process-call-retries] Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
