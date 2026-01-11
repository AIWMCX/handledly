import { Star } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/layout";

const testimonials = [
  { 
    name: "Sarah Mitchell", 
    location: "Cherry Creek", 
    rating: 5, 
    text: "Absolutely flawless experience. The flat rate pricing was exactly what they quoted — no surprises!" 
  },
  { 
    name: "Michael Chen", 
    location: "Highlands", 
    rating: 5, 
    text: "Moved my grand piano and antique collection without a scratch. These guys know what they're doing." 
  },
  { 
    name: "Emily Rodriguez", 
    location: "Downtown Denver", 
    rating: 5, 
    text: "Third time using Denver Premium Moving. Same great service, same fair prices every time." 
  },
];

export function Testimonials() {
  return (
    <Section>
      <Container>
        <SectionHeader 
          title="What Our Clients Say" 
          subtitle="Real reviews from real customers." 
        />
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6">"{t.text}"</p>
              <p className="font-medium text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.location}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
