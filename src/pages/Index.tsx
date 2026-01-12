import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { TrustIndicators } from "@/components/TrustIndicators";
import { HowItWorks } from "@/components/HowItWorks";
import { StatsBar } from "@/components/StatsBar";
import { PricingDisplay } from "@/components/PricingDisplay";
import { Testimonials } from "@/components/Testimonials";
import { HOURLY_RATES } from "@/lib/quoteCalculator";
import { 
  Phone, ArrowRight, Shield, Clock, Star, Truck, 
  Dumbbell, Users, Award, CheckCircle, MapPin
} from "lucide-react";

const services = [
  { 
    icon: Truck, 
    title: "Local Moving", 
    description: "Full-service moves with professional crew and truck. Flat hourly rates, no hidden fees.",
    link: "/services/local-moving"
  },
  { 
    icon: Dumbbell, 
    title: "Heavy Items", 
    description: "Expert handling for pianos, safes, appliances, pool tables, and oversized items.",
    link: "/services/heavy-items-moving"
  },
  { 
    icon: Users, 
    title: "Labor Only", 
    description: "Need help loading your truck or pod? Professional muscle at affordable rates.",
    link: "/quote"
  },
];

const whyChooseUs = [
  "Flat hourly rates — no hidden fees",
  "Free packing materials included",
  "No stair or elevator charges",
  "Free furniture assembly/disassembly",
  "500+ damage-free days",
  "Same-day service available",
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-background">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary to-transparent" />
        
        <Container className="relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm font-medium text-accent">97% Happy Customers — 500+ Damage-Free Days</span>
            </div>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight mb-6">
              Moving Made <span className="text-accent">Simple</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-4 max-w-2xl leading-relaxed">
              No hidden fees, no surprises. Just one simple hourly rate that includes everything — 
              truck, materials, assembly, and protection.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-foreground font-medium">2 Movers + Truck: ${HOURLY_RATES['moving-2-movers']}/hr</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-foreground font-medium">All materials included</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90 h-12 px-8">
                <Link to="/quote">Get Instant Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 border-primary text-primary hover:bg-primary hover:text-white">
                <a href="tel:+15551234567"><Phone className="mr-2 w-5 h-5" />(555) 123-4567</a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 inline mr-1 text-accent" />
              Get your personalized quote in less than 10 minutes
            </p>
          </div>
        </Container>
      </section>

      {/* Stats Bar */}
      <StatsBar />

      {/* Services */}
      <Section className="bg-secondary">
        <Container>
          <SectionHeader 
            title="Our Services" 
            subtitle="Professional moving solutions with transparent, flat-rate pricing." 
          />
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link 
                key={service.title} 
                to={service.link}
                className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-primary mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                <span className="text-accent font-medium text-sm group-hover:underline">
                  Learn More →
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link to="/services">View All Services <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Trust Indicators - What Makes Us Different */}
      <TrustIndicators />

      {/* Pricing Display */}
      <PricingDisplay />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose Us */}
      <Section className="bg-secondary">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader title="Why People Choose Handled" subtitle="No gimmicks, just honest service at fair prices." align="left" />
              <ul className="space-y-4">
                {whyChooseUs.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8 gradient-gold text-white shadow-gold hover:opacity-90">
                <Link to="/quote">Get Your Free Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-background border border-border shadow-card"><Award className="w-8 h-8 text-accent mb-3" /><p className="font-heading text-lg font-semibold text-primary">Award Winning</p></div>
                <div className="p-6 rounded-2xl bg-background border border-border shadow-card"><Shield className="w-8 h-8 text-accent mb-3" /><p className="font-heading text-lg font-semibold text-primary">Fully Insured</p></div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="p-6 rounded-2xl bg-background border border-border shadow-card"><Clock className="w-8 h-8 text-accent mb-3" /><p className="font-heading text-lg font-semibold text-primary">On Time</p></div>
                <div className="p-6 rounded-2xl bg-background border border-border shadow-card"><MapPin className="w-8 h-8 text-accent mb-3" /><p className="font-heading text-lg font-semibold text-primary">Local Experts</p></div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <Section className="bg-secondary">
        <Container size="narrow">
          <div className="text-center">
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-primary mb-4">Ready to Make Your Move?</h2>
            <p className="text-muted-foreground mb-8">Get a free quote in minutes. No hidden fees, guaranteed.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90">
                <Link to="/quote">Get Free Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                <a href="tel:+15551234567"><Phone className="mr-2 w-5 h-5" />Call Now</a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
      <ChatWidget />
      <VoiceAgent />
    </div>
  );
}
