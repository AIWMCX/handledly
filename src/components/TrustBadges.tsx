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
    <section className="py-6 bg-background border-y border-border/50">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {badges.map((badge, index) => (
            <div
              key={badge.label}
              className="flex items-center gap-4 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Premium icon container with golden glow */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:shadow-glow-gold transition-all duration-300">
                  <badge.Icon size="nav" color="gold" />
                </div>
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-accent/20 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary leading-tight group-hover:text-accent transition-colors">
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