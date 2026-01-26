import { 
  Truck, Dumbbell, Building, Home, Users, Zap, Piano, Package, Shield, LucideIcon,
  MapPin, Trash2, Clock
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

export interface SubService {
  title: string;
  description: string;
  icon: LucideIcon;
  closed?: boolean;
  comingSoon?: boolean;
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
  subServices?: SubService[];
  hasSameDay?: boolean;
  closed?: boolean; // Service temporarily not available
  comingSoon?: boolean; // Service planned but not yet launched
  // SEO fields
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export const servicesData: Record<string, ServiceData> = {
  'local-moving': {
    title: 'Local Moving',
    slug: 'local-moving',
    icon: Truck,
    tagline: 'Your Trusted Partner for Stress-Free Local Moves',
    headline: 'Professional Local Moving',
    highlightText: 'Made Simple',
    subheading: 'Apartments, Houses, Labor-Only & Same-Day Moves',
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
    subServices: [
      { title: 'Apartment & Condo Moving', description: 'Studios to 4+ BR apartments and high-rise condos', icon: Building },
      { title: 'House & Townhouse Moving', description: 'Single-family homes, townhouses, and duplexes', icon: Home },
      { title: 'Labor-Only Moving Help', description: 'Loading/unloading for your truck, pod, or container', icon: Users },
      { title: 'Same-Day Moving', description: 'Emergency moves — call now for immediate service', icon: Zap },
    ],
    hasSameDay: true,
    // SEO
    metaTitle: 'Local Moving Services Denver - Professional Movers | Handledly Moving Services',
    metaDescription: "Denver's top-rated local movers. Flat hourly rates, no hidden fees. Apartments, houses, same-day available. Licensed & insured. Get your free quote today!",
    keywords: ['local moving Denver', 'Denver movers', 'apartment moving', 'house moving', 'local movers near me', 'same day moving Denver'],
  },
  'heavy-items-moving': {
    title: 'Heavy Items Moving',
    slug: 'heavy-items-moving',
    icon: Dumbbell,
    tagline: 'Specialized Moving for Oversized & Heavy Items',
    headline: 'Professional Heavy Items Moving',
    highlightText: 'Done Right',
    subheading: 'Pianos, Pool Tables, Safes & Oversized Items',
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
    subServices: [
      { title: 'Piano Moving', description: 'Upright and grand pianos moved with precision', icon: Piano, closed: true },
      { title: 'Pool Table Moving', description: 'Disassembly, transport, and expert reassembly', icon: Package },
      { title: 'Heavy Items (Under 300 lbs)', description: 'Appliances, large furniture, gym equipment', icon: Dumbbell },
      { title: 'Heavy Items (300+ lbs)', description: 'Safes, gun safes, commercial equipment', icon: Shield },
      { title: 'Same-Day Heavy Items', description: 'Emergency heavy item moves available', icon: Zap },
    ],
    hasSameDay: true,
    // SEO
    metaTitle: 'Heavy Item Movers Denver - Pianos, Safes, Pool Tables | Handledly Moving Services',
    metaDescription: 'Specialized heavy item moving in Denver. Safe transport for pianos, pool tables, safes, and 300+ lb items. Licensed and insured professionals. Free quotes!',
    keywords: ['heavy item moving Denver', 'heavy furniture movers', 'oversized item moving', 'specialty movers Denver'],
  },
  'piano-moving': {
    title: 'Piano Moving',
    slug: 'piano-moving',
    icon: Piano,
    tagline: 'Expert Piano Moving with Precision Care',
    headline: 'Professional Piano Moving',
    highlightText: 'Handled with Care',
    subheading: 'Upright, Grand & Baby Grand Piano Specialists',
    closed: true, // Temporarily not available
    introParagraphs: [
      "Pianos are among the most challenging items to move. Their weight, delicate mechanisms, and sentimental value demand specialized expertise. Our piano movers have the training, equipment, and experience to ensure your instrument arrives in perfect condition.",
      "From upright pianos to concert grands, we use specialized piano boards, custom straps, and climate-controlled transport when needed. Your piano's safety is our top priority."
    ],
    features: [
      { title: 'Specialized Piano Boards', description: 'Custom equipment designed specifically for piano transport.' },
      { title: 'Trained Piano Movers', description: 'Crew members with specific piano handling certification.' },
      { title: 'Full Wrapping Protection', description: 'Multiple layers of padding and stretch wrap protection.' },
      { title: 'Climate Consideration', description: 'Careful planning to protect from temperature extremes.' },
      { title: 'Stair & Lift Capable', description: 'Equipment for multi-floor piano moves.' },
      { title: 'Post-Move Tuning Referrals', description: 'We partner with local piano tuners for after-move service.' },
    ],
    expertCareTitle: 'Why Piano Moving Requires Specialists',
    expertCareDescription: "Pianos weigh 300-1,400 pounds and contain thousands of delicate parts. A single mistake can cause thousands in damage or permanent harm to the instrument's sound quality.",
    challenges: [
      { icon: 'weight', title: 'Extreme Weight', description: 'Grand pianos can weigh over 1,000 pounds, requiring specialized equipment.' },
      { icon: 'shield', title: 'Delicate Internals', description: 'Soundboards, hammers, and strings are extremely fragile.' },
      { icon: 'map', title: 'Awkward Shape', description: 'Grand pianos require careful navigation through doorways and turns.' },
      { icon: 'clock', title: 'No Rush Jobs', description: 'Piano moving cannot be hurried—precision takes time.' },
    ],
    relatedServices: [
      { slug: 'heavy-items-moving', title: 'Heavy Items Moving', description: 'Specialty moving for other oversized pieces.' },
      { slug: 'local-moving', title: 'Local Moving', description: 'Full-service local moves.' },
    ],
    ctaSteps: [
      'Tell us about your piano',
      'We assess access and plan the route',
      'Piano specialists arrive with proper equipment',
      'Careful wrapping, loading, and transport',
      'Safe placement and unwrapping at destination',
    ],
    // SEO
    metaTitle: 'Piano Moving Denver - Safe & Professional Transport | Handledly Moving Services',
    metaDescription: 'Expert piano movers in Denver. Upright and grand pianos moved with precision care. Specialized equipment and trained professionals. Get your free quote!',
    keywords: ['piano moving Denver', 'piano movers', 'grand piano moving', 'upright piano moving', 'piano transport Denver'],
  },
  'pool-table-moving': {
    title: 'Pool Table Moving',
    slug: 'pool-table-moving',
    icon: Package,
    tagline: 'Expert Pool Table Disassembly, Moving & Reassembly',
    headline: 'Professional Pool Table Moving',
    highlightText: 'Level Perfection',
    subheading: 'Complete Disassembly, Transport & Expert Reassembly',
    introParagraphs: [
      "Pool tables require complete disassembly before moving—attempting to move one intact risks destroying the slate and frame. Our specialists handle every step, from felt removal to precision re-leveling at your new location.",
      "We move all types: 7-foot bar tables, 8-foot home tables, and 9-foot professional tables. Slate, MDF, and coin-operated tables all handled with expertise."
    ],
    features: [
      { title: 'Complete Disassembly', description: 'Rails, pockets, felt, and slate carefully removed.' },
      { title: 'Slate Protection', description: 'Each slate piece individually wrapped and protected.' },
      { title: 'Expert Reassembly', description: 'Precision reassembly with professional leveling.' },
      { title: 'Felt Options', description: 'Re-use existing felt or install new cloth.' },
      { title: 'All Table Types', description: 'Bar, home, and professional tables.' },
      { title: 'Same Location Service', description: 'Re-felting and leveling without moving.' },
    ],
    expertCareTitle: 'Why Pool Tables Need Professional Moving',
    expertCareDescription: "Pool table slates weigh 150-450 pounds each and can crack if not handled properly. The felt tears easily, and the frame can warp. Professional disassembly is the only safe option.",
    challenges: [
      { icon: 'weight', title: 'Heavy Slate', description: 'Three-piece slate can weigh over 800 pounds total.' },
      { icon: 'shield', title: 'Fragile Felt', description: 'Pool table felt tears easily and wrinkles are permanent.' },
      { icon: 'map', title: 'Precision Leveling', description: 'Tables must be perfectly level for proper play.' },
      { icon: 'clock', title: 'Time-Intensive', description: 'Proper reassembly takes 2-3 hours minimum.' },
    ],
    relatedServices: [
      { slug: 'heavy-items-moving', title: 'Heavy Items Moving', description: 'Other specialty item moving.' },
      { slug: 'local-moving', title: 'Local Moving', description: 'Full-service local moves.' },
    ],
    ctaSteps: [
      'Describe your pool table',
      'We assess and provide a quote',
      'Specialists disassemble and protect',
      'Safe transport to new location',
      'Expert reassembly and leveling',
    ],
    // SEO
    metaTitle: 'Pool Table Movers Denver - Expert Disassembly & Setup | Handledly Moving Services',
    metaDescription: 'Professional pool table moving in Denver. Complete disassembly, safe transport, and expert reassembly with precision leveling. Fully insured service. Free quotes!',
    keywords: ['pool table moving Denver', 'pool table movers', 'billiard table moving', 'pool table disassembly', 'pool table reassembly Denver'],
  },
  'safe-moving': {
    title: 'Safe Moving',
    slug: 'safe-moving',
    icon: Shield,
    tagline: 'Heavy Safe Transport by Trained Specialists',
    headline: 'Professional Safe Moving',
    highlightText: 'Secured Transport',
    subheading: 'Gun Safes, Commercial Safes & Vault Moving',
    introParagraphs: [
      "Safes present unique moving challenges: extreme weight in a compact space, potential floor damage, and the need for discretion. Our safe moving specialists have the equipment and technique to move safes up to 2,000+ pounds.",
      "Whether it's a 200-pound gun safe or an 800-pound commercial vault, we ensure safe extraction, transport, and placement without damaging your property or the safe itself."
    ],
    features: [
      { title: 'Heavy-Duty Equipment', description: 'Stair climbers and specialized dollies for extreme weight.' },
      { title: 'Floor Protection', description: 'Plywood paths and mats to prevent floor damage.' },
      { title: 'Discrete Service', description: 'Unmarked trucks and professional discretion.' },
      { title: 'All Safe Types', description: 'Gun safes, fire safes, commercial vaults, data safes.' },
      { title: 'Anchoring Available', description: 'Bolt-down installation at destination.' },
      { title: 'Stair Capable', description: 'Equipment and technique for multi-floor moves.' },
    ],
    expertCareTitle: 'Why Safe Moving Requires Specialists',
    expertCareDescription: "A 600-pound safe on stairs is extremely dangerous without proper equipment. The concentrated weight can crack floors, damage walls, and cause serious injury. Professional movers eliminate these risks.",
    challenges: [
      { icon: 'weight', title: 'Extreme Weight', description: 'Many safes weigh 500-2,000+ pounds.' },
      { icon: 'map', title: 'Tight Spaces', description: 'Safes often must navigate narrow doorways and stairs.' },
      { icon: 'shield', title: 'Floor Damage Risk', description: 'Concentrated weight can crack tiles and dent hardwood.' },
      { icon: 'clock', title: 'Safety Critical', description: 'Rushing safe moves leads to injury and damage.' },
    ],
    relatedServices: [
      { slug: 'heavy-items-moving', title: 'Heavy Items Moving', description: 'Other specialty item moving.' },
      { slug: 'local-moving', title: 'Local Moving', description: 'Full-service local moves.' },
    ],
    ctaSteps: [
      'Describe your safe (size, weight, location)',
      'We assess access and provide a quote',
      'Specialists arrive with proper equipment',
      'Safe extraction with floor protection',
      'Secure placement at destination',
    ],
    // SEO
    metaTitle: 'Safe Moving Denver - Heavy Safe Transport Specialists | Handledly Moving Services',
    metaDescription: 'Professional safe moving in Denver. Gun safes, commercial safes up to 2,000+ lbs. Specialized equipment, floor protection, and discrete service. Free quotes!',
    keywords: ['safe moving Denver', 'gun safe movers', 'heavy safe moving', 'vault moving', 'safe transport Denver'],
  },
  'junk-removal': {
    title: 'Junk Removal',
    slug: 'junk-removal',
    icon: Trash2,
    tagline: 'Fast & Eco-Friendly Junk Hauling Services',
    headline: 'Professional Junk Removal',
    highlightText: 'Gone Today',
    subheading: 'Furniture, Appliances, Construction Debris & More',
    closed: true, // Temporarily not available
    introParagraphs: [
      "Need stuff gone fast? Our junk removal team handles everything from old furniture to construction debris. We do the heavy lifting while you point and watch. Same-day service available throughout Denver.",
      "We're committed to responsible disposal: items are recycled, donated, or properly disposed of. You get a clean space, and we minimize landfill impact."
    ],
    features: [
      { title: 'Same-Day Pickup', description: 'Call today, gone today — when you need it fast.' },
      { title: 'All Item Types', description: 'Furniture, appliances, mattresses, yard waste, debris.' },
      { title: 'Eco-Friendly Disposal', description: 'Recycling and donation partnerships.' },
      { title: 'Volume-Based Pricing', description: 'Pay only for the space your junk takes.' },
      { title: 'Full-Service Removal', description: 'We load everything — you don\'t lift a finger.' },
      { title: 'Property Cleanouts', description: 'Estate, foreclosure, and rental cleanouts.' },
    ],
    expertCareTitle: 'Why Choose Professional Junk Removal',
    expertCareDescription: "DIY junk disposal means multiple dump trips, rental costs, and heavy lifting. Our team handles everything in one visit, saving you time and hassle while ensuring proper disposal.",
    challenges: [
      { icon: 'weight', title: 'Heavy Items', description: 'Old furniture and appliances are difficult to move alone.' },
      { icon: 'map', title: 'Disposal Logistics', description: 'Different items require different disposal methods.' },
      { icon: 'clock', title: 'Time Consuming', description: 'Multiple trips to donation centers and dumps.' },
      { icon: 'shield', title: 'Proper Disposal', description: 'Some items require special handling (electronics, chemicals).' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Moving to a new home? We can help there too.' },
      { slug: 'moving-help-labor', title: 'Moving Labor', description: 'Need help loading or organizing?' },
    ],
    ctaSteps: [
      'Tell us what needs to go',
      'We provide a volume-based quote',
      'Crew arrives at scheduled time',
      'We load everything for you',
      'Items recycled, donated, or disposed properly',
    ],
    // SEO
    metaTitle: 'Junk Removal Denver - Fast & Affordable Hauling | Handledly Moving Services',
    metaDescription: 'Denver junk removal services. Same-day pickup, eco-friendly disposal. Furniture, appliances, construction debris removed. Volume-based pricing. Free estimates!',
    keywords: ['junk removal Denver', 'junk hauling', 'furniture removal', 'appliance removal Denver', 'debris removal', 'cleanout services Denver'],
  },
  'long-distance-moving': {
    title: 'Long Distance Moving',
    slug: 'long-distance-moving',
    icon: MapPin,
    tagline: 'Interstate Moving with Full-Service Care',
    headline: 'Professional Long Distance Moving',
    highlightText: 'Coast to Coast',
    subheading: 'Licensed Interstate Movers You Can Trust',
    introParagraphs: [
      "Moving out of state requires a different level of planning and execution. As licensed interstate movers, we handle every detail of your long-distance relocation with the same care we bring to local moves.",
      "From detailed inventory management to GPS tracking and guaranteed delivery windows, we ensure your belongings arrive safely at your new home, wherever that may be."
    ],
    features: [
      { title: 'Licensed Interstate', description: 'Fully licensed and compliant for cross-state moves.' },
      { title: 'Full-Service Packing', description: 'Professional packing with quality materials included.' },
      { title: 'GPS Tracking', description: 'Track your belongings throughout transport.' },
      { title: 'Guaranteed Delivery', description: 'Delivery windows you can count on.' },
      { title: 'Full Valuation Options', description: 'Comprehensive protection for your belongings.' },
      { title: 'Storage Solutions', description: 'Short and long-term storage available.' },
    ],
    expertCareTitle: 'Why Long Distance Moves Need Experts',
    expertCareDescription: "Interstate moves involve federal regulations, complex logistics, and extended transport times. Professional long-distance movers handle these complexities while you focus on your new beginning.",
    challenges: [
      { icon: 'map', title: 'Logistics Complexity', description: 'Coordinating pickup, transport, and delivery across states.' },
      { icon: 'shield', title: 'Extended Protection', description: 'Items in transit for days need extra protection.' },
      { icon: 'clock', title: 'Timing Coordination', description: 'Aligning move-out and move-in dates precisely.' },
      { icon: 'weight', title: 'Inventory Management', description: 'Tracking everything across hundreds of miles.' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Need local help at your destination?' },
      { slug: 'heavy-items-moving', title: 'Heavy Items Moving', description: 'Specialty items moving long distance.' },
    ],
    ctaSteps: [
      'Request a long-distance quote',
      'Virtual or in-home inventory assessment',
      'Detailed moving plan and timeline',
      'Professional packing and loading',
      'Safe delivery to your new home',
    ],
    // SEO
    metaTitle: 'Long Distance Moving Denver - Interstate Movers | Handledly Moving Services',
    metaDescription: 'Professional long distance moving from Denver. Licensed interstate movers with full-service packing, GPS tracking, and guaranteed delivery. Get your free quote!',
    keywords: ['long distance moving Denver', 'interstate movers', 'cross country moving', 'out of state movers Denver', 'long distance movers'],
  },
  'residential-movers': {
    title: 'Residential Moving',
    slug: 'residential-movers',
    icon: Home,
    tagline: 'Complete Home Moving Solutions',
    headline: 'Professional Residential Moving',
    highlightText: 'Your Home, Our Care',
    subheading: 'Full-Service Home Moving for Families',
    introParagraphs: [
      "Your home holds your life's memories and treasures. Our residential moving service treats every item with the care it deserves—from family heirlooms to everyday essentials.",
      "We offer complete moving packages that include packing, loading, transport, unloading, and furniture assembly. You focus on your family; we handle the heavy lifting."
    ],
    features: [
      { title: 'Full Packing Service', description: 'Professional packing with all materials included.' },
      { title: 'Furniture Protection', description: 'Blankets, stretch wrap, and corner guards on everything.' },
      { title: 'Assembly Included', description: 'Furniture disassembly and reassembly at no extra charge.' },
      { title: 'All Home Sizes', description: 'Studios to 5+ bedroom estates.' },
      { title: 'Flexible Scheduling', description: 'Weekday, weekend, and after-hours availability.' },
      { title: 'One Point of Contact', description: 'Dedicated coordinator for your entire move.' },
    ],
    expertCareTitle: 'Why Families Choose Professional Movers',
    expertCareDescription: "Moving a household is overwhelming. Between work, kids, and daily life, who has time to pack, load, drive, and unload? Professional movers let you focus on your family during this transition.",
    challenges: [
      { icon: 'weight', title: 'Volume of Items', description: 'Homes accumulate a lot—packing takes longer than expected.' },
      { icon: 'shield', title: 'Fragile Memories', description: 'Family photos, artwork, and heirlooms need special care.' },
      { icon: 'clock', title: 'Coordination', description: 'Timing move-out, cleaning, and move-in is stressful.' },
      { icon: 'map', title: 'The Whole Picture', description: 'Garage, attic, basement—it all needs to move.' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Short-distance residential moves.' },
      { slug: 'long-distance-moving', title: 'Long Distance Moving', description: 'Moving to a new city or state.' },
    ],
    ctaSteps: [
      'Request your free home moving quote',
      'We assess your home and belongings',
      'Receive a detailed moving plan',
      'Professional crew packs and loads',
      'Unload and set up in your new home',
    ],
    // SEO
    metaTitle: 'Residential Moving Denver - Home Moving Experts | Handledly Moving Services',
    metaDescription: 'Denver residential movers for homes of all sizes. Complete moving services with packing, furniture protection, and assembly included. Free estimates!',
    keywords: ['residential moving Denver', 'home movers', 'house moving', 'family moving services', 'residential movers near me'],
  },
  'same-day-moving': {
    title: 'Same-Day Moving',
    slug: 'same-day-moving',
    icon: Zap,
    tagline: 'Emergency Moving When You Need It Now',
    headline: 'Same-Day Moving',
    highlightText: 'Fast Response',
    subheading: 'Last-Minute & Emergency Move Specialists',
    introParagraphs: [
      "Life happens fast. Lease fell through? Job transfer? Family emergency? Our same-day moving service gets you moved when time is critical. Call now and we'll have a crew to you today.",
      "Same urgency, same quality. We don't cut corners just because we're moving fast. Your belongings get the same protection and care as any scheduled move."
    ],
    features: [
      { title: 'Same-Day Availability', description: 'Call by noon, move by evening.' },
      { title: 'Rapid Response', description: 'Crews ready to deploy within hours.' },
      { title: 'Full Service', description: 'Packing materials and protection included.' },
      { title: 'Any Size Move', description: 'Studios to full homes on short notice.' },
      { title: 'Weekend & Holiday', description: 'Available 7 days a week.' },
      { title: 'No Rush Surcharges', description: 'Transparent pricing even for urgent moves.' },
    ],
    expertCareTitle: 'Why Same-Day Moving Works',
    expertCareDescription: "We maintain dedicated crews and equipment specifically for last-minute moves. This isn't about scrambling—it's about being prepared for the unexpected so you don't have to be.",
    challenges: [
      { icon: 'clock', title: 'Time Pressure', description: 'Everything needs to happen today—no room for delays.' },
      { icon: 'map', title: 'Quick Planning', description: 'Rapid assessment of what needs to move and how.' },
      { icon: 'weight', title: 'Efficient Loading', description: 'Maximizing truck space when there\'s no second trip.' },
      { icon: 'shield', title: 'Maintaining Quality', description: 'Speed without sacrificing care.' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Need to schedule ahead?' },
      { slug: 'moving-help-labor', title: 'Moving Labor', description: 'Just need loading/unloading help?' },
    ],
    ctaSteps: [
      'Call us now for availability',
      'Quick phone assessment',
      'Crew dispatched to your location',
      'Rapid but careful packing and loading',
      'Delivered and unloaded the same day',
    ],
    // SEO
    metaTitle: 'Same-Day Moving Denver - Emergency Move Service | Handledly Moving Services',
    metaDescription: 'Need to move today? Denver same-day moving specialists. Fast response, professional service, competitive rates. Call now for immediate availability!',
    keywords: ['same day moving Denver', 'emergency movers', 'last minute moving', 'urgent moving service', 'same day movers near me'],
  },
  'moving-help-labor': {
    title: 'Moving Labor',
    slug: 'moving-help-labor',
    icon: Users,
    tagline: 'Professional Loading & Unloading Assistance',
    headline: 'Moving Labor Help',
    highlightText: 'Your Truck, Our Muscle',
    subheading: 'Loading, Unloading & Packing for Your Move',
    introParagraphs: [
      "Rented a truck? Have a PODS container? Moving a storage unit? Our labor-only service provides the professional muscle you need without paying for a truck you don't.",
      "Our trained movers handle loading, unloading, and packing with the same care as our full-service moves. You control the vehicle; we handle the heavy lifting."
    ],
    features: [
      { title: 'Flexible Hours', description: 'Book 2 hours or all day—whatever you need.' },
      { title: 'All Vehicles', description: 'Trucks, trailers, PODS, containers, storage units.' },
      { title: 'Efficient Loading', description: 'Professional techniques maximize space.' },
      { title: 'Furniture Protection', description: 'We bring blankets and straps.' },
      { title: 'Packing Help', description: 'Add packing assistance if needed.' },
      { title: 'Affordable Rates', description: 'Pay only for labor, not truck fees.' },
    ],
    expertCareTitle: 'Why Hire Professional Loading Help',
    expertCareDescription: "Renting a truck is the easy part. Loading it properly—protecting furniture, maximizing space, securing items—takes experience. Our crews load hundreds of trucks per year.",
    challenges: [
      { icon: 'weight', title: 'Heavy Lifting', description: 'Furniture and boxes are heavier than they look.' },
      { icon: 'map', title: 'Space Optimization', description: 'Poor loading means multiple trips or damaged items.' },
      { icon: 'shield', title: 'Damage Prevention', description: 'Items shift and break without proper securing.' },
      { icon: 'clock', title: 'Time Efficiency', description: 'Pros load faster than DIY attempts.' },
    ],
    relatedServices: [
      { slug: 'local-moving', title: 'Local Moving', description: 'Need the full package with truck?' },
      { slug: 'same-day-moving', title: 'Same-Day Moving', description: 'Urgent help needed today?' },
    ],
    ctaSteps: [
      'Tell us about your vehicle and items',
      'We provide an hourly quote',
      'Crew arrives at your location',
      'Professional loading or unloading',
      'You drive—we did the hard part',
    ],
    // SEO
    metaTitle: 'Moving Labor Denver - Loading & Unloading Help | Handledly Moving Services',
    metaDescription: 'Professional moving labor in Denver. Loading, unloading, packing help for your truck, PODS, or container. Hourly rates, experienced crews. Free estimates!',
    keywords: ['moving labor Denver', 'loading help', 'unloading help', 'moving helpers', 'labor only movers Denver', 'truck loading service'],
  },
};

// Export all services as an array for iteration
export const allServices = Object.values(servicesData);

// Helper to get service by slug
export function getServiceBySlug(slug: string): ServiceData | undefined {
  return servicesData[slug];
}
