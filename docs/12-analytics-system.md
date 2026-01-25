# Analytics & Conversion Tracking Documentation

## Overview

The Handledly platform includes an enterprise-grade analytics system with 23 tracked conversion events, A/B testing capability, and GA4 integration.

---

## 1. Analytics Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Application                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  ConversionEvents│  │    ABTest       │  │   PageTiming    │  │
│  │     Object      │  │    Object       │  │    Object       │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼─────────────────────┼─────────────────────┼─────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      trackEvent() Core                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  • Generate session ID                                       │ │
│  │  • Get current page path                                     │ │
│  │  • Add timestamp                                             │ │
│  │  • Merge properties                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Destinations                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Google GA4    │  │  Console (dev)  │  │  Future: Mixpanel│  │
│  │   gtag('event') │  │   console.log   │  │   Analytics      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Event Categories

### Form Events (4)

| Event | Trigger | Properties |
|-------|---------|------------|
| `form_started` | User focuses first field | `form_type` |
| `form_step_completed` | Step navigation | `step`, `time_spent_seconds`, `form_type` |
| `form_submitted` | Successful submission | `form_type`, `value` |
| `form_abandoned` | Exit without submit | `form_type`, `last_step`, `time_spent_seconds` |

### Exit Intent Events (3)

| Event | Trigger | Properties |
|-------|---------|------------|
| `exit_intent_triggered` | Mouse leaves viewport | `variant` |
| `exit_intent_converted` | User submits offer | `variant`, `action` |
| `exit_intent_dismissed` | User closes modal | `variant` |

### Social Proof Events (2)

| Event | Trigger | Properties |
|-------|---------|------------|
| `social_proof_viewed` | Notification displayed | `notification_type`, `page` |
| `social_proof_clicked` | User clicks notification | `notification_type`, `action` |

### Urgency Badge Events (2)

| Event | Trigger | Properties |
|-------|---------|------------|
| `urgency_badge_viewed` | Badge rendered | `badge_type`, `service` |
| `urgency_badge_clicked` | User clicks badge | `badge_type`, `service` |

### Mobile CTA Events (1)

| Event | Trigger | Properties |
|-------|---------|------------|
| `mobile_cta_clicked` | Tap on mobile CTA | `action`, `page` |

### Scroll Events (1)

| Event | Trigger | Properties |
|-------|---------|------------|
| `scroll_milestone` | 25%, 50%, 75%, 100% scroll | `percentage`, `page` |

### Quote Events (2)

| Event | Trigger | Properties |
|-------|---------|------------|
| `quote_requested` | Quote form submitted | `service_type`, `estimated_value` |
| `quote_previewed` | Live preview shown | `service_type`, `estimated_value` |

### Chat Events (7)

| Event | Trigger | Properties |
|-------|---------|------------|
| `chat_started` | Chat widget opened | `variant` ('floating'/'inline'), `page` |
| `chat_message_sent` | User sends message | `message_length`, `is_first_message` |
| `chat_quote_requested` | Intent detected | `page` |
| `chat_quote_submitted` | Quote via chat | `quote_number`, `estimated_value`, `service_type` |
| `chat_ended` | Chat closed | `total_messages`, `duration_seconds`, `quote_submitted` |
| `chat_quick_action_used` | Quick action clicked | `action`, `page` |
| `chat_human_requested` | Transfer request | `messages_before_request` |

---

## 3. Implementation Details

### Core Event Tracking

**File**: `src/lib/analytics.ts` (267 lines)

```typescript
// Session ID generation
const getSessionId = (): string => {
  const key = 'conversion_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
};

// GA4 integration
const sendToGA4 = (eventName: string, params: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

// Core tracking function
const trackEvent = (
  event: ConversionEventType,
  properties?: Record<string, unknown>
): void => {
  const payload: ConversionEventPayload = {
    event,
    properties,
    timestamp: new Date(),
    page: window.location.pathname,
    sessionId: getSessionId(),
  };

  // Send to GA4 with conversion_ prefix
  sendToGA4(`conversion_${event}`, {
    ...properties,
    session_id: payload.sessionId,
    page_path: payload.page,
  });

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Conversion Event:', payload);
  }
};
```

### Usage Examples

```typescript
import { ConversionEvents } from '@/lib/analytics';

// Form tracking
ConversionEvents.formStarted('quote-wizard');
ConversionEvents.formStepCompleted(2, 45, 'quote-wizard');
ConversionEvents.formSubmitted('quote-wizard', 450);

// Chat tracking
ConversionEvents.chatStarted('floating', '/services');
ConversionEvents.chatMessageSent(50, true);
ConversionEvents.chatQuoteSubmitted('HM-2026-A1B2', 450, 'local-moving');

// Exit intent
ConversionEvents.exitIntentTriggered('discount_10');
ConversionEvents.exitIntentConverted('discount_10', 'email_submitted');
```

---

## 4. A/B Testing System

### Configuration

