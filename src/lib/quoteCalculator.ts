// Quote Calculation Engine for Denver Premium Moving
// All pricing logic for residential, commercial, and specialty moves

export interface QuoteInput {
  propertyType: 'studio' | 'apartment' | 'house' | 'condo' | 'townhouse' | 'office' | 'storage';
  bedrooms?: number;
  squareFootage?: number;
  floorNumber?: number;
  hasStairs?: boolean;
  hasElevator?: boolean;
  originZone: string;
  destinationZone: string;
  specialtyItems?: string[];
  packingServices?: boolean;
  moveDate?: Date;
}

export interface QuoteBreakdown {
  basePrice: number;
  bedroomFee: number;
  distanceFee: number;
  stairsFee: number;
  specialtyFee: number;
  packingFee: number;
  seasonalAdjustment: number;
  subtotal: number;
  total: number;
  estimatedHours: number;
  crewSize: number;
}

// Base rates by property type
const BASE_RATES: Record<string, number> = {
  studio: 299,
  apartment: 399,
  condo: 449,
  townhouse: 549,
  house: 599,
  office: 799,
  storage: 249,
};

// Per bedroom rate
const BEDROOM_RATE = 75;

// Denver zone pricing (one-way rates)
const ZONE_RATES: Record<string, number> = {
  'downtown': 0,
  'capitol-hill': 25,
  'city-park': 25,
  'cherry-creek': 35,
  'wash-park': 35,
  'highlands': 40,
  'lohi': 40,
  'rino': 30,
  'baker': 30,
  'aurora': 75,
  'centennial': 85,
  'lakewood': 60,
  'golden': 95,
  'westminster': 70,
  'thornton': 80,
  'arvada': 65,
  'littleton': 70,
  'englewood': 45,
  'greenwood-village': 55,
  'parker': 110,
  'castle-rock': 150,
  'boulder': 175,
  'out-of-metro': 250,
};

// Specialty item pricing
const SPECIALTY_RATES: Record<string, number> = {
  'piano-upright': 250,
  'piano-grand': 450,
  'pool-table': 350,
  'safe-small': 150,
  'safe-large': 300,
  'antiques': 100,
  'artwork': 75,
  'wine-collection': 150,
  'hot-tub': 400,
  'gym-equipment': 125,
  'motorcycle': 200,
};

// Floor/stairs rates
const STAIRS_RATE_PER_FLOOR = 50;
const ELEVATOR_DISCOUNT = -25;

// Packing service rate (percentage of base)
const PACKING_RATE = 0.35;

// Seasonal adjustments
function getSeasonalMultiplier(date?: Date): number {
  if (!date) return 1.0;
  
  const month = date.getMonth(); // 0-11
  const dayOfWeek = date.getDay(); // 0-6
  
  // Peak season: May-September
  let multiplier = 1.0;
  if (month >= 4 && month <= 8) {
    multiplier = 1.15; // 15% peak season surcharge
  }
  
  // End of month premium (last 5 days)
  const dayOfMonth = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), month + 1, 0).getDate();
  if (dayOfMonth > daysInMonth - 5) {
    multiplier += 0.10;
  }
  
  // Weekend premium
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier += 0.05;
  }
  
  return multiplier;
}

// Estimate crew size based on property
function estimateCrewSize(input: QuoteInput): number {
  const bedrooms = input.bedrooms || 0;
  
  switch (input.propertyType) {
    case 'studio':
      return 2;
    case 'apartment':
    case 'condo':
      return bedrooms <= 2 ? 2 : 3;
    case 'townhouse':
      return bedrooms <= 3 ? 3 : 4;
    case 'house':
      return bedrooms <= 3 ? 3 : bedrooms <= 5 ? 4 : 5;
    case 'office':
      return 4;
    case 'storage':
      return 2;
    default:
      return 3;
  }
}

