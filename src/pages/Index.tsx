import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { TrustIndicators } from "@/components/TrustIndicators";
import { HowItWorks } from "@/components/HowItWorks";
import { StatsBar } from "@/components/StatsBar";
import { PricingDisplay } from "@/components/PricingDisplay";
import { HOURLY_RATES } from "@/lib/quoteCalculator";
import { 
  Phone, ArrowRight, Shield, Clock, Star, Truck, 
  Package, Users, Award, CheckCircle, MapPin, Zap
} from "lucide-react";

const services = [
  { icon: Truck, title: "Residential Moving", description: "Full-service home moving with flat hourly rates. No hidden fees." },
  { icon: Package, title: "Commercial Moving", description: "Minimize downtime with efficient office and business relocation." },
  { icon: Shield, title: "Specialty Items", description: "Expert handling for pianos, safes, pool tables, and heavy items." },
  { icon: Users, title: "Labor Only / Help", description: "Need help loading your truck or pod? We've got you covered." },
  { icon: Zap, title: "Same-Day Moving", description: "Urgent move? We offer same-day service when you need it fast." },
  { icon: Package, title: "Junk Removal", description: "Furniture, appliances, and debris removal from your property." },
];

const testimonials = [
  { name: "Sarah Mitchell", location: "Cherry Creek", rating: 5, text: "Absolutely flawless experience. The flat rate pricing was exactly what they quoted — no surprises!" },
  { name: "Michael Chen", location: "Highlands", rating: 5, text: "Moved my grand piano and antique collection without a scratch. These guys know what they're doing." },
  { name: "Emily Rodriguez", location: "Downtown Denver", rating: 5, text: "Third time using Denver Premium Moving. Same great service, same fair prices every time." },
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
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        
        <Container className="relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">97% Happy Customers — 500+ Damage-Free Days</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-tight mb-6">
              Denver's <span className="text-gradient-gold">Flat-Rate</span> Moving Experts
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-4 max-w-2xl leading-relaxed">
              No hidden fees, no surprises. Just one simple hourly rate that includes everything — 
              truck, materials, assembly, and protection.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">2 Movers + Truck: ${HOURLY_RATES['2-movers']}/hr</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">All materials included</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90 h-12 px-8">
                <Link to="/quote">Get Instant Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <a href="tel:+13035551234"><Phone className="mr-2 w-5 h-5" />(303) 555-1234</a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 inline mr-1 text-primary" />
              Get your personalized quote in less than 10 minutes
            </p>
          </div>
        </Container>
      </section>

      {/* Stats Bar */}
      <StatsBar />

      {/* Services */}
      <Section className="bg-card">
        <Container>
          <SectionHeader 
            title="Our Services" 
            subtitle="Flat-rate moving solutions for every need — residential, commercial, and specialty." 
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.title} className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
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
      <Section className="bg-card">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader title="Why Denver Chooses Us" subtitle="No gimmicks, just honest service at fair prices." align="left" />
              <ul className="space-y-4">
                {whyChooseUs.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8 gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
                <Link to="/quote">Get Your Free Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-background border border-border"><Award className="w-8 h-8 text-primary mb-3" /><p className="font-serif text-lg font-semibold text-foreground">Award Winning</p></div>
                <div className="p-6 rounded-2xl bg-background border border-border"><Shield className="w-8 h-8 text-primary mb-3" /><p className="font-serif text-lg font-semibold text-foreground">Fully Insured</p></div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="p-6 rounded-2xl bg-background border border-border"><Clock className="w-8 h-8 text-primary mb-3" /><p className="font-serif text-lg font-semibold text-foreground">On Time</p></div>
                <div className="p-6 rounded-2xl bg-background border border-border"><MapPin className="w-8 h-8 text-primary mb-3" /><p className="font-serif text-lg font-semibold text-foreground">30+ Cities</p></div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section>
        <Container>
          <SectionHeader title="What Our Clients Say" subtitle="Real reviews from real customers." />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}</div>
                <p className="text-foreground mb-6">"{t.text}"</p>
                <p className="font-medium text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.location}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section className="bg-card">
        <Container size="narrow">
          <div className="text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground mb-4">Ready to Make Your Move?</h2>
            <p className="text-muted-foreground mb-8">Get a free quote in minutes. No hidden fees, guaranteed.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
                <Link to="/quote">Get Free Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:+13035551234"><Phone className="mr-2 w-5 h-5" />Call Now</a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
      <VoiceAgent />
    </div>
  );
}
