# ELEVENLABS JACK CONFIGURATION GUIDE
## Setup Instructions for Monday Launch

---

## 📦 PACKAGE CONTENTS

This folder contains two optimized files for your ElevenLabs agent:

1. **SYSTEM-PROMPT.md** (~2,500 characters)
   - Copy into: ElevenLabs Dashboard → Agent → "System Prompt" field
   - Contains: Core identity, pricing, Iron Law, discovery flow
   - Optimized for: Quick reference during conversations

2. **RAG-KNOWLEDGE-BASE.md** (~18,000 characters)
   - Upload to: ElevenLabs Dashboard → Agent → "Knowledge" tab
   - Contains: Full pricing, all scripts, Colorado specifics, objection handling
   - Optimized for: RAG retrieval during complex questions

---

## 🚀 SETUP STEPS (10 minutes)

### Step 1: Update the Voice
1. Go to ElevenLabs Dashboard → Your Agent → "Voice" tab
2. Select the new deeper voice you prefer
3. Adjust voice settings:
   - **Speed:** 1.1 (slightly faster for natural pacing)
   - **Stability:** 0.5-0.6 (natural variation)
   - **Similarity:** 0.75 (maintains voice character)

### Step 2: Update System Prompt
1. Go to "Agent" tab → "System Prompt" section
2. Delete existing content
3. Copy entire content from `SYSTEM-PROMPT.md`
4. Paste into the System Prompt field
5. Save changes

### Step 3: Upload RAG Knowledge Base
1. Go to "Knowledge" tab
2. Click "Upload Document" or "Add Knowledge"
3. Upload `RAG-KNOWLEDGE-BASE.md` file
4. Wait for processing to complete
5. Verify document is indexed

### Step 4: Configure Turn-Taking Settings
1. Go to "Agent" tab → Advanced settings
2. Set these recommended values:
   - **Turn Eagerness:** Patient (critical for address collection)
   - **Turn Timeout:** 8-10 seconds
   - **Interruption Handling:** Enabled
   - **End Call Silence:** 15 seconds

### Step 5: Test the Agent
1. Use "Test Agent" feature in ElevenLabs
2. Run through these scenarios:
   - Simple 2BR apartment move (should quote $159/hr)
   - Move with piano (should trigger Iron Law $179/hr)
   - Customer objection about price
   - Quote confirmation with HD-XXXXX number

---

## ✅ VERIFICATION CHECKLIST

Before Monday launch, verify Jack correctly:

- [ ] Uses the new deeper voice
- [ ] Quotes $159/hr for 2 movers + truck (most popular)
- [ ] Triggers Iron Law ($179/hr, 3 movers) for 200+ lb items
- [ ] Probes for heavy items in discovery
- [ ] Provides HD-XXXXX quote numbers
- [ ] Sounds like a Denver local
- [ ] Keeps responses to 1-2 sentences
- [ ] Completes 6-point confirmation before ending calls

---

## 🔧 TROUBLESHOOTING

### Jack not using correct pricing
→ Check that SYSTEM-PROMPT.md was fully copied (no truncation)

### Jack not finding detailed info
→ Verify RAG-KNOWLEDGE-BASE.md was uploaded and indexed successfully

### Jack talking too fast or robotic
→ Adjust voice Speed to 1.0-1.1, check Turn Eagerness is "Patient"

### Jack interrupting customers
→ Set Turn Eagerness to "Patient", increase Turn Timeout to 10s

### Jack not sounding local
→ Re-check system prompt includes Colorado-specific language section

---

## 📊 DASHBOARD SETTINGS SUMMARY

| Setting | Recommended Value |
|---------|-------------------|
| Voice Speed | 1.1 |
| Stability | 0.5-0.6 |
| Turn Eagerness | Patient |
| Turn Timeout | 8-10 seconds |
| Interruption Handling | Enabled |
| End Call Silence | 15 seconds |

---

## 📞 SUPPORT

If issues persist after following this guide:
1. Check ElevenLabs status page for outages
2. Verify your agent ID matches the one in your edge function
3. Test with a simple "Hello" to confirm connectivity
4. Review edge function logs for token generation errors

---

**Ready for Monday Launch!**
