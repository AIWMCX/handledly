// Complete TypeScript definitions for conversion optimization system

// Form Types
export interface QuoteFormData {
  // Step 1: Service Type
  serviceType: ServiceType;
  
  // Step 2: Move Details
  moveFromAddress: string;
  moveToAddress: string;
  moveDate: string;
  propertyType: PropertyType;
  bedrooms: number;
  hasStairs: boolean;
  floorNumber: number;
  
  // Step 3: Contact Info
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  preferEmailOnly: boolean;
  
  // Crew configuration (for applicable services)
  crewSize: number;
  estimatedHours: number;
  
  // UTM tracking (optional, added during submission)
  lead_source?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

export type ServiceType = 
  | 'local-moving'
  | 'long-distance'
  | 'residential'
  | 'piano-moving'
  | 'pool-table'
  | 'safe-moving'
  | 'heavy-items'
  | 'same-day'
  | 'junk-removal'
  | 'moving-help';

export type PropertyType = 
  | 'apartment'
  | 'condo'
  | 'house'
  | 'townhouse'
  | 'office'
  | 'storage';

// Social Proof Types
export interface SocialProofNotification {
  id: string;
  type: 'booking' | 'viewing' | 'recent';
  message: string;
  name?: string;
  neighborhood?: string;
  timestamp: Date;
  service?: string;
}

export interface LiveViewerData {
  count: number;
  lastUpdated: Date;
}

// Exit Intent Types
export interface ExitIntentConfig {
  delay: number; // ms before enabling
  sensitivity: number; // pixels from top to trigger
  cookieExpiry: number; // days
  variant: ExitIntentVariant;
}

export type ExitIntentVariant = 
  | 'discount_10'
  | 'discount_15'
  | 'free_supplies'
  | 'priority_booking'
  | 'callback';

export interface ExitIntentOffer {
  variant: ExitIntentVariant;
  headline: string;
  subheadline: string;
  discount?: string;
  code?: string;
  expiryMinutes: number;
}

// Urgency Badge Types
export type UrgencyType = 
  | 'slots_limited'
  | 'discount_expiring'
  | 'same_day'
  | 'popular'
  | 'last_minute';

export interface UrgencyBadgeConfig {
  type: UrgencyType;
  text: string;
  icon?: string;
  pulse?: boolean;
  expiryTime?: Date;
}

// Analytics Event Types
export type ConversionEventType =
  | 'form_started'
  | 'form_step_completed'
  | 'form_submitted'
  | 'form_abandoned'
  | 'exit_intent_triggered'
  | 'exit_intent_converted'
  | 'exit_intent_dismissed'
  | 'social_proof_viewed'
  | 'social_proof_clicked'
  | 'urgency_badge_viewed'
  | 'urgency_badge_clicked'
  | 'mobile_cta_clicked'
  | 'scroll_milestone'
  | 'quote_requested'
  | 'quote_previewed'
  // Chat Events
  | 'chat_started'
  | 'chat_message_sent'
  | 'chat_quote_requested'
  | 'chat_quote_submitted'
  | 'chat_ended'
  | 'chat_quick_action_used'
  | 'chat_human_requested';

export interface ConversionEventPayload {
  event: ConversionEventType;
  properties?: Record<string, unknown>;
  timestamp: Date;
  page: string;
  sessionId: string;
}

// A/B Test Types
export interface ABTestConfig {
  testId: string;
  variants: string[];
  weights?: number[];
  cookieDuration: number; // days
}

export interface ABTestAssignment {
  testId: string;
  variant: string;
  assignedAt: Date;
}

// Form Persistence Types
export interface PersistedFormData<T> {
  data: T;
  savedAt: Date;
  expiresAt: Date;
  step: number;
  completedSteps: number[];
}

// Quote Preview Types
export interface QuotePreview {
  estimatedLow: number;
  estimatedHigh: number;
  confidence: number;
  breakdown: QuoteBreakdown;
  validUntil: Date;
}

export interface QuoteBreakdown {
  baseRate: number;
  estimatedHours: number;
  crewCost: number;
  travelFee: number;
  specialtyFees: number;
  discount?: number;
  total: number;
}

// Mobile CTA Types
export type MobileCTAAction = 'call' | 'quote' | 'chat' | 'callback';

export interface MobileCTAConfig {
  primaryAction: MobileCTAAction;
  secondaryAction?: MobileCTAAction;
  phoneNumber: string;
  showAfterScroll: number; // pixels
}

// Scroll Progress Types
export interface ScrollMilestone {
  percentage: number;
  label: string;
  tracked: boolean;
}

// Denver Neighborhoods for Social Proof
export const DENVER_NEIGHBORHOODS = [
  'Cherry Creek',
  'LoDo',
  'Capitol Hill',
  'Highlands',
  'RiNo',
  'Washington Park',
  'Park Hill',
  'Stapleton',
  'Green Valley Ranch',
  'Lakewood',
  'Aurora',
  'Centennial',
  'Littleton',
  'Arvada',
  'Westminster',
  'Thornton',
  'Boulder',
  'Golden',
  'Englewood',
  'Broomfield',
] as const;

export type DenverNeighborhood = typeof DENVER_NEIGHBORHOODS[number];

// Common Names for Social Proof
export const COMMON_NAMES = [
  'Sarah', 'Michael', 'Jennifer', 'David', 'Emily',
  'Chris', 'Jessica', 'Matthew', 'Amanda', 'Joshua',
  'Ashley', 'Daniel', 'Stephanie', 'Andrew', 'Nicole',
  'James', 'Elizabeth', 'Ryan', 'Megan', 'Brandon',
] as const;
