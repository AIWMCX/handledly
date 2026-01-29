import { Star, BadgeCheck, Quote } from "lucide-react";
import { Container, Section } from "@/components/layout";

const testimonials = [
  { 
    name: "Chris J", 
    location: "Cherry Creek",
    neighborhood: "Denver", 
    rating: 5, 
    text: "Honestly wasn't expecting much — moving is usually a nightmare. But these folks showed up early, wrapped everything like it was their own stuff, and got us into our new place before lunch. No drama, no hidden costs. Just solid work.",
    date: "2 weeks ago",
    avatar: "CJ",
    verified: true,
  },
  { 
    name: "Rachel T", 
    location: "Capitol Hill",
    neighborhood: "Denver", 
    rating: 5, 
    text: "My mom's antique hutch made it across town without a single scratch. I was a nervous wreck about it, but the crew took their time and actually cared. That meant everything to me. Would call them again in a heartbeat.",
    date: "1 month ago",
    avatar: "RT",
    verified: true,
  },
  { 
    name: "Nancy S", 
    location: "Highlands Ranch",
    neighborhood: "Denver Metro", 
    rating: 5, 
    text: "We've moved twice in three years (don't ask) and both times used Handledly. Same crew, same vibe, same 'we got you' energy. It's rare to find people you can actually trust with your stuff these days.",
    date: "3 weeks ago",
    avatar: "NS",
    verified: true,
  },
];

export function Testimonials() {
  return (
    <Section className="bg-primary relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <Container className="relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-sm font-medium text-white">Denver Customer Reviews</span>
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-white mb-4">
            Trusted by Denver Families
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Real reviews from real customers across the Denver Metro area.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div 
              key={t.name} 
              className="group relative p-6 rounded-3xl bg-white/95 backdrop-blur-sm shadow-depth-3 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/10" />
              
              {/* Customer feedback badge */}
              {t.verified && (
                <div className="flex items-center gap-1.5 mb-4">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Customer Feedback</span>
                </div>
              )}
              
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              
              {/* Review text */}
              <p className="text-foreground mb-6 leading-relaxed">"{t.text}"</p>
              
              {/* Author info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{t.avatar}</span>
                </div>
                <div>
                  <p className="font-semibold text-primary">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.location}, {t.neighborhood} • {t.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Reviews CTA */}
        <div className="text-center mt-10">
          <p className="text-white/60 text-sm">
            Real feedback from Denver families we've helped move.
          </p>
        </div>
      </Container>
    </Section>
  );
}
