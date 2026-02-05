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

    // Load after user interaction
    const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart'];
    interactionEvents.forEach(event => {
      window.addEventListener(event, loadVoiceAgent, { once: true, passive: true });
    });

    // Or load after 5 seconds of idle time
    const timeoutId = setTimeout(loadVoiceAgent, 5000);

    // Or use requestIdleCallback for better scheduling if available
    let idleCallbackId: number | undefined;
    if ('requestIdleCallback' in window) {
      idleCallbackId = (window as any).requestIdleCallback(loadVoiceAgent, { timeout: 5000 });
    }

    return () => {
      interactionEvents.forEach(event => {
        window.removeEventListener(event, loadVoiceAgent);
      });
      clearTimeout(timeoutId);
      if (idleCallbackId && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleCallbackId);
      }
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
