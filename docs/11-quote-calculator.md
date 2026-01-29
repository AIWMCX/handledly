# Quote Calculator Documentation

## Overview

The Handledly quote calculator (`src/lib/quoteCalculator.ts`, 227 lines) implements a flat hourly rate pricing model with no hidden fees.

---

## 1. Core Concepts

### Pricing Philosophy
- **Flat Hourly Rates**: Simple, transparent pricing
- **No Hidden Fees**: No stair fees, no travel fees, no truck fees
- **Crew-Based Pricing**: Rate varies by crew size and truck inclusion
- **Specialty Items**: Flat fees for pianos, pool tables, safes, etc.

---

## 2. Type Definitions

```typescript
export type ServiceType = 'local-moving' | 'heavy-items';

export type LocalMovingSubType = 
  | 'apartment-condo' 
  | 'house-townhouse' 
  | 'labor-only' 
  | 'same-day-local';

export type HeavyItemsSubType = 
  | 'piano' 
  | 'pool-table' 
  | 'heavy-under-300' 
  | 'heavy-over-300' 
  | 'same-day-heavy';

export interface QuoteInput {
  serviceType: ServiceType;
  subType?: LocalMovingSubType | HeavyItemsSubType;
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
}
```

---

## 3. Pricing Tables

### Hourly Rates

| Configuration | Code | Rate | Includes Truck |
|---------------|------|------|----------------|
| 2 Movers (Labor Only) | `labor-2-movers` | $139/hr | No |
| 3 Movers (Labor Only) | `labor-3-movers` | $169/hr | No |
| 4 Movers (Labor Only) | `labor-4-movers` | $239/hr | No |
| 2 Movers + Truck | `moving-2-movers` | $159/hr | Yes |
| 3 Movers + Truck | `moving-3-movers` | $189/hr | Yes |
| 3 Movers + 2 Trucks | `moving-3-movers-2-trucks` | $209/hr | Yes |
| 4 Movers + Truck | `moving-4-movers` | $259/hr | Yes |
| Heavy Items | `heavy-items` | $169/hr | Yes |
| Iron Law Rate | `iron-law-minimum` | $179/hr | Yes (200+ lb items) |

```typescript
export const HOURLY_RATES = {
  'labor-2-movers': 139,
  'labor-3-movers': 169,
  'labor-4-movers': 239,
  'moving-2-movers': 159,
  'moving-3-movers': 189,
  'moving-3-movers-2-trucks': 209,
  'moving-4-movers': 259,
  'heavy-items': 169,
  'iron-law-minimum': 179,
} as const;
```

### Specialty Item Flat Fees

| Item | Code | Price |
|------|------|-------|
| Upright Piano | `piano-upright` | $250 |
| Grand Piano | `piano-grand` | $450 |
| Pool Table (Move Only) | `pool-table-move` | $350 |
| Pool Table (Full Service) | `pool-table-full` | $550 |
| Safe (Under 200lbs) | `safe-small` | $150 |
| Safe (200-800lbs) | `safe-large` | $300 |
| Gun Safe | `safe-gun` | $400 |
| Hot Tub | `hot-tub` | $400 |
| Gym Equipment | `gym-equipment` | $125 |
| Motorcycle | `motorcycle` | $200 |

```typescript
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
```

### Additional Fees

| Fee | Amount | Notes |
|-----|--------|-------|
| Electronic Payment | $5 | Mandatory processing fee |

---

## 4. Calculation Algorithm

### Step 1: Estimate Crew Size

```typescript
function estimateCrewSize(input: QuoteInput): number {
  const bedrooms = input.bedrooms || 0;
  
  switch (input.serviceType) {
    case 'local-moving':
      return bedrooms <= 2 ? 2 : bedrooms <= 3 ? 3 : 4;
    case 'heavy-items':
      return 2;
    default:
      return 2;
  }
}
```

| Bedrooms | Recommended Crew |
|----------|------------------|
| 0-2 | 2 movers |
| 3 | 3 movers |
| 4+ | 4 movers |
| Heavy items | 2 movers (always) |

### Step 2: Estimate Hours

```typescript
function estimateHours(input: QuoteInput): number {
  if (input.estimatedHours) return input.estimatedHours;
  
  const bedrooms = input.bedrooms || 0;
  
  switch (input.serviceType) {
    case 'local-moving':
      return Math.max(2, 2 + bedrooms); // Minimum 2 hours
    case 'heavy-items':
      return 2;
    default:
      return 3;
  }
}
```

| Bedrooms | Estimated Hours |
|----------|-----------------|
| Studio | 2 hours |
| 1 BR | 3 hours |
| 2 BR | 4 hours |
| 3 BR | 5 hours |
| 4 BR | 6 hours |
| 5+ BR | 7 hours |

### Step 3: Get Hourly Rate

```typescript
function getHourlyRate(crewConfig: string | undefined, crewSize: number): number {
  if (crewConfig && HOURLY_RATES[crewConfig]) {
    return HOURLY_RATES[crewConfig];
  }
  
  // Default to moving with truck rates
  if (crewSize <= 2) return HOURLY_RATES['moving-2-movers'];
  if (crewSize === 3) return HOURLY_RATES['moving-3-movers'];
  return HOURLY_RATES['moving-4-movers'];
}
```

### Step 4: Calculate Total

```typescript
export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const crewSize = estimateCrewSize(input);
  const estimatedHours = Math.ceil(estimateHours(input));
  const hourlyRate = input.serviceType === 'heavy-items' 
    ? HOURLY_RATES['heavy-items']
    : getHourlyRate(input.crewConfig, crewSize);
  
  // Base labor cost
  const laborCost = hourlyRate * estimatedHours;
  
  // Specialty items fee
  let specialtyFee = 0;
  if (input.specialtyItems?.length) {
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
    hasTruck: input.crewConfig?.startsWith('moving-') ?? true,
  };
}
```

