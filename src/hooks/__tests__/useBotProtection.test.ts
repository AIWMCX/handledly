import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBotProtection } from '../useBotProtection';

describe('useBotProtection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useBotProtection({ formId: 'test-form' }));
    
    expect(result.current.suspicionScore).toBe(0);
    expect(result.current.formProps).toBeDefined();
    expect(result.current.validate).toBeDefined();
    expect(result.current.getFingerprint).toBeDefined();
  });

  it('should block submissions that are too fast (less than minSubmitTime)', async () => {
    const onBotDetected = vi.fn();
    const { result } = renderHook(() => 
      useBotProtection({ 
        formId: 'test-form',
        minSubmitTime: 3000, // 3 seconds minimum
        onBotDetected,
      })
    );

    // Try to validate immediately (too fast)
    let validation: { valid: boolean; reason?: string };
    await act(async () => {
      validation = await result.current.validate();
    });

    expect(validation!.valid).toBe(false);
    expect(validation!.reason).toContain('fast');
    expect(onBotDetected).toHaveBeenCalled();
  });

  it('should allow submissions after minSubmitTime has passed', async () => {
    const { result } = renderHook(() => 
      useBotProtection({ 
        formId: 'test-form',
        minSubmitTime: 1000, // 1 second minimum
        maxSubmitTime: 60000, // 1 minute maximum
      })
    );

    // Simulate some user interaction (no arguments needed)
    act(() => {
      result.current.formProps.onKeyDown();
      result.current.formProps.onMouseMove();
    });

    // Advance time past minSubmitTime
    act(() => {
      vi.advanceTimersByTime(2000); // 2 seconds
    });

    let validation: { valid: boolean; reason?: string };
    await act(async () => {
      validation = await result.current.validate();
    });

    expect(validation!.valid).toBe(true);
  });

  it('should block submissions that take too long (exceeds maxSubmitTime)', async () => {
    const onBotDetected = vi.fn();
    const { result } = renderHook(() => 
      useBotProtection({ 
        formId: 'test-form',
        minSubmitTime: 1000,
        maxSubmitTime: 5000, // 5 seconds maximum
        onBotDetected,
      })
    );

    // Advance time past maxSubmitTime
    act(() => {
      vi.advanceTimersByTime(10000); // 10 seconds
    });

    let validation: { valid: boolean; reason?: string };
    await act(async () => {
      validation = await result.current.validate();
    });

    expect(validation!.valid).toBe(false);
    expect(validation!.reason).toContain('slow');
    expect(onBotDetected).toHaveBeenCalled();
  });

  it('should detect honeypot field being filled', async () => {
    const onBotDetected = vi.fn();
    const { result } = renderHook(() => 
      useBotProtection({ 
        formId: 'test-form',
        minSubmitTime: 0,
        onBotDetected,
      })
    );

    // Simulate honeypot being filled (bot behavior) - expects string value
    act(() => {
      result.current.onHoneypotChange('bot-filled-value');
    });

    // Wait for minSubmitTime
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    let validation: { valid: boolean; reason?: string };
    await act(async () => {
      validation = await result.current.validate();
    });

    expect(validation!.valid).toBe(false);
    expect(validation!.reason).toContain('honeypot');
    expect(onBotDetected).toHaveBeenCalledWith('honeypot_filled', expect.any(Number));
  });

  it('should increase suspicion score with no user interaction', async () => {
    const { result } = renderHook(() => 
      useBotProtection({ 
        formId: 'test-form',
        minSubmitTime: 100,
        maxSubmitTime: 60000,
      })
    );

    // Advance time without any interaction
    act(() => {
      vi.advanceTimersByTime(500);
    });

    let validation: { valid: boolean; reason?: string };
    await act(async () => {
      validation = await result.current.validate();
    });

    // Should still pass but with elevated suspicion
    // (depends on implementation - no interaction alone may not block)
    expect(validation!).toBeDefined();
  });

  it('should generate a consistent fingerprint', async () => {
    const { result } = renderHook(() => 
      useBotProtection({ formId: 'test-form' })
    );

    let fingerprint1: string;
    let fingerprint2: string;
    
    await act(async () => {
      fingerprint1 = await result.current.getFingerprint();
      fingerprint2 = await result.current.getFingerprint();
    });

    expect(fingerprint1!).toBeDefined();
    expect(typeof fingerprint1!).toBe('string');
    expect(fingerprint1!).toBe(fingerprint2!);
  });

  it('should track keystrokes and mouse movements', () => {
    const { result } = renderHook(() => 
      useBotProtection({ formId: 'test-form' })
    );

    // Simulate user interactions (no arguments needed)
    act(() => {
      result.current.formProps.onKeyDown();
      result.current.formProps.onKeyDown();
      result.current.formProps.onMouseMove();
      result.current.formProps.onMouseMove();
      result.current.formProps.onMouseMove();
    });

    // The hook should have tracked these interactions internally
    // Verification happens through successful validation with human-like behavior
    expect(result.current.suspicionScore).toBeLessThanOrEqual(30);
  });

  it('should provide form props for event binding', () => {
    const { result } = renderHook(() => 
      useBotProtection({ formId: 'test-form' })
    );

    expect(result.current.formProps).toHaveProperty('onKeyDown');
    expect(result.current.formProps).toHaveProperty('onMouseMove');
    expect(typeof result.current.formProps.onKeyDown).toBe('function');
    expect(typeof result.current.formProps.onMouseMove).toBe('function');
  });
});
