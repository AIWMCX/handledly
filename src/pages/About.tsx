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
  CheckCircle, Star, Truck, MapPin 
} from "lucide-react";
import { SocialProofBanner, MobileStickyCTA, AnimatedStats } from "@/components/conversion";

const values = [
  {
    icon: Shield,
    title: "Reliability",
    description: "We show up on time, every time. Your schedule matters to us as much as it does to you.",
  },
  {
    icon: Heart,
    title: "Care",
    description: "Every item we move is treated as if it were our own. Your belongings are precious to us.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We don't just meet expectations—we exceed them. Quality is in everything we do.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We're Denver locals serving our neighbors. This is our home too.",
  },
];

const milestones = [
  { title: "Professional Training", description: "Every team member completes hands-on training before their first move" },
  { title: "Quality Equipment", description: "Modern trucks and premium moving supplies for safe transport" },
  { title: "Local Knowledge", description: "We know Denver's neighborhoods, buildings, and traffic patterns" },
  { title: "Customer Focus", description: "Real-time communication and personalized service on every job" },
];

const credentials = [
  "Colorado Licensed & Registered",
  "Fully Bonded & Insured",
  "Background-Checked Employees",
  "Professional Liability Coverage",
  "GPS-Tracked Fleet",
  "Verified Customer Reviews",
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
        title="About Handledly Moving Services - Denver's Professional Moving Team"
        description="Denver's trusted moving team with professional crews and transparent pricing. Licensed, insured, and committed to excellence on every move."
        canonicalUrl="https://handledly.com/about"
        keywords={['about Handledly Moving Services', 'Denver moving company', 'trusted movers Denver', 'professional movers']}
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
              <span className="text-sm font-semibold text-primary">Denver's Professional Moving Team</span>
            </div>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6">
              Denver's Most <span className="text-accent">Trusted</span> Moving Team
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-6">
              Denver's trusted partner for seamless, stress-free moves. 
              Our story is one of dedication, quality service, and an 
              unwavering commitment to treating every move with care.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4">
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Professional Denver Movers</span>
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
                  We're a Denver-based moving team that believes moving should be 
                  straightforward and stress-free. No drama, no hidden fees, no 
                  surprises—just professional movers who show up on time and 
                  handle your belongings with care.
                </p>
                <p>
                  Our team brings hands-on experience from working in the Denver 
                  metro area. We know the buildings, the neighborhoods, and what 
                  it takes to get the job done right. Whether it's a one-bedroom 
                  apartment or a full house, we treat every move with the same 
                  level of attention.
                </p>
                <p>
                  What sets us apart? We answer our phones, we communicate clearly, 
                  and we genuinely care about making your move easier. That's it—
                  no complicated story, just good work.
                </p>
              </div>
            </div>
            <div className="relative">
              {/* Stats card instead of placeholder */}
              <div className="rounded-2xl glass-card shadow-depth-3 p-8">
                <h3 className="font-heading text-xl font-semibold text-primary mb-6">Denver Moving Excellence</h3>
                <AnimatedStats 
                  stats={[
                    { value: 4.9, label: "Google Rating", suffix: "/5" },
                    { value: 30, label: "Cities Served", suffix: "+" },
                    { value: 0, label: "Hidden Fees", prefix: "$" },
                    { value: 97, label: "Satisfaction Rate", suffix: "%" },
                  ]}
                  className="grid grid-cols-2 gap-6"
                />
              </div>
              
              {/* Floating Glass Card - Hidden on mobile to prevent overlap */}
              <div className="hidden sm:block absolute -bottom-6 -left-6 p-6 rounded-xl glass-card shadow-depth-3 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">4.9 Rating</p>
                    <p className="text-sm text-muted-foreground">Customer Reviews</p>
                  </div>
                </div>
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
            subtitle="The principles that guide every move we make."
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
            title="What We Bring"
            subtitle="The things that matter most on moving day."
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
            title="Licensed & Certified"
            subtitle="Your peace of mind is backed by our credentials."
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
              Ready to Experience the Difference?
            </h2>
            <p className="text-muted-foreground mb-8">
              Let Denver's most trusted movers show you what premium service really means.
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