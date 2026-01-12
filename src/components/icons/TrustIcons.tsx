import { IconWrapper, type IconProps } from "./IconWrapper";

export function NoHiddenFeesIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2" />
        <path d="M12 16v2" />
        <path d="M9 10c0-1.1.9-2 2-2h2a2 2 0 110 4h-2a2 2 0 100 4h2a2 2 0 002-2" />
        <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" />
      </svg>
    </IconWrapper>
  );
}

export function DamageProtectionIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </IconWrapper>
  );
}

export function InsuredIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="12" cy="10" r="3" />
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="5" r="3" />
        <circle cx="5" cy="9" r="2.5" />
        <circle cx="19" cy="9" r="2.5" />
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M7 7h10v10l-5 4-5-4V7z" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 4v3" />
        <circle cx="12" cy="3" r="1" fill="currentColor" />
        <circle cx="18" cy="5" r="1.5" />
        <path d="M18 6.5v3" />
      </svg>
    </IconWrapper>
  );
}

export function OnTimeIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
        <path d="M17 17l2 2" />
        <path d="M19 17l-2 2" />
      </svg>
    </IconWrapper>
  );
}
