import { useState, useEffect, useCallback, useRef } from 'react';
import { FormStorage } from '@/lib/storage';
import { PersistedFormData } from '@/types/conversion';

interface UseFormPersistenceOptions<T> {
  formId: string;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseFormPersistenceReturn<T> {
  savedData: PersistedFormData<T> | null;
  hasRestoredData: boolean;
  saveData: (data: T, currentStep: number, completedSteps: number[]) => void;
  clearData: () => void;
  loadData: () => PersistedFormData<T> | null;
  markRestored: () => void;
}

export function useFormPersistence<T>(
  options: UseFormPersistenceOptions<T>
): UseFormPersistenceReturn<T> {
  const { formId, debounceMs = 1000, enabled = true } = options;

  const [savedData, setSavedData] = useState<PersistedFormData<T> | null>(null);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved data on mount
  useEffect(() => {
    if (!enabled) return;

    const loaded = FormStorage.loadFormData<T>(formId);
    if (loaded) {
      setSavedData(loaded);
    }
  }, [formId, enabled]);

  // Save data with debouncing
  const saveData = useCallback(
    (data: T, currentStep: number, completedSteps: number[]) => {
      if (!enabled) return;

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the save
      debounceTimeoutRef.current = setTimeout(() => {
        FormStorage.saveFormData(formId, data, currentStep, completedSteps);
        
        // Update local state
        const newSavedData: PersistedFormData<T> = {
          data,
          savedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          step: currentStep,
          completedSteps,
        };
        setSavedData(newSavedData);
      }, debounceMs);
    },
    [formId, debounceMs, enabled]
  );

  // Clear saved data
  const clearData = useCallback(() => {
    FormStorage.clearFormData(formId);
    setSavedData(null);
    setHasRestoredData(false);
  }, [formId]);

  // Load data manually
  const loadData = useCallback((): PersistedFormData<T> | null => {
    return FormStorage.loadFormData<T>(formId);
  }, [formId]);

  // Mark data as restored (to show "Welcome back" once)
  const markRestored = useCallback(() => {
    setHasRestoredData(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    savedData,
    hasRestoredData,
    saveData,
    clearData,
    loadData,
    markRestored,
  };
}

export default useFormPersistence;
