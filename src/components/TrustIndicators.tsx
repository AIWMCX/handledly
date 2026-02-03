import { Container } from "@/components/layout";
import {
  FlatPricingIcon,
  FreePackingIcon,
  NoStairFeesIcon,
  NoTruckFeesIcon,
  FreeAssemblyIcon,
  DamageFreeDaysIcon
} from "@/components/icons/TrustIcons";

const differentiators = [
  {
    Icon: FlatPricingIcon,
    title: "No Hidden Fees",
    description: "Flat hourly rate pricing with zero surprises",
  },
  {
    Icon: FreePackingIcon,
    title: "Free Packing Materials",
    description: "Blankets, wrap, and tape included at no extra cost",
  },
  {
    Icon: NoStairFeesIcon,
    title: "No Stair/Elevator Fees",
    description: "Same rate whether you're on the 1st or 10th floor",
  },
  {
    Icon: NoTruckFeesIcon,
    title: "No Truck Surcharges",
    description: "Truck and fuel costs are always included",
  },
  {
    Icon: FreeAssemblyIcon,
    title: "Free Assembly",
    description: "Furniture disassembly and reassembly included",
  },
  {
    Icon: DamageFreeDaysIcon,
    title: "Safe & Secure",
    description: "Proven track record of careful handling",
  },
];

export function TrustIndicators() {
  return (
    <section className="relative py-20 bg-secondary border-y border-border overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold mb-4">
            What Makes Us <span className="text-accent">Different</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We believe in transparent pricing and exceptional service. Here's what sets us apart.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-depth-2 hover:shadow-depth-3 hover:border-accent/30 transition-all duration-300 hover-lift overflow-hidden animate-fade-in-up opacity-0 animate-delay-${(index + 1) * 100}`}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Subtle top highlight for 3D effect */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              
              {/* Premium icon container with glow */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:shadow-glow-gold transition-all duration-300">
                <item.Icon size="list" color="gold" />
              </div>
              
              <h3 className="font-heading text-xl font-bold text-primary mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
              
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
