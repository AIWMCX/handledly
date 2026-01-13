// Secure localStorage wrapper with encryption and expiry support
// Used for form persistence and conversion data

import { PersistedFormData } from '@/types/conversion';

// Simple encoding (not true encryption, but obfuscates data)
const encode = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
};

const decode = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data;
  }
};

// Check if localStorage is available
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Storage prefix for namespacing
const STORAGE_PREFIX = 'conv_';

// Secure storage operations
export const SecureStorage = {
  /**
   * Set an item with optional expiry
   */
  set: <T>(key: string, value: T, expiryDays?: number): boolean => {
    if (!isStorageAvailable()) return false;

    try {
      const item = {
        data: value,
        savedAt: new Date().toISOString(),
        expiresAt: expiryDays
          ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
      };

      const encoded = encode(JSON.stringify(item));
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, encoded);
      return true;
    } catch (error) {
      console.warn('Storage set failed:', error);
      return false;
    }
  },

  /**
   * Get an item, returns null if expired or not found
   */
  get: <T>(key: string): T | null => {
    if (!isStorageAvailable()) return null;

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!stored) return null;

      const decoded = decode(stored);
      const item = JSON.parse(decoded);

      // Check expiry
      if (item.expiresAt && new Date(item.expiresAt) < new Date()) {
        SecureStorage.remove(key);
        return null;
      }

      return item.data as T;
    } catch (error) {
      console.warn('Storage get failed:', error);
      return null;
    }
  },

  /**
   * Remove an item
   */
  remove: (key: string): boolean => {
    if (!isStorageAvailable()) return false;

    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if item exists and is not expired
   */
  has: (key: string): boolean => {
    return SecureStorage.get(key) !== null;
  },

  /**
   * Clear all conversion-related storage
   */
  clearAll: (): void => {
    if (!isStorageAvailable()) return;

    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};

// Form-specific persistence
export const FormStorage = {
  /**
   * Save form data with step tracking
   */
  saveFormData: <T>(
    formId: string,
    data: T,
    currentStep: number,
    completedSteps: number[]
  ): boolean => {
    const persistedData: PersistedFormData<T> = {
      data,
      savedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      step: currentStep,
      completedSteps,
    };

    return SecureStorage.set(`form_${formId}`, persistedData, 7);
  },

  /**
   * Load saved form data
   */
  loadFormData: <T>(formId: string): PersistedFormData<T> | null => {
    return SecureStorage.get<PersistedFormData<T>>(`form_${formId}`);
  },

  /**
   * Clear form data
   */
  clearFormData: (formId: string): boolean => {
    return SecureStorage.remove(`form_${formId}`);
  },

  /**
   * Check if form has saved data
   */
  hasSavedData: (formId: string): boolean => {
    return SecureStorage.has(`form_${formId}`);
  },
};

// Exit intent tracking
export const ExitIntentStorage = {
  /**
   * Mark exit intent as shown
   */
  markShown: (variant: string): void => {
    SecureStorage.set('exit_intent_shown', { variant, shownAt: new Date() }, 1);
  },

  /**
   * Check if exit intent was already shown
   */
  wasShown: (): boolean => {
    return SecureStorage.has('exit_intent_shown');
  },

  /**
   * Mark exit intent as converted
   */
  markConverted: (variant: string, action: string): void => {
    SecureStorage.set('exit_intent_converted', { variant, action, at: new Date() }, 30);
  },

  /**
   * Check if already converted
   */
  wasConverted: (): boolean => {
    return SecureStorage.has('exit_intent_converted');
  },
};

// Social proof interaction tracking
export const SocialProofStorage = {
  /**
   * Track viewed notifications
   */
  trackViewed: (notificationId: string): void => {
    const viewed = SecureStorage.get<string[]>('social_proof_viewed') || [];
    if (!viewed.includes(notificationId)) {
      viewed.push(notificationId);
      SecureStorage.set('social_proof_viewed', viewed.slice(-50), 1); // Keep last 50
    }
  },

  /**
   * Get last interaction time
   */
  getLastInteraction: (): Date | null => {
    const data = SecureStorage.get<{ at: string }>('social_proof_last');
    return data ? new Date(data.at) : null;
  },

  /**
   * Update last interaction time
   */
  updateLastInteraction: (): void => {
    SecureStorage.set('social_proof_last', { at: new Date() }, 1);
  },
};

export default SecureStorage;
