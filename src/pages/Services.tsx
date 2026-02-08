import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget/index";
import { StickyCTA } from "@/components/StickyCTA";
import { TrustBadges } from "@/components/TrustBadges";

import { ExitIntentModal } from "@/components/ExitIntentModal";
import { HOURLY_RATES, CREW_CONFIGURATIONS, ELECTRONIC_PAYMENT_FEE } from "@/lib/quoteCalculator";
import { SEO } from "@/components/SEO";
import { 
  Truck, Dumbbell, Users, ArrowRight, CheckCircle, Phone,
  Piano, Shield, Zap, Info, Building, Home, Package, Clock, MapPin, Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SocialProofBanner, MobileStickyCTA, UrgencyBadge } from "@/components/conversion";

// LOCAL MOVING sub-services
const localMovingServices = [
  {
    icon: Building,
    title: "Apartment & Condo Moving",
    description: "Studios to 4+ BDR apartments, high-rise condos, lofts. Elevator and stairs — no extra fees.",
    features: ["High-rise experience", "Elevator coordination", "No stair fees"],
    popular: true,
  },
  {
    icon: Home,
    title: "House & Townhouse Moving",
    description: "Single-family homes, townhouses, duplexes. Complete protection for your belongings.",
    features: ["Whole-home moves", "Large furniture handling", "Multi-story capable"],
  },
  {
    icon: Users,
    title: "Labor-Only Moving Help",
    description: "Have your own truck, pod, or container? We provide the professional muscle.",
    features: ["Load/unload help", "PODS & containers", "Rental truck loading"],
  },
  {
    icon: Zap,
    title: "Same-Day Moving",
    description: "Emergency moves available. Call now for fastest service or book your weekend slot.",
    features: ["Immediate availability", "Weekend appointments", "Rush service"],
    isSameDay: true,
  },
];

// HEAVY ITEMS sub-services with dedicated page slugs
const heavyItemsServices: {
  icon: typeof Piano;
  title: string;
  description: string;
  features: string[];
  closed?: boolean;
  comingSoon?: boolean;
  isSameDay?: boolean;
  slug?: string; // Dedicated landing page slug
}[] = [
  {
    icon: Piano,
    title: "Piano Moving",
    description: "Upright and grand pianos moved with precision. Specialized equipment and trained handlers.",
    features: ["Upright pianos", "Grand pianos", "Climate-controlled"],
    slug: "piano-moving",
    closed: true, // Temporarily not available
  },
  {
    icon: Package,
    title: "Pool Table Moving",
    description: "Professional disassembly, safe transport, and expert reassembly with precision leveling.",
    features: ["Disassembly included", "Professional reassembly", "Precision leveling"],
    slug: "pool-table-moving",
  },
  {
    icon: Shield,
    title: "Safe Moving",
    description: "Gun safes, commercial safes up to 2,000+ lbs. Specialized equipment and expert handling.",
    features: ["Gun safes", "Commercial vaults", "Expert handling"],
    slug: "safe-moving",
  },
  {
    icon: Dumbbell,
    title: "Heavy Items (200+ lbs)",
    description: "Appliances, gym equipment, commercial items. IRON LAW: 3 movers @ $189/hr required.",
    features: ["Appliances", "Gym equipment", "Iron Law applies"],
  },
  {
    icon: Zap,
    title: "Same-Day Heavy Items",
    description: "Emergency heavy item moves when you can't wait. Call now for immediate assistance.",
    features: ["Immediate response", "Priority scheduling", "Rush service"],
    isSameDay: true,
    slug: "same-day-moving",
  },
];

const localMovingPricing = [
  { label: "2 Movers + Truck", rate: HOURLY_RATES['moving-2-movers'], popular: true },
  { label: "3 Movers + Truck", rate: HOURLY_RATES['moving-3-movers'] },
  { label: "4 Movers + Truck", rate: HOURLY_RATES['moving-4-movers'] },
];

