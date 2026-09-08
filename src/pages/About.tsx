import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget/index";
import { StickyCTA } from "@/components/StickyCTA";
import { TrustBadges } from "@/components/TrustBadges";

import { ExitIntentModal } from "@/components/ExitIntentModal";
import { MeshGradientHero } from "@/components/ui/BackgroundEffects";
import { SEO } from "@/components/SEO";

import { 
  ArrowRight, Shield, Heart, Award, Users, 
  CheckCircle, Truck, MapPin
} from "lucide-react";
import { SocialProofBanner, MobileStickyCTA, AnimatedStats } from "@/components/conversion";

const values = [
  {
    icon: Shield,
    title: "Neutrality",
    description: "We rank companies on eligibility, availability, and verified track record — not who pays the most.",
  },
  {
    icon: Heart,
    title: "No Lead-Selling",
    description: "Movers never pay to receive a request. Handledly only earns when a booking is completed.",
  },
  {
    icon: Award,
    title: "Verification",
    description: "Every company discloses its licensing and insurance information before it can list on the platform.",
  },
  {
    icon: Users,
    title: "Local Focus",
    description: "We're building the Denver metro network first, one verified company at a time.",
  },
];

const milestones = [
  { title: "Company Verification", description: "Companies submit DOT/MC authority, state license, and insurance details before going live" },
  { title: "One Move Request", description: "Customers describe their move once and compare quotes from multiple companies" },
  { title: "Direct Communication", description: "Message movers in-platform; contact details are shared once you choose to connect" },
  { title: "Booking After Completion", description: "Reviews are only enabled after a verified, completed booking" },
];

const credentials = [
  "Denver metro focus at launch",
  "License & insurance disclosed per company",
  "No pay-per-lead pricing for movers",
  "1.5% success commission — charged only on completed bookings",
  "Reviews gated to verified completed bookings",
  "Companies set their own hours and service areas",
];

const denverAreas = [
  "Capitol Hill", "Cherry Creek", "LoDo", "Highlands", "RiNo",
  "Wash Park", "Park Hill", "Baker", "Sloan's Lake", "Stapleton",
  "Aurora", "Lakewood", "Arvada", "Westminster", "Thornton",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Handledly - The Denver Moving Marketplace"
        description="Handledly is the marketplace connecting Denver-area customers with independent, verified moving companies. Compare quotes, message movers, and book — without paying for leads."
        canonicalUrl="https://handledly.com/about"
        keywords={['about Handledly', 'Denver moving marketplace', 'compare Denver movers', 'moving company marketplace']}
      />
      
      <Header />
      
      <main id="main-content">
      {/* Hero with Mesh Gradient */}
      <section className="relative pt-40 pb-16 lg:pt-48 lg:pb-20 overflow-hidden">
        <MeshGradientHero />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            {/* Denver Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 shadow-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">The Denver Moving Marketplace</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6">
              One Request. <span className="text-accent">Several Verified</span> Movers.
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-6">
              Handledly is the marketplace where Denver-area customers compare quotes
              from independent, licensed moving companies — and where movers build a
              real customer pipeline without paying for leads they might not win.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4">

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Independent, verified moving companies</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <TrustBadges />

      {/* Story Section */}
      <Section className="pt-12">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-primary mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Handledly is a marketplace, not a moving company. We don't own trucks
                  or send crews — we connect you with independent, licensed moving
                  companies serving the Denver metro area, so you can compare real
                  quotes side by side instead of calling ten different websites.
                </p>
                <p>
                  Every company on Handledly discloses its own licensing, insurance,
                  and service area. You choose who to hear from, message them directly
                  through the platform, and book with the one that fits your move —
                  the moving company you select is the one that performs and is
                  responsible for the move.
                </p>
                <p>
                  What sets us apart? Moving companies never pay for a lead they don't
                  win — Handledly only earns a small commission when a booking is
                  actually completed. That keeps the incentives aligned: we do better
                  when you find the right mover, not when a company outbids another
                  for your phone number.
                </p>
              </div>
            </div>
            <div className="relative">
              {/* Stats card instead of placeholder */}
              <div className="rounded-2xl glass-card shadow-depth-3 p-8">
                <h3 className="font-heading text-xl font-semibold text-primary mb-6">How the Marketplace Works</h3>
                <AnimatedStats
                  stats={[
                    { value: 1.5, label: "Commission — success fee only", suffix: "%" },
                    { value: 30, label: "Metro Cities Covered", suffix: "+" },
                    { value: 0, label: "Cost to List Your Company", prefix: "$" },
                    { value: 0, label: "Fee to Receive a Request", prefix: "$" },
                  ]}
                  className="grid grid-cols-2 gap-6"
                />
              </div>

            </div>
          </div>
        </Container>
      </Section>

      {/* Denver Service Area */}
      <Section className="bg-secondary">
        <Container>
          <SectionHeader
            title="Proudly Serving Denver Metro"
            subtitle="From downtown Denver to the surrounding suburbs, we've got you covered."
          />
          
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {denverAreas.map((area) => (
              <div
                key={area}
                className="px-4 py-2 rounded-full bg-background border border-border shadow-sm hover:border-accent/50 hover:shadow-depth-2 transition-all cursor-default"
              >
                <span className="text-sm font-medium text-foreground">{area}</span>
              </div>
            ))}
            <div className="px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
              <span className="text-sm font-medium text-accent">+ 15 More Cities</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values with mesh background */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
        <Container className="relative z-10">
          <SectionHeader
            title="Our Values"
            subtitle="The principles that guide how we run the marketplace."
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>


      {/* What We Bring - Simple value props */}
      <Section className="bg-secondary">
        <Container size="narrow">
          <SectionHeader
            title="How Booking Works"
            subtitle="From move request to a completed, reviewed booking."
          />
          
          <div className="grid sm:grid-cols-2 gap-6">
            {milestones.map((item, index) => (
              <div 
                key={item.title} 
                className="flex gap-4 p-6 rounded-xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-3 h-3 rounded-full gradient-gold shadow-glow-gold mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-primary mb-1">{item.title}</p>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Credentials with glass effect */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
        <Container className="relative z-10">
          <SectionHeader
            title="How the Marketplace Protects You"
            subtitle="The standards every company on Handledly must meet."
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {credentials.map((credential, index) => (
              <div
                key={credential}
                className="flex items-center gap-3 p-4 rounded-xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                <span className="text-foreground text-sm">{credential}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-mesh-hero pointer-events-none opacity-50" />
        <Container size="narrow" className="relative z-10">
          <div className="text-center">
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-primary mb-4">
              Ready to Compare Movers?
            </h2>
            <p className="text-muted-foreground mb-8">
              Submit one move request and hear from verified Denver-area companies — free, no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90 hover-lift animate-glow-pulse">
                <Link to="/quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Link to="/contact">Contact Us</Link>
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