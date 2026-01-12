import { IconWrapper, type IconProps } from "./IconWrapper";

export function NoHiddenFeesIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 6v2" />
        <path d="M12 16v2" />
        <path d="M9 10c0-1.1.9-2 2-2h2a2 2 0 110 4h-2a2 2 0 100 4h2a2 2 0 002-2" />
        <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2.5" />
      </svg>
    </IconWrapper>
  );
}

export function DamageProtectionIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" fill="currentColor" fillOpacity="0.1" />
        <path d="M9 12l2 2 4-4" strokeWidth="2.5" />
      </svg>
    </IconWrapper>
  );
}

export function InsuredIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.1" />
        <circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 13v2" />
        <path d="M8 18h8" />
        <path d="M9 7h6" />
      </svg>
    </IconWrapper>
  );
}

export function ProfessionalTeamIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="5" r="3" fill="currentColor" fillOpacity="0.15" />
        <circle cx="5" cy="9" r="2.5" fill="currentColor" fillOpacity="0.1" />
        <circle cx="19" cy="9" r="2.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M7.5 21v-4a4.5 4.5 0 019 0v4" />
        <path d="M2.5 21v-3a2.5 2.5 0 015 0v3" />
        <path d="M16.5 21v-3a2.5 2.5 0 015 0v3" />
      </svg>
    </IconWrapper>
  );
}

export function TransparentPricingIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M7 7h10v10l-5 4-5-4V7z" fill="currentColor" fillOpacity="0.1" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M12 4v3" />
        <circle cx="12" cy="3" r="1" fill="currentColor" />
        <circle cx="18" cy="5" r="1.5" fill="currentColor" fillOpacity="0.3" />
        <path d="M18 6.5v3" />
      </svg>
    </IconWrapper>
  );
}

export function OnTimeIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 6v6l4 2" strokeWidth="2.5" />
        <path d="M17 17l2 2" />
        <path d="M19 17l-2 2" />
      </svg>
    </IconWrapper>
  );
}

// Premium Trust Card Icons - Filled/Bold versions
export function AwardWinningIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="8" r="6" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.5 14l-1 8 4.5-2 4.5 2-1-8" />
      </svg>
    </IconWrapper>
  );
}

export function OnTimeGuaranteeIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 6v6l3 3" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M20 6l1.5 1.5" strokeWidth="2" />
        <path d="M21.5 6L20 7.5" strokeWidth="2" />
      </svg>
    </IconWrapper>
  );
}

export function FullyInsuredIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" fill="currentColor" fillOpacity="0.15" />
        <path d="M9 12l2 2 4-4" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.1" />
      </svg>
    </IconWrapper>
  );
}

export function LocalExpertsIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="12" cy="9" r="3" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 6l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="currentColor" />
      </svg>
    </IconWrapper>
  );
}

// Differentiator Icons - Enhanced versions
export function FlatPricingIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 6v12" strokeWidth="2.5" />
        <path d="M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2.5 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5" />
        <path d="M9 18h6" strokeWidth="1.5" />
      </svg>
    </IconWrapper>
  );
}

export function FreePackingIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M21 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v2" fill="currentColor" fillOpacity="0.1" />
        <rect x="3" y="8" width="18" height="12" rx="1" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 4v4" />
        <path d="M8 12h8" />
        <path d="M12 12v4" />
        <circle cx="19" cy="5" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
        <path d="M18 5h2" />
      </svg>
    </IconWrapper>
  );
}

export function NoStairFeesIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
        <path d="M7 17h3v-4h4v-3h3" strokeWidth="2.5" />
        <path d="M7 17V7" strokeDasharray="2 2" />
        <circle cx="18" cy="6" r="2" fill="currentColor" fillOpacity="0.2" />
        <path d="M17 6h2" />
      </svg>
    </IconWrapper>
  );
}

export function NoTruckFeesIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M1 3h15v13H1z" fill="currentColor" fillOpacity="0.1" />
        <path d="M16 8h4l3 3v5h-7V8z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="5.5" cy="18.5" r="2.5" fill="currentColor" fillOpacity="0.2" />
        <circle cx="18.5" cy="18.5" r="2.5" fill="currentColor" fillOpacity="0.2" />
        <path d="M8 18.5h7" />
        <circle cx="20" cy="5" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <path d="M19 5h2" />
      </svg>
    </IconWrapper>
  );
}

export function FreeAssemblyIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" fill="currentColor" fillOpacity="0.1" />
        <circle cx="6" cy="6" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="10" cy="4" r="1.5" fill="currentColor" fillOpacity="0.15" />
      </svg>
    </IconWrapper>
  );
}

export function DamageFreeDaysIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" fill="currentColor" fillOpacity="0.1" />
        <path d="M9 12l2 2 4-4" strokeWidth="2.5" />
        <path d="M12 2v2" />
        <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.08" />
      </svg>
    </IconWrapper>
  );
}
