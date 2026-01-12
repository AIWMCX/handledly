import { cn } from "@/lib/utils";

// Mesh Gradient Hero Background with floating orbs
export function MeshGradientHero({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Base mesh gradient */}
      <div className="absolute inset-0 bg-mesh-hero" />
      
      {/* Floating orbs */}
      <div className="absolute top-10 right-[10%] w-[600px] h-[600px] bg-gradient-radial from-accent/10 via-accent/5 to-transparent rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-[30%] left-[5%] w-[400px] h-[400px] bg-gradient-radial from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-gradient-radial from-accent/6 to-transparent rounded-full blur-2xl animate-float-delayed" />
      
      {/* Dot grid overlay */}
      <div className="absolute inset-0 pattern-dots" />
      
      {/* Subtle grain texture */}
      <div className="absolute inset-0 texture-grain" />
    </div>
  );
}

// Section background with subtle mesh gradient
export function SectionMeshBackground({ 
  className, 
  variant = "default" 
}: { 
  className?: string;
  variant?: "default" | "accent" | "subtle";
}) {
  const gradientClass = {
    default: "from-primary/3 via-transparent to-accent/3",
    accent: "from-accent/5 via-transparent to-primary/3",
    subtle: "from-secondary via-transparent to-secondary",
  }[variant];

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradientClass)} />
      <div className="absolute inset-0 pattern-dots opacity-50" />
    </div>
  );
}

// Glass card wrapper
export function GlassCard({ 
  children, 
  className,
  hover = true 
}: { 
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(
      "glass-card rounded-2xl p-6 relative overflow-hidden",
      hover && "hover:shadow-depth-3 hover:border-primary/30 transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
}

// Floating orb component for backgrounds
export function FloatingOrb({ 
  className,
  size = "md",
  color = "accent"
}: { 
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "accent" | "primary" | "mixed";
}) {
  const sizeClasses = {
    sm: "w-[200px] h-[200px]",
    md: "w-[400px] h-[400px]",
    lg: "w-[600px] h-[600px]",
    xl: "w-[800px] h-[800px]",
  }[size];

  const colorClasses = {
    accent: "from-accent/10 to-transparent",
    primary: "from-primary/8 to-transparent",
    mixed: "from-accent/8 via-primary/5 to-transparent",
  }[color];

  return (
    <div className={cn(
      "absolute bg-gradient-radial rounded-full blur-3xl animate-float pointer-events-none",
      sizeClasses,
      colorClasses,
      className
    )} />
  );
}

// Spotlight effect that follows mouse (simplified version)
export function SpotlightBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-accent/10 via-accent/5 to-transparent blur-3xl" />
    </div>
  );
}

// Animated border glow for premium cards
export function GlowBorder({ 
  children, 
  className,
  active = false 
}: { 
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div className={cn(
      "relative rounded-2xl p-[1px] transition-all duration-500",
      active ? "bg-gradient-to-r from-accent via-accent/50 to-primary shadow-glow-gold" : "bg-border",
      className
    )}>
      <div className="bg-background rounded-2xl h-full">
        {children}
      </div>
    </div>
  );
}
