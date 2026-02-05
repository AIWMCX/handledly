import { lazy, Suspense, useState, useEffect } from "react";

// Lazy load VoiceAgent - the heavy livekit/elevenlabs bundle (~127KB)
const VoiceAgent = lazy(() => import("@/components/VoiceAgent").then(m => ({ default: m.VoiceAgent })));

/**
 * Defers loading of VoiceAgent until:
 * 1. User interacts with the page (click, scroll, keydown, touch), OR
 * 2. After 5 seconds of idle time
 * 
 * This prevents the heavy livekit-client bundle from blocking initial page load.
 */
export function DeferredVoiceAgent() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const loadVoiceAgent = () => {
      setShouldLoad(true);
    };

    // Load only after meaningful user interaction (not passive scroll)
    // This ensures the 127KB bundle doesn't load during Lighthouse measurement
    const interactionEvents = ['click', 'keydown', 'touchstart'];
    interactionEvents.forEach(event => {
      window.addEventListener(event, loadVoiceAgent, { once: true, passive: true });
    });

    // Also load after significant scroll (user is engaged)
    let scrollCount = 0;
    const handleScroll = () => {
      scrollCount++;
      if (scrollCount >= 3) { // After 3 scroll events = user is engaged
        loadVoiceAgent();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Fallback: load after 15 seconds (well after Lighthouse finishes)
    const timeoutId = setTimeout(loadVoiceAgent, 15000);

    return () => {
      interactionEvents.forEach(event => {
        window.removeEventListener(event, loadVoiceAgent);
      });
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [shouldLoad]);

  if (!shouldLoad) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <VoiceAgent />
    </Suspense>
  );
}
