// Quote Calculation Engine for Handledly Moving Services
// Flat Hourly Rate Model - NO HIDDEN FEES

export type ServiceType = 'local-moving' | 'heavy-items';
export type LocalMovingSubType = 'apartment-condo' | 'house-townhouse' | 'labor-only' | 'same-day-local';
export type HeavyItemsSubType = 'piano' | 'pool-table' | 'heavy-under-200' | 'heavy-over-200' | 'same-day-heavy';

export interface QuoteInput {
  serviceType: ServiceType;
  subType?: LocalMovingSubType | HeavyItemsSubType | string; // Allow string for Iron Law detection
  bedrooms?: number;
  estimatedHours?: number;
  crewConfig?: string;
  specialtyItems?: string[];
  moveDate?: Date;
  isSameDay?: boolean;
}

export interface QuoteBreakdown {
  hourlyRate: number;
  crewSize: number;
  estimatedHours: number;
  laborCost: number;
  specialtyFee: number;
  total: number;
  inclusions: string[];
  hasTruck: boolean;
  isIronLaw?: boolean; // True when 200lb Iron Law applies (3 movers @ $179/hr)
}

// FLAT HOURLY RATES - Professional Pricing (Updated February 2026)
export const HOURLY_RATES = {
  // Labor Only (no truck)
  'labor-2-movers': 139,
  'labor-3-movers': 169,
  'labor-4-movers': 239,
  // Moving (with truck)
  'moving-2-movers': 159,
  'moving-3-movers': 189,
  'moving-3-movers-2-trucks': 209,
  'moving-4-movers': 259,
  // Heavy Items (by situation)
  'heavy-items': 169,
  // Iron Law Rate - 200+ lbs items REQUIRE 3 movers minimum at this rate
  // NOTE: Iron Law (3 movers + truck) = $189/hr, 3 movers labor only = $179/hr
  'iron-law-minimum': 189,
} as const;

// Electronic payment processing fee
export const ELECTRONIC_PAYMENT_FEE = 5;

// Negotiation flexibility - $10 discount if customer hesitates
export const NEGOTIATION_DISCOUNT = 10;

// Specialty item flat fees (for heavy/specialty items)
const SPECIALTY_RATES: Record<string, number> = {
  'piano-upright': 250,
  'piano-grand': 450,
  'pool-table-move': 350,
  'pool-table-full': 550,
  'safe-small': 150,
  'safe-large': 300,
  'safe-gun': 400,
  'hot-tub': 400,
  'gym-equipment': 125,
  'motorcycle': 200,
};

// What's included with every move - NO EXTRA CHARGES
export const INCLUDED_WITH_EVERY_MOVE = [
  'Professional moving crew',
  'Moving truck with fuel included',
  'All packing materials (blankets, wrap, tape)',
  'Furniture disassembly & reassembly',
  'No stair or elevator fees',
  'No truck/fuel surcharges',
  'Free basic packing supplies',
];

// 200LB IRON LAW - CRITICAL SAFETY REQUIREMENT
// Any item 200+ lbs requires MINIMUM 3 movers - NO EXCEPTIONS
// RATE DISTINCTION:
//   - $189/hr = Iron Law WITH TRUCK (default, most common)
//   - $179/hr = Iron Law LABOR-ONLY (rare, customer has own truck)
export const IRON_LAW_WEIGHT_THRESHOLD = 200;
export const IRON_LAW_MIN_CREW = 3;
export const IRON_LAW_RATE = 189; // WITH TRUCK (default for most customers)
export const IRON_LAW_LABOR_ONLY_RATE = 179; // LABOR-ONLY (rare)

