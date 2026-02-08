/**
 * AI Cost Protection Framework - Client-Side Utilities
 * 
 * Protects against spam attacks, viral traffic, and API abuse
 * to prevent AI cost explosions.
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================
// HONEYPOT DETECTION
// ============================================

interface HoneypotConfig {
  fieldName?: string;
  minSubmitTime?: number; // Minimum milliseconds before form can be submitted
  maxSubmitTime?: number; // Maximum milliseconds (prevents pre-filled bots)
}

export interface HoneypotState {
  loadTime: number;
  honeypotValue: string;
  mouseMovements: number;
  keystrokes: number;
  scrollEvents: number;
}

/**
 * Creates a honeypot state tracker for bot detection
 */
export function createHoneypotState(): HoneypotState {
  return {
    loadTime: Date.now(),
    honeypotValue: "",
    mouseMovements: 0,
    keystrokes: 0,
    scrollEvents: 0,
  };
}

/**
 * Validates form submission against honeypot rules
 * Returns { valid: boolean, reason?: string }
 */
export function validateHoneypot(
  state: HoneypotState,
  config: HoneypotConfig = {}
): { valid: boolean; reason?: string; score: number } {
  const {
    minSubmitTime = 2000, // At least 2 seconds
    maxSubmitTime = 600000, // Max 10 minutes
  } = config;

  const submitTime = Date.now();
  const elapsedTime = submitTime - state.loadTime;
  let suspicionScore = 0;
  let reason: string | undefined;

  // Check 1: Honeypot field filled (instant fail)
  if (state.honeypotValue && state.honeypotValue.trim() !== "") {
    return { valid: false, reason: "hidden_field", score: 100 };
  }

  // Check 2: Too fast submission (likely bot)
  if (elapsedTime < minSubmitTime) {
    suspicionScore += 40;
    reason = "timing_too_fast";
  }

  // Check 3: Too slow submission (might be automated script)
  if (elapsedTime > maxSubmitTime) {
    suspicionScore += 20;
    reason = reason || "timing_too_slow";
  }

  // Check 4: No mouse movements (bot indicator)
  if (state.mouseMovements < 3) {
    suspicionScore += 25;
    reason = reason || "no_mouse_movement";
  }

  // Check 5: No keystrokes recorded
  if (state.keystrokes < 5) {
    suspicionScore += 15;
    reason = reason || "minimal_keystrokes";
  }

  // Check 6: No scroll events on long forms
  if (state.scrollEvents === 0) {
    suspicionScore += 10;
  }

  // Threshold: 50+ is considered bot behavior
  const valid = suspicionScore < 50;

  return {
    valid,
    reason: valid ? undefined : reason || "pattern_match",
    score: suspicionScore,
  };
}

/**
 * Creates event handlers for tracking human behavior
 */
export function createBehaviorTrackers(state: HoneypotState) {
  return {
    onMouseMove: () => {
      state.mouseMovements++;
    },
    onKeyDown: () => {
      state.keystrokes++;
    },
    onScroll: () => {
      state.scrollEvents++;
    },
    onHoneypotChange: (value: string) => {
      state.honeypotValue = value;
    },
  };
}

// ============================================
// REQUEST FINGERPRINTING
// ============================================

/**
 * Creates an anonymized fingerprint hash for rate limiting
 * This is privacy-respecting - no PII is stored
 */
export async function createClientFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || "unknown",
  ];

  const data = components.join("|");
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex.substring(0, 32); // Return first 32 chars
}

// ============================================
// PROGRESSIVE DELAY
// ============================================

interface RateLimitState {
  requestCount: number;
  lastRequestTime: number;
  backoffLevel: number;
}

const rateLimitStates = new Map<string, RateLimitState>();

/**
 * Implements progressive delay for repeated requests
 * Delays increase exponentially with abuse
 */
