/**
 * API Utilities for Resilient Operations
 * Provides retry logic, error handling, and rate limit detection
 */

import { isValidUSPhone } from './phoneValidation';

export type QuoteErrorType =
  | 'RATE_LIMITED' 
  | 'VALIDATION_ERROR' 
  | 'NETWORK_ERROR' 
  | 'SERVER_ERROR' 
  | 'UNKNOWN_ERROR';

export interface QuoteError {
  type: QuoteErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<QuoteErrorType, string> = {
  RATE_LIMITED: "You've submitted too many requests. Please wait a few minutes and try again.",
  VALIDATION_ERROR: "Please check your information and try again.",
  NETWORK_ERROR: "Connection issue. Please check your internet and try again.",
  SERVER_ERROR: "Our servers are busy. Please try again in a moment.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

/**
 * Classify an error into a QuoteError type
 */
export function classifyError(error: unknown): QuoteError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Rate limiting detection
  if (
    lowerMessage.includes('rate') ||
    lowerMessage.includes('too many') ||
    lowerMessage.includes('check_rate_limit') ||
    lowerMessage.includes('row-level security') ||
    lowerMessage.includes('violates row-level security policy')
  ) {
    return {
      type: 'RATE_LIMITED',
      message: errorMessage,
      userMessage: ERROR_MESSAGES.RATE_LIMITED,
      retryable: false,
    };
  }

  // Validation errors
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('required') ||
    lowerMessage.includes('must be')
  ) {
    return {
      type: 'VALIDATION_ERROR',
      message: errorMessage,
      userMessage: ERROR_MESSAGES.VALIDATION_ERROR,
      retryable: false,
    };
  }

  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('aborted') ||
    error instanceof TypeError
  ) {
    return {
      type: 'NETWORK_ERROR',
      message: errorMessage,
      userMessage: ERROR_MESSAGES.NETWORK_ERROR,
      retryable: true,
    };
  }

  // Server errors (5xx)
  if (
    lowerMessage.includes('500') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('504') ||
    lowerMessage.includes('server error') ||
    lowerMessage.includes('internal error')
  ) {
    return {
      type: 'SERVER_ERROR',
      message: errorMessage,
      userMessage: ERROR_MESSAGES.SERVER_ERROR,
      retryable: true,
    };
  }

  // Default: unknown error
  return {
    type: 'UNKNOWN_ERROR',
    message: errorMessage,
    userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
    retryable: true,
  };
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: QuoteError) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options;

  let lastError: QuoteError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = classifyError(error);

      // Don't retry non-retryable errors
      if (!lastError.retryable) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Calculate delay with exponential backoff + jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 500,
        maxDelay
      );

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || { type: 'UNKNOWN_ERROR', message: 'Max retries exceeded', userMessage: ERROR_MESSAGES.UNKNOWN_ERROR, retryable: false };
}

/**
 * Generate a UUID for client-side ID generation
 * Uses crypto.randomUUID when available, falls back to polyfill
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate quote form data before submission
 */
export function validateQuoteData(data: {
  fullName?: string;
  email?: string;
  phone?: string;
  moveDate?: string;
  serviceType?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.fullName?.trim()) {
    errors.push('Full name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  } else if (!isValidUSPhone(data.phone)) {
    // Strict US-only validation - blocks international numbers
    errors.push('We currently serve US customers only. Please enter a valid 10-digit US phone number.');
  }

  if (!data.serviceType) {
    errors.push('Service type is required');
  }

  // Move date validation (optional but must be valid if provided)
  if (data.moveDate) {
    const moveDate = new Date(data.moveDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(moveDate.getTime())) {
      errors.push('Please enter a valid move date');
    } else if (moveDate < today) {
      errors.push('Move date cannot be in the past');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
