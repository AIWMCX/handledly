import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
}

/**
 * Scroll-to-top button using pure CSS transitions instead of framer-motion.
 * This avoids pulling the 40KB framer-motion bundle into the critical rendering path,
 * significantly reducing LCP element render delay.
 */
export function ScrollToTop({ threshold = 400, className }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setIsVisible(window.scrollY > threshold);
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed z-30 p-3 rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl',
        'hover:bg-primary/90',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        // Position: bottom-left on mobile to avoid overlap with FABs on right
        'bottom-[7.5rem] left-4 sm:bottom-6 sm:left-auto sm:right-6',
        // CSS transitions replacing framer-motion animations
        'transition-all duration-200 ease-out',
        isVisible
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-75 translate-y-4 pointer-events-none',
        className
      )}
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export default ScrollToTop;