---

## 5. Included Services

```typescript
export const INCLUDED_WITH_EVERY_MOVE = [
  'Professional moving crew',
  'Moving truck with fuel included',
  'All packing materials (blankets, wrap, tape)',
  'Furniture disassembly & reassembly',
  'No stair or elevator fees',
  'No truck/fuel surcharges',
  'Free basic packing supplies',
];
```

---

## 6. Configuration Objects

### Crew Configurations (UI Display)

```typescript
export const CREW_CONFIGURATIONS = [
  { 
    value: 'labor-2-movers', 
    label: 'Labor Only - 2 Movers', 
    rate: 129, 
    hasTruck: false, 
    crew: 2, 
    description: 'Loading/unloading help' 
  },
  { 
    value: 'moving-2-movers', 
    label: '2 Movers + Truck', 
    rate: 149, 
    hasTruck: true, 
    crew: 2, 
    description: 'Studios & 1-2 BR', 
    popular: true  // Badge flag
  },
  { 
    value: 'labor-3-movers', 
    label: 'Labor Only - 3 Movers', 
    rate: 159, 
    hasTruck: false, 
    crew: 3, 
    description: 'Larger load/unload jobs' 
  },
  // ... more configurations
];
```

### Service Types (UI Display)

```typescript
export const SERVICE_TYPES = [
  { 
    value: 'local-moving', 
    label: 'Local Moving',
    description: 'Apartments, houses, labor-only & same-day moves',
    icon: 'truck',
    subTypes: [
      { value: 'apartment-condo', label: 'Apartment & Condo Moving', description: '...' },
      { value: 'house-townhouse', label: 'House & Townhouse Moving', description: '...' },
      { value: 'labor-only', label: 'Labor-Only Moving Help', description: '...' },
      { value: 'same-day-local', label: 'Same-Day Moving', description: '...' },
    ]
  },
  { 
    value: 'heavy-items', 
    label: 'Heavy Items Moving',
    description: 'Pianos, pool tables, safes & oversized items',
    icon: 'weight',
    subTypes: [
      { value: 'piano', label: 'Piano Moving', description: '...' },
      { value: 'pool-table', label: 'Pool Table Moving', description: '...' },
      { value: 'heavy-under-200', label: 'Heavy Items (Under 200 lbs)', description: '...' },
      { value: 'heavy-over-200', label: 'Heavy Items (200+ lbs)', description: '...' },
      { value: 'same-day-heavy', label: 'Same-Day Heavy Items', description: '...' },
    ]
  },
];
```

### Bedroom Options

```typescript
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
```

### Hours Options

```typescript
export const HOURS_OPTIONS = [
  { value: 2, label: '2 Hours (Minimum)' },
  { value: 3, label: '3 Hours' },
  { value: 4, label: '4 Hours' },
  { value: 5, label: '5 Hours' },
  { value: 6, label: '6 Hours' },
  { value: 8, label: '8 Hours (Full Day)' },
];
```

---

## 7. Example Calculations

### Example 1: 2 Bedroom Apartment

```typescript
const input: QuoteInput = {
  serviceType: 'local-moving',
  subType: 'apartment-condo',
  bedrooms: 2,
  crewConfig: 'moving-2-movers',
};

const result = calculateQuote(input);
// {
//   hourlyRate: 149,
//   crewSize: 2,
//   estimatedHours: 4,
//   laborCost: 596,
//   specialtyFee: 0,
//   total: 596,
//   inclusions: [...],
//   hasTruck: true
// }
```

### Example 2: 3 Bedroom House with Piano

```typescript
const input: QuoteInput = {
  serviceType: 'local-moving',
  subType: 'house-townhouse',
  bedrooms: 3,
  crewConfig: 'moving-3-movers',
  specialtyItems: ['piano-upright'],
};

const result = calculateQuote(input);
// {
//   hourlyRate: 179,
//   crewSize: 3,
//   estimatedHours: 5,
//   laborCost: 895,
//   specialtyFee: 250,
//   total: 1145,
//   inclusions: [...],
//   hasTruck: true
// }
```

### Example 3: Pool Table Only

```typescript
const input: QuoteInput = {
  serviceType: 'heavy-items',
  subType: 'pool-table',
  specialtyItems: ['pool-table-full'],
};

const result = calculateQuote(input);
// {
//   hourlyRate: 159,
//   crewSize: 2,
//   estimatedHours: 2,
//   laborCost: 318,
//   specialtyFee: 550,
//   total: 868,
//   inclusions: [...],
//   hasTruck: true
// }
```

---

## 8. Quote Preview Logic

The `InstantQuotePreview` component shows estimated ranges:

```typescript
// Range calculation (approximately)
const lowEstimate = total * 0.85;
const highEstimate = total * 1.15;

// Display: "$506 - $686" with "94.6% accuracy" badge
```

---

## 9. Integration Points

### Frontend Usage
```typescript
import { calculateQuote, CREW_CONFIGURATIONS, SERVICE_TYPES } from '@/lib/quoteCalculator';

// In QuoteFormWizard
const quote = calculateQuote({
  serviceType: formData.serviceType,
  bedrooms: formData.bedrooms,
  crewConfig: formData.crewConfig,
  specialtyItems: formData.specialtyItems,
});
```

### Backend Usage (Email Template)
```typescript
// In send-quote-email edge function
const laborCost = data.hourlyRate * data.estimatedHours;
// Display in email:
// "Labor (4 hrs × $149): $596"
```

---

*Last Updated: January 25, 2026*
