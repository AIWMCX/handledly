import { useEffect, useState, useRef } from "react";
import { Container } from "@/components/layout";
import {
  GoogleRatingIcon,
  ReviewCountIcon,
  CityCountIcon,
  ZeroFeesIcon,
} from "@/components/icons/TrustIcons";

const stats = [
  { 
    value: 4.9, 
    suffix: "/5", 
    label: "Customer Rating",
    Icon: GoogleRatingIcon,
    highlight: true,
  },
  { 
    value: 97, 
    suffix: "%", 
    label: "Satisfaction Rate",
    Icon: ReviewCountIcon,
    highlight: false,
  },
  { 
    value: 30, 
    suffix: "+", 
    label: "Denver Metro Cities",
    Icon: CityCountIcon,
    highlight: false,
  },
  { 
    value: 0, 
    suffix: "", 
    label: "Hidden Fees - Guaranteed",
    Icon: ZeroFeesIcon,
    highlight: true,
    prefix: "$",
  },
];

function AnimatedNumber({ value, suffix, prefix }: { value: number; suffix: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setDisplayValue(value);
              clearInterval(timer);
            } else {
              setDisplayValue(Math.floor(current * 10) / 10);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref}>
      <span>{prefix}</span>
      {Number.isInteger(value) ? Math.floor(displayValue).toLocaleString() : displayValue.toFixed(1)}
      <span className="text-accent">{suffix}</span>
    </div>
  );
}

export function StatsBar() {
  return (
    <section className="py-10 bg-background border-y border-border/50">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className={`text-center p-5 rounded-2xl transition-all duration-300 group animate-fade-in hover-lift ${
                stat.highlight 
                  ? "bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10" 
                  : "hover:bg-secondary"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Premium icon with golden glow */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:shadow-glow-gold transition-all duration-300">
                    <stat.Icon size="nav" color="gold" />
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-accent/20 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
                </div>
              </div>
              <p className="font-heading text-3xl lg:text-4xl font-bold text-primary">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}