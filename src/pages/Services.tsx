import { Header, Footer, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget";
import { allServices } from "@/data/servicesData";
import { 
  Truck, Package, Shield, Users, Home, Building2, 
  Warehouse, Piano, Wine, Dumbbell, ArrowRight, CheckCircle 
} from "lucide-react";

const mainServices = [
  {
    icon: Home,
    title: "Residential Moving",
    slug: "residential-movers",
    description: "Complete home moving services for families of all sizes. From cozy apartments to sprawling estates, we handle every detail.",
    features: [
      "Professional packing and unpacking",
      "Furniture disassembly and reassembly",
      "Careful handling of personal items",
      "Same-day local moves available",
      "Long-distance moving options",
    ],
    startingPrice: "From $299",
  },
  {
    icon: Building2,
    title: "Commercial Moving",
    slug: "long-distance-moving",
    description: "Minimize business disruption with our efficient office and commercial relocation services. We work on your schedule.",
    features: [
      "After-hours and weekend moves",
      "IT equipment handling",
      "Office furniture installation",
      "Confidential document handling",
      "Project management included",
    ],
    startingPrice: "From $799",
  },
  {
    icon: Shield,
    title: "Specialty Moving",
    slug: "heavy-items-moving",
    description: "Expert care for your most valuable and delicate possessions. Our trained specialists handle items requiring extra attention.",
    features: [
      "Piano moving (upright & grand)",
      "Antique furniture",
      "Fine art and sculptures",
      "Safes and heavy items",
      "Wine collections",
    ],
    startingPrice: "Custom quotes",
  },
  {
    icon: Warehouse,
    title: "Storage Solutions",
    slug: "local-moving",
    description: "Climate-controlled storage facilities for short or long-term needs. Secure, accessible, and flexible options available.",
    features: [
      "Climate-controlled units",
      "24/7 security monitoring",
      "Flexible rental terms",
      "Packing supplies available",
      "Convenient Denver locations",
    ],
    startingPrice: "From $99/month",
  },
];

const specialtyItems = [
  { icon: Piano, name: "Pianos", price: "From $250" },
  { icon: Wine, name: "Wine Collections", price: "From $150" },
  { icon: Dumbbell, name: "Gym Equipment", price: "From $125" },
  { icon: Shield, name: "Safes", price: "From $150" },
];

const packingOptions = [
  {
    title: "Full Packing",
    description: "We pack everything for you—every box, every item, every room.",
    price: "35% of move cost",
  },
  {
    title: "Partial Packing",
    description: "We handle fragile and specialty items while you pack the rest.",
    price: "Custom quote",
  },
  {
    title: "Packing Supplies",
    description: "Premium boxes, tape, paper, and materials delivered to your door.",
    price: "Varies by quantity",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
              Our <span className="text-gradient-gold">Services</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Comprehensive moving solutions designed for Denver's diverse needs. 
              From studio apartments to corporate headquarters, we deliver excellence.
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
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
                    {service.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-primary">{service.startingPrice}</span>
                    <Button asChild className="gradient-gold text-primary-foreground hover:opacity-90">
                      <Link to={`/services/${service.slug}`}>Learn More</Link>
                    </Button>
                  </div>
                </div>
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="aspect-[4/3] rounded-2xl bg-card border border-border flex items-center justify-center">
                    <service.icon className="w-24 h-24 text-primary/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Specialty Items */}
      <Section className="bg-card">
        <Container>
          <SectionHeader
            title="Specialty Item Moving"
            subtitle="Expert handling for items that require extra care and specialized equipment."
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialtyItems.map((item) => (
              <div
                key={item.name}
                className="p-6 rounded-2xl bg-background border border-border text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-primary font-medium">{item.price}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-muted-foreground mt-8">
            Have something unique? <Link to="/contact" className="text-primary hover:underline">Contact us</Link> for a custom quote.
          </p>
        </Container>
      </Section>

      {/* Packing Services */}
      <Section>
        <Container>
          <SectionHeader
            title="Professional Packing"
            subtitle="Let our experts pack your belongings with premium materials and proven techniques."
          />
          
          <div className="grid md:grid-cols-3 gap-6">
            {packingOptions.map((option) => (
              <div
                key={option.title}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{option.title}</h3>
                <p className="text-muted-foreground mb-4">{option.description}</p>
                <p className="text-primary font-medium">{option.price}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-card">
        <Container size="narrow">
          <div className="text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Get a free, no-obligation quote in minutes. Our team is ready to help.
            </p>
            <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
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