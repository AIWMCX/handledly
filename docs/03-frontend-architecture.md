# Frontend Architecture Documentation

## Overview

The Handledly frontend is a React 18 Single Page Application built with TypeScript, Tailwind CSS, and shadcn/ui components.

---

## 1. Project Structure

```
src/
├── components/           # Reusable UI components (80+)
│   ├── admin/           # Admin dashboard components (9)
│   ├── conversion/      # Conversion optimization (8)
│   ├── icons/           # Custom icon components (8)
│   ├── layout/          # Layout components (4)
│   ├── services/        # Service page components (7)
│   └── ui/              # shadcn/ui primitives (49)
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state
├── data/                # Static data files
│   ├── servicesData.ts  # Service page content
│   └── teamData.ts      # Team member info
├── hooks/               # Custom React hooks (10)
├── integrations/        # External service clients
│   └── supabase/        # Supabase client + types
├── lib/                 # Utility libraries
│   ├── analytics.ts     # Conversion tracking (267 lines)
│   ├── apiUtils.ts      # API helpers
│   ├── quoteCalculator.ts # Pricing engine (227 lines)
│   ├── storage.ts       # Local storage helpers
│   └── utils.ts         # General utilities
├── pages/               # Route components (24 total)
│   ├── admin/           # Admin pages (7)
│   └── services/        # Service landing pages (10)
├── types/               # TypeScript definitions
│   └── conversion.ts    # Conversion system types
├── App.tsx              # Root component + routing
├── App.css              # Global styles
├── index.css            # Tailwind + custom CSS
├── main.tsx             # Entry point
└── vite-env.d.ts        # Vite type definitions
```

---

## 2. Routing Architecture

### All 24 Routes

| Route | Component | Access | Purpose |
|-------|-----------|--------|---------|
| `/` | Index | Public | Homepage with hero, services, testimonials |
| `/services` | Services | Public | Services overview page |
| `/services/local-moving` | LocalMoving | Public | SEO landing page |
| `/services/residential-movers` | ResidentialMovers | Public | SEO landing page |
| `/services/piano-moving` | PianoMoving | Public | SEO landing page |
| `/services/pool-table-moving` | PoolTableMoving | Public | SEO landing page |
| `/services/safe-moving` | SafeMoving | Public | SEO landing page |
| `/services/heavy-items-moving` | HeavyItemsMoving | Public | SEO landing page |
| `/services/same-day-moving` | SameDayMoving | Public | SEO landing page |
| `/services/junk-removal` | JunkRemoval | Public | SEO landing page |
| `/services/long-distance-moving` | LongDistanceMoving | Public | SEO landing page |
| `/services/moving-help-labor` | MovingHelpLabor | Public | SEO landing page |
| `/quote` | Quote | Public | Quote request wizard |
| `/about` | About | Public | Company information, team |
| `/contact` | Contact | Public | Contact form, hours |
| `/privacy` | PrivacyPolicy | Public | Privacy policy (legal) |
| `/terms` | TermsOfService | Public | Terms of service (legal) |
| `/auth` | Auth | Public | Login/signup |
| `/client-portal` | ClientPortal | Protected | Client onboarding hub |
| `/admin` | AdminOverview | Admin | Dashboard home |
| `/admin/leads` | AdminLeads | Admin | Lead management |
| `/admin/conversations` | AdminConversations | Admin | Chat history |
| `/admin/call-logs` | AdminCallLogs | Admin | Voice call logs |
| `/admin/appointments` | AdminAppointments | Admin | Scheduling |
| `/admin/users` | AdminUserManagement | Admin | User roles |
| `/admin/settings` | AdminSettings | Admin | Configuration |
| `*` | NotFound | Public | 404 page |

### Route Configuration (App.tsx)

```tsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Index />} />
  <Route path="/services" element={<Services />} />
  <Route path="/services/:serviceSlug" element={<ServicePage />} />
  <Route path="/quote" element={<Quote />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/privacy" element={<PrivacyPolicy />} />
  <Route path="/terms" element={<TermsOfService />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/client-portal" element={<ClientPortal />} />
  
  {/* Protected Admin Routes */}
  <Route path="/admin" element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout />
    </ProtectedRoute>
  }>
    <Route index element={<Overview />} />
    <Route path="leads" element={<Leads />} />
    <Route path="conversations" element={<Conversations />} />
    <Route path="call-logs" element={<CallLogs />} />
    <Route path="appointments" element={<Appointments />} />
    <Route path="users" element={<UserManagement />} />
    <Route path="settings" element={<Settings />} />
  </Route>
  
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 3. State Management

### Approach: Hybrid

| State Type | Solution | Use Case |
|------------|----------|----------|
| Server State | React Query | API data, leads, conversations |
| Auth State | Context + Supabase | User session, roles |
| Form State | React Hook Form | Quote wizard, contact forms |
| UI State | Local State | Modals, menus, tabs |
| Persisted State | localStorage | Form recovery, A/B test assignment |

### React Query Configuration

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Auth Context

```tsx
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

---

## 4. Component Hierarchy

### Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                        Header                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Logo │ Navigation │ Phone │ Get Quote Button        │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                     ScrollProgress                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                     Page Content                         │
│                                                          │
│  (varies by route)                                       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                        Footer                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Contact │ Services │ Legal │ Social │ Copyright     │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│              Fixed/Floating Components                   │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │  ChatWidget   │ │  VoiceAgent   │ │  StickyCTA    │  │
│  └───────────────┘ └───────────────┘ └───────────────┘  │
│  ┌───────────────┐ ┌───────────────┐                    │
│  │MobileStickyCTA│ │ExitIntentModal│                    │
│  └───────────────┘ └───────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Admin Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                     AdminHeader                          │
├────────────────┬────────────────────────────────────────┤
│                │                                         │
│   AdminSidebar │              Page Content               │
│                │                                         │
│   - Overview   │         (Outlet from router)            │
│   - Leads      │                                         │
│   - Chats      │                                         │
│   - Calls      │                                         │
│   - Calendar   │                                         │
│   - Users      │                                         │
│   - Settings   │                                         │
│                │                                         │
└────────────────┴────────────────────────────────────────┘
```

---

## 5. Page Documentation

### 5.1 Homepage (Index)

**Route**: `/`
**File**: `src/pages/Index.tsx`
**Purpose**: Primary landing page with conversion focus

**Sections**:
1. Hero Banner - Main CTA, trust badges
2. Stats Bar - Animated metrics
3. Services Grid - 6 service cards
4. Pricing Display - Transparent pricing
5. How It Works - 3-step process
6. Why Choose Us - Trust indicators
7. Meet the Team (preview) - 4 team members
8. Testimonials - Customer reviews
9. Final CTA - Quote button

**Components Used**:
- Header, Footer
- GoogleReviewsBadge
- AnimatedStats
- TrustBadges
- HowItWorks
- PricingDisplay
- Testimonials
- MeetTheTeam (compact)
- ChatWidget, VoiceAgent
- StickyCTA, MobileStickyCTA
- ExitIntentModal
- SocialProofBanner

### 5.2 Quote Page

**Route**: `/quote`
**File**: `src/pages/Quote.tsx`
**Purpose**: 3-step quote wizard with auto-save

**Components**:
- QuoteFormWizard (3 steps)
- InstantQuotePreview
- TrustBadges
- QuoteConfirmation (post-submit)

**Features**:
- Auto-save to localStorage
- Real-time price estimate
- UTM parameter capture
- Email + Call follow-up trigger

### 5.3 Service Landing Pages (10)

**Template**: `src/components/services/ServicePageTemplate.tsx`
**Data**: `src/data/servicesData.ts`

Each page follows the same structure:
1. ServiceHeroBanner
2. TrustBadges
3. ServiceIntro
4. FeatureCards
5. WhyExpertCare
6. RelatedServices
7. ServiceCTA
8. Testimonials
9. Footer

**SEO Features**:
- Unique meta title/description
- Structured data (JSON-LD)
- Canonical URLs
- Breadcrumb navigation

### 5.4 Admin Dashboard

**Route**: `/admin/*`
**Layout**: `src/components/admin/AdminLayout.tsx`
**Access**: Admin role required

**Pages**:
| Page | Purpose | Key Features |
|------|---------|--------------|
| Overview | Dashboard home | Charts, stats, launch readiness |
| Leads | Lead management | Table, filters, export CSV |
| Conversations | Chat history | Message timeline |
| Call Logs | Voice call records | Transcripts, status |
| Appointments | Scheduling | Calendar view |
| User Management | Admin users | Role assignment |
| Settings | Configuration | Test mode toggle |

---

## 6. Build Configuration

### Vite Configuration (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### TypeScript Configuration

- Strict mode enabled
- Path aliases (`@/`)
- ESNext target
- React JSX transform

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... semantic tokens
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

---

## 7. Performance Optimization

### Bundle Optimization
- Code splitting by route
- Lazy loading for admin pages
- Tree shaking for unused code
- Minification in production

### Runtime Optimization
- React.memo for expensive components
- useMemo/useCallback for computed values
- Virtual scrolling for large lists (potential)
- Image lazy loading

### Metrics Targets
| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | ~2.0s |
| FID | < 100ms | ~50ms |
| CLS | < 0.1 | ~0.05 |
| Bundle Size | < 500KB | ~450KB |

---

## 8. Error Handling

### Error Boundary

```tsx
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Toast Notifications

```tsx
// Using sonner for toast notifications
import { toast } from 'sonner';

// Success
toast.success('Quote submitted successfully!');

// Error
toast.error('Failed to submit quote. Please try again.');

// Loading
toast.loading('Processing your request...');
```

---

## 9. Accessibility

### WCAG 2.1 Compliance

| Requirement | Implementation |
|-------------|----------------|
| Semantic HTML | `<header>`, `<main>`, `<section>`, `<nav>` |
| ARIA Labels | All interactive elements labeled |
| Keyboard Navigation | Full tab support, focus management |
| Color Contrast | 4.5:1 minimum ratio |
| Screen Reader | Alt text, aria-live regions |
| Focus Indicators | Visible focus rings on all focusable elements |

### Testing Tools Used
- axe-core
- Lighthouse accessibility audit
- Screen reader testing (VoiceOver, NVDA)

---

*Last Updated: January 25, 2026*
