import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Clock, MapPin, Sparkles } from 'lucide-react';
import { useSocialProof } from '@/hooks/useSocialProof';
import { cn } from '@/lib/utils';

interface SocialProofBannerProps {
  enabled?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export function SocialProofBanner({
  enabled = true,
  position = 'bottom-left',
  className,
}: SocialProofBannerProps) {
  const { currentNotification, liveViewers, dismissNotification, pauseNotifications } = useSocialProof({
    enabled,
    intervalMin: 60, // Less aggressive - 60-90 seconds
    intervalMax: 90,
    autoHideDuration: 6,
    maxNotifications: 8, // Fewer per session
  });

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-20 left-4',
    'top-right': 'top-20 right-4',
  };

  const getIcon = () => {
    switch (currentNotification?.type) {
      case 'booking':
        return <Sparkles className="w-5 h-5 text-accent" />;
      case 'viewing':
        return <Users className="w-5 h-5 text-primary" />;
      case 'recent':
        return <Clock className="w-5 h-5 text-success" />;
      default:
        return <MapPin className="w-5 h-5 text-accent" />;
    }
  };

  const getBackgroundClass = () => {
    switch (currentNotification?.type) {
      case 'booking':
        return 'bg-accent/10 border-accent/30';
      case 'viewing':
        return 'bg-primary/10 border-primary/30';
      case 'recent':
        return 'bg-success/10 border-success/30';
      default:
        return 'bg-background border-border';
    }
  };

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 25 
          }}
          className={cn(
            'fixed z-50 max-w-sm',
            positionClasses[position],
            className
          )}
        >
          <div
            className={cn(
              'relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
              getBackgroundClass()
            )}
          >
            {/* Dismiss button with "don't show again" on double-click */}
            <button
              onClick={(e) => {
                if (e.detail === 2) {
                  // Double-click to dismiss permanently
                  localStorage.setItem('socialProofDismissed', 'true');
                  pauseNotifications();
                } else {
                  dismissNotification();
                }
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Dismiss notification (double-click to hide permanently)"
              title="Click to dismiss, double-click to hide permanently"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm">
              {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground leading-snug">
                {currentNotification.message}
              </p>
              {currentNotification.type === 'booking' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Just now
                </p>
              )}
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-accent/50 via-accent to-accent/50 rounded-b-xl"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              style={{ transformOrigin: 'left' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SocialProofBanner;
