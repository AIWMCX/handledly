import { useState, useEffect, useCallback } from 'react';
import { ExitIntentStorage } from '@/lib/storage';
import { ConversionEvents } from '@/lib/analytics';

interface UseExitIntentOptions {
  delay?: number; // ms before enabling detection
  sensitivity?: number; // pixels from top to trigger
  onTrigger?: () => void;
  disabled?: boolean;
}

interface UseExitIntentReturn {
  hasTriggered: boolean;
  isEnabled: boolean;
  reset: () => void;
  trigger: () => void;
}

export function useExitIntent(options: UseExitIntentOptions = {}): UseExitIntentReturn {
  const {
    delay = 5000,
    sensitivity = 20,
    onTrigger,
    disabled = false,
  } = options;

  const [hasTriggered, setHasTriggered] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // Check if already shown in this session
  useEffect(() => {
    if (ExitIntentStorage.wasShown() || ExitIntentStorage.wasConverted()) {
      setHasTriggered(true);
    }
  }, []);

  // Enable detection after delay
  useEffect(() => {
    if (disabled || hasTriggered) return;

    const timer = setTimeout(() => {
      setIsEnabled(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, disabled, hasTriggered]);

  // Mouse leave detection (desktop)
  useEffect(() => {
    if (!isEnabled || hasTriggered || disabled) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of page
      if (e.clientY <= sensitivity) {
        setHasTriggered(true);
        onTrigger?.();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isEnabled, hasTriggered, sensitivity, onTrigger, disabled]);

  // Tab visibility change detection
  useEffect(() => {
    if (!isEnabled || hasTriggered || disabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Small delay to prevent accidental triggers
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            setHasTriggered(true);
            onTrigger?.();
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled, hasTriggered, onTrigger, disabled]);

  // Mobile back button detection (history popstate)
  useEffect(() => {
    if (!isEnabled || hasTriggered || disabled) return;

    // Push a dummy state to detect back button
    window.history.pushState({ exitIntent: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.exitIntent) {
        setHasTriggered(true);
        onTrigger?.();
        // Re-push state to prevent navigation
        window.history.pushState({ exitIntent: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEnabled, hasTriggered, onTrigger, disabled]);

  const reset = useCallback(() => {
    setHasTriggered(false);
    setIsEnabled(false);
    
    // Re-enable after delay
    setTimeout(() => {
      setIsEnabled(true);
    }, delay);
  }, [delay]);

  const trigger = useCallback(() => {
    if (!hasTriggered) {
      setHasTriggered(true);
      onTrigger?.();
    }
  }, [hasTriggered, onTrigger]);

  return {
    hasTriggered,
    isEnabled,
    reset,
    trigger,
  };
}

export default useExitIntent;
