// Enterprise-grade analytics library for conversion tracking
// Supports GA4 + Custom Events with full type safety

import { ConversionEventType, ConversionEventPayload } from '@/types/conversion';

// Generate session ID
const getSessionId = (): string => {
  const key = 'conversion_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
};

// Get current page path
const getCurrentPage = (): string => {
  return window.location.pathname;
};

// Send event to GA4 (if available)
const sendToGA4 = (eventName: string, params: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

// Log event for debugging (development only)
const logEvent = (event: ConversionEventPayload) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Conversion Event:', {
      event: event.event,
      properties: event.properties,
      page: event.page,
    });
  }
};

// Core event tracking function
const trackEvent = (
  event: ConversionEventType,
  properties?: Record<string, unknown>
): void => {
  const payload: ConversionEventPayload = {
    event,
    properties,
    timestamp: new Date(),
    page: getCurrentPage(),
    sessionId: getSessionId(),
  };

  // Send to GA4
  sendToGA4(`conversion_${event}`, {
    ...properties,
    session_id: payload.sessionId,
    page_path: payload.page,
  });

  // Log for debugging
  logEvent(payload);
};

// Typed conversion events
export const ConversionEvents = {
  // Form Events
  formStarted: (formType: string) => {
    trackEvent('form_started', { form_type: formType });
  },

  formStepCompleted: (step: number, timeSpentSeconds: number, formType?: string) => {
    trackEvent('form_step_completed', {
      step,
      time_spent_seconds: timeSpentSeconds,
      form_type: formType,
    });
  },

  formSubmitted: (formType: string, value?: number) => {
    trackEvent('form_submitted', {
      form_type: formType,
      value,
    });
  },

  formAbandoned: (formType: string, lastStep: number, timeSpentSeconds: number) => {
    trackEvent('form_abandoned', {
      form_type: formType,
      last_step: lastStep,
      time_spent_seconds: timeSpentSeconds,
    });
  },

  // Exit Intent Events
  exitIntentTriggered: (variant: string) => {
    trackEvent('exit_intent_triggered', { variant });
  },

  exitIntentConverted: (variant: string, action: string) => {
    trackEvent('exit_intent_converted', { variant, action });
  },

  exitIntentDismissed: (variant: string) => {
    trackEvent('exit_intent_dismissed', { variant });
  },

  // Social Proof Events
  socialProofViewed: (notificationType: string, page: string) => {
    trackEvent('social_proof_viewed', {
      notification_type: notificationType,
      page,
    });
  },

  socialProofClicked: (notificationType: string, action: string) => {
    trackEvent('social_proof_clicked', {
      notification_type: notificationType,
      action,
    });
  },

  // Urgency Badge Events
  urgencyBadgeViewed: (badgeType: string, service?: string) => {
    trackEvent('urgency_badge_viewed', {
      badge_type: badgeType,
      service,
    });
  },

  urgencyBadgeClicked: (badgeType: string, service?: string) => {
    trackEvent('urgency_badge_clicked', {
      badge_type: badgeType,
      service,
    });
  },

  // Mobile CTA Events
  mobileCTAClicked: (action: string, page: string) => {
    trackEvent('mobile_cta_clicked', { action, page });
  },

  // Scroll Events
  scrollMilestone: (percentage: number, page: string) => {
    trackEvent('scroll_milestone', { percentage, page });
  },

  // Quote Events
  quoteRequested: (serviceType: string, estimatedValue: number) => {
    trackEvent('quote_requested', {
      service_type: serviceType,
      estimated_value: estimatedValue,
    });
  },

  quotePreviewed: (serviceType: string, estimatedValue: number) => {
    trackEvent('quote_previewed', {
      service_type: serviceType,
      estimated_value: estimatedValue,
    });
  },

  // Chat Events
  chatStarted: (variant: 'floating' | 'inline', page: string) => {
    trackEvent('chat_started', { variant, page });
  },

  chatMessageSent: (messageLength: number, isFirstMessage: boolean) => {
    trackEvent('chat_message_sent', {
      message_length: messageLength,
      is_first_message: isFirstMessage,
    });
  },

  chatQuoteRequested: (page: string) => {
    trackEvent('chat_quote_requested', { page });
  },

  chatQuoteSubmitted: (quoteNumber: string, estimatedValue: number, serviceType?: string) => {
    trackEvent('chat_quote_submitted', {
      quote_number: quoteNumber,
      estimated_value: estimatedValue,
      service_type: serviceType,
    });
  },

  chatEnded: (totalMessages: number, durationSeconds: number, quoteSubmitted: boolean) => {
    trackEvent('chat_ended', {
      total_messages: totalMessages,
      duration_seconds: durationSeconds,
      quote_submitted: quoteSubmitted,
    });
  },

  chatQuickActionUsed: (action: string, page: string) => {
    trackEvent('chat_quick_action_used', { action, page });
  },

  chatHumanRequested: (messageCount: number) => {
    trackEvent('chat_human_requested', { messages_before_request: messageCount });
  },

  // Phone Click Events - P1 tracking
  phoneClicked: (location: 'header' | 'sticky_cta' | 'hero' | 'footer' | 'mobile_cta', phoneNumber: string) => {
    trackEvent('phone_clicked', { 
      location, 
      phone_number: phoneNumber,
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
    });
  },

  // Service Card Events
  serviceCardClicked: (serviceName: string, source: 'homepage' | 'services_page') => {
    trackEvent('service_card_clicked', { service_name: serviceName, source });
  },

  // CTA Click Events
  ctaClicked: (ctaText: string, location: string, variant?: string) => {
    trackEvent('cta_clicked', { cta_text: ctaText, location, variant });
  },
};

// A/B Test Assignment
export const ABTest = {
  getVariant: (testId: string, variants: string[], weights?: number[]): string => {
    const storageKey = `ab_test_${testId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (variants.includes(parsed.variant)) {
          return parsed.variant;
        }
      } catch {
        // Invalid stored data, reassign
      }
    }

    // Assign new variant
    let selectedVariant: string;

    if (weights && weights.length === variants.length) {
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const random = Math.random() * totalWeight;
      let cumulative = 0;

      for (let i = 0; i < variants.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          selectedVariant = variants[i];
          break;
        }
      }
      selectedVariant = selectedVariant! || variants[0];
    } else {
      selectedVariant = variants[Math.floor(Math.random() * variants.length)];
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        variant: selectedVariant,
        assignedAt: new Date().toISOString(),
      })
    );

    return selectedVariant;
  },
};

// Page timing utilities
export const PageTiming = {
  startTime: Date.now(),

  getTimeOnPage: (): number => {
    return Math.round((Date.now() - PageTiming.startTime) / 1000);
  },

  reset: () => {
    PageTiming.startTime = Date.now();
  },
};

export default ConversionEvents;
