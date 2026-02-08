import React, { forwardRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, FileText, MessageCircle, PhoneCall } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { ConversionEvents } from '@/lib/analytics';
import { MobileCTAAction } from '@/types/conversion';
import { cn } from '@/lib/utils';

interface MobileStickyCTAProps {
  phoneNumber?: string;
  primaryAction?: MobileCTAAction;
  secondaryAction?: MobileCTAAction;
  showAfterScroll?: number;
  className?: string;
}

const ACTION_CONFIG: Record<MobileCTAAction, { label: string; icon: typeof Phone; href?: string }> = {
  call: {
    label: 'Call Now',
    icon: Phone,
  },
  quote: {
    label: 'Get Quote',
    icon: FileText,
  },
  chat: {
    label: 'Chat',
    icon: MessageCircle,
  },
  callback: {
    label: 'Call Me',
    icon: PhoneCall,
  },
};

export const MobileStickyCTA = forwardRef<HTMLDivElement, MobileStickyCTAProps>(function MobileStickyCTA({
  phoneNumber = '(878) 218-7397',
  primaryAction = 'call',
  secondaryAction = 'quote',
  showAfterScroll = 300,
  className,
}, ref) {
  const isMobile = useIsMobile();
  const { hasPassedThreshold } = useScrollProgress();
  const location = useLocation();
  
  const isQuotePage = location.pathname === '/quote';
  const shouldShow = isMobile && hasPassedThreshold(15) && !isQuotePage;

  // Manage render + visibility for CSS transition
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldShow) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [shouldShow]);

  const handleActionClick = (action: MobileCTAAction) => {
    ConversionEvents.mobileCTAClicked(action, window.location.pathname);

    if (action === 'call') {
      window.location.href = `tel:${phoneNumber.replace(/[^\d+]/g, '')}`;
    } else if (action === 'quote') {
      window.location.href = '/quote';
    }
  };

  const PrimaryIcon = ACTION_CONFIG[primaryAction].icon;
  const SecondaryIcon = secondaryAction ? ACTION_CONFIG[secondaryAction].icon : null;

  if (!isMobile || !shouldRender) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom',
        'transition-all duration-300 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0',
        className
      )}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-lg border-t border-border/50" />
      
      {/* Content */}
      <div className="relative flex items-center gap-3 p-4 max-w-md mx-auto">
        {/* Primary CTA */}
        <button
          onClick={() => handleActionClick(primaryAction)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2',
            'py-4 px-6 rounded-xl',
            'bg-accent text-accent-foreground',
            'font-semibold text-lg',
            'shadow-lg shadow-accent/30',
            'active:scale-95 transition-transform'
          )}
        >
          <PrimaryIcon className="w-5 h-5" />
          <span>{ACTION_CONFIG[primaryAction].label}</span>
        </button>

        {/* Secondary CTA */}
        {secondaryAction && SecondaryIcon && (
          <button
            onClick={() => handleActionClick(secondaryAction)}
            className={cn(
              'flex items-center justify-center gap-2',
              'py-4 px-6 rounded-xl',
              'bg-muted text-foreground',
              'font-semibold',
              'border border-border',
              'active:scale-95 transition-transform'
            )}
          >
            <SecondaryIcon className="w-5 h-5" />
            <span>{ACTION_CONFIG[secondaryAction].label}</span>
          </button>
        )}
      </div>

      {/* Safe area spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
});

export default MobileStickyCTA;
