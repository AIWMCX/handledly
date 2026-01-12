import { IconWrapper, type IconProps } from "./IconWrapper";

export function BrandIconSolid({ size = 'feature', color = 'navy', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M4 4h5v7h6V4h5v16h-5v-7H9v7H4V4z" />
        <rect x="17" y="2" width="4" height="4" rx="1" className="text-[#F9B233]" fill="currentColor" />
      </svg>
    </IconWrapper>
  );
}

export function BrandIconOutline({ size = 'feature', color = 'navy', className }: Omit<IconProps, 'children'>) {
  return (
    <IconWrapper size={size} color={color} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M5 4h4v7h6V4h4v16h-4v-7H9v7H5V4z" />
        <rect x="17" y="2" width="4" height="4" rx="1" className="text-[#F9B233]" stroke="currentColor" />
      </svg>
    </IconWrapper>
  );
}

export function BrandIconGold({ size = 'feature', className }: Omit<IconProps, 'children' | 'color'>) {
  return (
    <IconWrapper size={size} color="gold" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M4 4h5v7h6V4h5v16h-5v-7H9v7H4V4z" />
        <rect x="17" y="2" width="4" height="4" rx="1" />
      </svg>
    </IconWrapper>
  );
}