// Estimate hours based on property
function estimateHours(input: QuoteInput): number {
  const bedrooms = input.bedrooms || 0;
  
  switch (input.propertyType) {
    case 'studio':
      return 2;
    case 'apartment':
    case 'condo':
      return 2 + bedrooms;
    case 'townhouse':
      return 3 + bedrooms;
    case 'house':
      return 4 + bedrooms * 1.5;
    case 'office':
      return 6;
    case 'storage':
      return 2;
    default:
      return 4;
  }
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  // Base price
  const basePrice = BASE_RATES[input.propertyType] || 499;
  
  // Bedroom fee
  const bedroomFee = (input.bedrooms || 0) * BEDROOM_RATE;
  
  // Distance fee (sum of origin and destination zones)
  const originRate = ZONE_RATES[input.originZone] || ZONE_RATES['out-of-metro'];
  const destRate = ZONE_RATES[input.destinationZone] || ZONE_RATES['out-of-metro'];
  const distanceFee = originRate + destRate;
  
  // Stairs/elevator fee
  let stairsFee = 0;
  if (input.hasStairs && input.floorNumber && input.floorNumber > 1) {
    stairsFee = (input.floorNumber - 1) * STAIRS_RATE_PER_FLOOR;
  }
  if (input.hasElevator) {
    stairsFee += ELEVATOR_DISCOUNT;
  }
  stairsFee = Math.max(0, stairsFee);
  
  // Specialty items fee
  let specialtyFee = 0;
  if (input.specialtyItems && input.specialtyItems.length > 0) {
    specialtyFee = input.specialtyItems.reduce((sum, item) => {
      return sum + (SPECIALTY_RATES[item] || 75);
    }, 0);
  }
  
  // Packing services fee
  const packingFee = input.packingServices ? Math.round(basePrice * PACKING_RATE) : 0;
  
  // Subtotal before seasonal
  const subtotal = basePrice + bedroomFee + distanceFee + stairsFee + specialtyFee + packingFee;
  
  // Seasonal adjustment
  const seasonalMultiplier = getSeasonalMultiplier(input.moveDate);
  const seasonalAdjustment = Math.round(subtotal * (seasonalMultiplier - 1));
  
  // Final total
  const total = subtotal + seasonalAdjustment;
  
  return {
    basePrice,
    bedroomFee,
    distanceFee,
    stairsFee,
    specialtyFee,
    packingFee,
    seasonalAdjustment,
    subtotal,
    total,
    estimatedHours: estimateHours(input),
    crewSize: estimateCrewSize(input),
  };
}

export const DENVER_ZONES = [
  { value: 'downtown', label: 'Downtown Denver' },
  { value: 'capitol-hill', label: 'Capitol Hill' },
  { value: 'city-park', label: 'City Park' },
  { value: 'cherry-creek', label: 'Cherry Creek' },
  { value: 'wash-park', label: 'Washington Park' },
  { value: 'highlands', label: 'Highlands' },
  { value: 'lohi', label: 'LoHi' },
  { value: 'rino', label: 'RiNo' },
  { value: 'baker', label: 'Baker' },
  { value: 'aurora', label: 'Aurora' },
  { value: 'centennial', label: 'Centennial' },
  { value: 'lakewood', label: 'Lakewood' },
  { value: 'golden', label: 'Golden' },
  { value: 'westminster', label: 'Westminster' },
  { value: 'thornton', label: 'Thornton' },
  { value: 'arvada', label: 'Arvada' },
  { value: 'littleton', label: 'Littleton' },
  { value: 'englewood', label: 'Englewood' },
  { value: 'greenwood-village', label: 'Greenwood Village' },
  { value: 'parker', label: 'Parker' },
  { value: 'castle-rock', label: 'Castle Rock' },
  { value: 'boulder', label: 'Boulder' },
  { value: 'out-of-metro', label: 'Outside Metro Area' },
];

export const PROPERTY_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'house', label: 'House' },
  { value: 'office', label: 'Office/Commercial' },
  { value: 'storage', label: 'Storage Unit' },
];

export const SPECIALTY_ITEMS = [
  { value: 'piano-upright', label: 'Upright Piano', price: 250 },
  { value: 'piano-grand', label: 'Grand Piano', price: 450 },
  { value: 'pool-table', label: 'Pool Table', price: 350 },
  { value: 'safe-small', label: 'Small Safe', price: 150 },
  { value: 'safe-large', label: 'Large Safe', price: 300 },
  { value: 'antiques', label: 'Antique Furniture', price: 100 },
  { value: 'artwork', label: 'Fine Art/Artwork', price: 75 },
  { value: 'wine-collection', label: 'Wine Collection', price: 150 },
  { value: 'hot-tub', label: 'Hot Tub', price: 400 },
  { value: 'gym-equipment', label: 'Gym Equipment', price: 125 },
  { value: 'motorcycle', label: 'Motorcycle', price: 200 },
];