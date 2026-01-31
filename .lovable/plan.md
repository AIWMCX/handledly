
# Jack Voice Agent Optimization Plan
## Making Jack Faster, More Adaptive, and Human-Like

---

## Problem Summary

Based on your testing, you identified 3 critical issues with Jack's voice interactions:

| Issue | Impact | Root Cause |
|-------|--------|------------|
| **Jack speaks too slowly** | Frustrating wait times, unnatural pace | Voice speed not optimized |
| **Jack interrupts clients mid-speech** | Users feel talked over, disappointed | Turn detection too eager |
| **5-second response delay** | Dead air when 1-3 seconds expected | Suboptimal turn-taking & latency |

---

## Solution: ElevenLabs Dashboard Configuration

**These optimizations must be configured in the ElevenLabs Agent dashboard** - they cannot be done in code. The ElevenLabs Conversational AI platform has specific settings that control all three issues.

---

## Step 1: Voice Speed Optimization

**Location:** ElevenLabs Dashboard → Agent → Voice Tab → Speed Control

### Current Issue
Jack is speaking at default speed (1.0), which feels too slow for a professional moving specialist who should sound energetic and efficient.

### Recommended Configuration
| Setting | Current | Recommended | Reason |
|---------|---------|-------------|--------|
| **Speed** | 1.0 (default) | **1.1 - 1.15** | Faster, more energetic professional tone without distortion |

### Speed Control Notes
- Range: 0.7 (slower) to 1.2 (faster)
- Stay below 1.2 to maintain voice quality
- **1.1** is optimal for conversational business calls

---

## Step 2: Turn Detection & Interruption Handling

**Location:** ElevenLabs Dashboard → Agent → Advanced Tab

This is the **most critical fix** for preventing Jack from talking over clients.

### Turn Eagerness Setting

| Setting | Current (Likely) | Recommended | Reason |
|---------|------------------|-------------|--------|
| **Turn Eagerness** | Normal or Eager | **Patient** | Gives clients time to finish speaking |

### Turn Eagerness Modes Explained:
- **Eager**: Jumps in at earliest opportunity (causes interruptions)
- **Normal**: Balanced, works for casual conversation
- **Patient**: Waits longer for natural breaks (best for info collection)

### Why "Patient" is Best for Jack
Jack's primary job is **collecting quote information** (names, addresses, phone numbers, heavy items). ElevenLabs specifically recommends "Patient" mode for:
- Collecting phone numbers
- Collecting addresses
- Collecting email addresses
- Any structured information gathering

---

## Step 3: Latency Optimization

**Location:** Multiple settings in ElevenLabs Dashboard

### 3.1 Use Flash TTS Model (if available)
| Setting | Impact |
|---------|--------|
| **TTS Model** | Flash TTS has 75ms model time vs 300ms for standard |

### 3.2 Timeout Configuration
**Location:** Advanced Tab → Turn Timeout

| Setting | Current | Recommended | Reason |
|---------|---------|-------------|--------|
| **Turn Timeout** | Unknown | **8-10 seconds** | Allows natural pauses without prompting too quickly |

### 3.3 LLM Selection (if configurable)
Faster models = faster responses:
- **Gemini 2.5 Flash** - Lower latency, good quality
- **GPT-4o-mini** - Fast, good for conversation

---

## Step 4: Interruption Handling

**Location:** ElevenLabs Dashboard → Agent → Advanced Tab → Client Events

### Configuration
| Setting | Recommended | Reason |
|---------|-------------|--------|
| **Enable Interruptions** | ✅ Yes (enabled) | Allows natural back-and-forth |
| **With Patient Turn Eagerness** | Combined | Prevents premature takeover |

The key is **combining** "Enable Interruptions" with "Patient" turn eagerness:
- Interruptions ENABLED = Client can interrupt Jack when needed
- Patient turn eagerness = Jack waits for natural breaks before responding

---

## Complete Configuration Checklist

Open ElevenLabs Dashboard → Select Jack Agent → Configure:

### Voice Tab
- [ ] **Voice Speed**: Set to **1.1** (range: 0.7-1.2)
- [ ] **TTS Model**: Use fastest available (Flash if available)

### Advanced Tab
- [ ] **Turn Eagerness**: Set to **Patient**
- [ ] **Turn Timeout**: Set to **8-10 seconds**
- [ ] **Interruptions**: Keep **Enabled**

### Optional Prompt Enhancements
In the agent's system prompt, consider adding behavioral guidance:

```
## CONVERSATION BEHAVIOR
- Let the customer finish speaking before responding
- Keep responses SHORT (1-2 sentences) unless explaining pricing
- Use brief acknowledgments: "Got it", "Perfect", "Sure thing"
- Pause briefly before complex explanations
- If you're unsure the customer is done speaking, wait an extra moment
```

---

## Expected Results

| Before | After |
|--------|-------|
| 5-second response delays | 1-2 second natural response time |
| Jack talks over clients | Jack waits for natural pause |
| Slow, robotic speech | Energetic professional pace |
| Users feel disappointed | Natural, human-like conversation |

---

## Technical Notes

### Why These Changes Work

1. **Speed 1.1**: Research shows slightly faster speech is perceived as more confident and professional without being rushed

2. **Patient Mode**: ElevenLabs uses sophisticated Voice Activity Detection (VAD) that needs the right threshold. Patient mode:
   - Looks for longer silence duration before triggering response
   - Better handles mid-sentence pauses
   - Accounts for "thinking pauses" common when giving addresses/numbers

3. **Combined Settings**: The interaction between interruptions + turn eagerness creates the optimal behavior:
   - Jack CAN be interrupted (natural)
   - Jack WON'T interrupt (polite)

### Latency Stack
ElevenLabs documentation shows the full latency chain:
```
Speech → ASR (~100ms) → VAD (~variable) → LLM (~350-1000ms) → TTS (~75-300ms) → Output
```

With optimized settings, total latency should be:
- **Target**: 800ms - 1.5 seconds (feels human)
- **Current (estimated)**: 3-5 seconds (feels robotic)

---

## Action Required

**You must configure these settings in the ElevenLabs dashboard** - they cannot be set via code or API. 

1. Log into ElevenLabs (elevenlabs.io)
2. Navigate to Agents Platform → Your Jack Agent
3. Apply the configuration changes above
4. Test with a live call to verify improvements

---

## Post-Configuration Testing

After applying changes, test these scenarios:

1. **Speed Test**: Does Jack sound more energetic but still clear?
2. **Interruption Test**: Say something mid-way through Jack speaking - does he stop appropriately?
3. **Pause Test**: Give a long address with natural pauses - does Jack wait until you're done?
4. **Response Time Test**: After you finish speaking, how long until Jack responds? (Target: 1-2 seconds)

---

## No Code Changes Required

All optimizations are in the ElevenLabs dashboard configuration. The current codebase (`VoiceAgent.tsx`, `elevenlabs-conversation-token/index.ts`) is already correct and doesn't need modifications.
