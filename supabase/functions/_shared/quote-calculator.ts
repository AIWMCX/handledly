// Shared Quote Calculator for Edge Functions
// Single source of truth - mirrors src/lib/quoteCalculator.ts
// Updated February 2026

export type ServiceType = 'local-moving' | 'heavy-items';
export type LocalMovingSubType = 'apartment-condo' | 'house-townhouse' | 'labor-only' | 'same-day-local';
export type HeavyItemsSubType = 'piano' | 'pool-table' | 'heavy-under-200' | 'heavy-over-200' | 'same-day-heavy';

export interface QuoteInput {
  serviceType: string;
  subType?: string;
  bedrooms?: number;
  estimatedHours?: number;
  crewConfig?: string;
  specialtyItems?: string[];
  moveDate?: Date;
  isSameDay?: boolean;
}

export interface QuoteResult {
  hourlyRate: number;
  crewSize: number;
  estimatedHours: number;
  laborCost: number;
  specialtyFee: number;
  total: number;
  hasTruck: boolean;
  isIronLaw: boolean;
}

// FLAT HOURLY RATES - Professional Pricing (Updated February 2026)
export const HOURLY_RATES: Record<string, number> = {
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
  // Iron Law Rate - 200+ lbs items REQUIRE 3 movers minimum
  'iron-law-minimum': 189,
};

// 200LB IRON LAW - CRITICAL SAFETY REQUIREMENT
export const IRON_LAW_RATE = 189; // WITH TRUCK (default for most customers)
export const IRON_LAW_LABOR_ONLY_RATE = 179; // LABOR-ONLY (rare)
export const HEAVY_ITEMS_RATE = 169;
export const IRON_LAW_MIN_CREW = 3;

// IRON LAW SERVICES - require 3 movers @ $189/hr for safety
// NOTE: Pool tables are NOT Iron Law - they use $169/hr heavy items rate with 2 movers
export const IRON_LAW_SERVICES = [
  'piano-moving',
  'safe-moving',
  'piano',
  'heavy-over-200',
] as const;

// Specialty item flat fees
export const SPECIALTY_RATES: Record<string, number> = {
  'piano-upright': 250,
  'piano-grand': 450,
  'pool-table-move': 350,
  'pool-table-full': 550,
  'safe-small': 150,
  'safe-large': 300,
  'safe-gun': 400,
  'gym-equipment': 125,
  'motorcycle': 200,
};

/**
 * Check if a service requires Iron Law enforcement (200+ lb items)
 */
export function isIronLawService(serviceType: string, subType?: string): boolean {
  if ((IRON_LAW_SERVICES as readonly string[]).includes(serviceType)) {
    return true;
  }
  if (subType && (IRON_LAW_SERVICES as readonly string[]).includes(subType)) {
    return true;
  }
  return false;
}

/**
 * Estimate crew size based on service and property
 * IRON LAW: 200+ lb items (pianos, safes) = 3 movers minimum
 */
function estimateCrewSize(input: QuoteInput): number {
  if (isIronLawService(input.serviceType, input.subType)) {
    return IRON_LAW_MIN_CREW;
  }
  
  const bedrooms = input.bedrooms || 0;
  
  if (input.serviceType === 'local-moving') {
    return bedrooms <= 2 ? 2 : bedrooms <= 3 ? 3 : 4;
  }
  
  return 2;
}

/**
 * Estimate hours based on service and property
 */
function estimateHours(input: QuoteInput): number {
  if (input.estimatedHours) return input.estimatedHours;
  
  const bedrooms = input.bedrooms || 0;
  
  if (input.serviceType === 'local-moving') {
    return Math.max(2, 2 + bedrooms);
  }
  
  if (input.serviceType === 'heavy-items') {
    return 2;
  }
  
  return 3;
}

/**
 * Get hourly rate based on crew configuration
 */
function getHourlyRate(crewConfig: string | undefined, crewSize: number): number {
  if (crewConfig && HOURLY_RATES[crewConfig]) {
    return HOURLY_RATES[crewConfig];
  }
  
  // Default to moving with truck rates
  if (crewSize <= 2) return HOURLY_RATES['moving-2-movers'];
  if (crewSize === 3) return HOURLY_RATES['moving-3-movers'];
  return HOURLY_RATES['moving-4-movers'];
}

/**
 * Calculate quote - main function
 */
export function calculateQuote(input: QuoteInput): QuoteResult {
  const crewSize = estimateCrewSize(input);
  const estimatedHours = Math.ceil(estimateHours(input));
  
  const isIronLaw = isIronLawService(input.serviceType, input.subType);
  
  let hourlyRate: number;
  if (isIronLaw) {
    hourlyRate = IRON_LAW_RATE;
  } else if (input.serviceType === 'heavy-items' || input.serviceType === 'pool-table' || input.serviceType === 'junk-removal') {
    hourlyRate = HEAVY_ITEMS_RATE;
  } else {
    hourlyRate = getHourlyRate(input.crewConfig, crewSize);
  }
  
  const laborCost = hourlyRate * estimatedHours;
  
  // Specialty items fee
  let specialtyFee = 0;
  if (input.specialtyItems && input.specialtyItems.length > 0) {
    specialtyFee = input.specialtyItems.reduce((sum, item) => {
      return sum + (SPECIALTY_RATES[item] || 0);
    }, 0);
  }
  
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
    hasTruck,
    isIronLaw,
  };
}

/**
 * Calculate quote with simplified parameters (for edge functions)
 */
export function calculateQuoteSimple(
  serviceType: string,
  bedrooms: number,
  crewConfig: string,
  estimatedHours: number
): QuoteResult {
  return calculateQuote({
    serviceType,
    bedrooms,
    crewConfig,
    estimatedHours,
  });
}
