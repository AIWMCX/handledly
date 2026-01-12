import { IconWrapper, type IconProps } from "./IconWrapper";

export function AiVoiceIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10v2a7 7 0 0014 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
        <path d="M2 8c1-1 2-1 2 0s1 1 2 0" />
        <path d="M18 8c1-1 2-1 2 0s1 1 2 0" />
        <path d="M2 12c1-1 2-1 2 0s1 1 2 0" />
        <path d="M18 12c1-1 2-1 2 0s1 1 2 0" />
      </svg>
    </IconWrapper>
  );
}

export function InstantQuoteIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="14" y2="12" />
        <line x1="8" y1="16" x2="10" y2="16" />
        <path d="M17 12l2-4h-3l2-4" strokeWidth="2" />
      </svg>
    </IconWrapper>
  );
}

export function SmartSchedulingIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <circle cx="12" cy="16" r="3" />
        <path d="M10 15.5c0-.8.5-1.5 1.2-1.8" />
        <path d="M14 16.5c0 .8-.5 1.5-1.2 1.8" />
        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      </svg>
    </IconWrapper>
  );
}

export function RealTimeTrackingIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="3" />
        <circle cx="12" cy="9" r="1" fill="currentColor" />
        <path d="M3 12c-1 1-1 2 0 2" />
        <path d="M21 12c1 1 1 2 0 2" />
        <path d="M3 16c-1 1-1 2 0 2" />
        <path d="M21 16c1 1 1 2 0 2" />
      </svg>
    </IconWrapper>
  );
}
