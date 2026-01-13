import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget";
import { StickyCTA } from "@/components/StickyCTA";
import { TrustBadges } from "@/components/TrustBadges";
import { GoogleReviewsBadge } from "@/components/GoogleReviewsBadge";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { MeshGradientHero } from "@/components/ui/BackgroundEffects";
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
  { year: "2010", event: "Founded in Denver with a single truck and a dream" },
  { year: "2013", event: "Expanded to 5 trucks and 15 team members" },
  { year: "2016", event: "Opened specialty moving division for pianos and antiques" },
  { year: "2019", event: "Recognized as Denver's top-rated moving company" },
  { year: "2022", event: "Launched commercial moving services across Colorado" },
  { year: "2025", event: "Celebrating 15 years and 10,000+ successful Denver moves" },
];

const credentials = [
  "Colorado Licensed & Registered",
  "Fully Bonded & Insured",
  "BBB A+ Rated",
  "Member of American Moving & Storage Association",
  "Background-Checked Employees",
  "Drug-Free Workplace Certified",
];

const denverAreas = [
  "Capitol Hill", "Cherry Creek", "LoDo", "Highlands", "RiNo",
  "Wash Park", "Park Hill", "Baker", "Sloan's Lake", "Stapleton",
  "Aurora", "Lakewood", "Arvada", "Westminster", "Thornton",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero with Mesh Gradient */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        <MeshGradientHero />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            {/* Denver Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Serving Denver Since 2010</span>
            </div>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6">
              Denver's Most <span className="text-accent">Trusted</span> Moving Team
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-6">
              For over 15 years, we've been Denver's trusted partner for seamless, 
              stress-free moves. Our story is one of dedication, growth, and an 
              unwavering commitment to excellence.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4">
              <GoogleReviewsBadge compact />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">10,000+ Denver Moves</span>
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
                  Our company was born from a simple observation: moving in Denver 
                  doesn't have to be stressful. Our founder recognized that 
                  families and businesses deserved better—movers who actually cared 
                  about their belongings and their experience.
                </p>
                <p>
                  Starting with a single truck and an uncompromising commitment to 
                  quality, we've grown into Denver's most trusted moving company. 
                  But growth hasn't changed our values. Every move, whether it's a 
                  studio apartment in Capitol Hill or a corporate headquarters downtown, 
                  receives the same attention to detail and personal care.
                </p>
                <p>
                  Today, with a fleet of modern trucks and a team of trained 
                  professionals, we continue to raise the bar for what a Denver moving 
                  experience should be. Because here, your next chapter starts with us.
                </p>
              </div>
            </div>
            <div className="relative">
              {/* Stats card instead of placeholder */}
              <div className="rounded-2xl glass-card shadow-depth-3 p-8">
                <h3 className="font-heading text-xl font-semibold text-primary mb-6">Denver Moving Excellence</h3>
                <AnimatedStats 
                  stats={[
                    { value: 15, label: "Years in Denver", suffix: "+" },
                    { value: 10, label: "Moves Completed", suffix: "K+" },
                    { value: 30, label: "Cities Served", suffix: "+" },
                    { value: 97, label: "Satisfaction Rate", suffix: "%" },
                  ]}
                  className="grid grid-cols-2 gap-6"
                />
              </div>
              
              {/* Floating Glass Card */}
              <div className="absolute -bottom-6 -left-6 p-6 rounded-xl glass-card shadow-depth-3 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">4.9 Rating</p>
                    <p className="text-sm text-muted-foreground">500+ Reviews</p>
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

      {/* Timeline with glow effects */}
      <Section className="bg-secondary">
        <Container size="narrow">
          <SectionHeader
            title="Our Journey"
            subtitle="Milestones along the way."
          />
          
          <div className="space-y-0">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full gradient-gold shadow-glow-gold" />
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-accent/50 to-border my-2" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-accent font-semibold">{milestone.year}</p>
                  <p className="text-foreground">{milestone.event}</p>
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