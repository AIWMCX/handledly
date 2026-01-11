import { Container, SectionHeader } from "@/components/layout";
import { MapPin, Dumbbell, Shield, Clock } from "lucide-react";
import type { ServiceChallenge } from "@/data/servicesData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'map': MapPin,
  'weight': Dumbbell,
  'shield': Shield,
  'clock': Clock,
};

interface WhyExpertCareProps {
  title: string;
  description: string;
  challenges: ServiceChallenge[];
}

export function WhyExpertCare({ title, description, challenges }: WhyExpertCareProps) {
  return (
    <section className="py-16 lg:py-24 bg-primary/5">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((challenge, index) => {
            const Icon = iconMap[challenge.icon] || Shield;
            return (
              <div 
                key={index}
                className="bg-background rounded-2xl border border-border p-6 text-center hover:border-primary/50 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {challenge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
