/**
 * Shared validation schemas for edge functions
 * Uses zod for comprehensive server-side input validation
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ============= PII Detection Patterns =============

// Credit card patterns (major card types)
const CREDIT_CARD_PATTERNS = [
  /\b(?:4[0-9]{12}(?:[0-9]{3})?)\b/,           // Visa
  /\b(?:5[1-5][0-9]{14})\b/,                    // MasterCard
  /\b(?:3[47][0-9]{13})\b/,                     // American Express
  /\b(?:6(?:011|5[0-9]{2})[0-9]{12})\b/,       // Discover
  /\b(?:3(?:0[0-5]|[68][0-9])[0-9]{11})\b/,    // Diners Club
  /\b(?:[0-9]{4}[\s-]?){3}[0-9]{4}\b/,         // Generic 16-digit with separators
];

// Social Security Number patterns
const SSN_PATTERNS = [
  /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/,           // 123-45-6789 or 123 45 6789
];

// Bank account patterns (routing + account)
const BANK_PATTERNS = [
  /\b\d{9}\s*\d{8,17}\b/,                       // Routing (9 digits) + Account number
];

/**
 * Check if text contains potential PII that shouldn't be stored
 * Returns true if PII is detected (validation fails)
 */
export function containsSensitivePII(text: string): boolean {
  // Check for credit card numbers
  for (const pattern of CREDIT_CARD_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  
  // Check for SSN
  for (const pattern of SSN_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  
  // Check for bank account info
  for (const pattern of BANK_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  
  return false;
}

// ============= Common Validators =============

// US Phone validation - strict format
export const usPhoneSchema = z.string()
  .min(10, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone format")
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => {
    // Must be 10 digits or 11 starting with 1
    if (val.length === 10) return /^[2-9]\d{9}$/.test(val);
    if (val.length === 11 && val.startsWith('1')) return /^1[2-9]\d{9}$/.test(val);
    return false;
  }, "Please enter a valid US phone number");

// Email validation
export const emailSchema = z.string()
  .email("Invalid email address")
  .max(320, "Email is too long")
  .transform(val => val.trim().toLowerCase());

// UUID validation
export const uuidSchema = z.string().uuid("Invalid UUID format");

// Safe text - no XSS patterns (with min length support)
export const safeTextSchema = (maxLength: number = 1000, minLength: number = 0) => z.string()
  .min(minLength, minLength > 0 ? "This field is required" : undefined)
  .max(maxLength, `Text exceeds maximum length of ${maxLength}`)
  .refine(val => !/<script|javascript:|on\w+=/i.test(val), "Invalid content detected");

// Safe text with PII filtering - blocks credit cards, SSN, bank info
export const safeTextWithPIIFilterSchema = (maxLength: number = 1000, minLength: number = 0) => z.string()
  .min(minLength, minLength > 0 ? "This field is required" : undefined)
  .max(maxLength, `Text exceeds maximum length of ${maxLength}`)
  .refine(val => !/<script|javascript:|on\w+=/i.test(val), "Invalid content detected")
  .refine(val => !containsSensitivePII(val), "Please don't share sensitive financial information like credit card or SSN numbers");

// ============= Quote Submission Schema =============

export const quoteSubmissionSchema = z.object({
  fullName: safeTextSchema(200, 1),
  email: emailSchema,
  phone: usPhoneSchema,
  serviceType: safeTextSchema(100, 1),
  moveFromAddress: safeTextSchema(500).optional().nullable(),
  moveToAddress: safeTextSchema(500).optional().nullable(),
  moveDate: z.string().optional().nullable(),
  bedrooms: z.number().int().min(0).max(20).optional().default(0),
  hasStairs: z.boolean().optional().default(false),
  floorNumber: z.number().int().min(1).max(100).optional().nullable(),
  notes: safeTextSchema(2000).optional().nullable(),
  preferEmailOnly: z.boolean().optional().default(false),
  crewSize: z.number().int().min(2).max(6).optional().default(2),
  estimatedHours: z.number().int().min(2).max(12).optional().default(3),
  lead_source: safeTextSchema(100).optional().default('website'),
  utm_source: safeTextSchema(200).optional().nullable(),
  utm_medium: safeTextSchema(200).optional().nullable(),
  utm_campaign: safeTextSchema(200).optional().nullable(),
  utm_content: safeTextSchema(200).optional().nullable(),
  utm_term: safeTextSchema(200).optional().nullable(),
  // Honeypot fields - should be empty
  website_url: z.string().optional(),
  honeypot: z.string().optional(),
});

export type QuoteSubmission = z.infer<typeof quoteSubmissionSchema>;

// ============= AI Chat Schema =============

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: safeTextWithPIIFilterSchema(10000),
});

export const aiChatRequestSchema = z.object({
  message: safeTextWithPIIFilterSchema(5000, 1),
  conversationHistory: z.array(chatMessageSchema).max(20).optional().default([]),
  sessionId: z.string().max(100).optional(),
  ipHash: z.string().max(128).optional(),
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

// ============= Email Request Schema =============

export const quoteEmailRequestSchema = z.object({
  leadId: uuidSchema,
  verificationToken: z.string().optional(),
  conversationId: z.string().optional(),
  firstName: safeTextSchema(100),
  lastName: safeTextSchema(100).optional().default(''),
  customerName: safeTextSchema(200),
  email: emailSchema,
  phone: z.string().max(30),
  serviceType: safeTextSchema(100),
  crewSize: z.number().int().min(1).max(10),
  hourlyRate: z.number().min(0).max(10000),
  estimatedHours: z.number().min(0).max(100),
  laborCost: z.number().min(0).max(100000),
  specialtyFee: z.number().min(0).max(50000),
  totalQuote: z.number().min(0).max(200000),
  quoteNumber: z.string().optional(),
  moveDate: z.string().optional(),
  moveFrom: safeTextSchema(500).optional(),
  moveTo: safeTextSchema(500).optional(),
  specialtyItems: z.array(z.string()).max(20).optional(),
  notes: safeTextSchema(2000).optional(),
});

export type QuoteEmailRequest = z.infer<typeof quoteEmailRequestSchema>;

// ============= Call Request Schema =============

export const callRequestSchema = z.object({
  leadId: uuidSchema.optional(),
  moveRequestId: uuidSchema.optional(),
  bookingId: uuidSchema.optional(),
  verificationToken: z.string().optional(),
  firstName: safeTextSchema(100).optional(),
  lastName: safeTextSchema(100).optional(),
  customerName: safeTextSchema(200),
  phone: z.string().max(30),
  email: emailSchema,
  serviceType: safeTextSchema(100),
  totalQuote: z.number().min(0).max(200000),
  quoteNumber: z.string().optional(),
  moveDate: z.string().optional(),
  moveFrom: safeTextSchema(500).optional(),
  moveTo: safeTextSchema(500).optional(),
  crewSize: z.number().int().min(1).max(10),
  estimatedHours: z.number().min(1).max(100),
  callPurpose: z.enum(['quote_confirmation', 'booking_confirmation', 'marketplace_confirmation']).optional(),
}).refine(d => !!(d.leadId || d.moveRequestId || d.bookingId), {
  message: 'Either leadId, moveRequestId, or bookingId is required',
});

export type CallRequest = z.infer<typeof callRequestSchema>;

// ============= Validation Helper =============

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  );
  
  return { success: false, errors };
}
