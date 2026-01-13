import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: React.ReactNode;
  decimals?: number;
}

interface AnimatedStatsProps {
  stats: StatItem[];
  duration?: number;
  delay?: number;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

function useCountUp(
  end: number,
  duration: number,
  isInView: boolean,
  delay: number = 0,
  decimals: number = 0
) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out-expo)
        const easeOutExpo = progress === 1 
          ? 1 
          : 1 - Math.pow(2, -10 * progress);
        
        countRef.current = easeOutExpo * end;
        setCount(parseFloat(countRef.current.toFixed(decimals)));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, isInView, delay, decimals]);

  return count;
}

function AnimatedStatItem({
  stat,
  index,
  duration,
  staggerDelay,
  isInView,
  className,
}: {
  stat: StatItem;
  index: number;
  duration: number;
  staggerDelay: number;
  isInView: boolean;
  className?: string;
}) {
  const count = useCountUp(
    stat.value,
    duration,
    isInView,
    index * staggerDelay,
    stat.decimals || 0
  );

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center text-center p-4 rounded-xl',
        'bg-background/50 backdrop-blur-sm border border-border/50',
        'hover:border-accent/50 hover:shadow-lg transition-all duration-300',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.5, 
        delay: index * staggerDelay / 1000,
        ease: 'easeOut'
      }}
    >
      {stat.icon && (
        <div className="mb-2 text-accent">
          {stat.icon}
        </div>
      )}
      
      <div className="flex items-baseline gap-0.5">
        {stat.prefix && (
          <span className="text-2xl md:text-3xl font-bold text-accent">
            {stat.prefix}
          </span>
        )}
        <span className="text-3xl md:text-4xl font-bold text-foreground">
          {count}
        </span>
        {stat.suffix && (
          <span className="text-2xl md:text-3xl font-bold text-accent">
            {stat.suffix}
          </span>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mt-1">
        {stat.label}
      </p>
    </motion.div>
  );
}

export function AnimatedStats({
  stats,
  duration = 2000,
  delay = 0,
  staggerDelay = 150,
  className,
  itemClassName,
}: AnimatedStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  return (
    <div
      ref={containerRef}
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-4',
        className
      )}
    >
      {stats.map((stat, index) => (
        <AnimatedStatItem
          key={`${stat.label}-${index}`}
          stat={stat}
          index={index}
          duration={duration}
          staggerDelay={staggerDelay}
          isInView={isInView}
          className={itemClassName}
        />
      ))}
    </div>
  );
}

export default AnimatedStats;
