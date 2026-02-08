import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

interface RetryQueueItem {
  id: string;
  lead_id: string;
  retry_attempt: number;
  scheduled_for: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // AUTH: Only allow internal calls (cron jobs / admin triggers)
  const authHeader = req.headers.get('Authorization');
  const expectedAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authHeader || !expectedAnonKey || !authHeader.includes(expectedAnonKey)) {
    console.warn('[process-call-retries] Unauthorized request rejected');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.log('[process-call-retries] Starting retry processing...');

    // Get scheduled retries that are due - use row-level locking to prevent concurrent processing
    // First, get candidate IDs
    const { data: candidates, error: fetchError } = await supabase
      .from('call_retry_queue')
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch retries: ${fetchError.message}`);
    }

    if (!candidates || candidates.length === 0) {
      console.log('[process-call-retries] No pending retries');
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atomically claim retries by updating status from 'scheduled' to 'processing'
    // Only items still in 'scheduled' status will be claimed (prevents double-processing)
    const candidateIds = candidates.map(c => c.id);
    const { data: claimedRetries, error: claimError } = await supabase
      .from('call_retry_queue')
      .update({ status: 'processing' })
      .in('id', candidateIds)
      .eq('status', 'scheduled') // Only claim items still scheduled (atomic)
      .select('*');

    if (claimError) {
      throw new Error(`Failed to claim retries: ${claimError.message}`);
    }

    if (!claimedRetries || claimedRetries.length === 0) {
      console.log('[process-call-retries] All candidates already claimed by another worker');
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[process-call-retries] Claimed ${claimedRetries.length} retries for processing`);

    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const retry of claimedRetries as RetryQueueItem[]) {
      try {
        // Get lead data
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', retry.lead_id)
          .single();

        if (leadError || !lead) {
          throw new Error('Lead not found');
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
          throw new Error('Call trigger failed');
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

      } catch (retryError: unknown) {
        const errorMsg = retryError instanceof Error ? retryError.message : 'Unknown error';
        console.error(`[process-call-retries] Retry ${retry.id} failed:`, errorMsg);
        
        // Check if max retries reached
        if (retry.retry_attempt >= 3) {
          await supabase
            .from('call_retry_queue')
            .update({ 
              status: 'exhausted', 
              last_error: errorMsg,
              processed_at: new Date().toISOString() 
            })
            .eq('id', retry.id);

          // Update lead to show all retries exhausted
          await supabase
            .from('leads')
            .update({
              call_notes: 'All 3 retry attempts exhausted',
              next_retry_at: null,
            })
            .eq('id', retry.lead_id);
        } else {
          // Mark as failed but allow the trigger to schedule next retry
          await supabase
            .from('call_retry_queue')
            .update({ 
              status: 'completed', 
              last_error: errorMsg,
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

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[process-call-retries] Error:', errorMsg);
    // Sanitized error response - no internal details
    return new Response(
      JSON.stringify({ success: false, error: 'Retry processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
