import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { TrustIndicators } from "@/components/TrustIndicators";
import { TrustBadges } from "@/components/TrustBadges";
import { HowItWorks } from "@/components/HowItWorks";
import { StatsBar } from "@/components/StatsBar";
import { PricingDisplay } from "@/components/PricingDisplay";
import { Testimonials } from "@/components/Testimonials";
import { StickyCTA } from "@/components/StickyCTA";
import { GoogleReviewsBadge } from "@/components/GoogleReviewsBadge";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { Badge } from "@/components/ui/badge";
import { MeshGradientHero } from "@/components/ui/BackgroundEffects";
import { HOURLY_RATES } from "@/lib/quoteCalculator";
import { 
  Phone, ArrowRight, Star, MapPin,
  Dumbbell, Users, CheckCircle, Building, Home, Zap
} from "lucide-react";
import {
  AwardWinningIcon,
  OnTimeGuaranteeIcon,
  FullyInsuredIcon,
  LocalExpertsIcon
} from "@/components/icons/TrustIcons";

const services = [
  { 
    icon: Building, 
    title: "Apartment & Condo", 
    description: "Studios to 4+ BR apartments and high-rise condos. No elevator or stair fees.",
    link: "/services/local-moving",
    badge: null,
  },
  { 
    icon: Home, 
    title: "House & Townhouse", 
    description: "Single-family homes, townhouses, and duplexes. Complete protection included.",
    link: "/services/local-moving",
    badge: null,
  },
  { 
    icon: Users, 
    title: "Labor-Only Help", 
    description: "Have your own truck or pod? We provide the professional muscle.",
    link: "/quote",
    badge: null,
  },
  { 
    icon: Dumbbell, 
    title: "Heavy Items", 
    description: "Pianos, safes, pool tables, appliances, and oversized items.",
    link: "/services/heavy-items-moving",
    badge: null,
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
      
      {/* Hero Section with Mesh Gradient */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <MeshGradientHero />
        
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              {/* Denver anchor badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 shadow-depth-1">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Denver's #1 Rated Moving Company</span>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight mb-6">
                Moving Made <span className="text-accent">Simple</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-4 max-w-2xl leading-relaxed">
                No hidden fees, no surprises. Just one simple hourly rate that includes everything — 
                truck, materials, assembly, and protection.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card shadow-depth-1">
                  <Users className="w-4 h-4 text-accent" />
                  <span className="text-foreground font-medium">2 Movers + Truck: ${HOURLY_RATES['moving-2-movers']}/hr</span>
                </div>
                <Badge className="px-3 py-1.5 bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 shadow-depth-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Same-Day Available
                </Badge>
              </div>
              
              {/* Google Reviews Badge */}
              <div className="mb-8">
                <GoogleReviewsBadge rating={4.9} reviewCount={500} />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90 h-14 px-8 text-lg hover-lift animate-glow-pulse">
                  <Link to="/quote">Get Instant Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 border-primary text-primary hover:bg-primary hover:text-white glass-card">
                  <a href="tel:+18782187397"><Phone className="mr-2 w-5 h-5" />(878) 218-7397</a>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Free quote in 60 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>30+ Denver cities</span>
                </div>
              </div>
            </div>

            {/* Right: Trust visual / Quick stats */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main trust card */}
                <div className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-depth-3">
                  <div className="text-center mb-6">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Trusted By Denver Families</p>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-3xl font-bold text-primary">4.9 out of 5</p>
                    <p className="text-sm text-muted-foreground">Based on 500+ verified reviews</p>
                  </div>
                  
                  {/* Quick stats grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-primary/5 text-center">
                      <p className="text-2xl font-bold text-primary">500+</p>
                      <p className="text-xs text-muted-foreground">Damage-Free Days</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-accent/10 text-center">
                      <p className="text-2xl font-bold text-primary">$0</p>
                      <p className="text-xs text-muted-foreground">Hidden Fees</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-accent/10 text-center">
                      <p className="text-2xl font-bold text-primary">30+</p>
                      <p className="text-xs text-muted-foreground">Cities Served</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 text-center">
                      <p className="text-2xl font-bold text-primary">24hr</p>
                      <p className="text-xs text-muted-foreground">Response Time</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating accent elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Badges Strip */}
      <TrustBadges />

      {/* Stats Bar */}
      <StatsBar />

      {/* Services with mesh background */}
      <Section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
        <Container className="relative z-10">
          <SectionHeader 
            title="Our Services" 
            subtitle="Professional moving solutions with transparent, flat-rate pricing." 
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link 
                key={service.title} 
                to={service.link}
                className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all shadow-depth-2 hover:shadow-depth-3 hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:shadow-glow-gold transition-shadow">
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
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white shadow-depth-1">
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
      <Section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
        <Container className="relative z-10">
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
              <Button asChild size="lg" className="mt-8 gradient-gold text-white shadow-gold hover:opacity-90 hover-lift">
                <Link to="/quote">Get Your Free Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5">
                <div className="group relative p-7 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-depth-2 hover:shadow-depth-3 hover:border-accent/30 transition-all duration-300 hover-lift overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:shadow-glow-gold transition-all duration-300">
                    <AwardWinningIcon size="list" color="gold" />
                  </div>
                  <p className="font-heading text-xl font-bold text-primary tracking-tight">Award Winning</p>
                  <p className="text-sm text-muted-foreground mt-1">Top-rated Denver movers</p>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                </div>
                <div className="group relative p-7 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-depth-2 hover:shadow-depth-3 hover:border-accent/30 transition-all duration-300 hover-lift overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:shadow-glow-gold transition-all duration-300">
                    <FullyInsuredIcon size="list" color="gold" />
                  </div>
                  <p className="font-heading text-xl font-bold text-primary tracking-tight">Fully Insured</p>
                  <p className="text-sm text-muted-foreground mt-1">Complete protection</p>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                </div>
              </div>
              <div className="space-y-5 mt-10">
                <div className="group relative p-7 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-depth-2 hover:shadow-depth-3 hover:border-accent/30 transition-all duration-300 hover-lift overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:shadow-glow-gold transition-all duration-300">
                    <OnTimeGuaranteeIcon size="list" color="gold" />
                  </div>
                  <p className="font-heading text-xl font-bold text-primary tracking-tight">On Time</p>
                  <p className="text-sm text-muted-foreground mt-1">Punctuality guaranteed</p>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                </div>
                <div className="group relative p-7 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-depth-2 hover:shadow-depth-3 hover:border-accent/30 transition-all duration-300 hover-lift overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:shadow-glow-gold transition-all duration-300">
                    <LocalExpertsIcon size="list" color="gold" />
                  </div>
                  <p className="font-heading text-xl font-bold text-primary tracking-tight">Local Experts</p>
                  <p className="text-sm text-muted-foreground mt-1">Denver Metro specialists</p>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <Section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
        <Container size="narrow" className="relative z-10">
          <div className="text-center">
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-primary mb-4">Ready to Make Your Move?</h2>
            <p className="text-muted-foreground mb-8">Get a free quote in minutes. No hidden fees, guaranteed.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90 hover-lift animate-glow-pulse">
                <Link to="/quote">Get Free Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                <a href="tel:+18782187397"><Phone className="mr-2 w-5 h-5" />Call Now</a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
      <ChatWidget />
      <VoiceAgent />
      <StickyCTA />
      <ExitIntentModal />
    </div>
  );
}