```typescript
export const ABTest = {
  getVariant: (
    testId: string, 
    variants: string[], 
    weights?: number[]
  ): string => {
    const storageKey = `ab_test_${testId}`;
    const stored = localStorage.getItem(storageKey);

    // Return existing assignment
    if (stored) {
      const parsed = JSON.parse(stored);
      if (variants.includes(parsed.variant)) {
        return parsed.variant;
      }
    }

    // Weighted random assignment
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
    } else {
      selectedVariant = variants[Math.floor(Math.random() * variants.length)];
    }

    // Persist assignment
    localStorage.setItem(storageKey, JSON.stringify({
      variant: selectedVariant,
      assignedAt: new Date().toISOString(),
    }));

    return selectedVariant;
  },
};
```

### Usage

```typescript
import { ABTest } from '@/lib/analytics';

// Equal weight test
const ctaVariant = ABTest.getVariant('cta_color', ['blue', 'green', 'gold']);

// Weighted test (70/30 split)
const formVariant = ABTest.getVariant('form_steps', ['3_step', '2_step'], [70, 30]);
```

---

## 5. Page Timing Utilities

```typescript
export const PageTiming = {
  startTime: Date.now(),

  getTimeOnPage: (): number => {
    return Math.round((Date.now() - PageTiming.startTime) / 1000);
  },

  reset: () => {
    PageTiming.startTime = Date.now();
  },
};

// Usage
const timeSpent = PageTiming.getTimeOnPage(); // seconds on page
```

---

## 6. Type Definitions

**File**: `src/types/conversion.ts`

```typescript
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
```

---

## 7. GA4 Configuration

### Expected Setup

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Event Naming Convention

All events are prefixed with `conversion_` in GA4:
- `conversion_form_started`
- `conversion_chat_quote_submitted`
- etc.

### Recommended GA4 Conversions

Configure these as conversions in GA4:
1. `conversion_form_submitted`
2. `conversion_quote_requested`
3. `conversion_chat_quote_submitted`
4. `conversion_exit_intent_converted`

---

## 8. Conversion Funnel

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWARENESS                                 │
│  • Page view                                                     │
│  • scroll_milestone (25%, 50%, 75%, 100%)                       │
│  • social_proof_viewed                                          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CONSIDERATION                             │
│  • form_started                                                  │
│  • chat_started                                                  │
│  • quote_previewed                                               │
│  • urgency_badge_viewed                                          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        INTENT                                    │
│  • form_step_completed (step 1, 2, 3)                           │
│  • chat_message_sent                                             │
│  • chat_quote_requested                                          │
│  • mobile_cta_clicked                                            │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│       EXIT PATH               │ │      CONVERSION PATH          │
│  • exit_intent_triggered      │ │  • form_submitted             │
│  • form_abandoned             │ │  • quote_requested            │
│  • exit_intent_dismissed      │ │  • chat_quote_submitted       │
└───────────────────────────────┘ │  • exit_intent_converted      │
                                  └───────────────────────────────┘
```

---

## 9. Event Matrix (CSV Export)

```csv
Event Name,Category,Trigger,Property 1,Property 2,Property 3
form_started,Form,First field focus,form_type,,
form_step_completed,Form,Step navigation,step,time_spent_seconds,form_type
form_submitted,Form,Successful submit,form_type,value,
form_abandoned,Form,Exit without submit,form_type,last_step,time_spent_seconds
exit_intent_triggered,Exit Intent,Mouse leaves viewport,variant,,
exit_intent_converted,Exit Intent,Offer submitted,variant,action,
exit_intent_dismissed,Exit Intent,Modal closed,variant,,
social_proof_viewed,Social Proof,Notification shown,notification_type,page,
social_proof_clicked,Social Proof,Click notification,notification_type,action,
urgency_badge_viewed,Urgency,Badge rendered,badge_type,service,
urgency_badge_clicked,Urgency,Badge clicked,badge_type,service,
mobile_cta_clicked,Mobile,CTA tapped,action,page,
scroll_milestone,Engagement,Scroll depth,percentage,page,
quote_requested,Quote,Form submitted,service_type,estimated_value,
quote_previewed,Quote,Preview shown,service_type,estimated_value,
chat_started,Chat,Widget opened,variant,page,
chat_message_sent,Chat,Message sent,message_length,is_first_message,
chat_quote_requested,Chat,Intent detected,page,,
chat_quote_submitted,Chat,Quote via chat,quote_number,estimated_value,service_type
chat_ended,Chat,Widget closed,total_messages,duration_seconds,quote_submitted
chat_quick_action_used,Chat,Quick action click,action,page,
chat_human_requested,Chat,Transfer request,messages_before_request,,
```

---

## 10. Integration Checklist

- [ ] GA4 property created (G-XXXXXXXXXX)
- [ ] gtag script added to index.html
- [ ] Conversions configured in GA4
- [ ] Facebook Pixel ID added (optional)
- [ ] Google Ads conversion tracking (AW-XXXXXXXXX)
- [ ] Custom events verified in GA4 DebugView

---

*Last Updated: January 25, 2026*
