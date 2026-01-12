import { Container } from "@/components/layout";
import { Shield, Award, CheckCircle, Users, FileCheck } from "lucide-react";

const badges = [
  {
    icon: FileCheck,
    label: "USDOT Licensed",
    sublabel: "Federal Authority",
  },
  {
    icon: Shield,
    label: "Colorado PUC",
    sublabel: "State Certified",
  },
  {
    icon: Award,
    label: "BBB Accredited",
    sublabel: "A+ Rating",
  },
  {
    icon: Shield,
    label: "$2M+ Insured",
    sublabel: "Full Coverage",
  },
  {
    icon: Users,
    label: "Workers' Comp",
    sublabel: "Team Protected",
  },
];

export function TrustBadges() {
  return (
    <section className="py-6 bg-background border-y border-border/50">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary leading-tight">
                  {badge.label}
                </p>
                <p className="text-xs text-muted-foreground">
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
