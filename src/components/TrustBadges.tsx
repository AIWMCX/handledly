import { Container } from "@/components/layout";
import {
  InsuranceCoverageIcon,
  WorkersCompIcon,
} from "@/components/icons/TrustIcons";
import { Shield, Truck, Users, Clock } from "lucide-react";

const badges = [
  {
    Icon: Shield,
    isLucide: true,
    label: "Licensed & Insured",
    sublabel: "State Registered",
  },
  {
    Icon: InsuranceCoverageIcon,
    isLucide: false,
    label: "Full Coverage",
    sublabel: "Protected Moves",
  },
  {
    Icon: WorkersCompIcon,
    isLucide: false,
    label: "Workers' Comp",
    sublabel: "Team Protected",
  },
  {
    Icon: Truck,
    isLucide: true,
    label: "GPS Tracked",
    sublabel: "Real-Time Updates",
  },
  {
    Icon: Clock,
    isLucide: true,
    label: "On-Time Guarantee",
    sublabel: "We Show Up",
  },
];

export function TrustBadges() {
  return (
    <section className="py-8 bg-secondary/50 border-y border-border">
      <Container>
        <div className="flex flex-wrap items-start sm:items-center justify-start sm:justify-center gap-x-8 sm:gap-x-12 gap-y-6 sm:gap-y-8 px-4 sm:px-0">
          {badges.map((badge, index) => (
            <div
              key={badge.label}
              className="flex items-center gap-4 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Premium icon container with golden glow */}
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/25 to-accent/10 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)] group-hover:shadow-glow-gold transition-all duration-300">
                  {badge.isLucide ? (
                    <badge.Icon className="w-6 h-6 text-accent" />
                  ) : (
                    <badge.Icon size="nav" color="gold" />
                  )}
                </div>
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-accent/20 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
              </div>
              <div>
                <p className="text-base font-bold text-primary leading-tight group-hover:text-accent transition-colors">
                  {badge.label}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {badge.sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
