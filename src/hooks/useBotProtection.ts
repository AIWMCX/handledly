/**
 * Bot Protection Hook
 * 
 * Provides comprehensive bot detection and protection
 * for forms and interactive elements.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createHoneypotState,
  validateHoneypot,
  createBehaviorTrackers,
  logHoneypotDetection,
  applyProgressiveDelay,
  createClientFingerprint,
  HoneypotState,
} from "@/lib/costProtection";

interface UseBotProtectionOptions {
  formId: string;
  minSubmitTime?: number;
  maxSubmitTime?: number;
  onBotDetected?: (reason: string, score: number) => void;
}

interface BotProtectionResult {
  // State
  isReady: boolean;
  suspicionScore: number;
  
  // Handlers to attach to form
  formProps: {
    onMouseMove: () => void;
    onKeyDown: () => void;
    onScroll: () => void;
  };
  
  // Honeypot handler
  onHoneypotChange: (value: string) => void;
  
  // Validation
  validate: () => Promise<{ valid: boolean; reason?: string }>;
  
  // Client fingerprint for server-side tracking
  getFingerprint: () => Promise<string>;
}

export function useBotProtection(
  options: UseBotProtectionOptions
): BotProtectionResult {
  const { formId, minSubmitTime = 2000, maxSubmitTime = 600000, onBotDetected } = options;
  
  const stateRef = useRef<HoneypotState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const fingerprintRef = useRef<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    stateRef.current = createHoneypotState();
    setIsReady(true);

    // Pre-compute fingerprint
    createClientFingerprint().then((fp) => {
      fingerprintRef.current = fp;
    });

    return () => {
      stateRef.current = null;
    };
  }, []);

  // Get behavior trackers
  const trackers = stateRef.current
    ? createBehaviorTrackers(stateRef.current)
    : {
        onMouseMove: () => {},
        onKeyDown: () => {},
        onScroll: () => {},
        onHoneypotChange: () => {},
      };

  // Validation function
  const validate = useCallback(async (): Promise<{ valid: boolean; reason?: string }> => {
    if (!stateRef.current) {
      return { valid: true };
    }

    // Apply progressive delay before validation
    await applyProgressiveDelay(formId);

    const result = validateHoneypot(stateRef.current, {
      minSubmitTime,
      maxSubmitTime,
    });

    setSuspicionScore(result.score);

    if (!result.valid) {
      // Log the detection
      await logHoneypotDetection(result.reason || "unknown", {
        score: result.score,
        elapsedTime: Date.now() - stateRef.current.loadTime,
        mouseMovements: stateRef.current.mouseMovements,
        keystrokes: stateRef.current.keystrokes,
        scrollEvents: stateRef.current.scrollEvents,
        formId,
      });

      // Notify callback
      onBotDetected?.(result.reason || "unknown", result.score);
    }

    return { valid: result.valid, reason: result.reason };
  }, [formId, minSubmitTime, maxSubmitTime, onBotDetected]);

  // Get fingerprint
  const getFingerprint = useCallback(async (): Promise<string> => {
    if (fingerprintRef.current) {
      return fingerprintRef.current;
    }
    const fp = await createClientFingerprint();
    fingerprintRef.current = fp;
    return fp;
  }, []);

  return {
    isReady,
    suspicionScore,
    formProps: {
      onMouseMove: trackers.onMouseMove,
      onKeyDown: trackers.onKeyDown,
      onScroll: trackers.onScroll,
    },
    onHoneypotChange: trackers.onHoneypotChange,
    validate,
    getFingerprint,
  };
}

export default useBotProtection;
