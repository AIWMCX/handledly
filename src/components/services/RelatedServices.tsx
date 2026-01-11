import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeader } from "@/components/layout";
import type { RelatedService } from "@/data/servicesData";

interface RelatedServicesProps {
  services: RelatedService[];
}

export function RelatedServices({ services }: RelatedServicesProps) {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <SectionHeader 
          title="Related Services" 
          subtitle="Explore other services that might be helpful for your move."
        />
        
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link 
              key={index}
              to={`/services/${service.slug}`}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
            >
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {service.description}
              </p>
              <span className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                Learn more 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
