// Quote Calculation Engine for Denver Premium Moving
// Flat Hourly Rate Model - NO HIDDEN FEES

export type ServiceType = 
  | 'apartment-condo'
  | 'house-townhouse'
  | 'labor-only'
  | 'commercial'
  | 'heavy-items'
  | 'pool-table'
  | 'junk-removal'
  | 'same-day';

export interface QuoteInput {
  serviceType: ServiceType;
  bedrooms?: number;
  estimatedHours?: number;
  specialtyItems?: string[];
  moveDate?: Date;
}

export interface QuoteBreakdown {
  hourlyRate: number;
  crewSize: number;
  estimatedHours: number;
  laborCost: number;
  specialtyFee: number;
  total: number;
  inclusions: string[];
}

// FLAT HOURLY RATES - NO HIDDEN FEES
export const HOURLY_RATES = {
  '2-movers': 149,
  '3-movers': 189,
  '4-movers': 229,
  '5-movers': 269,
} as const;

// Specialty item flat fees (these are for heavy/specialty items only)
const SPECIALTY_RATES: Record<string, number> = {
  'piano-upright': 250,
  'piano-grand': 450,
  'pool-table-move': 350,
  'pool-table-full': 550, // includes disassembly, move, reassembly, leveling
  'safe-small': 150, // under 300lbs
  'safe-large': 300, // 300-800lbs
  'safe-gun': 400, // gun safes
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
  'Floor & door protection',
  'No stair or elevator fees',
  'No truck/fuel surcharges',
  'Free basic packing supplies',
];

// Estimate crew size based on service and property
function estimateCrewSize(input: QuoteInput): number {
  const bedrooms = input.bedrooms || 0;
  
  switch (input.serviceType) {
    case 'labor-only':
      return 2;
    case 'apartment-condo':
      return bedrooms <= 2 ? 2 : 3;
    case 'house-townhouse':
      return bedrooms <= 3 ? 3 : bedrooms <= 5 ? 4 : 5;
    case 'commercial':
      return 4;
    case 'heavy-items':
    case 'pool-table':
      return 3;
    case 'junk-removal':
      return 2;
    case 'same-day':
      return bedrooms <= 2 ? 2 : 3;
    default:
      return 3;
  }
}

// Estimate hours based on service and property
function estimateHours(input: QuoteInput): number {
  if (input.estimatedHours) return input.estimatedHours;
  
  const bedrooms = input.bedrooms || 0;
  
  switch (input.serviceType) {
    case 'labor-only':
      return 3; // minimum
    case 'apartment-condo':
      return Math.max(2, 2 + bedrooms);
    case 'house-townhouse':
      return Math.max(3, 3 + bedrooms * 1.2);
    case 'commercial':
      return 6;
    case 'heavy-items':
      return 2;
    case 'pool-table':
      return 3;
    case 'junk-removal':
      return 2;
    case 'same-day':
      return Math.max(2, 2 + bedrooms);
    default:
      return 4;
  }
}

// Get hourly rate based on crew size
function getHourlyRate(crewSize: number): number {
  if (crewSize <= 2) return HOURLY_RATES['2-movers'];
  if (crewSize === 3) return HOURLY_RATES['3-movers'];
  if (crewSize === 4) return HOURLY_RATES['4-movers'];
  return HOURLY_RATES['5-movers'];
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const crewSize = estimateCrewSize(input);
  const estimatedHours = Math.ceil(estimateHours(input));
  const hourlyRate = getHourlyRate(crewSize);
  
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
  
  return {
    hourlyRate,
    crewSize,
    estimatedHours,
    laborCost,
    specialtyFee,
    total,
    inclusions: INCLUDED_WITH_EVERY_MOVE,
  };
}

// Service types for the form
export const SERVICE_TYPES = [
  { 
    value: 'apartment-condo', 
    label: 'Apartment & Condo Moving',
    description: 'Studios, apartments, and condos of any size',
    icon: 'building',
  },
  { 
    value: 'house-townhouse', 
    label: 'House & Townhouse Moving',
    description: 'Single-family homes and townhouses',
    icon: 'home',
  },
  { 
    value: 'labor-only', 
    label: 'Labor / Moving Help',
    description: 'Load/unload your truck, pod, or storage unit',
    icon: 'users',
  },
  { 
    value: 'commercial', 
    label: 'Commercial / Office Moving',
    description: 'Offices, retail spaces, and businesses',
    icon: 'building-2',
  },
  { 
    value: 'heavy-items', 
    label: 'Heavy Items Moving',
    description: 'Safes, appliances, and heavy furniture',
    icon: 'weight',
  },
  { 
    value: 'pool-table', 
    label: 'Pool Table Moving',
    description: 'Professional pool table relocation',
    icon: 'gamepad',
  },
  { 
    value: 'junk-removal', 
    label: 'Junk Removal',
    description: 'Furniture, appliances, and debris removal',
    icon: 'trash',
  },
  { 
    value: 'same-day', 
    label: 'Same-Day Moving',
    description: 'Urgent, last-minute moves',
    icon: 'zap',
  },
];

// Bedroom options by service type
export const BEDROOM_OPTIONS = {
  'apartment-condo': [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1 Bedroom' },
    { value: 2, label: '2 Bedrooms' },
    { value: 3, label: '3 Bedrooms' },
    { value: 4, label: '4 Bedrooms' },
  ],
  'house-townhouse': [
    { value: 2, label: '2 Bedrooms' },
    { value: 3, label: '3 Bedrooms' },
    { value: 4, label: '4 Bedrooms' },
    { value: 5, label: '5 Bedrooms' },
    { value: 6, label: '6+ Bedrooms' },
  ],
  'same-day': [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1 Bedroom' },
    { value: 2, label: '2 Bedrooms' },
    { value: 3, label: '3 Bedrooms' },
  ],
};

// Hours options for labor-only
export const HOURS_OPTIONS = [
  { value: 2, label: '2 Hours' },
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
  { value: 'safe-small', label: 'Safe (Under 300lbs)', price: 150 },
  { value: 'safe-large', label: 'Safe (300-800lbs)', price: 300 },
  { value: 'safe-gun', label: 'Gun Safe', price: 400 },
  { value: 'hot-tub', label: 'Hot Tub', price: 400 },
  { value: 'gym-equipment', label: 'Gym Equipment', price: 125 },
  { value: 'motorcycle', label: 'Motorcycle', price: 200 },
];

// Denver service areas (30+ cities)
export const SERVICE_AREAS = [
  'Downtown Denver', 'Capitol Hill', 'City Park', 'Cherry Creek',
  'Washington Park', 'Highlands', 'LoHi', 'RiNo', 'Baker',
  'Aurora', 'Centennial', 'Lakewood', 'Golden', 'Westminster',
  'Thornton', 'Arvada', 'Littleton', 'Englewood', 'Greenwood Village',
  'Parker', 'Castle Rock', 'Boulder', 'Broomfield', 'Commerce City',
  'Federal Heights', 'Wheat Ridge', 'Edgewater', 'Glendale',
  'Sheridan', 'Lone Tree', 'Highlands Ranch',
];
