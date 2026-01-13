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

  // Calculate scroll progress
  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) return 0;
    
    const currentProgress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    return Math.round(currentProgress);
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

  // Set up scroll listener
  useEffect(() => {
    // Calculate initial progress
    setProgress(calculateProgress());

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [handleScroll, calculateProgress]);

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
