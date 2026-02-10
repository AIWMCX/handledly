
# Fix: Duplicate Quote Submissions Should Still Trigger Email and Call

## Problem
When a customer submits the same quote twice within 1 hour (same email + service type), the system silently returns the old quote data without sending an email or making a call. The customer sees a confirmation screen but receives nothing.

This is the exact scenario that happened: Attempt 1 worked (email + call to voicemail). Attempt 2 was blocked by the 1-hour idempotency window -- no new lead, no email, no call.

## Solution
Two changes:

### 1. Re-trigger email and call on duplicate submissions
**File:** `supabase/functions/submit-quote/index.ts`

When a duplicate is detected (lines 187-207), instead of just returning the old data silently:
- Fetch the existing lead's full data (id, verification_token, name, phone, etc.)
- Re-invoke `send-quote-email` and `trigger-confirmation-call` for that existing lead (same as the original submission flow does)
- Return the response with `isDuplicate: true` AND `leadId` and `verificationToken` so the frontend can track it
- Add a log: `"Duplicate detected, re-triggering email and call for lead X"`

This way, if a customer submits again because they didn't get the email or missed the call, they get another email and another call attempt.

### 2. Show user-friendly message on frontend for duplicates
**File:** `src/pages/Quote.tsx`

After receiving the response from `submit-quote`, check if `response.isDuplicate === true`:
- Show a toast: "We already have your quote! Resending confirmation email and scheduling a call."
- Still navigate to confirmation screen as normal

This gives the customer clear feedback that their info was already received.

## Technical Details

### submit-quote/index.ts changes (lines 187-207)
Replace the early return block with:
```typescript
if (existingLead) {
  console.log(`[submit-quote] Duplicate detected for ${email}, re-triggering outreach for lead ${existingLead.id}`);
  
  // Fetch full lead data for re-triggering
  const { data: fullLead } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", existingLead.id)
    .single();

  if (fullLead) {
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "Friend";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Re-trigger email (fire-and-forget)
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-quote-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        leadId: fullLead.id,
        verificationToken: fullLead.verification_token,
        firstName, lastName,
        customerName: fullName,
        email, phone: fullLead.phone,
        serviceType, crewSize: quote.crewSize,
        hourlyRate: quote.hourlyRate,
        estimatedHours: quote.estimatedHours,
        laborCost: quote.laborCost,
        specialtyFee: quote.specialtyFee,
        totalQuote: fullLead.estimated_quote || quote.total,
        quoteNumber: fullLead.verification_token ? generateQuoteNumber() : generateQuoteNumber(),
        moveDate, moveFrom: moveFromAddress, moveTo: moveToAddress,
        specialtyItems: specialtyItems || [],
      }),
    }).catch(e => console.error("[submit-quote] Re-trigger email failed:", e));

    // Re-trigger call if not preferEmailOnly (fire-and-forget)
    if (!preferEmailOnly) {
      fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/trigger-confirmation-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          leadId: fullLead.id,
          verificationToken: fullLead.verification_token,
          firstName, lastName,
          customerName: fullName,
          phone: fullLead.phone, email,
          serviceType,
          totalQuote: fullLead.estimated_quote || quote.total,
          crewSize: quote.crewSize,
          estimatedHours: quote.estimatedHours,
          moveDate, moveFrom: moveFromAddress, moveTo: moveToAddress,
        }),
      }).catch(e => console.error("[submit-quote] Re-trigger call failed:", e));
    }
  }

  return new Response(JSON.stringify({
    success: true,
    quoteNumber: generateQuoteNumber(),
    firstName: nameParts[0] || "Friend",
    lastName: nameParts.slice(1).join(" ") || "",
    total: existingLead.estimated_quote || quote.total,
    crewSize: quote.crewSize, hourlyRate: quote.hourlyRate,
    estimatedHours: quote.estimatedHours,
    laborCost: quote.laborCost, specialtyFee: quote.specialtyFee,
    isDuplicate: true,
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

### Quote.tsx changes (after line 102)
Add after receiving response:
```typescript
if (response.isDuplicate) {
  toast.info("We already have your quote! Resending confirmation email and scheduling a call.");
}
```

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/submit-quote/index.ts` | Re-trigger email + call on duplicate instead of silent return |
| `src/pages/Quote.tsx` | Show toast when duplicate detected |

## What This Fixes
- Customer submits twice -> gets email and call both times
- Customer sees clear message that their quote was already received
- No duplicate leads created (idempotency preserved)
- Call and email are re-triggered safely via fire-and-forget
