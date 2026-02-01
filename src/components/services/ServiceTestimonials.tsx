import { Container, Section } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import type { ServiceTestimonial } from "@/data/servicesData";

interface ServiceTestimonialsProps {
  testimonials: ServiceTestimonial[];
  serviceName: string;
}

export function ServiceTestimonials({ testimonials, serviceName }: ServiceTestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <Section className="bg-secondary">
      <Container>
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-primary mb-4">
            What Our <span className="text-accent">{serviceName}</span> Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from Denver homeowners who trusted us with their valuable items
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={`${testimonial.name}-${index}`}
              className="glass-card shadow-depth-2 hover:shadow-depth-3 transition-all hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 fill-accent text-accent" 
                    />
                  ))}
                </div>
                
                <div className="relative mb-4">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-accent/20" />
                  <p className="text-foreground italic pl-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-primary">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
