

# Jack Anti-Rambling Fix: Short, Natural Speech Bursts

## Problem
Jack is dumping all information at once -- 100-150 words per turn, 5 questions stacked together, monologue-style. Customers feel overwhelmed instead of having a natural conversation.

## Goal
Jack speaks 5-15 words per turn, asks ONE question at a time, waits for a response, and sounds like a quick phone call -- not a lecture.

## What Changes

### 1. ElevenLabs Voice Jack -- System Prompt Update
**File:** `docs/elevenlabs/SYSTEM-PROMPT.md`

Add a new top-priority section at the very beginning (right after the identity line) with anti-rambling rules:
- Maximum 30 words per turn (most turns should be 5-15 words)
- ONE question per turn, then stop
- Wait for the customer to respond before continuing
- Never info-dump or list multiple questions
- "One-breath test" -- if Jack cannot say it in one breath, it is too long

Rewrite the PERSONALITY section to remove "Keep responses to 1-2 sentences maximum" and replace with the tighter rule: "Speak in short bursts. 5-15 words per turn. ONE question at a time."

Rewrite the DISCOVERY FLOW section to explicitly mark each step as a separate turn with "[wait for response]" markers between them.

Rewrite the IRON LAW EXPLANATION SCRIPT to be shorter (under 30 words).

Rewrite the 6-POINT CONFIRMATION to be a single compressed sentence instead of listing each point separately.

Add speaking length limits:
- Opening greeting: 10 words max
- Follow-up questions: 5-10 words max
- Explanations: 20-30 words max
- Pricing quotes: 15-20 words max

Add explicit BAD vs GOOD examples showing the difference.

### 2. Chat Jack -- Edge Function System Prompt Update
**File:** `supabase/functions/ai-chat/index.ts`

Update the `SYSTEM_PROMPT` constant (line 65-192) with the same anti-rambling rules adapted for text chat:
- Maximum 2 short sentences per message
- Ask ONE thing at a time
- Never stack 3+ questions in one message
- Remove the instruction "Try to collect multiple pieces in single questions" (line 151) -- this directly causes rambling
- Remove "Keep responses SHORT (2-3 sentences max)" and replace with "1-2 short sentences max, under 40 words"
- Add explicit examples of good vs bad responses

Key changes to the chat prompt:
- Remove: "PROACTIVE about gathering quote information" (encourages over-eagerness)
- Remove: "Try to collect multiple pieces in single questions to speed up the process" (causes question stacking)
- Add: "Ask ONE question per message. Wait for the answer before asking the next."
- Shorten the CONVERSION STRATEGY section -- keep the intent but remove aggressive multi-sentence scripts
- Reduce `max_tokens` from 800 to 300 to physically prevent long responses

### 3. RAG Knowledge Base Update
**File:** `docs/elevenlabs/RAG-KNOWLEDGE-BASE.md`

Update Section 1 (Agent Identity) communication style to reinforce short bursts.

Update Section 7 (Discovery Flow) to add "[wait for response]" between each step.

Add a new Section (between current Section 1 and Section 2) titled "ANTI-RAMBLING RULES" with:
- Word count limits per turn type
- Good vs bad examples
- The one-breath rule
- Conversation rhythm pattern (ping-pong, not monologue)

### 4. No UI Changes
The chat widget and voice agent components remain exactly the same. This is purely a prompt/behavior fix -- no frontend code changes needed except the edge function prompt.

## Files Modified

| File | What Changes |
|------|-------------|
| `docs/elevenlabs/SYSTEM-PROMPT.md` | Anti-rambling rules added at top, discovery flow rewritten with turn markers, scripts shortened |
| `supabase/functions/ai-chat/index.ts` | System prompt rewritten with short-burst rules, removed "collect multiple pieces" instruction, max_tokens reduced to 300 |
| `docs/elevenlabs/RAG-KNOWLEDGE-BASE.md` | New anti-rambling section added, discovery flow updated with turn markers |

## Important Note
After these code changes are deployed:
- The **chat Jack** (text widget) will immediately use the new prompt
- The **voice Jack** (ElevenLabs) requires a manual step: you must copy the updated `SYSTEM-PROMPT.md` content into the ElevenLabs dashboard and click "Publish" for the changes to take effect on live calls

## Expected Result

Before: Jack speaks 100-150 words, asks 5 questions at once, customers feel overwhelmed.

After: Jack speaks 5-15 words per turn, asks one question, waits, creates a natural back-and-forth conversation like texting or a quick phone call.
