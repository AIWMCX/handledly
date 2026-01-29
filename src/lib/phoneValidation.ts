/**
 * US Phone Number Validation Utility
 * Strict US-only validation to prevent international calls
 */

// Known international country codes to explicitly block
const BLOCKED_COUNTRY_PREFIXES = [
  '+44', '+91', '+61', '+49', '+33', '+86', '+81', '+82', '+7', '+52', '+55',
  '+34', '+39', '+31', '+32', '+46', '+47', '+45', '+48', '+43', '+41',
  '+351', '+353', '+358', '+30', '+90', '+20', '+27', '+234', '+254',
  '+63', '+84', '+66', '+60', '+65', '+62', '+64', '+971', '+966', '+972',
];

/**
 * Check if a phone number is a valid US phone number
 * Accepts: 10-digit, 11-digit starting with 1, +1 prefixed
 * Rejects: International numbers, invalid lengths
 */
export function isValidUSPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const trimmed = phone.trim();
  
  // Check for blocked international prefixes
  for (const prefix of BLOCKED_COUNTRY_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return false;
    }
  }

  // Also block + followed by any non-1 digit
  if (trimmed.startsWith('+') && !trimmed.startsWith('+1')) {
    return false;
  }

  // Strip all non-digits
  const digits = trimmed.replace(/\D/g, '');

  // Check for valid US formats
  // 10 digits: standard US number
  if (digits.length === 10) {
    // First digit cannot be 0 or 1 (area codes start with 2-9)
    return digits[0] !== '0' && digits[0] !== '1';
  }

  // 11 digits: must start with 1 (US country code)
  if (digits.length === 11) {
    if (!digits.startsWith('1')) {
      return false;
    }
    // Area code (second digit) cannot be 0 or 1
    return digits[1] !== '0' && digits[1] !== '1';
  }

  // Any other length is invalid
  return false;
}

/**
 * Format a phone number to E.164 format (+1XXXXXXXXXX)
 * Returns null if the number is not a valid US phone
 */
export function formatUSPhone(phone: string): string | null {
  if (!isValidUSPhone(phone)) {
    return null;
  }

  const digits = phone.replace(/\D/g, '');

  // 10 digits → prepend +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // 11 digits (starts with 1) → prepend +
  if (digits.length === 11) {
    return `+${digits}`;
  }

  return null;
}

/**
 * Format phone number for display: (XXX) XXX-XXXX
 * Returns the original input if not a valid US phone
 */
export function getPhoneDisplayFormat(phone: string): string {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');
  
  // Handle 11-digit with leading 1
  let normalizedDigits = digits;
  if (digits.length === 11 && digits.startsWith('1')) {
    normalizedDigits = digits.slice(1);
  }

  // Only format if we have exactly 10 digits
  if (normalizedDigits.length !== 10) {
    return phone;
  }

  const areaCode = normalizedDigits.slice(0, 3);
  const exchange = normalizedDigits.slice(3, 6);
  const subscriber = normalizedDigits.slice(6, 10);

  return `(${areaCode}) ${exchange}-${subscriber}`;
}

/**
 * Auto-format phone input as user types
 * Returns formatted string for display
 */
/**
 * Check if raw input looks like an international number (before stripping)
 * Returns true if the input appears to be international
 */
export function looksLikeInternationalNumber(value: string): boolean {
  const trimmed = value.trim();
  
  // Check for blocked country prefixes first
  for (const prefix of BLOCKED_COUNTRY_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return true;
    }
  }
  
  // Check for + followed by non-1 digit (international)
  if (trimmed.startsWith('+') && trimmed.length > 1) {
    const afterPlus = trimmed.charAt(1);
    if (afterPlus !== '1' && /\d/.test(afterPlus)) {
      return true;
    }
  }
  
  // Check for 00 prefix (international dialing)
  if (trimmed.startsWith('00')) {
    return true;
  }
  
  return false;
}

/**
 * Auto-format phone input as user types
 * Returns formatted string for display
 * BLOCKS international numbers before formatting
 */
export function formatPhoneInput(value: string): string {
  // CRITICAL: Check for international prefixes BEFORE stripping non-digits
  if (looksLikeInternationalNumber(value)) {
    // Return empty to block international input
    return '';
  }
  
  // Strip non-digits
  const digits = value.replace(/\D/g, '');
  
  // If starts with 1, treat as US country code and strip it
  let normalized = digits;
  if (digits.startsWith('1') && digits.length > 10) {
    normalized = digits.slice(1);
  }
  
  // Limit to 10 digits
  const limited = normalized.slice(0, 10);
  
  // Format progressively
  if (limited.length === 0) return '';
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
}

/**
 * Get the raw digits from a formatted phone string
 */
export function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validation result with user-friendly error message
 */
export interface PhoneValidationResult {
  valid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validate and return detailed result with error message
 */
export function validateUSPhone(phone: string): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Phone number is required' };
  }

  const trimmed = phone.trim();

  // Check for international prefixes
  for (const prefix of BLOCKED_COUNTRY_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return {
        valid: false,
        error: 'We currently serve US customers only. Please enter a US phone number.',
      };
    }
  }

  // Check for non-US + prefix
  if (trimmed.startsWith('+') && !trimmed.startsWith('+1')) {
    return {
      valid: false,
      error: 'We currently serve US customers only. Please enter a US phone number.',
    };
  }

  const digits = trimmed.replace(/\D/g, '');

  // Check minimum length
  if (digits.length < 10) {
    return {
      valid: false,
      error: 'Please enter a valid 10-digit US phone number.',
    };
  }

  // Check for too many digits (not a US format)
  if (digits.length > 11) {
    return {
      valid: false,
      error: 'Please enter a valid 10-digit US phone number.',
    };
  }

  // Check 11-digit format
  if (digits.length === 11 && !digits.startsWith('1')) {
    return {
      valid: false,
      error: 'We currently serve US customers only. Please enter a US phone number.',
    };
  }

  // Check area code validity
  const areaCode = digits.length === 11 ? digits[1] : digits[0];
  if (areaCode === '0' || areaCode === '1') {
    return {
      valid: false,
      error: 'Please enter a valid US phone number with a valid area code.',
    };
  }

  // Valid!
  const formatted = formatUSPhone(trimmed);
  return { valid: true, formatted: formatted || undefined };
}
