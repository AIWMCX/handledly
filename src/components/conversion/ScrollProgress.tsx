import React from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  color?: string;
  height?: number;
  className?: string;
  showPercentage?: boolean;
  threshold?: number; // Only show after scrolling this percentage
}

export function ScrollProgress({
  color,
  height = 3,
  className,
  showPercentage = false,
  threshold = 5,
}: ScrollProgressProps) {
  const { progress, isScrolling } = useScrollProgress();

  // Don't show until user has scrolled a bit
  const isVisible = progress > threshold;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Background track */}
      <div
        className="absolute top-0 left-0 right-0 bg-muted/30"
        style={{ height: `${height}px` }}
      />

      {/* Progress bar */}
      <div
        className={cn(
          'absolute top-0 left-0 bg-gradient-to-r from-accent via-accent to-accent/80',
          'shadow-[0_0_10px_rgba(212,175,55,0.5)]',
          'transition-[opacity,transform] duration-200'
        )}
        style={{
          height: `${height}px`,
          width: `${progress}%`,
          backgroundColor: color,
          opacity: isVisible ? 1 : 0,
          transform: `scaleY(${isScrolling ? 1.2 : 1})`,
          transformOrigin: 'top',
        }}
      />

      {/* Glow effect at the tip */}
      {isVisible && (
        <div
          className="absolute top-0 w-8 bg-gradient-to-r from-transparent to-accent/50 blur-sm transition-opacity duration-200"
          style={{ 
            left: `calc(${progress}% - 32px)`,
            height: `${height * 2}px`,
            top: `-${height / 2}px`,
            opacity: isScrolling ? 1 : 0.5,
          }}
        />
      )}

      {/* Percentage indicator */}
      {showPercentage && isVisible && (
        <div
          className="absolute top-2 right-4 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded-full backdrop-blur-sm"
        >
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

export default ScrollProgress;
