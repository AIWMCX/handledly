import { Star, BadgeCheck, Quote } from "lucide-react";
import { Container, Section } from "@/components/layout";

const testimonials = [
  { 
    name: "Sarah Mitchell", 
    location: "Cherry Creek",
    neighborhood: "Denver", 
    rating: 5, 
    text: "Absolutely flawless experience. The flat rate pricing was exactly what they quoted — no surprises! The team was professional and handled my antique furniture with incredible care.",
    date: "2 weeks ago",
    avatar: "SM",
    verified: true,
  },
  { 
    name: "Michael Chen", 
    location: "Capitol Hill",
    neighborhood: "Denver", 
    rating: 5, 
    text: "Moved my grand piano and antique collection without a scratch. These guys know what they're doing. Highly recommend for anyone with specialty items!",
    date: "1 month ago",
    avatar: "MC",
    verified: true,
  },
  { 
    name: "Emily Rodriguez", 
    location: "Highlands Ranch",
    neighborhood: "Denver Metro", 
    rating: 5, 
    text: "Third time using Handled. Same great service, same fair prices every time. They're my go-to movers now. The team is always on time and incredibly efficient.",
    date: "3 weeks ago",
    avatar: "ER",
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
            <span className="text-sm font-medium text-white">500+ 5-Star Reviews</span>
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
              
              {/* Google verified badge */}
              {t.verified && (
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Verified Google Review</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
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
        
        {/* Google Reviews CTA */}
        <div className="text-center mt-10">
          <a 
            href="#" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <span>See all reviews on Google</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </Container>
    </Section>
  );
}