export async function applyProgressiveDelay(actionKey: string): Promise<void> {
  const now = Date.now();
  const state = rateLimitStates.get(actionKey) || {
    requestCount: 0,
    lastRequestTime: 0,
    backoffLevel: 0,
  };

  // Reset after 1 hour of inactivity
  if (now - state.lastRequestTime > 3600000) {
    state.requestCount = 0;
    state.backoffLevel = 0;
  }

  state.requestCount++;
  state.lastRequestTime = now;

  // Progressive delays: 0, 1s, 2s, 4s, 8s, 16s (max)
  if (state.requestCount > 5) {
    state.backoffLevel = Math.min(state.backoffLevel + 1, 4);
    const delayMs = Math.pow(2, state.backoffLevel) * 1000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  rateLimitStates.set(actionKey, state);
}

// ============================================
// CIRCUIT BREAKER CHECK
// ============================================

interface CircuitBreakerStatus {
  enabled: boolean;
  tripped: boolean;
  tripReason?: string;
  dailySpend: number;
  dailyLimit: number;
  hourlySpend: number;
  hourlyLimit: number;
}

/**
 * Checks if a service is available (not circuit-tripped)
 * This is called before making expensive API calls
 */
export async function checkServiceAvailable(
  serviceName: string
): Promise<{ available: boolean; status?: CircuitBreakerStatus }> {
  try {
    // Use RPC to check circuit breaker
    const { data, error } = await supabase.rpc("check_circuit_breaker", {
      p_service_name: serviceName,
    });

    if (error) {
      console.warn(`[CostProtection] Circuit breaker check failed: ${error.message}`);
      // Fail open - allow if we can't check
      return { available: true };
    }

    return { available: data === true };
  } catch (err) {
    console.warn("[CostProtection] Circuit breaker check error:", err);
    return { available: true };
  }
}

// ============================================
// ABUSE DETECTION LOGGING
// ============================================

/**
 * Logs a honeypot detection to the database via Supabase client.
 * Uses the typed client to insert into honeypot_detections table.
 */
export async function logHoneypotDetection(
  detectionType: string,
  detectionData: Record<string, unknown>,
  blocked: boolean = true
): Promise<void> {
  try {
    const ipHash = await createClientFingerprint();
    
    await supabase
      .from('honeypot_detections')
      .insert([{
        ip_hash: ipHash,
        page: window.location.pathname,
        detection_type: detectionType,
        detection_data: detectionData as unknown as import('@/integrations/supabase/types').Json,
        blocked,
      }]);
  } catch (err) {
    // Silent fail - don't break user experience
    console.warn("[CostProtection] Failed to log detection:", err);
  }
}

// ============================================
// SMART RETRY WITH BACKOFF
// ============================================

interface SmartRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Smart retry with exponential backoff and jitter
 * Prevents thundering herd during outages
 */
export async function smartRetry<T>(
  fn: () => Promise<T>,
  options: SmartRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error, attempt) => {
      // Don't retry on 4xx errors (client errors)
      if (error.message.includes("4")) return false;
      return attempt < maxRetries;
    },
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Calculate delay with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// ============================================
// COST ESTIMATION UTILITIES
// ============================================

export const ESTIMATED_COSTS = {
  ai_chat_message: 0.002, // ~$0.002 per message
  confirmation_call: 0.25, // ~$0.25 per call
  sms_message: 0.01, // ~$0.01 per SMS
  email_send: 0.001, // ~$0.001 per email
} as const;

/**
 * Estimates total cost for a quote submission
 */
export function estimateQuoteSubmissionCost(options: {
  includeCall: boolean;
  includeSms: boolean;
  includeEmail: boolean;
}): number {
  let cost = 0;
  
  if (options.includeEmail) cost += ESTIMATED_COSTS.email_send;
  if (options.includeCall) cost += ESTIMATED_COSTS.confirmation_call;
  if (options.includeSms) cost += ESTIMATED_COSTS.sms_message;
  
  return cost;
}

// ============================================
// DAILY REQUEST QUOTA (Client-side cache)
// ============================================

const QUOTA_STORAGE_KEY = "handledly_daily_quota";

interface DailyQuota {
  date: string;
  quotes: number;
  chats: number;
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDailyQuota(): DailyQuota {
  try {
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (stored) {
      const quota = JSON.parse(stored) as DailyQuota;
      if (quota.date === getTodayString()) {
        return quota;
      }
    }
  } catch {
    // Ignore parse errors
  }
  
  return { date: getTodayString(), quotes: 0, chats: 0 };
}

export function incrementQuota(type: "quotes" | "chats"): boolean {
  const quota = getDailyQuota();
  const limits = { quotes: 10, chats: 50 }; // Daily limits per user
  
  if (quota[type] >= limits[type]) {
    return false; // Over limit
  }
  
  quota[type]++;
  localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(quota));
  return true;
}

export function isOverQuota(type: "quotes" | "chats"): boolean {
  const quota = getDailyQuota();
  const limits = { quotes: 10, chats: 50 };
  return quota[type] >= limits[type];
}
