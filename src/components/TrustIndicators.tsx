import { 
  DollarSign, Package, Building2, Fuel, Wrench, Shield
} from "lucide-react";
import { Container } from "@/components/layout";

const differentiators = [
  {
    icon: DollarSign,
    title: "No Hidden Fees",
    description: "Flat hourly rate pricing with zero surprises",
  },
  {
    icon: Package,
    title: "Free Packing Materials",
    description: "Blankets, wrap, and tape included at no extra cost",
  },
  {
    icon: Building2,
    title: "No Stair/Elevator Fees",
    description: "Same rate whether you're on the 1st or 10th floor",
  },
  {
    icon: Fuel,
    title: "No Truck Surcharges",
    description: "Truck and fuel costs are always included",
  },
  {
    icon: Wrench,
    title: "Free Assembly",
    description: "Furniture disassembly and reassembly included",
  },
  {
    icon: Shield,
    title: "500+ Damage-Free Days",
    description: "Proven track record of careful handling",
  },
];

export function TrustIndicators() {
  return (
    <section className="relative py-16 bg-secondary border-y border-border overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold mb-4">
            What Makes Us <span className="text-accent">Different</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We believe in transparent pricing and exceptional service. Here's what sets us apart.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all shadow-depth-2 hover:shadow-depth-3 hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:shadow-glow-gold transition-shadow">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-primary mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
