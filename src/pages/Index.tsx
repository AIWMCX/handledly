import { lazy, Suspense, memo } from "react";
import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { TrustBadges } from "@/components/TrustBadges";
import { StickyCTA } from "@/components/StickyCTA";

import { Badge } from "@/components/ui/badge";
import { MeshGradientHero } from "@/components/ui/BackgroundEffects";
import { HOURLY_RATES } from "@/lib/quoteCalculator";
import { SEO } from "@/components/SEO";
import { 
  Phone, ArrowRight, Star, MapPin,
  Dumbbell, Users, CheckCircle, Building, Home, Zap
} from "lucide-react";

// Lazy load trust icons - they're decorative and below initial viewport
const TrustIconsLazy = lazy(() => import("@/components/icons/TrustIcons").then(m => ({ 
  default: () => (
    <>
      {/* These are rendered via the TrustIndicators component */}
    </>
  )
})));

// Trust icons are loaded synchronously only when needed
import {
  AwardWinningIcon,
  OnTimeGuaranteeIcon,
  FullyInsuredIcon,
  LocalExpertsIcon
} from "@/components/icons/TrustIcons";

// Lazy load below-fold and non-critical components for better FCP/LCP
const TrustIndicators = lazy(() => import("@/components/TrustIndicators").then(m => ({ default: m.TrustIndicators })));
import { DeferredVoiceAgent } from "@/components/DeferredVoiceAgent";
const ChatWidget = lazy(() => import("@/components/ChatWidget/index").then(m => ({ default: m.ChatWidget })));
const HowItWorks = lazy(() => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const StatsBar = lazy(() => import("@/components/StatsBar").then(m => ({ default: m.StatsBar })));
const PricingDisplay = lazy(() => import("@/components/PricingDisplay").then(m => ({ default: m.PricingDisplay })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const ExitIntentModal = lazy(() => import("@/components/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));
const SocialProofBanner = lazy(() => import("@/components/conversion/SocialProofBanner").then(m => ({ default: m.SocialProofBanner })));
const AnimatedStats = lazy(() => import("@/components/conversion/AnimatedStats").then(m => ({ default: m.AnimatedStats })));
const MobileStickyCTA = lazy(() => import("@/components/conversion/MobileStickyCTA").then(m => ({ default: m.default })));
const UrgencyBadge = lazy(() => import("@/components/conversion/UrgencyBadge").then(m => ({ default: m.UrgencyBadge })));


const services = [
  { 
    icon: Building, 
    title: "Apartment & Condo", 
    description: "Studios to 4+ BDR apartments and high-rise condos. No elevator or stair fees.",
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
    customRate: 169,
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
      <SEO 
        title="Denver's Top-Rated Movers | Handledly™ - $159/hr Flat Rate Moving"
        description="Denver's highest-rated moving company. Flat hourly rates from $159/hr, no hidden fees, free packing materials. 500+ damage-free days. Get your free quote in 60 seconds."
        canonicalUrl="https://handledly.com/"
        keywords={['Denver movers', 'moving company Denver', 'local movers Denver', 'affordable moving', 'professional movers', 'Denver moving services', 'flat rate movers', 'same day moving']}
      />
      
      <AnnouncementBar />
      <Header />
      
      <main>
        {/* Hero Section with Mesh Gradient */}
        <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <MeshGradientHero />
        
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              {/* First Moving AI SaaS Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 shadow-depth-1">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">America's First Moving AI SaaS Platform</span>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight mb-6">
                Denver's<br />
                <span className="text-accent">Top-Rated Movers.</span><br />
                Flat Rates. No Surprises.
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-4 max-w-2xl leading-relaxed">
                The future of moving operations is here. AI-powered scheduling, instant quotes, and 24/7 
                customer communication — all in one intelligent platform.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card shadow-depth-1">
                  <Users className="w-4 h-4 text-accent" />
                  <span className="text-foreground font-medium">2 Movers + Truck: ${HOURLY_RATES['moving-2-movers']}/hr</span>
                </div>
                <Badge className="px-3 py-1.5 bg-accent/10 text-accent-text border-accent/30 hover:bg-accent/20 shadow-depth-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Same-Day Available
                </Badge>
              </div>
              
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90 h-14 px-8 text-lg hover-lift animate-glow-pulse">
                  <Link to="/quote">Get Instant Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 border-primary text-primary hover:bg-primary hover:text-white glass-card">
                  <a href="tel:+18782187397"><Phone className="mr-2 w-5 h-5" />(878) 218-7397</a>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-14 px-6 text-muted-foreground hover:text-primary">
                  <a href="tel:+17199203282">(719) 920-3282</a>
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
                        <Star key={i} className="w-6 h-6 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-3xl font-bold text-primary">4.9 out of 5</p>
                    <p className="text-sm text-muted-foreground">Based on 500+ verified reviews</p>
                  </div>
                  
                  {/* Animated Quick stats grid - lazy loaded */}
                  <Suspense fallback={<div className="grid grid-cols-2 gap-4 h-32" />}>
                    <AnimatedStats 
                      stats={[
                        { value: 500, label: "Damage-Free Days", suffix: "+" },
                        { value: 0, label: "Hidden Fees", prefix: "$" },
                        { value: 30, label: "Cities Served", suffix: "+" },
                        { value: 24, label: "Response Time", suffix: "hr" },
                      ]}
                      className="grid grid-cols-2 gap-4"
                    />
                  </Suspense>
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
      <Suspense fallback={<div className="py-12" />}>
        <StatsBar />
      </Suspense>

      {/* Services with mesh background */}
      <Section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
        <Container className="relative z-10">
          <SectionHeader 
            title="Our Services" 
            subtitle="Professional moving solutions with transparent, flat-rate pricing." 
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link 
                key={service.title} 
                to={service.link}
                className="group relative p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all shadow-depth-2 hover:shadow-depth-3 hover-lift"
              >
                {/* Urgency badge for first service */}
                {index === 0 && (
                  <div className="absolute -top-3 right-4">
                    <Suspense fallback={null}>
                      <UrgencyBadge type="slots_limited" text="Only 3 slots left today" size="sm" />
                    </Suspense>
                  </div>
                )}
                {index === 3 && (
                  <div className="absolute -top-3 right-4">
                    <Suspense fallback={null}>
                      <UrgencyBadge type="popular" size="sm" />
                    </Suspense>
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:shadow-glow-gold transition-shadow">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-primary mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-accent-text font-medium text-sm group-hover:underline">
                    Learn More →
                  </span>
                  <span className="text-xs text-muted-foreground">From ${service.customRate || HOURLY_RATES['moving-2-movers']}/hr</span>
                </div>
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
      <Suspense fallback={<div className="py-16" />}>
        <TrustIndicators />
      </Suspense>

      {/* Pricing Display */}
      <Suspense fallback={<div className="py-20" />}>
        <PricingDisplay />
      </Suspense>

      {/* How It Works */}
      <Suspense fallback={<div className="py-20" />}>
        <HowItWorks />
      </Suspense>

      {/* Why Choose Us */}
      <Section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader title="Why People Choose Handledly" subtitle="No gimmicks, just honest service at fair prices." align="left" />
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
      <Suspense fallback={<div className="py-20" />}>
        <Testimonials />
      </Suspense>

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
                <a href="tel:+18782187397"><Phone className="mr-2 w-5 h-5" />(878) 218-7397</a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-primary">
                <a href="tel:+17199203282">(719) 920-3282</a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
      </main>

      <Footer />
      <StickyCTA />
      <Suspense fallback={null}>
        <ChatWidget />
        <ExitIntentModal />
        <SocialProofBanner />
        <MobileStickyCTA />
      </Suspense>
      <DeferredVoiceAgent />
    </div>
  );
}
