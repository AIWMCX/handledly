import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget";
import { HOURLY_RATES, CREW_CONFIGURATIONS, ELECTRONIC_PAYMENT_FEE } from "@/lib/quoteCalculator";
import { 
  Truck, Dumbbell, Users, ArrowRight, CheckCircle,
  Piano, Shield, Zap, Info
} from "lucide-react";

const mainServices = [
  {
    icon: Truck,
    title: "Local Moving",
    slug: "local-moving",
    description: "Full-service local moves with professional crew and truck. From studio apartments to large homes, we handle every detail with care.",
    features: [
      "Professional packing and unpacking",
      "Furniture disassembly and reassembly",
      "Floor and door protection included",
      "No stair or elevator fees",
      "Same-day service available",
    ],
    pricing: [
      { label: "2 Movers + Truck", rate: HOURLY_RATES['moving-2-movers'], popular: true },
      { label: "3 Movers + Truck", rate: HOURLY_RATES['moving-3-movers'] },
      { label: "4 Movers + Truck", rate: HOURLY_RATES['moving-4-movers'] },
    ],
  },
  {
    icon: Dumbbell,
    title: "Heavy Items Moving",
    slug: "heavy-items-moving",
    description: "Specialized moving for oversized and heavy items. Our trained specialists have the equipment and expertise to handle even the most challenging pieces.",
    features: [
      "Pianos (upright & grand)",
      "Safes and gun safes",
      "Pool tables (full service available)",
      "Appliances and hot tubs",
      "Gym equipment",
    ],
    pricing: [
      { label: "Heavy Items", rate: HOURLY_RATES['heavy-items'], note: "Quote varies by item" },
    ],
  },
];

const laborOnlyOptions = [
  { label: "Labor Only - 2 Movers", rate: HOURLY_RATES['labor-2-movers'], description: "Loading/unloading help" },
  { label: "Labor Only - 3 Movers", rate: HOURLY_RATES['labor-3-movers'], description: "Larger jobs" },
  { label: "Labor Only - 4 Movers", rate: HOURLY_RATES['labor-4-movers'], description: "Big projects" },
];

const specialtyItems = [
  { icon: Piano, name: "Pianos", description: "Upright & Grand" },
  { icon: Shield, name: "Safes", description: "All sizes" },
  { icon: Zap, name: "Pool Tables", description: "Full service" },
  { icon: Dumbbell, name: "Gym Equipment", description: "Commercial & home" },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-background">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6">
              Our <span className="text-accent">Services</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Professional moving solutions with transparent, flat-rate pricing. 
              No hidden fees, no surprises — just reliable service you can trust.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Services */}
      <Section className="pt-0">
        <Container>
          <div className="space-y-16">
            {mainServices.map((service, index) => (
              <div
                key={service.title}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-start ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h2 className="font-heading text-3xl font-semibold text-primary mb-4">
                    {service.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="gradient-gold text-white hover:opacity-90">
                    <Link to={`/services/${service.slug}`}>Learn More</Link>
                  </Button>
                </div>
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="p-6 rounded-2xl bg-secondary border border-border shadow-card">
                    <h3 className="font-heading text-lg font-semibold text-primary mb-4">Pricing</h3>
                    <div className="space-y-3">
                      {service.pricing.map((tier) => (
                        <div 
                          key={tier.label}
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            tier.popular ? 'bg-primary/5 border border-primary/20' : 'bg-background'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{tier.label}</span>
                            {tier.popular && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-white">Popular</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-primary">${tier.rate}</span>
                            <span className="text-muted-foreground text-sm">/hr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {service.slug === 'heavy-items-moving' && (
                      <p className="text-xs text-muted-foreground mt-3">
                        * Final quote varies based on item type, weight, and access
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Labor Only Section */}
      <Section className="bg-secondary">
        <Container>
          <SectionHeader
            title="Labor Only Services"
            subtitle="Have your own truck, pod, or container? We provide the professional muscle."
          />
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {laborOnlyOptions.map((option) => (
              <div
                key={option.label}
                className="p-6 rounded-2xl bg-background border border-border text-center shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-primary mb-1">{option.label}</h3>
                <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                <div>
                  <span className="text-2xl font-bold text-foreground">${option.rate}</span>
                  <span className="text-muted-foreground">/hr</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Electronic Payment Fee Notice */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 border border-border max-w-md mx-auto">
            <Info className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              +${ELECTRONIC_PAYMENT_FEE} processing fee for card/electronic payments
            </p>
          </div>
        </Container>
      </Section>

      {/* Specialty Items */}
      <Section>
        <Container>
          <SectionHeader
            title="Specialty Items We Move"
            subtitle="Expert handling for items that require extra care and specialized equipment."
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialtyItems.map((item) => (
              <div
                key={item.name}
                className="p-6 rounded-2xl bg-background border border-border text-center shadow-card hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-primary mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-muted-foreground mt-8">
            Have something unique? <Link to="/contact" className="text-accent hover:underline">Contact us</Link> for a custom quote.
          </p>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-secondary">
        <Container size="narrow">
          <div className="text-center">
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-primary mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Get a free, no-obligation quote in minutes. Our team is ready to help.
            </p>
            <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90">
              <Link to="/quote">
                Get Your Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Footer />
      <ChatWidget />
      <VoiceAgent />
    </div>
  );
}
