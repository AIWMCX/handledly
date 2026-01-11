import { Container } from "@/components/layout";
import { 
  Shield, DollarSign, Settings, Calendar, MapPin, CheckCircle,
  Truck, Package, ThermometerSun, Clock, Users, Wrench,
  Target, Lock, Layers, Zap, Recycle, Home
} from "lucide-react";
import type { ServiceFeature } from "@/data/servicesData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Licensed & Insured Crew': Shield,
  'No Hidden Fees': DollarSign,
  'Customized Solutions': Settings,
  'Flexible Scheduling': Calendar,
  'Local Expertise': MapPin,
  'Damage-Free Guarantee': CheckCircle,
  'Full-Service Packing': Package,
  'Furniture Protection': Shield,
  'Assembly & Disassembly': Wrench,
  'Specialty Item Care': Shield,
  'No Stair Charges': CheckCircle,
  'Dedicated Trucks': Truck,
  'GPS Tracking': MapPin,
  'Guaranteed Delivery': CheckCircle,
  'Full Valuation Coverage': Shield,
  'Climate Control Options': ThermometerSun,
  'Door-to-Door Service': Home,
  'Flexible Hourly Rates': DollarSign,
  'Trained Professionals': Users,
  'Equipment Included': Wrench,
  'Loading Expertise': Package,
  'Any Container Type': Package,
  'Same-Day Available': Zap,
  'Specialized Equipment': Wrench,
  'Trained Specialists': Users,
  'Structural Protection': Shield,
  'Custom Solutions': Settings,
  'Insurance Coverage': Shield,
  'Stair & Elevator Capable': CheckCircle,
  'Piano Board & Straps': Wrench,
  'Climate Control': ThermometerSun,
  'Full Padding': Layers,
  'Stair Capability': CheckCircle,
  'Tuning Partnerships': Settings,
  'Complete Disassembly': Wrench,
  'Slate Protection': Shield,
  'Felt Preservation': Layers,
  'Precision Leveling': Target,
  'All Table Types': Target,
  'Re-felting Available': Layers,
  'Heavy-Duty Equipment': Wrench,
  'Weight Capacity': Shield,
  'Floor Protection': Shield,
  'Stair Navigation': CheckCircle,
  'Positioning Service': Target,
  'Anchoring Available': Lock,
  'Rapid Response': Zap,
  'Full Service Available': Package,
  'Evening Moves': Clock,
  'Weekend Service': Calendar,
  'Transparent Pricing': DollarSign,
  'Professional Quality': CheckCircle,
  'Upfront Pricing': DollarSign,
  'Responsible Disposal': Recycle,
  'Any Size Job': Package,
  'Interior & Exterior': Home,
  'Estate Cleanouts': Home,
};

interface FeatureCardsProps {
  features: ServiceFeature[];
}

export function FeatureCards({ features }: FeatureCardsProps) {
  return (
    <section className="py-16 bg-card">
      <Container>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.title] || CheckCircle;
            return (
              <div 
                key={index} 
                className="group relative bg-background rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all"
              >
                {/* Gold ribbon header */}
                <div className="gradient-gold px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                    <h3 className="font-serif text-lg font-semibold text-primary-foreground">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