// Crew configurations for local moving (Updated February 2026)
export const CREW_CONFIGURATIONS = [
  { value: 'labor-2-movers', label: 'Labor Only - 2 Movers', rate: 139, hasTruck: false, crew: 2, description: 'Loading/unloading help' },
  { value: 'moving-2-movers', label: '2 Movers + Truck', rate: 159, hasTruck: true, crew: 2, description: 'Studios & 1-2 BR', popular: true },
  { value: 'labor-3-movers', label: 'Labor Only - 3 Movers', rate: 169, hasTruck: false, crew: 3, description: 'Larger jobs or 200+ lb items' },
  { value: 'moving-3-movers', label: '3 Movers + Truck', rate: 189, hasTruck: true, crew: 3, description: '2-3 BR or heavy items' },
  { value: 'moving-3-movers-2-trucks', label: '3 Movers + 2 Trucks', rate: 209, hasTruck: true, crew: 3, description: 'When more capacity needed' },
  { value: 'labor-4-movers', label: 'Labor Only - 4 Movers', rate: 239, hasTruck: false, crew: 4, description: 'Large loading projects' },
  { value: 'moving-4-movers', label: '4 Movers + Truck', rate: 259, hasTruck: true, crew: 4, description: '3-4 BR homes' },
] as const;

// IRON LAW SERVICES - require 3 movers @ $189/hr for safety
// These services involve 200+ lb items that mandate Iron Law enforcement
// NOTE: Pool tables are NOT Iron Law - they use $169/hr heavy items rate with 2 movers
export const IRON_LAW_SERVICES = [
  'piano-moving',
  'safe-moving',
  'piano',           // subType from heavy-items
  'heavy-over-200',  // subType for 200+ lb items
] as const;

// Check if a service requires Iron Law enforcement
export function isIronLawService(serviceType: string, subType?: string): boolean {
  // Check main service type
  if (IRON_LAW_SERVICES.includes(serviceType as any)) {
    return true;
  }
  // Check subType if provided
  if (subType && IRON_LAW_SERVICES.includes(subType as any)) {
    return true;
  }
  return false;
}

// Estimate crew size based on service and property
// IRON LAW: 200+ lb items (pianos, safes, hot tubs) = 3 movers minimum
// NOTE: Pool tables are NOT Iron Law - handled at $169/hr with 2-3 movers
function estimateCrewSize(input: QuoteInput): number {
  // IRON LAW ENFORCEMENT: Heavy item services get 3 movers automatically
  if (isIronLawService(input.serviceType as string, input.subType)) {
    return IRON_LAW_MIN_CREW; // 3 movers
  }
  
  const bedrooms = input.bedrooms || 0;
  
  switch (input.serviceType) {
    case 'local-moving':
      return bedrooms <= 2 ? 2 : bedrooms <= 3 ? 3 : 4;
    default:
      return 2;
  }
}

// Estimate hours based on service and property
function estimateHours(input: QuoteInput): number {
  if (input.estimatedHours) return input.estimatedHours;
  
  const bedrooms = input.bedrooms || 0;
  
  switch (input.serviceType) {
    case 'local-moving':
      return Math.max(2, 2 + bedrooms);
    case 'heavy-items':
      return 2;
    default:
      return 3;
  }
}

// Get hourly rate based on crew configuration
function getHourlyRate(crewConfig: string | undefined, crewSize: number): number {
  if (crewConfig && HOURLY_RATES[crewConfig as keyof typeof HOURLY_RATES]) {
    return HOURLY_RATES[crewConfig as keyof typeof HOURLY_RATES];
  }
  
  // Default to moving with truck rates
  if (crewSize <= 2) return HOURLY_RATES['moving-2-movers'];
  if (crewSize === 3) return HOURLY_RATES['moving-3-movers'];
  return HOURLY_RATES['moving-4-movers'];
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const crewSize = estimateCrewSize(input);
  const estimatedHours = Math.ceil(estimateHours(input));
  
  // IRON LAW: 200+ lb services (piano, safe, hot tub) use $189/hr rate
  // NOTE: Pool tables are NOT Iron Law - they use $169/hr heavy items rate
  const isIronLaw = isIronLawService(input.serviceType as string, input.subType);
  
  let hourlyRate: number;
  if (isIronLaw) {
    // IRON LAW RATE: $179/hr for all heavy item services
    hourlyRate = IRON_LAW_RATE;
  } else if (input.serviceType === 'heavy-items') {
    // Fallback for generic heavy-items (shouldn't hit this due to isIronLawService check)
    hourlyRate = HOURLY_RATES['heavy-items'];
  } else {
    hourlyRate = getHourlyRate(input.crewConfig, crewSize);
  }
  
  // Base labor cost
  const laborCost = hourlyRate * estimatedHours;
  
  // Specialty items fee (only for specific heavy items)
  let specialtyFee = 0;
  if (input.specialtyItems && input.specialtyItems.length > 0) {
    specialtyFee = input.specialtyItems.reduce((sum, item) => {
      return sum + (SPECIALTY_RATES[item] || 0);
    }, 0);
  }
  
  // Total with NO hidden fees
  const total = laborCost + specialtyFee;
  
  const hasTruck = input.crewConfig 
    ? input.crewConfig.startsWith('moving-')
    : true;
  
  return {
    hourlyRate,
    crewSize,
    estimatedHours,
    laborCost,
    specialtyFee,
    total,
    inclusions: INCLUDED_WITH_EVERY_MOVE,
    hasTruck,
    isIronLaw, // Include Iron Law flag for downstream use
  };
}

