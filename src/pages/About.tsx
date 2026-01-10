import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { 
  ArrowRight, Shield, Heart, Award, Users, 
  CheckCircle, Star, Truck 
} from "lucide-react";

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
  { year: "2009", event: "Founded in Denver with a single truck and a dream" },
  { year: "2012", event: "Expanded to 5 trucks and 15 team members" },
  { year: "2015", event: "Opened specialty moving division for pianos and antiques" },
  { year: "2018", event: "Recognized as Denver's Best Moving Company" },
  { year: "2021", event: "Launched commercial moving services" },
  { year: "2024", event: "Celebrating 15 years and 10,000+ successful moves" },
];

const credentials = [
  "Colorado PUC Licensed & Registered",
  "Fully Bonded & Insured",
  "BBB A+ Rated",
  "Member of American Moving & Storage Association",
  "Background-Checked Employees",
  "Drug-Free Workplace Certified",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
              About <span className="text-gradient-gold">Denver Premium Moving</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              For over 15 years, we've been Denver's trusted partner for seamless, 
              stress-free moves. Our story is one of dedication, growth, and an 
              unwavering commitment to excellence.
            </p>
          </div>
        </Container>
      </section>

      {/* Story Section */}
      <Section className="pt-0">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Denver Premium Moving was born from a simple observation: moving 
                  doesn't have to be stressful. In 2009, our founder recognized that 
                  families and businesses deserved better—movers who actually cared 
                  about their belongings and their experience.
                </p>
                <p>
                  Starting with a single truck and an uncompromising commitment to 
                  quality, we've grown into Denver's most trusted moving company. 
                  But growth hasn't changed our values. Every move, whether it's a 
                  studio apartment or a corporate headquarters, receives the same 
                  attention to detail and personal care.
                </p>
                <p>
                  Today, with a fleet of modern trucks and a team of trained 
                  professionals, we continue to raise the bar for what a moving 
                  experience should be. Because at Denver Premium Moving, your 
                  next chapter starts with us.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-card border border-border flex items-center justify-center">
                <Truck className="w-32 h-32 text-primary/20" />
              </div>
              <div className="absolute -bottom-6 -left-6 p-6 rounded-xl glass shadow-elegant">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">4.9 Rating</p>
                    <p className="text-sm text-muted-foreground">500+ Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section className="bg-card">
        <Container>
          <SectionHeader
            title="Our Values"
            subtitle="The principles that guide every move we make."
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl bg-background border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
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

      {/* Timeline */}
      <Section>
        <Container size="narrow">
          <SectionHeader
            title="Our Journey"
            subtitle="Milestones along the way."
          />
          
          <div className="space-y-0">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full gradient-gold" />
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border my-2" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-primary font-semibold">{milestone.year}</p>
                  <p className="text-foreground">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Credentials */}
      <Section className="bg-card">
        <Container>
          <SectionHeader
            title="Licensed & Certified"
            subtitle="Your peace of mind is backed by our credentials."
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {credentials.map((credential) => (
              <div
                key={credential}
                className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border"
              >
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground text-sm">{credential}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container size="narrow">
          <div className="text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-muted-foreground mb-8">
              Let us show you what premium moving really means.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
                <Link to="/quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Contact Us</Link>
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