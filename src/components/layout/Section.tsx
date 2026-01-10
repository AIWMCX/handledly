import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-20 lg:py-28", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({ title, subtitle, align = "center", className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 lg:mb-16",
        {
          "text-center": align === "center",
          "text-left": align === "left",
        },
        className
      )}
    >
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          "text-muted-foreground text-lg max-w-2xl",
          align === "center" && "mx-auto"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}