// Main service categories with sub-types
export const SERVICE_TYPES = [
  { 
    value: 'local-moving', 
    label: 'Local Moving',
    description: 'Apartments, houses, labor-only & same-day moves',
    icon: 'truck',
    subTypes: [
      { value: 'apartment-condo', label: 'Apartment & Condo Moving', description: 'Studios to 4+ BR apartments and condos' },
      { value: 'house-townhouse', label: 'House & Townhouse Moving', description: 'Single-family homes and townhouses' },
      { value: 'labor-only', label: 'Labor-Only Moving Help', description: 'Loading/unloading for your truck or pod' },
      { value: 'same-day-local', label: 'Same-Day Moving', description: 'Emergency moves - call now!' },
    ]
  },
  { 
    value: 'heavy-items', 
    label: 'Heavy Items Moving',
    description: 'Pianos, pool tables, safes & oversized items',
    icon: 'weight',
    subTypes: [
      { value: 'piano', label: 'Piano Moving', description: 'Upright and grand pianos (200+ lbs = 3 movers @ $189/hr with truck)' },
      { value: 'pool-table', label: 'Pool Table Moving', description: 'Disassembly, move & reassembly (2-3 movers @ $169/hr - NOT Iron Law)' },
      { value: 'heavy-under-200', label: 'Heavy Items (Under 200 lbs)', description: 'Appliances, large furniture, gym equipment' },
      { value: 'heavy-over-200', label: 'Heavy Items (200+ lbs)', description: 'Safes, gun safes, hot tubs - IRON LAW: 3 movers @ $189/hr with truck' },
      { value: 'same-day-heavy', label: 'Same-Day Heavy Items', description: 'Emergency heavy item moves' },
    ]
  },
];

// Bedroom options for local moving
export const BEDROOM_OPTIONS = {
  'local-moving': [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1 Bedroom' },
    { value: 2, label: '2 Bedrooms' },
    { value: 3, label: '3 Bedrooms' },
    { value: 4, label: '4 Bedrooms' },
    { value: 5, label: '5+ Bedrooms' },
  ],
};

// Hours options for services
export const HOURS_OPTIONS = [
  { value: 2, label: '2 Hours (Minimum)' },
  { value: 3, label: '3 Hours' },
  { value: 4, label: '4 Hours' },
  { value: 5, label: '5 Hours' },
  { value: 6, label: '6 Hours' },
  { value: 8, label: '8 Hours (Full Day)' },
];

// Specialty items that can be added
export const SPECIALTY_ITEMS = [
  { value: 'piano-upright', label: 'Upright Piano', price: 250 },
  { value: 'piano-grand', label: 'Grand Piano', price: 450 },
  { value: 'pool-table-move', label: 'Pool Table (Move Only)', price: 350 },
  { value: 'pool-table-full', label: 'Pool Table (Full Service)', price: 550 },
  { value: 'safe-small', label: 'Safe (Under 200lbs)', price: 150 },
  { value: 'safe-large', label: 'Safe (200-800lbs)', price: 300 },
  { value: 'safe-gun', label: 'Gun Safe', price: 400 },
  { value: 'hot-tub', label: 'Hot Tub', price: 400 },
  { value: 'gym-equipment', label: 'Gym Equipment', price: 125 },
  { value: 'motorcycle', label: 'Motorcycle', price: 200 },
];

// Service areas
export const SERVICE_AREAS = [
  'Downtown', 'Midtown', 'Uptown', 'Suburbs',
  'Metro Area', 'Greater Region',
];
