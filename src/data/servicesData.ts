import { 
  Truck, Dumbbell, LucideIcon 
} from "lucide-react";

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface ServiceChallenge {
  icon: string;
  title: string;
  description: string;
}

export interface RelatedService {
  slug: string;
  title: string;
  description: string;
}

export interface ServiceData {
  title: string;
  slug: string;
  icon: LucideIcon;
  tagline: string;
  headline: string;
  highlightText: string;
  subheading: string;
  introParagraphs: string[];
  features: ServiceFeature[];
  expertCareTitle: string;
  expertCareDescription: string;
  challenges: ServiceChallenge[];
  relatedServices: RelatedService[];
  ctaSteps: string[];
}

export const servicesData: Record<string, ServiceData> = {
  'local-moving': {
    title: 'Local Moving',
    slug: 'local-moving',
    icon: Truck,
    tagline: 'Your Trusted Partner for Stress-Free Local Moves',
    headline: 'Professional Local Moving',
    highlightText: 'Made Simple',
    subheading: 'Why Our Local Movers Stand Out',
    introParagraphs: [
      "Moving locally doesn't have to be stressful. Our team specializes in efficient, damage-free local moves that get you settled quickly. With flat hourly rates and no hidden fees, you'll know exactly what to expect.",
      "From studio apartments to family homes, we handle every detail with care. Our professional movers are trained, insured, and committed to making your move as smooth as possible."
    ],
    features: [
      { title: 'Licensed & Insured Crew', description: 'Every team member is fully licensed and insured for your peace of mind.' },
      { title: 'No Hidden Fees', description: 'Transparent flat-rate pricing with everything included upfront.' },
      { title: 'Customized Solutions', description: 'Tailored moving plans designed around your specific needs.' },
      { title: 'Flexible Scheduling', description: 'Same-day, weekend, and after-hours moves available.' },
      { title: 'Local Expertise', description: 'We know the area inside and out.' },
      { title: 'Damage-Free Guarantee', description: 'Professional handling with protection for your belongings.' },
    ],
    expertCareTitle: 'Why Local Moving Requires Expert Care',
    expertCareDescription: "Even short-distance moves present unique challenges. Navigating varied neighborhoods, managing parking permits, and protecting your belongings requires local expertise and professional equipment.",
    challenges: [
      { icon: 'map', title: 'Logistics Headaches', description: 'Coordinating timing, parking, and access across different neighborhoods.' },
      { icon: 'weight', title: 'Heavy Lifting', description: 'Moving furniture and appliances without proper equipment risks injury.' },
      { icon: 'shield', title: 'Fragile Items', description: 'Protecting delicate possessions during transport and handling.' },
      { icon: 'clock', title: 'Time And Energy', description: 'DIY moves often take twice as long and exhaust you completely.' },
    ],
    relatedServices: [
      { slug: 'heavy-items-moving', title: 'Heavy Items Moving', description: 'Specialty moving for oversized pieces.' },
    ],
    ctaSteps: [
      'Request your free quote online',
      'We confirm details and schedule',
      'Professional crew arrives on time',
      'Careful loading and transport',
      'You\'re settled in your new home',
    ],
  },
  'heavy-items-moving': {
    title: 'Heavy Items Moving',
    slug: 'heavy-items-moving',
    icon: Dumbbell,
    tagline: 'Specialized Moving for Oversized & Heavy Items',
    headline: 'Professional Heavy Items Moving',
    highlightText: 'Done Right',
    subheading: 'Why Heavy Items Require Specialty Movers',
    introParagraphs: [
      "Some items are too heavy, too awkward, or too valuable for standard moving. Our heavy item specialists have the equipment, training, and experience to safely move even the most challenging pieces.",
      "From 800-pound safes to commercial gym equipment, we handle items that other movers refuse. Proper rigging, specialized dollies, and experienced crews ensure safe transport."
    ],
    features: [
      { title: 'Specialized Equipment', description: 'Heavy-duty dollies, straps, and rigging gear.' },
      { title: 'Trained Specialists', description: 'Crew members certified in heavy item handling.' },
      { title: 'Structural Protection', description: 'Floor and wall protection during moves.' },
      { title: 'Custom Solutions', description: 'Every heavy item gets a tailored moving plan.' },
      { title: 'Insurance Coverage', description: 'Full protection for high-value items.' },
      { title: 'Stair & Elevator Capable', description: 'We navigate difficult access points safely.' },
    ],
    expertCareTitle: 'Why Heavy Items Demand Expert Handling',
    expertCareDescription: "Heavy items pose risks to people, property, and the items themselves. Without proper equipment and technique, you risk injury, property damage, and destroyed valuables.",
    challenges: [
      { icon: 'map', title: 'Access Planning', description: 'Measuring doorways, stairs, and paths beforehand.' },
      { icon: 'weight', title: 'Weight Distribution', description: 'Balancing loads to prevent tipping or damage.' },
      { icon: 'shield', title: 'Property Protection', description: 'Preventing floor scratches and wall damage.' },
      { icon: 'clock', title: 'Safety First', description: 'Taking time to do it right, not fast.' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Full-service local moves.' },
    ],
    ctaSteps: [
      'Describe your heavy items',
      'We assess and plan the move',
      'Specialized crew and equipment arrive',
      'Careful extraction and transport',
      'Safe placement at destination',
    ],
  },
};

// Export all services as an array for iteration
export const allServices = Object.values(servicesData);

// Helper to get service by slug
export function getServiceBySlug(slug: string): ServiceData | undefined {
  return servicesData[slug];
}
