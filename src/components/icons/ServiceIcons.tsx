import { IconWrapper, type IconProps } from "./IconWrapper";

// LOCAL MOVING Icons

export function ApartmentCondoIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="4" y="2" width="16" height="20" rx="1" />
        <rect x="7" y="5" width="3" height="2" />
        <rect x="14" y="5" width="3" height="2" />
        <rect x="7" y="9" width="3" height="2" />
        <rect x="14" y="9" width="3" height="2" />
        <rect x="7" y="13" width="3" height="2" />
        <rect x="14" y="13" width="3" height="2" />
        <rect x="10" y="18" width="4" height="4" />
      </svg>
    </IconWrapper>
  );
}

export function HouseTownhouseIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M3 12l9-9 9 9" />
        <path d="M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
        <rect x="9" y="14" width="6" height="7" />
        <rect x="9" y="8" width="2" height="2" />
        <rect x="13" y="8" width="2" height="2" />
      </svg>
    </IconWrapper>
  );
}

export function LaborOnlyIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="7" cy="5" r="2" />
        <circle cx="17" cy="5" r="2" />
        <path d="M5 10h4l1 4-2 7" />
        <path d="M15 10h4l-1 4 2 7" />
        <rect x="8" y="12" width="8" height="6" rx="1" />
        <line x1="12" y1="12" x2="12" y2="9" />
      </svg>
    </IconWrapper>
  );
}

export function SameDayLocalIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
        <path d="M19 5l2-2" />
        <path d="M21 7l-2-2" />
      </svg>
    </IconWrapper>
  );
}

// HEAVY ITEMS Icons

export function PianoIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M3 6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
        <path d="M3 18v1a1 1 0 001 1h2v-2" />
        <path d="M21 18v1a1 1 0 01-1 1h-2v-2" />
        <line x1="7" y1="8" x2="7" y2="14" />
        <line x1="10" y1="8" x2="10" y2="14" />
        <line x1="14" y1="8" x2="14" y2="14" />
        <line x1="17" y1="8" x2="17" y2="14" />
        <rect x="8" y="8" width="1.5" height="4" fill="currentColor" />
        <rect x="11" y="8" width="1.5" height="4" fill="currentColor" />
        <rect x="15" y="8" width="1.5" height="4" fill="currentColor" />
      </svg>
    </IconWrapper>
  );
}

export function PoolTableIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="2" y="6" width="20" height="12" rx="1" />
        <circle cx="5" cy="9" r="1" />
        <circle cx="19" cy="9" r="1" />
        <circle cx="5" cy="15" r="1" />
        <circle cx="19" cy="15" r="1" />
        <circle cx="12" cy="6" r="1" />
        <circle cx="12" cy="18" r="1" />
        <circle cx="10" cy="12" r="1.5" fill="currentColor" />
        <circle cx="14" cy="10" r="1.5" fill="currentColor" />
        <line x1="2" y1="20" x2="4" y2="18" />
        <line x1="22" y1="20" x2="20" y2="18" />
      </svg>
    </IconWrapper>
  );
}

export function HeavyItemLightIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="4" y="10" width="16" height="4" rx="2" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="12" r="3" />
        <text x="12" y="20" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none">&lt;300</text>
      </svg>
    </IconWrapper>
  );
}

export function HeavyItemHeavyIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="9" x2="12" y2="15" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <rect x="8" y="2" width="8" height="2" rx="0.5" />
      </svg>
    </IconWrapper>
  );
}

export function SameDayHeavyIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l3 2" />
        <rect x="16" y="16" width="6" height="6" rx="1" fill="none" />
        <path d="M19 19v2" />
        <path d="M18 20h2" />
      </svg>
    </IconWrapper>
  );
}
