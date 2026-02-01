# POOL TABLE PRICING FIX - COMPLETED ✅

## Summary
Fixed pool table pricing across all 7 files to use **$169/hr with 2 movers** (NOT Iron Law).

## Files Updated
1. ✅ `src/lib/quoteCalculator.ts` - Removed `pool-table` from IRON_LAW_SERVICES
2. ✅ `supabase/functions/ai-chat/index.ts` - Updated SYSTEM_PROMPT with pool table exception
3. ✅ `supabase/functions/send-quote-email/index.ts` - Fixed SPECIALTY_LABELS and IRON_LAW_SERVICES
4. ✅ `docs/elevenlabs/SYSTEM-PROMPT.md` - Updated Iron Law triggers (removed pool tables)
5. ✅ `docs/elevenlabs/RAG-KNOWLEDGE-BASE.md` - Updated Sections 3, 4, 22
6. ✅ `docs/MASTER-PRICING-PROMPT.md` - Fixed specialty item table and Iron Law triggers
7. ✅ `docs/JACK-QUICK-REFERENCE.md` - Updated pricing references
8. ✅ `src/data/servicesData.ts` - Updated pool table descriptions

## Final Pricing Reference

| Service | Rate | Crew | Iron Law? |
|---------|------|------|-----------|
| Local Moving (standard) | $159/hr | 2 | NO |
| Heavy Items (by situation) | $169/hr | 2-3 | NO |
| **Pool Table** | **$169/hr + flat fee** | **2-3** | **NO** |
| Piano (any type) | $189/hr + flat fee | 3 | YES |
| Safe (200+ lbs) | $189/hr + flat fee | 3 | YES |
| Hot Tub | $189/hr + flat fee | 3-4 | YES |

## Manual Action Required
1. Open ElevenLabs dashboard
2. Update System Prompt from `docs/elevenlabs/SYSTEM-PROMPT.md`
3. Upload `docs/elevenlabs/RAG-KNOWLEDGE-BASE.md` to Knowledge Base
4. **CLICK PUBLISH**

**Status: COMPLETE** ✅