const laborOnlyPricing = [
  { label: "Labor Only - 2 Movers", rate: HOURLY_RATES['labor-2-movers'] },
  { label: "Labor Only - 3 Movers", rate: HOURLY_RATES['labor-3-movers'] },
  { label: "Labor Only - 4 Movers", rate: HOURLY_RATES['labor-4-movers'] },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEO 
        title="Moving Services Denver - Local Movers & Heavy Item Specialists | Handledly Moving Services"
        description="Professional Denver moving services with flat hourly rates. Local moving, piano moving, pool table moving, safe moving, and same-day service. Licensed and insured. Get your free quote!"
        canonicalUrl="https://handledly.com/services"
        keywords={["Denver moving services", "local movers Denver", "heavy item movers", "piano moving Denver", "pool table movers", "same day moving Denver"]}
      />
      
      <main id="main-content">
      {/* Hero */}
      <section className="pt-40 pb-16 lg:pt-48 lg:pb-20 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-3xl">
            {/* Denver Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Denver Metro Moving Services</span>
            </div>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6">
              Denver <span className="text-accent">Moving</span> Services
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-6">
              Professional moving solutions with transparent, flat-rate pricing. 
              No hidden fees, no surprises — just reliable Denver service you can trust.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              
              <Badge variant="outline" className="px-4 py-2 text-sm border-accent text-accent">
                <Zap className="w-4 h-4 mr-2" />
                Same-Day Available
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary text-primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                No Hidden Fees
              </Badge>
            </div>
          </div>
        </Container>
      </section>

      <TrustBadges />

      {/* LOCAL MOVING Category */}
      <Section className="pt-12">
        <Container>
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shadow-depth-2">
                <Truck className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h2 className="font-heading text-3xl font-semibold text-primary">Local Moving</h2>
                <p className="text-muted-foreground">Denver apartments, houses, labor-only & same-day moves</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Badge className="bg-accent/10 text-accent border-accent/30 hover:bg-accent/20">
                <Zap className="w-3 h-3 mr-1" />
                Same-Day Service Available
              </Badge>
              <Badge className="bg-primary/10 text-primary border-primary/30">
                From $139/hr
              </Badge>
            </div>
          </div>

          {/* Local Moving Sub-Services Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {localMovingServices.map((service, index) => (
              <Link
                key={service.title}
                to="/quote"
                className={`p-6 rounded-2xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all hover-lift animate-fade-in relative group cursor-pointer ${
                  service.isSameDay ? 'border-accent/50 ring-1 ring-accent/20' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {service.popular && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-accent text-white shadow-gold">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:shadow-glow-gold transition-shadow">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                {service.isSameDay && (
                  <Badge className="mb-3 bg-accent text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    Same-Day
                  </Badge>
                )}
                <h3 className="font-heading text-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-1">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle className="w-3 h-3 text-accent shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>

          {/* Local Moving Pricing */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Full Service Pricing */}
            <div className="p-6 rounded-2xl glass-card shadow-depth-2">
              <h3 className="font-heading text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                Full Service (Movers + Truck)
              </h3>
              <div className="space-y-3">
                {localMovingPricing.map((tier) => (
                  <div 
                    key={tier.label}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      tier.popular ? 'bg-accent/10 border border-accent/20' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{tier.label}</span>
                      {tier.popular && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-white">Popular</span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-primary">${tier.rate}</span>
                      <span className="text-muted-foreground text-sm">/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Labor Only Pricing */}
            <div className="p-6 rounded-2xl glass-card shadow-depth-2">
              <h3 className="font-heading text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Labor Only (No Truck)
              </h3>
              <div className="space-y-3">
                {laborOnlyPricing.map((tier) => (
                  <div 
                    key={tier.label}
                    className="flex justify-between items-center p-3 rounded-lg bg-background"
                  >
                    <span className="font-medium text-foreground">{tier.label}</span>
                    <div>
                      <span className="font-bold text-primary">${tier.rate}</span>
                      <span className="text-muted-foreground text-sm">/hr</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Perfect for PODS, rental trucks, or container loading/unloading
              </p>
            </div>
          </div>

          {/* Same-Day CTA */}
          <div className="p-6 rounded-2xl bg-accent/5 border border-accent/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-primary">Need to Move Today in Denver?</h4>
                <p className="text-sm text-muted-foreground">Same-day service available — call now for immediate assistance</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <a href="tel:+18782187397">
                  <Phone className="w-4 h-4 mr-2" />
                  (878) 218-7397
                </a>
              </Button>
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary">
                <a href="tel:+17199203282">
                  (719) 920-3282
                </a>
              </Button>
              <Button asChild className="gradient-gold text-white hover:opacity-90 shadow-gold">
                <Link to="/quote">Book Weekend Slot</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* HEAVY ITEMS Category */}
      <Section className="bg-secondary">
        <Container>
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shadow-depth-2">
                <Dumbbell className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h2 className="font-heading text-3xl font-semibold text-primary">Heavy Items Moving</h2>
                <p className="text-muted-foreground">Denver pianos, pool tables, safes & oversized items</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Badge className="bg-accent/10 text-accent border-accent/30 hover:bg-accent/20">
                <Zap className="w-3 h-3 mr-1" />
                Same-Day Service Available
              </Badge>
              <Badge className="bg-primary/10 text-primary border-primary/30">
                From $159/hr
              </Badge>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {heavyItemsServices.map((service, index) => (
              <Link
                key={service.title}
                to={service.slug ? `/services/${service.slug}` : "/quote"}
                className={`p-6 rounded-2xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all hover-lift animate-fade-in relative group cursor-pointer ${
                  service.isSameDay ? 'border-accent/50 ring-1 ring-accent/20' : ''
                } ${service.closed || service.comingSoon ? 'opacity-70 pointer-events-none' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {service.closed && !service.comingSoon && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-muted text-muted-foreground border border-border shadow-sm text-xs">
                      Closed
                    </Badge>
                  </div>
                )}
                {service.comingSoon && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-accent text-white shadow-gold text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </Badge>
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:shadow-glow-gold transition-shadow">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                {service.isSameDay && !service.closed && !service.comingSoon && (
                  <Badge className="mb-3 bg-accent text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    Same-Day
                  </Badge>
                )}
                <h3 className="font-heading text-base font-semibold text-primary mb-2 group-hover:text-accent transition-colors">{service.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-1">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle className="w-3 h-3 text-accent shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>

          {/* Heavy Items Pricing */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="p-8 rounded-2xl glass-card shadow-depth-3 text-center">
              <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-accent" />
              </div>
              
              <h3 className="font-heading text-2xl font-semibold text-primary mb-2">
                Heavy Items Moving
              </h3>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">${HOURLY_RATES['heavy-items']}</span>
                <span className="text-muted-foreground">/hr</span>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Professional handling for oversized and heavy items in Denver
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 text-sm mb-4">
                {['Pianos', 'Pool Tables', 'Safes', 'Appliances', 'Gym Equipment', 'Commercial Equipment'].map((item) => (
                  <span key={item} className="px-3 py-1 rounded-full bg-secondary border border-border">
                    {item}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Final quote varies based on item complexity and access
              </p>
            </div>
          </div>

          {/* Same-Day Heavy Items CTA */}
          <div className="p-6 rounded-2xl bg-accent/5 border border-accent/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-primary">Emergency Heavy Item Move in Denver?</h4>
                <p className="text-sm text-muted-foreground">Same-day service for urgent heavy item needs — call now</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <a href="tel:+18782187397">
                  <Phone className="w-4 h-4 mr-2" />
                  (878) 218-7397
                </a>
              </Button>
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary">
                <a href="tel:+17199203282">
                  (719) 920-3282
                </a>
              </Button>
              <Button asChild className="gradient-gold text-white hover:opacity-90 shadow-gold">
                <Link to="/quote">Get Quote</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Electronic Payment Fee Notice - Removed as per UX review */}

      {/* Final CTA */}
      <Section className="bg-secondary">
        <Container size="narrow">
          <div className="text-center">
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-primary mb-4">
              Ready to Get Started in Denver?
            </h2>
            <p className="text-muted-foreground mb-8">
              Get a free, no-obligation quote in minutes. Our Denver team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90 animate-glow-pulse">
                <Link to="/quote">
                  Get Your Free Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                <a href="tel:+18782187397">
                  <Phone className="w-5 h-5 mr-2" />
                  Call (878) 218-7397
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      </main>
      <Footer />
      <StickyCTA />
      <ChatWidget />
      <VoiceAgent />
      <ExitIntentModal />
      <SocialProofBanner />
      <MobileStickyCTA />
    </div>
  );
}