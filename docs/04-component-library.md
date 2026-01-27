# Component Library Documentation

## Overview

The Handledly component library consists of 80+ React components organized into logical categories.

---

## 1. Component Categories

| Category | Count | Location |
|----------|-------|----------|
| Layout | 4 | `src/components/layout/` |
| Conversion | 8 | `src/components/conversion/` |
| Services | 7 | `src/components/services/` |
| Admin | 9 | `src/components/admin/` |
| Icons | 8 | `src/components/icons/` |
| UI (shadcn) | 49 | `src/components/ui/` |
| Root-level | 15+ | `src/components/` |

---

## 2. Layout Components

### Header
**File**: `src/components/layout/Header.tsx`
**Purpose**: Site header with navigation and CTA

```tsx
interface HeaderProps {
  // No props - uses internal state
}

// Features:
// - Responsive navigation
// - Mobile hamburger menu
// - Scroll-based glass effect
// - ScrollProgress indicator
// - Phone number links
// - Get Quote CTA button
```

### Footer
**File**: `src/components/layout/Footer.tsx`
**Purpose**: Site footer with contact info and links

```tsx
// Sections:
// - Brand info + social links
// - Quick links navigation
// - Services list
// - Contact information
// - Business hours
// - Legal links (Privacy, Terms)
// - Copyright
```

### Container
**File**: `src/components/layout/Container.tsx`
**Purpose**: Max-width wrapper for content

```tsx
interface ContainerProps {
  children: ReactNode;
  className?: string;
}

// Usage:
<Container>
  <h1>Page Title</h1>
</Container>
```

### Section
**File**: `src/components/layout/Section.tsx`
**Purpose**: Page section wrapper with consistent padding

```tsx
interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

// Usage:
<Section id="services">
  <SectionHeader 
    title="Our Services" 
    subtitle="Professional moving solutions"
  />
  {/* Content */}
</Section>
```

---

## 3. Conversion Components

### QuoteFormWizard
**File**: `src/components/conversion/QuoteFormWizard.tsx`
**Purpose**: 3-step quote request form with auto-save

```tsx
interface QuoteFormWizardProps {
  onComplete?: (data: QuoteFormData) => void;
}

// Steps:
// 1. Service Type Selection
// 2. Move Details (addresses, date, property)
// 3. Contact Information

// Features:
// - Auto-save to localStorage
// - Progress indicator
// - Form validation (Zod)
// - Real-time quote preview
// - UTM parameter capture
```

### InstantQuotePreview
**File**: `src/components/conversion/InstantQuotePreview.tsx`
**Purpose**: Real-time quote estimate display

```tsx
interface InstantQuotePreviewProps {
  serviceType: string;
  bedrooms: number;
  estimatedHours: number;
  crewConfig: string;
}

// Shows:
// - Estimated price range
// - Crew size
// - Hourly rate
// - Included services
```

### MobileStickyCTA
**File**: `src/components/conversion/MobileStickyCTA.tsx`
**Purpose**: Fixed bottom CTA bar on mobile

```tsx
// Features:
// - Call Now button (tel: link)
// - Get Quote button
// - Hidden on /quote page
// - Large touch targets (48px+)
// - Glass morphism effect
```

### SocialProofBanner
**File**: `src/components/conversion/SocialProofBanner.tsx`
**Purpose**: Real-time booking notifications

```tsx
// Shows rotating notifications:
// - "Sarah from Cherry Creek just booked..."
// - "3 people viewing this page"
// - "Michael just requested a quote"

// Config:
// - 60-90 second intervals
// - Double-click to dismiss
// - Denver neighborhood names
```

### UrgencyBadge
**File**: `src/components/conversion/UrgencyBadge.tsx`
**Purpose**: FOMO/urgency indicators

```tsx
interface UrgencyBadgeProps {
  type: 'slots_limited' | 'discount_expiring' | 'same_day' | 'popular';
}

// Examples:
// - "Only 3 slots left this week!"
// - "15% off expires in 2 hours"
// - "Same-day available!"
```

### ScrollProgress
**File**: `src/components/conversion/ScrollProgress.tsx`
**Purpose**: Visual scroll progress indicator

```tsx
// Fixed bar at top showing scroll percentage
// Uses useScrollProgress hook
```

### AnimatedStats
**File**: `src/components/conversion/AnimatedStats.tsx`
**Purpose**: Animated counter statistics

```tsx
// Shows animated counting:
// - 10,000+ Moves Completed
// - 500+ 5-Star Reviews
// - 15+ Years Experience
```

---

## 4. Service Components

### ServicePageTemplate
**File**: `src/components/services/ServicePageTemplate.tsx`
**Purpose**: Unified template for all service pages

