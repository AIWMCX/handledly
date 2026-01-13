import { IconWrapper, type IconProps } from "./IconWrapper";

// ==========================================
// PREMIUM PROCESS ICONS - How It Works
// ==========================================

export function ContactUsIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        {/* Phone with chat bubble */}
        <rect x="5" y="2" width="14" height="20" rx="2" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 18h.01" strokeWidth="3" />
        <path d="M8 6h8" />
        <circle cx="17" cy="8" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
        <path d="M15.5 8h3" strokeWidth="2" />
        <path d="M17 6.5v3" strokeWidth="2" />
      </svg>
    </IconWrapper>
  );
}

export function DescribeMoveIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        {/* Clipboard with house details */}
        <rect x="4" y="2" width="16" height="20" rx="2" fill="currentColor" fillOpacity="0.1" />
        <path d="M8 2v2h8V2" />
        <rect x="8" y="2" width="8" height="2" fill="currentColor" fillOpacity="0.2" />
        {/* House icon inside */}
        <path d="M12 8l4 3v5h-3v-3h-2v3H8v-5l4-3z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 19h10" strokeWidth="1.5" />
      </svg>
    </IconWrapper>
  );
}

export function UpfrontPricingIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        {/* Dollar in transparent circle - no hidden fees */}
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M12 7v2" strokeWidth="2.5" />
        <path d="M12 15v2" strokeWidth="2.5" />
        <path d="M9 11c0-1.1.9-2 2-2h2a2 2 0 110 4h-2a2 2 0 100 4h2a2 2 0 002-2" strokeWidth="2" />
      </svg>
    </IconWrapper>
  );
}

export function ScheduleDateIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        {/* Calendar with checkmark */}
        <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
        <path d="M3 10h18" strokeWidth="2" />
        <path d="M8 2v4" strokeWidth="2" />
        <path d="M16 2v4" strokeWidth="2" />
        {/* Checkmark */}
        <circle cx="12" cy="16" r="4" fill="currentColor" fillOpacity="0.15" />
        <path d="M10 16l1.5 1.5 3-3" strokeWidth="2" />
      </svg>
    </IconWrapper>
  );
}

export function WeHandleItIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        {/* Moving truck with checkmark */}
        <path d="M1 6h14v10H1z" fill="currentColor" fillOpacity="0.1" />
        <path d="M15 10h4l3 3v3h-7v-6z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="5" cy="18" r="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
        <circle cx="17" cy="18" r="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
        <path d="M7 18h8" />
        {/* Success checkmark badge */}
        <circle cx="19" cy="6" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17.5 6l1 1 2-2" strokeWidth="2" />
      </svg>
    </IconWrapper>
  );
}

// ==========================================
// ORIGINAL ICONS (kept for compatibility)
// ==========================================

export function QuoteIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="4" y="2" width="16" height="20" rx="2" fill="currentColor" fillOpacity="0.1" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="16" y2="11" />
        <line x1="8" y1="15" x2="12" y2="15" />
        <path d="M14 15l2 2 4-4" />
      </svg>
    </IconWrapper>
  );
}

export function ScheduleIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <circle cx="12" cy="16" r="3" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 14.5v1.5l1 1" />
      </svg>
    </IconWrapper>
  );
}

export function MovingTruckIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="1" y="6" width="14" height="10" rx="1" fill="currentColor" fillOpacity="0.1" />
        <path d="M15 10h4l3 4v2h-7V10z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="6" cy="18" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="18" cy="18" r="2" fill="currentColor" fillOpacity="0.2" />
        <line x1="8" y1="18" x2="16" y2="18" />
      </svg>
    </IconWrapper>
  );
}

export function CheckmarkIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <path d="M8 12l3 3 5-6" strokeWidth="2.5" />
      </svg>
    </IconWrapper>
  );
}
