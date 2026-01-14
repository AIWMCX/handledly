import { Container } from "@/components/layout";
import {
  USDOTIcon,
  ColoradoPUCIcon,
  BBBAccreditedIcon,
  InsuranceCoverageIcon,
  WorkersCompIcon,
} from "@/components/icons/TrustIcons";

const badges = [
  {
    Icon: USDOTIcon,
    label: "USDOT Licensed",
    sublabel: "Federal Authority",
  },
  {
    Icon: ColoradoPUCIcon,
    label: "Colorado PUC",
    sublabel: "State Certified",
  },
  {
    Icon: BBBAccreditedIcon,
    label: "BBB Accredited",
    sublabel: "A+ Rating",
  },
  {
    Icon: InsuranceCoverageIcon,
    label: "$2M+ Insured",
    sublabel: "Full Coverage",
  },
  {
    Icon: WorkersCompIcon,
    label: "Workers' Comp",
    sublabel: "Team Protected",
  },
];

export function TrustBadges() {
  return (
    <section className="py-8 bg-secondary/50 border-y border-border">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {badges.map((badge, index) => (
            <div
              key={badge.label}
              className="flex items-center gap-4 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Premium icon container with golden glow */}
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/25 to-accent/10 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)] group-hover:shadow-glow-gold transition-all duration-300">
                  <badge.Icon size="nav" color="gold" />
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