```tsx
interface ServicePageTemplateProps {
  data: ServiceData;
}

// Includes:
// - SEO component
// - ServiceHeroBanner
// - TrustBadges
// - ServiceIntro
// - FeatureCards
// - WhyExpertCare
// - RelatedServices
// - ServiceCTA
// - Testimonials
// - Footer
// - ChatWidget, VoiceAgent
```

### ServiceHeroBanner
**File**: `src/components/services/ServiceHeroBanner.tsx`
**Purpose**: Hero section for service pages

```tsx
interface ServiceHeroBannerProps {
  serviceName: string;
  tagline: string;
}

// Features:
// - Breadcrumb navigation
// - Service name + tagline
// - Star ratings display
// - Key statistics (customers, areas, moves)
```

### FeatureCards
**File**: `src/components/services/FeatureCards.tsx`
**Purpose**: Grid of service feature cards

```tsx
interface FeatureCardsProps {
  features: ServiceFeature[];
}

interface ServiceFeature {
  title: string;
  description: string;
}

// Icon mapping for 30+ feature titles
// Responsive grid layout
```

### ServiceCTA
**File**: `src/components/services/ServiceCTA.tsx`
**Purpose**: Call-to-action section

```tsx
interface ServiceCTAProps {
  steps: string[];
}

// Two-column layout:
// - Left: Headline, steps, CTA buttons
// - Right: Trust badges, benefits, testimonial
```

---

## 5. Admin Components

### AdminLayout
**File**: `src/components/admin/AdminLayout.tsx`
**Purpose**: Admin dashboard layout wrapper

```tsx
// Structure:
// - AdminHeader (top)
// - AdminSidebar (left)
// - Main content area (Outlet)
```

### AdminSidebar
**File**: `src/components/admin/AdminSidebar.tsx`
**Purpose**: Navigation sidebar

```tsx
// Links:
// - Overview
// - Leads
// - Conversations
// - Call Logs
// - Appointments
// - Users
// - Settings
```

### AdminHeader
**File**: `src/components/admin/AdminHeader.tsx`
**Purpose**: Admin header with user menu

```tsx
// Features:
// - Logo/brand
// - User dropdown
// - Logout option
```

### StatsCard
**File**: `src/components/admin/StatsCard.tsx`
**Purpose**: Metric display card

```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: LucideIcon;
}
```

### DeliverablesPDFReport
**File**: `src/components/admin/DeliverablesPDFReport.tsx`
**Purpose**: PDF export for project deliverables

```tsx
// Uses @react-pdf/renderer
// 3-page branded report:
// - Executive summary
// - Platform metrics
// - Technical infrastructure
// - Recent leads
```

### LaunchReadinessTracker
**File**: `src/components/admin/LaunchReadinessTracker.tsx`
**Purpose**: Launch checklist visualization

### E2ETestChecklist
**File**: `src/components/admin/E2ETestChecklist.tsx`
**Purpose**: End-to-end testing checklist

```tsx
// 10 critical items:
// - Quote form submission
// - Email delivery
// - AI call trigger
// - Webhook processing
// - etc.
```

### LaunchAlerts
**File**: `src/components/admin/LaunchAlerts.tsx`
**Purpose**: Real-time monitoring alerts

### QuickReferenceCard
**File**: `src/components/admin/QuickReferenceCard.tsx`
**Purpose**: Quick access to support info

---

## 6. Root-Level Components

### ChatWidget
**File**: `src/components/ChatWidget.tsx`
**Purpose**: Floating AI chat interface

```tsx
// Features:
// - Expandable/collapsible
// - AI chat via useAIChat hook
// - Quick action buttons
// - Quote submission capability
// - Analytics tracking
```

### VoiceAgent
**File**: `src/components/VoiceAgent.tsx`
**Purpose**: Voice AI interaction button

```tsx
// Uses @elevenlabs/react useConversation
// WebRTC connection to ElevenLabs
// Microphone permission handling
```

### ExitIntentModal
**File**: `src/components/ExitIntentModal.tsx`
**Purpose**: Exit intent capture popup

```tsx
// Triggers on:
// - Mouse leaving viewport (desktop)
// - Back button (mobile)

// Offers:
// - 10% discount
// - Free packing supplies
// - 15-minute countdown timer
```

### StickyCTA
**File**: `src/components/StickyCTA.tsx`
**Purpose**: Scroll-triggered floating CTA

```tsx
// Appears after scrolling
// Phone number + Quote button
// Hidden on mobile (MobileStickyCTA used instead)
```

### TrustBadges
**File**: `src/components/TrustBadges.tsx`
**Purpose**: Trust signal badges

```tsx
// Shows:
// - USDOT Licensed
// - Colorado PUC Certified
// - $750K General Liability
// - Workers' Comp
```

### GoogleReviewsBadge
**File**: `src/components/GoogleReviewsBadge.tsx`
**Purpose**: Google reviews display

```tsx
// Shows:
// - 4.9 star rating
// - 500+ reviews
// - Google logo
```

