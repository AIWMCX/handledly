import { useState, useEffect, useCallback, useRef } from 'react';
import { ConversionEvents } from '@/lib/analytics';

interface UseScrollProgressOptions {
  throttleMs?: number;
  trackMilestones?: number[]; // percentages to track (e.g., [25, 50, 75, 100])
}

interface UseScrollProgressReturn {
  progress: number; // 0-100
  hasPassedThreshold: (threshold: number) => boolean;
  scrollToTop: () => void;
  isScrolling: boolean;
}

export function useScrollProgress(options: UseScrollProgressOptions = {}): UseScrollProgressReturn {
  const { throttleMs = 50, trackMilestones = [25, 50, 75, 100] } = options;

  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const trackedMilestonesRef = useRef<Set<number>>(new Set());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Cache document height to avoid repeated reads
  const docHeightRef = useRef<number>(0);
  const lastDocHeightUpdateRef = useRef<number>(0);
  
  // Calculate scroll progress with cached height
  // Uses RAF-safe reads to avoid forced reflows
  const calculateProgress = useCallback(() => {
    // scrollY is a simple property read that doesn't trigger reflow
    const scrollTop = window.scrollY;
    
    // Use cached docHeight - only update via separate RAF to avoid sync reflow
    const docHeight = docHeightRef.current;
    if (docHeight <= 0) return 0;
    
    const currentProgress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    return Math.round(currentProgress);
  }, []);

  // Separate function to update doc height - called less frequently
  const updateDocHeight = useCallback(() => {
    // These reads trigger reflow, so batch them in a single RAF
    rafRef.current = requestAnimationFrame(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;
      docHeightRef.current = scrollHeight - innerHeight;
      lastDocHeightUpdateRef.current = Date.now();
    });
  }, []);

  // Handle scroll with throttling
  const handleScroll = useCallback(() => {
    const now = Date.now();
    
    // Throttle updates
    if (now - lastUpdateRef.current < throttleMs) return;
    lastUpdateRef.current = now;

    // Use RAF for smooth updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const newProgress = calculateProgress();
      setProgress(newProgress);
      setIsScrolling(true);

      // Track milestones
      trackMilestones.forEach((milestone) => {
        if (
          newProgress >= milestone &&
          !trackedMilestonesRef.current.has(milestone)
        ) {
          trackedMilestonesRef.current.add(milestone);
          ConversionEvents.scrollMilestone(milestone, window.location.pathname);
        }
      });

      // Clear scrolling state after delay
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    });
  }, [calculateProgress, throttleMs, trackMilestones]);

  // Set up scroll listener and doc height updates
  useEffect(() => {
    // Use requestIdleCallback for non-critical geometry reads
    const scheduleIdleRead = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        return (window as any).requestIdleCallback(callback, { timeout: 200 });
      }
      return setTimeout(callback, 50);
    };

    // Initial doc height calculation - deferred to idle time
    const idleId = scheduleIdleRead(() => {
      updateDocHeight();
      // After doc height is set, calculate initial progress
      setTimeout(() => setProgress(calculateProgress()), 0);
    });

    // Periodically update doc height (content may change)
    const heightInterval = setInterval(() => {
      scheduleIdleRead(updateDocHeight);
    }, 2000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateDocHeight, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDocHeight);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      clearInterval(heightInterval);
      if ('cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, [handleScroll, calculateProgress, updateDocHeight]);

  // Check if passed threshold
  const hasPassedThreshold = useCallback(
    (threshold: number) => {
      return progress >= threshold;
    },
    [progress]
  );

  // Scroll to top utility
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return {
    progress,
    hasPassedThreshold,
    scrollToTop,
    isScrolling,
  };
}

export default useScrollProgress;
