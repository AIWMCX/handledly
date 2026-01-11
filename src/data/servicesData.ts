import { 
  Truck, Home, MapPin, Users, Dumbbell, Piano, 
  Target, Shield, Zap, Trash2, LucideIcon 
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
    headline: 'Discover Hassle-Free Local Moving',
    highlightText: 'in Colorado',
    subheading: 'Why Our Local Movers Stand Out in Colorado',
    introParagraphs: [
      "Moving locally doesn't have to be stressful. Our Denver-based team specializes in efficient, damage-free local moves that get you settled quickly. With flat hourly rates and no hidden fees, you'll know exactly what to expect.",
      "From studio apartments to family homes, we handle every detail with care. Our professional movers are trained, insured, and committed to making your move as smooth as possible."
    ],
    features: [
      { title: 'Licensed & Insured Crew', description: 'Every team member is fully licensed and insured for your peace of mind.' },
      { title: 'No Hidden Fees', description: 'Transparent flat-rate pricing with everything included upfront.' },
      { title: 'Customized Solutions', description: 'Tailored moving plans designed around your specific needs.' },
      { title: 'Flexible Scheduling', description: 'Same-day, weekend, and after-hours moves available.' },
      { title: 'Local Expertise', description: 'We know Denver neighborhoods inside and out.' },
      { title: 'Damage-Free Guarantee', description: 'Professional handling with protection for your belongings.' },
    ],
    expertCareTitle: 'Why Local Moving Requires Expert Care',
    expertCareDescription: "Even short-distance moves present unique challenges. Navigating Denver's varied neighborhoods, managing parking permits, and protecting your belongings requires local expertise and professional equipment.",
    challenges: [
      { icon: 'map', title: 'Logistics Headaches', description: 'Coordinating timing, parking, and access across different neighborhoods.' },
      { icon: 'weight', title: 'Heavy Lifting', description: 'Moving furniture and appliances without proper equipment risks injury.' },
      { icon: 'shield', title: 'Fragile Items', description: 'Protecting delicate possessions during transport and handling.' },
      { icon: 'clock', title: 'Time And Energy', description: 'DIY moves often take twice as long and exhaust you completely.' },
    ],
    relatedServices: [
      { slug: 'residential-movers', title: 'Residential Moving', description: 'Full-service home moving solutions.' },
      { slug: 'same-day-moving', title: 'Same-Day Moving', description: 'Urgent moves when time is critical.' },
      { slug: 'moving-help-labor', title: 'Moving Labor', description: 'Professional help loading your truck.' },
    ],
    ctaSteps: [
      'Request your free quote online',
      'We confirm details and schedule',
      'Professional crew arrives on time',
      'Careful loading and transport',
      'You\'re settled in your new home',
    ],
  },
  'residential-movers': {
    title: 'Residential Movers',
    slug: 'residential-movers',
    icon: Home,
    tagline: 'Premium Home Moving Services for Colorado Families',
    headline: 'Experience Premium Residential Moving',
    highlightText: 'in Colorado',
    subheading: 'Why Colorado Families Choose Our Residential Movers',
    introParagraphs: [
      "Your home holds your most precious possessions and memories. Our residential moving service treats every item with the care it deserves, from family heirlooms to everyday essentials.",
      "We specialize in moves of all sizes — from cozy apartments to sprawling estates. Our comprehensive service includes packing, furniture protection, disassembly/reassembly, and careful placement in your new home."
    ],
    features: [
      { title: 'Full-Service Packing', description: 'Professional packing with premium materials included at no extra charge.' },
      { title: 'Furniture Protection', description: 'Blankets, padding, and stretch wrap for every piece.' },
      { title: 'Assembly & Disassembly', description: 'We handle beds, tables, and complex furniture.' },
      { title: 'Specialty Item Care', description: 'Extra protection for antiques, art, and valuables.' },
      { title: 'Flexible Scheduling', description: 'Move when it works for you, including weekends.' },
      { title: 'No Stair Charges', description: 'Stairs and elevators included in your flat rate.' },
    ],
    expertCareTitle: 'Why Your Home Move Deserves Expert Care',
    expertCareDescription: "A residential move involves more than just boxes. It's about safely relocating your life — your family's comfort, your valuable possessions, and your peace of mind.",
    challenges: [
      { icon: 'map', title: 'Complex Logistics', description: 'Coordinating between two properties with different access needs.' },
      { icon: 'weight', title: 'Heavy Furniture', description: 'Large items require proper equipment and technique.' },
      { icon: 'shield', title: 'Sentimental Items', description: 'Irreplaceable family possessions need special attention.' },
      { icon: 'clock', title: 'Timing Pressure', description: 'Closing dates and lease deadlines create stress.' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Efficient moves within the Denver area.' },
      { slug: 'long-distance-moving', title: 'Long Distance', description: 'Interstate and cross-country relocations.' },
      { slug: 'heavy-items-moving', title: 'Heavy Items', description: 'Specialty moving for oversized pieces.' },
    ],
    ctaSteps: [
      'Get your personalized quote',
      'Schedule your preferred date',
      'We pack and protect everything',
      'Careful transport to your new home',
      'Unpack, assemble, and settle in',
    ],
  },
  'long-distance-moving': {
    title: 'Long Distance Moving',
    slug: 'long-distance-moving',
    icon: MapPin,
    tagline: 'Reliable Long Distance Moving Across America',
    headline: 'Trust Your Long Distance Move',
    highlightText: 'from Colorado',
    subheading: 'Why Our Long Distance Service Leads the Industry',
    introParagraphs: [
      "Moving across state lines requires expertise, planning, and reliable execution. Our long-distance moving service provides door-to-door care from Colorado to anywhere in the continental United States.",
      "With dedicated trucks, GPS tracking, and guaranteed delivery windows, you'll have complete peace of mind throughout your interstate relocation."
    ],
    features: [
      { title: 'Dedicated Trucks', description: 'Your belongings travel alone, not mixed with other shipments.' },
      { title: 'GPS Tracking', description: 'Real-time updates on your shipment location.' },
      { title: 'Guaranteed Delivery', description: 'Firm delivery windows with on-time guarantees.' },
      { title: 'Full Valuation Coverage', description: 'Comprehensive protection for long journeys.' },
      { title: 'Climate Control Options', description: 'Temperature-sensitive items protected en route.' },
      { title: 'Door-to-Door Service', description: 'Complete service from loading to final placement.' },
    ],
    expertCareTitle: 'Why Long Distance Moves Need Professional Handling',
    expertCareDescription: "Cross-country moves involve complex logistics, varying regulations, and extended transport times. Professional movers ensure your belongings arrive safely, on time, and in perfect condition.",
    challenges: [
      { icon: 'map', title: 'Route Planning', description: 'Optimal routes considering weather, traffic, and road conditions.' },
      { icon: 'weight', title: 'Extended Transport', description: 'Secure packing that protects during days of travel.' },
      { icon: 'shield', title: 'State Regulations', description: 'Compliance with interstate moving requirements.' },
      { icon: 'clock', title: 'Coordination', description: 'Timing arrival with your new home availability.' },
    ],
    relatedServices: [
      { slug: 'residential-movers', title: 'Residential Moving', description: 'Complete home moving services.' },
      { slug: 'heavy-items-moving', title: 'Heavy Items', description: 'Specialty items for long distance.' },
      { slug: 'local-moving', title: 'Local Moving', description: 'Short-distance moves in Denver.' },
    ],
    ctaSteps: [
      'Request a detailed quote',
      'We plan your route and timeline',
      'Professional packing and loading',
      'Tracked transport to destination',
      'Delivery and setup at your new home',
    ],
  },
  'moving-help-labor': {
    title: 'Moving Help & Labor',
    slug: 'moving-help-labor',
    icon: Users,
    tagline: 'Professional Moving Labor When You Need It',
    headline: 'Get Expert Moving Help & Labor',
    highlightText: 'in Colorado',
    subheading: 'Why Hire Professional Moving Labor',
    introParagraphs: [
      "Have your own truck, pod, or container? Our labor-only service provides the professional muscle you need without the full moving package. Trained movers, proper equipment, and efficient loading/unloading.",
      "Whether you're loading a rental truck, portable container, or storage unit, our crew handles the heavy lifting while you focus on everything else."
    ],
    features: [
      { title: 'Flexible Hourly Rates', description: 'Pay only for the time you need, with transparent pricing.' },
      { title: 'Trained Professionals', description: 'Experienced movers who know proper lifting techniques.' },
      { title: 'Equipment Included', description: 'Dollies, straps, and moving blankets provided.' },
      { title: 'Loading Expertise', description: 'Maximize space and protect items during loading.' },
      { title: 'Any Container Type', description: 'Trucks, pods, trailers, or storage units.' },
      { title: 'Same-Day Available', description: 'Last-minute help when you need it.' },
    ],
    expertCareTitle: 'Why Professional Labor Makes the Difference',
    expertCareDescription: "Even with your own truck, improper loading leads to damage and wasted space. Professional movers know how to maximize capacity, secure items properly, and work efficiently.",
    challenges: [
      { icon: 'map', title: 'Space Optimization', description: 'Fitting everything efficiently requires experience.' },
      { icon: 'weight', title: 'Heavy Items', description: 'Moving large pieces without injury or damage.' },
      { icon: 'shield', title: 'Proper Securing', description: 'Items must be secured to prevent shifting.' },
      { icon: 'clock', title: 'Efficiency', description: 'Professional crews work faster and safer.' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Full-service local moves with truck included.' },
      { slug: 'heavy-items-moving', title: 'Heavy Items', description: 'Specialty item handling.' },
      { slug: 'junk-removal', title: 'Junk Removal', description: 'Haul away unwanted items.' },
    ],
    ctaSteps: [
      'Tell us what you need loaded',
      'Get an instant hourly quote',
      'We arrive with equipment ready',
      'Efficient loading and securing',
      'You\'re ready to go!',
    ],
  },
  'heavy-items-moving': {
    title: 'Heavy Items Moving',
    slug: 'heavy-items-moving',
    icon: Dumbbell,
    tagline: 'Specialized Moving for Oversized & Heavy Items',
    headline: 'Professional Heavy Items Moving',
    highlightText: 'in Colorado',
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
      { slug: 'piano-moving', title: 'Piano Moving', description: 'Specialized piano transport.' },
      { slug: 'safe-moving', title: 'Safe Moving', description: 'Gun safe and vault relocation.' },
      { slug: 'pool-table-moving', title: 'Pool Tables', description: 'Disassembly and precision setup.' },
    ],
    ctaSteps: [
      'Describe your heavy items',
      'We assess and plan the move',
      'Specialized crew and equipment arrive',
      'Careful extraction and transport',
      'Safe placement at destination',
    ],
  },
  'piano-moving': {
    title: 'Piano Moving',
    slug: 'piano-moving',
    icon: Piano,
    tagline: 'Expert Piano Moving with Concert-Level Care',
    headline: 'Trust Your Piano to Expert Movers',
    highlightText: 'in Colorado',
    subheading: 'Why Piano Moving Requires Specialists',
    introParagraphs: [
      "Pianos are among the most challenging items to move — heavy, delicate, and irreplaceable. Our piano moving specialists combine strength with precision to protect your instrument.",
      "From spinets to concert grands, we have the experience and equipment to move any piano safely. Climate-controlled trucks, custom padding, and trained technicians ensure your piano arrives in tune."
    ],
    features: [
      { title: 'Piano Board & Straps', description: 'Custom equipment designed specifically for pianos.' },
      { title: 'Climate Control', description: 'Temperature-regulated transport protects finish and tuning.' },
      { title: 'Trained Specialists', description: 'Crew members with piano-specific moving experience.' },
      { title: 'Full Padding', description: 'Multi-layer protection for every surface.' },
      { title: 'Stair Capability', description: 'Safe navigation of stairs and tight spaces.' },
      { title: 'Tuning Partnerships', description: 'We can coordinate post-move tuning services.' },
    ],
    expertCareTitle: 'Why Your Piano Deserves Specialist Care',
    expertCareDescription: "A piano isn't just furniture — it's a precision instrument worth thousands of dollars. Internal mechanisms, finish, and tuning can all be damaged by improper moving.",
    challenges: [
      { icon: 'map', title: 'Path Planning', description: 'Measuring every doorway and turn in advance.' },
      { icon: 'weight', title: 'Extreme Weight', description: 'Grand pianos can weigh over 1,200 pounds.' },
      { icon: 'shield', title: 'Delicate Finish', description: 'Lacquer finishes scratch and chip easily.' },
      { icon: 'clock', title: 'Tuning Stability', description: 'Proper handling maintains tuning integrity.' },
    ],
    relatedServices: [
      { slug: 'heavy-items-moving', title: 'Heavy Items', description: 'Other oversized item moving.' },
      { slug: 'residential-movers', title: 'Residential Moving', description: 'Full home moving services.' },
      { slug: 'local-moving', title: 'Local Moving', description: 'Denver area relocations.' },
    ],
    ctaSteps: [
      'Tell us about your piano',
      'We assess access and requirements',
      'Specialized crew with piano equipment',
      'Careful wrapping, moving, and transport',
      'Precise placement in your new space',
    ],
  },
  'pool-table-moving': {
    title: 'Pool Table Moving',
    slug: 'pool-table-moving',
    icon: Target,
    tagline: 'Professional Pool Table Disassembly, Moving & Setup',
    headline: 'Expert Pool Table Moving',
    highlightText: 'in Colorado',
    subheading: 'Why Pool Tables Require Professional Handling',
    introParagraphs: [
      "Pool tables can't simply be carried out — they must be professionally disassembled, transported, and precisely reassembled. Our specialists ensure your table plays perfectly after the move.",
      "From slate removal to felt protection to precision leveling, we handle every step. Whether it's a 7-foot bar table or a 9-foot professional table, we have the expertise."
    ],
    features: [
      { title: 'Complete Disassembly', description: 'Rails, pockets, slate, and frame carefully separated.' },
      { title: 'Slate Protection', description: 'Heavy slate pieces wrapped and transported flat.' },
      { title: 'Felt Preservation', description: 'Careful handling to avoid tears and wrinkles.' },
      { title: 'Precision Leveling', description: 'Your table plays true after reassembly.' },
      { title: 'All Table Types', description: 'Bar tables, home tables, and professional sizes.' },
      { title: 'Re-felting Available', description: 'New felt installation if needed.' },
    ],
    expertCareTitle: 'Why Pool Table Moving Is a Specialty Service',
    expertCareDescription: "A pool table is more than furniture — it's a precision gaming surface. Improper moving can crack slate, tear felt, damage rails, and ruin the table's playability.",
    challenges: [
      { icon: 'map', title: 'Disassembly Expertise', description: 'Knowing how each table type comes apart.' },
      { icon: 'weight', title: 'Slate Weight', description: 'Three-piece slate can weigh over 450 pounds.' },
      { icon: 'shield', title: 'Component Protection', description: 'Rails, pockets, and hardware need care.' },
      { icon: 'clock', title: 'Precision Setup', description: 'Leveling requires patience and skill.' },
    ],
    relatedServices: [
      { slug: 'heavy-items-moving', title: 'Heavy Items', description: 'Other specialty item moving.' },
      { slug: 'safe-moving', title: 'Safe Moving', description: 'Gun safe relocation.' },
      { slug: 'residential-movers', title: 'Residential Moving', description: 'Complete home moves.' },
    ],
    ctaSteps: [
      'Describe your pool table',
      'We schedule disassembly day',
      'Professional breakdown and wrap',
      'Safe transport to new location',
      'Reassembly and precision leveling',
    ],
  },
  'safe-moving': {
    title: 'Safe Moving',
    slug: 'safe-moving',
    icon: Shield,
    tagline: 'Secure Gun Safe & Vault Moving Services',
    headline: 'Professional Safe Moving',
    highlightText: 'in Colorado',
    subheading: 'Why Safe Moving Requires Professionals',
    introParagraphs: [
      "Gun safes and security vaults are among the heaviest and most challenging items to move. Our safe moving specialists have the equipment and experience to relocate safes weighing up to 2,000+ pounds.",
      "From small home safes to commercial vaults, we use heavy-duty stair climbers, rigging equipment, and proper technique to move your safe without damaging your property."
    ],
    features: [
      { title: 'Heavy-Duty Equipment', description: 'Stair climbers, heavy dollies, and rigging gear.' },
      { title: 'Weight Capacity', description: 'We move safes up to 2,000+ pounds regularly.' },
      { title: 'Floor Protection', description: 'Plywood paths and surface protection.' },
      { title: 'Stair Navigation', description: 'Safe stair descent and ascent techniques.' },
      { title: 'Positioning Service', description: 'Final placement exactly where you want it.' },
      { title: 'Anchoring Available', description: 'Secure your safe to the floor at destination.' },
    ],
    expertCareTitle: 'Why Safes Demand Specialist Movers',
    expertCareDescription: "Safes combine extreme weight with awkward dimensions. Without proper equipment and technique, you risk serious injury, property damage, and damage to the safe itself.",
    challenges: [
      { icon: 'map', title: 'Weight Assessment', description: 'Accurate weight determines equipment needs.' },
      { icon: 'weight', title: 'Extreme Loads', description: 'Standard equipment can\'t handle safe weights.' },
      { icon: 'shield', title: 'Floor Loading', description: 'Distributing weight to prevent floor damage.' },
      { icon: 'clock', title: 'Careful Progress', description: 'Rushing risks catastrophic accidents.' },
    ],
    relatedServices: [
      { slug: 'heavy-items-moving', title: 'Heavy Items', description: 'Other oversized moves.' },
      { slug: 'piano-moving', title: 'Piano Moving', description: 'Another delicate specialty.' },
      { slug: 'residential-movers', title: 'Residential Moving', description: 'Full home services.' },
    ],
    ctaSteps: [
      'Tell us your safe details and weight',
      'We assess access and equipment needs',
      'Specialized crew arrives prepared',
      'Safe extraction and transport',
      'Precise placement and optional anchoring',
    ],
  },
  'same-day-moving': {
    title: 'Same-Day Moving',
    slug: 'same-day-moving',
    icon: Zap,
    tagline: 'Emergency & Same-Day Moving When Time Is Critical',
    headline: 'Same-Day Moving',
    highlightText: 'in Colorado',
    subheading: 'When You Need to Move Now',
    introParagraphs: [
      "Life doesn't always give notice. When you need to move today, our same-day moving service delivers. We maintain crews and trucks ready for urgent relocations throughout the Denver metro area.",
      "Whether it's an emergency, a last-minute lease situation, or simply a schedule that requires immediate action, we respond fast without sacrificing quality."
    ],
    features: [
      { title: 'Rapid Response', description: 'Crews dispatched within hours of your call.' },
      { title: 'Full Service Available', description: 'Same-day doesn\'t mean limited service.' },
      { title: 'Evening Moves', description: 'After-hours availability for urgent needs.' },
      { title: 'Weekend Service', description: 'Saturday and Sunday same-day moves.' },
      { title: 'Transparent Pricing', description: 'Same fair rates as scheduled moves.' },
      { title: 'Professional Quality', description: 'Fast doesn\'t mean careless.' },
    ],
    expertCareTitle: 'Why Choose Professional Same-Day Service',
    expertCareDescription: "Emergency moves are stressful enough without amateur help. Professional same-day movers bring efficiency and expertise to urgent situations.",
    challenges: [
      { icon: 'map', title: 'Quick Planning', description: 'Rapid assessment and crew dispatch.' },
      { icon: 'weight', title: 'Efficient Packing', description: 'Fast but careful packing under time pressure.' },
      { icon: 'shield', title: 'No Shortcuts', description: 'Maintaining quality despite urgency.' },
      { icon: 'clock', title: 'Time Pressure', description: 'Meeting tight deadlines reliably.' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Standard local moves when time allows.' },
      { slug: 'moving-help-labor', title: 'Moving Labor', description: 'Quick help with your truck.' },
      { slug: 'residential-movers', title: 'Residential Moving', description: 'Full home moving services.' },
    ],
    ctaSteps: [
      'Call or submit urgent request',
      'We confirm crew availability',
      'Team dispatched to your location',
      'Efficient packing and loading',
      'Same-day delivery and setup',
    ],
  },
  'junk-removal': {
    title: 'Junk Removal',
    slug: 'junk-removal',
    icon: Trash2,
    tagline: 'Fast, Responsible Junk & Debris Removal',
    headline: 'Professional Junk Removal',
    highlightText: 'in Colorado',
    subheading: 'Clear the Clutter with Our Junk Removal Service',
    introParagraphs: [
      "Whether you're preparing for a move, clearing an estate, or just decluttering, our junk removal service makes it easy. We haul away furniture, appliances, yard waste, and general debris.",
      "We prioritize responsible disposal — donating usable items and recycling materials whenever possible. You get a clean space, and we handle the heavy lifting and hauling."
    ],
    features: [
      { title: 'Same-Day Available', description: 'Rapid response for urgent cleanouts.' },
      { title: 'Upfront Pricing', description: 'Quotes before we start, no surprises.' },
      { title: 'Responsible Disposal', description: 'Donation and recycling whenever possible.' },
      { title: 'Any Size Job', description: 'Single items to full property cleanouts.' },
      { title: 'Interior & Exterior', description: 'We clear basements, garages, and yards.' },
      { title: 'Estate Cleanouts', description: 'Sensitive handling of estate clearances.' },
    ],
    expertCareTitle: 'Why Professional Junk Removal Makes Sense',
    expertCareDescription: "Hauling junk yourself means truck rentals, dump fees, multiple trips, and heavy lifting. Our crews handle everything efficiently and dispose of items responsibly.",
    challenges: [
      { icon: 'map', title: 'Disposal Logistics', description: 'Knowing where different items should go.' },
      { icon: 'weight', title: 'Heavy Items', description: 'Furniture and appliances require muscle.' },
      { icon: 'shield', title: 'Responsible Disposal', description: 'Avoiding improper dumping.' },
      { icon: 'clock', title: 'Time Savings', description: 'We do in hours what takes you days.' },
    ],
    relatedServices: [
      { slug: 'moving-help-labor', title: 'Moving Labor', description: 'Help with your moving project.' },
      { slug: 'local-moving', title: 'Local Moving', description: 'Full-service local moves.' },
      { slug: 'same-day-moving', title: 'Same-Day Moving', description: 'Urgent moving services.' },
    ],
    ctaSteps: [
      'Tell us what needs to go',
      'Get an upfront quote',
      'We arrive and assess',
      'Load everything onto our truck',
      'Responsible disposal and recycling',
    ],
  },
};

export const allServices = Object.values(servicesData);
export const servicesList = Object.keys(servicesData);