### Testimonials
**File**: `src/components/Testimonials.tsx`
**Purpose**: Customer testimonial carousel

### HowItWorks
**File**: `src/components/HowItWorks.tsx`
**Purpose**: 3-step process explanation

### PricingDisplay
**File**: `src/components/PricingDisplay.tsx`
**Purpose**: Transparent pricing table

### MeetTheTeam
**File**: `src/components/MeetTheTeam.tsx`
**Purpose**: Team member display

```tsx
interface MeetTheTeamProps {
  variant: 'full' | 'compact';
}
```

### SEO
**File**: `src/components/SEO.tsx`
**Purpose**: Dynamic meta tags + structured data

```tsx
interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string;
  type?: string;
}

// Uses react-helmet-async
// Includes JSON-LD LocalBusiness schema
```

---

## 7. shadcn/ui Components (49)

All shadcn/ui components are in `src/components/ui/`:

### Form Components
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line input
- `select.tsx` - Dropdown select
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - Radio buttons
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider
- `calendar.tsx` - Date picker
- `form.tsx` - Form wrapper with validation
- `label.tsx` - Form labels
- `input-otp.tsx` - OTP input

### Display Components
- `card.tsx` - Card container
- `badge.tsx` - Status badges
- `avatar.tsx` - User avatars
- `table.tsx` - Data tables
- `progress.tsx` - Progress bars
- `skeleton.tsx` - Loading skeletons
- `separator.tsx` - Dividers
- `aspect-ratio.tsx` - Aspect ratio container

### Overlay Components
- `dialog.tsx` - Modal dialogs
- `sheet.tsx` - Slide-out panels
- `drawer.tsx` - Bottom drawer
- `popover.tsx` - Popovers
- `tooltip.tsx` - Tooltips
- `hover-card.tsx` - Hover cards
- `alert-dialog.tsx` - Confirmation dialogs
- `dropdown-menu.tsx` - Dropdown menus
- `context-menu.tsx` - Right-click menus
- `command.tsx` - Command palette

### Navigation Components
- `navigation-menu.tsx` - Navigation menus
- `menubar.tsx` - Menu bars
- `tabs.tsx` - Tab navigation
- `breadcrumb.tsx` - Breadcrumbs
- `pagination.tsx` - Pagination

### Layout Components
- `accordion.tsx` - Expandable sections
- `collapsible.tsx` - Collapsible content
- `scroll-area.tsx` - Custom scrollbars
- `resizable.tsx` - Resizable panels
- `sidebar.tsx` - Sidebar layout

### Feedback Components
- `alert.tsx` - Alert messages
- `toast.tsx` - Toast notifications
- `toaster.tsx` - Toast container
- `sonner.tsx` - Sonner integration

### Interactive Components
- `button.tsx` - Buttons with variants
- `toggle.tsx` - Toggle buttons
- `toggle-group.tsx` - Toggle button groups
- `carousel.tsx` - Image carousels

### Utility
- `chart.tsx` - Chart wrapper
- `use-toast.ts` - Toast hook

---

## 8. Icon Components

### IconWrapper
**File**: `src/components/icons/IconWrapper.tsx`
**Purpose**: Consistent icon styling wrapper

```tsx
interface IconWrapperProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'gold';
}
```

### BrandIcon
**File**: `src/components/icons/BrandIcon.tsx`
**Purpose**: Brand-specific icons

### TrustIcons
**File**: `src/components/icons/TrustIcons.tsx`
**Purpose**: Trust badge icons (USDOT, Insurance, etc.)
### ServiceIcons
**File**: `src/components/icons/ServiceIcons.tsx`
**Purpose**: Service-specific icons

### ProcessIcons
**File**: `src/components/icons/ProcessIcons.tsx`
**Purpose**: Process step icons

### LocationIcons
**File**: `src/components/icons/LocationIcons.tsx`
**Purpose**: Location/map icons

### TechIcons
**File**: `src/components/icons/TechIcons.tsx`
**Purpose**: Technology stack icons

---

## 9. Component Best Practices

### Naming Conventions
- PascalCase for component names
- Descriptive, action-oriented names
- Suffix with purpose (e.g., `StatsCard`, `QuoteFormWizard`)

### Props Pattern
```tsx
interface ComponentProps {
  // Required props first
  title: string;
  
  // Optional props with defaults
  variant?: 'default' | 'primary';
  className?: string;
  
  // Event handlers
  onClick?: () => void;
  
  // Children last
  children?: ReactNode;
}
```

### Styling Pattern
```tsx
import { cn } from '@/lib/utils';

function Component({ className, variant }: Props) {
  return (
    <div className={cn(
      // Base styles
      'rounded-lg p-4',
      // Variant styles
      variant === 'primary' && 'bg-primary text-primary-foreground',
      // Custom className override
      className
    )}>
      {/* Content */}
    </div>
  );
}
```

---

*Last Updated: January 25, 2026*
