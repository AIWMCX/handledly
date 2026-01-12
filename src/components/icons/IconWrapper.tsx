import { cn } from "@/lib/utils";

export interface IconProps {
  size?: 'hero' | 'feature' | 'list' | 'nav' | 'badge' | number;
  color?: 'navy' | 'gold' | 'white' | 'current';
  className?: string;
  children?: React.ReactNode;
}

const ICON_SIZES = {
  hero: 64,
  feature: 48,
  list: 32,
  nav: 24,
  badge: 20,
} as const;

const ICON_COLORS = {
  navy: 'text-[#1E3A5F]',
  gold: 'text-[#F9B233]',
  white: 'text-white',
  current: 'text-current',
} as const;

export function IconWrapper({ 
  size = 'feature', 
  color = 'current', 
  className, 
  children 
}: IconProps) {
  const pixelSize = typeof size === 'number' ? size : ICON_SIZES[size];
  const colorClass = ICON_COLORS[color];

  return (
    <span 
      className={cn("inline-flex items-center justify-center shrink-0", colorClass, className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {children}
    </span>
  );
}

export function createIcon(
  SvgContent: React.FC<React.SVGProps<SVGSVGElement>>
) {
  return function Icon({ size = 'feature', color = 'current', className }: Omit<IconProps, 'children'>) {
    return (
      <IconWrapper size={size} color={color} className={className}>
        <SvgContent className="w-full h-full" />
      </IconWrapper>
    );
  };
}
