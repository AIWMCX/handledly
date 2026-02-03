import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, Zap, TrendingUp, CalendarClock } from 'lucide-react';
import { UrgencyType, UrgencyBadgeConfig } from '@/types/conversion';
import { ConversionEvents } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface UrgencyBadgeProps {
  type: UrgencyType;
  text?: string;
  expiryTime?: Date;
  service?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const URGENCY_CONFIGS: Record<UrgencyType, Omit<UrgencyBadgeConfig, 'type'>> = {
  slots_limited: {
    text: 'Only 3 slots left today',
    icon: 'clock',
    pulse: true,
  },
  discount_expiring: {
    text: '15% off ends soon',
    icon: 'flame',
    pulse: true,
  },
  same_day: {
    text: 'Same-day available',
    icon: 'zap',
    pulse: false,
  },
  popular: {
    text: 'Most popular choice',
    icon: 'trending',
    pulse: false,
  },
  last_minute: {
    text: 'Last-minute opening',
    icon: 'calendar',
    pulse: true,
  },
};

const ICONS = {
  clock: Clock,
  flame: Flame,
  zap: Zap,
  trending: TrendingUp,
  calendar: CalendarClock,
};

function formatTimeRemaining(expiryTime: Date): string {
  const now = new Date();
  const diff = expiryTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

export function UrgencyBadge({
  type,
  text,
  expiryTime,
  service,
  pulse,
  size = 'md',
  className,
  onClick,
}: UrgencyBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const config = URGENCY_CONFIGS[type];
  const displayText = text || config.text;
  const shouldPulse = pulse ?? config.pulse;
  const IconComponent = ICONS[config.icon as keyof typeof ICONS] || Clock;

  // Update countdown timer
  useEffect(() => {
    if (!expiryTime) return;

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(expiryTime));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryTime]);

  // Track view
  useEffect(() => {
    if (!hasTrackedView) {
      ConversionEvents.urgencyBadgeViewed(type, service);
      setHasTrackedView(true);
    }
  }, [type, service, hasTrackedView]);

  const handleClick = () => {
    ConversionEvents.urgencyBadgeClicked(type, service);
    onClick?.();
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const colorClasses: Record<UrgencyType, string> = {
    slots_limited: 'bg-accent/10 text-accent-text border-accent/30',
    discount_expiring: 'bg-destructive/10 text-destructive border-destructive/30',
    same_day: 'bg-success/10 text-success border-success/30',
    popular: 'bg-primary/10 text-primary border-primary/30',
    last_minute: 'bg-accent/10 text-accent-text border-accent/30',
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:scale-105',
        sizeClasses[size],
        colorClasses[type],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pulse animation */}
      {shouldPulse && (
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}

      <IconComponent className={iconSizes[size]} />
      
      <span>
        {displayText}
        {timeRemaining && (
          <span className="ml-1 opacity-80">• {timeRemaining}</span>
        )}
      </span>
    </motion.button>
  );
}

// Convenience components for common urgency types
export function SlotsLimitedBadge(props: Omit<UrgencyBadgeProps, 'type'>) {
  const slots = Math.floor(Math.random() * 3) + 2; // 2-4 slots
  return (
    <UrgencyBadge
      type="slots_limited"
      text={`Only ${slots} slots left today`}
      {...props}
    />
  );
}

export function DiscountBadge(props: Omit<UrgencyBadgeProps, 'type'> & { discount?: number }) {
  const { discount = 15, ...rest } = props;
  return (
    <UrgencyBadge
      type="discount_expiring"
      text={`${discount}% off this week`}
      {...rest}
    />
  );
}

export function SameDayBadge(props: Omit<UrgencyBadgeProps, 'type'>) {
  return (
    <UrgencyBadge
      type="same_day"
      text="Same-day available"
      {...props}
    />
  );
}

export default UrgencyBadge;
