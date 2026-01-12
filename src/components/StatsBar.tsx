import { useEffect, useState, useRef } from "react";
import { Container } from "@/components/layout";
import { Star, MapPin, Shield, Calendar } from "lucide-react";

const stats = [
  { 
    value: 4.9, 
    suffix: "/5", 
    label: "Google Rating",
    icon: Star,
    highlight: true,
  },
  { 
    value: 500, 
    suffix: "+", 
    label: "5-Star Reviews",
    icon: Star,
    highlight: false,
  },
  { 
    value: 30, 
    suffix: "+", 
    label: "Denver Metro Cities",
    icon: MapPin,
    highlight: false,
  },
  { 
    value: 0, 
    suffix: "", 
    label: "Hidden Fees - Guaranteed",
    icon: Shield,
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
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className={`text-center p-4 rounded-2xl transition-all ${
                stat.highlight 
                  ? "bg-primary/5 border border-primary/10" 
                  : ""
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.highlight ? "text-accent fill-accent" : "text-accent"}`} />
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