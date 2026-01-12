import { IconWrapper, type IconProps } from "./IconWrapper";

export function DenverMetroIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        {/* Mountains */}
        <path d="M2 20l5-8 3 4 4-10 4 6 4-4v12H2z" />
        {/* City skyline overlay */}
        <rect x="8" y="14" width="3" height="6" />
        <rect x="12" y="12" width="2" height="8" />
        <rect x="15" y="15" width="3" height="5" />
        {/* Sun */}
        <circle cx="18" cy="5" r="2" />
      </svg>
    </IconWrapper>
  );
}

export function LocalExpertIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <path d="M12 6l1.5 3 3.5.5-2.5 2.5.5 3.5L12 14l-3 1.5.5-3.5L7 9.5l3.5-.5L12 6z" fill="currentColor" stroke="none" />
      </svg>
    </IconWrapper>
  );
}

export function ServiceAreaIcon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M12 7v2" />
        <path d="M12 15v2" />
        <path d="M7 12h2" />
        <path d="M15 12h2" />
      </svg>
    </IconWrapper>
  );
}
