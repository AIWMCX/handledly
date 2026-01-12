import { Container } from "@/components/layout";
import { 
  MessageSquare, ClipboardList, DollarSign, CalendarCheck, Truck 
} from "lucide-react";

const steps = [
  {
    number: 1,
    icon: MessageSquare,
    title: "Contact Us",
    description: "Fill out our form or give us a call — we respond fast!",
  },
  {
    number: 2,
    icon: ClipboardList,
    title: "Describe Your Move",
    description: "Tell us about your property, items, and timeline.",
  },
  {
    number: 3,
    icon: DollarSign,
    title: "Get Upfront Pricing",
    description: "Receive a clear quote with no hidden fees or surprises.",
  },
  {
    number: 4,
    icon: CalendarCheck,
    title: "Schedule Your Date",
    description: "Pick a date that works for you — including same-day!",
  },
  {
    number: 5,
    icon: Truck,
    title: "We Handle the Rest",
    description: "Our team arrives on time and completes your move with care.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-20 bg-background overflow-hidden">
      {/* Subtle mesh background */}
      <div className="absolute inset-0 bg-mesh-section opacity-50 pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold mb-4">
            How It <span className="text-accent">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting your quote and scheduling your move is simple. Here's our 5-step process.
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line with gradient */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center group">
                {/* Step icon circle with glow */}
                <div className="relative mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto relative z-10 shadow-gold group-hover:shadow-glow-gold transition-shadow">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                <h3 className="font-heading text-lg font-semibold text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
