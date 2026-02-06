

# HANDLEDLY Complete Business Bundle -- Implementation Plan

This plan transforms Handledly from a local moving company website into a full-stack Vertical SaaS + Logistics AI Platform, implementing all bundles in parallel across structured phases.

---

## What Already Exists (Will Be Enhanced, Not Rebuilt)

- Quote engine with pricing calculator (no distance calc yet)
- AI Chat (Jack) + Voice Agent (ElevenLabs)
- Admin dashboard (overview, leads, conversations, calls, appointments, AI quality, cost monitoring)
- Auth system with admin roles (4-user whitelist via `user_roles` table)
- 10 service pages with SEO
- Email (Resend) + SMS (Twilio) notifications
- Analytics system (GA4 + custom events)
- Client portal with checklist

---

## Phase 1: Database Foundation (New Tables)

Create all new database tables required across every bundle. This must happen first so all subsequent features have their data layer ready.

**New tables to create:**

1. `jobs` -- Core job/booking record linking leads to scheduled work
   - id, lead_id, status (quoted/booked/in_progress/completed/cancelled), crew_ids, scheduled_date, scheduled_time, estimated_duration, actual_duration, move_from_address, move_to_address, distance_miles, property_type, bedrooms, special_instructions, total_price, deposit_amount, created_at, updated_at

2. `crew_members` -- Crew personnel records
   - id, user_id (nullable), full_name, phone, email, role (mover/driver/lead), status (active/inactive), hourly_rate, created_at

3. `job_crew_assignments` -- Many-to-many: jobs to crew members
   - id, job_id, crew_member_id, role, check_in_time, check_out_time, hours_worked

4. `job_photos` -- Before/after photos for jobs (URLs only, files in storage)
   - id, job_id, crew_member_id, photo_url, photo_type (before/after/damage/inventory), notes, created_at

5. `job_checklists` -- Checklist items per job
   - id, job_id, item_text, completed, completed_by, completed_at, category (pre_move/during/post_move)

6. `digital_agreements` -- Customer agreements/waivers
   - id, job_id, lead_id, agreement_type (service_agreement/liability_waiver/damage_policy), customer_name, customer_email, signature_data_url, signed_at, ip_address, created_at

7. `equipment` -- Fleet and equipment inventory
   - id, name, type (truck/dolly/blankets/straps), status (available/in_use/maintenance), assigned_job_id, notes, created_at

8. `job_financials` -- Per-job cost and margin tracking
   - id, job_id, revenue, labor_cost, fuel_cost, equipment_cost, insurance_allocation, net_profit, margin_percentage, created_at

9. `activity_logs` -- Audit trail for all system actions
   - id, user_id, action, entity_type, entity_id, metadata (jsonb), ip_address, created_at

**Storage bucket:** `job-photos` (public bucket for crew photo uploads)

**RLS policies:** All tables admin-only (same 4 admins), with `digital_agreements` allowing public INSERT for customer signatures.

---

## Phase 2: Customer-Facing Bundle

### A. Enhanced Quote Engine with Google Maps

- **New edge function: `calculate-distance`**
  - Accepts origin/destination addresses
  - Calls Google Maps Distance Matrix API
  - Returns distance in miles and estimated drive time
  - Caches results to minimize API costs

- **Update `QuoteFormWizard`** to:
  - Add Google Places Autocomplete on address fields
  - Call `calculate-distance` after both addresses entered
  - Show distance and drive time in the estimate
  - Factor distance into pricing (zone-based surcharges for 20+ miles)

- **Enhanced inventory selector** (new Step 1.5):
  - Room-by-room item counter
  - Weight estimation per item category
  - Auto-detect 200lb+ items for Iron Law enforcement
  - Stairs/elevator/long carry fee toggles

### B. Customer Dashboard (Enhance existing `/client-portal`)

- Transform from admin onboarding hub to customer-facing portal
- Create new `/my-account` route for customers with:
  - Booking history with status tracking
  - Reschedule option (request-based, admin approves)
  - Add items to existing booking
  - View crew ETA (static for now, real GPS later)
  - Upload photos of items to move
  - Sign digital agreement (service agreement + liability waiver)
  - View and download invoices

### C. Digital Agreements

- Create `AgreementViewer` component with:
  - Moving Service Agreement template
  - Liability waiver template
  - Cancellation policy
  - Canvas-based signature capture
  - Save to `digital_agreements` table
  - Email signed copy to customer

---

## Phase 3: Operations Bundle

### A. Dispatcher Dashboard (New admin pages)

- **`/admin/dispatch`** -- Calendar View
  - Weekly/daily calendar showing all scheduled jobs
  - Color-coded by job status
  - Drag-and-drop crew assignment
  - Job detail panel on click

- **`/admin/dispatch/route`** -- Route View
  - List of today's jobs with optimized ordering
  - Distance between consecutive jobs
  - Estimated time blocks
  - Profit-per-job quick view

- **`/admin/crew`** -- Crew Management
  - Add/edit/deactivate crew members
  - View availability calendar
  - Performance stats (jobs completed, hours worked)
  - Equipment currently assigned

- **`/admin/equipment`** -- Equipment Tracking
  - Fleet inventory (trucks, dollies, blankets)
  - Status tracking (available/in-use/maintenance)
  - Assignment history

### B. Crew Mobile Panel (New route: `/crew`)

- Mobile-optimized interface for crew members
  - Today's job list with addresses and details
  - Job checklist (pre-move, during, post-move items)
  - Inventory confirmation with checkboxes
  - Before/after photo capture (upload to storage bucket)
  - Customer digital signature capture
  - Time tracking (clock in/clock out per job)
  - Navigation link to Google Maps

### C. Cost and Margin Tracking (Enhance `/admin/cost-monitoring`)

- Add per-job financial breakdown:
  - Revenue vs. costs (labor, fuel, insurance)
  - Net profit and margin percentage
  - Fuel cost per mile calculator
  - Crew hourly cost tracking
  - Insurance allocation per job
  - Weekly/monthly P&L summary

---

## Phase 4: AI Layer (Competitive Moat)

### A. Enhanced AI Quoting (Upgrade existing Jack)

- Update Jack's knowledge base with distance-aware pricing
- Add conversational upsell logic:
  - "Since you have a piano, I'd recommend our specialty piano service..."
  - "Your move is on a Saturday -- we have 2 slots left, want me to lock one in?"
- Heavy-item auto-detection from inventory description

### B. AI Route Optimization (New admin feature)

- **`/admin/dispatch/optimize`**
  - Input: List of day's jobs with addresses
  - Uses Google Maps Directions API to calculate optimal route order
  - Estimates time blocks per job
  - Crew efficiency scoring (jobs/hour, revenue/hour)
  - Traffic awareness via departure time optimization

### C. AI Business Insights Dashboard (New admin page)

- **`/admin/insights`**
  - Weekly revenue breakdown (chart)
  - Repeat customer rate
  - Marketing ROI by UTM source
  - Seasonal demand forecasting (based on historical bookings)
  - Average job value trends
  - Busiest days/times heatmap

---

## Phase 5: Legal and Protection Bundle

### Documents (Static pages + digital signing)

- **`/legal/service-agreement`** -- Moving Service Agreement
- **`/legal/liability-waiver`** -- Liability and Damage Waiver  
- **`/legal/cancellation-policy`** -- Cancellation and Refund Policy
- **`/legal/arbitration`** -- Arbitration Clause

Each document:
- Professionally formatted with Handledly branding
- Linkable from quote confirmation and booking flow
- Colorado PUC compliance language included
- Data privacy compliance (CCPA-aligned)

### Digital Signature Flow

- Integrated into booking confirmation
- Canvas signature + typed name + timestamp
- Stored in `digital_agreements` table
- PDF copy emailed to customer and admin

---

## Phase 6: Security and Privacy Enhancements

- **Activity logs:** All admin actions logged to `activity_logs` table
- **Role separation:** Admin sees everything; future crew role sees only assigned jobs
- **Encrypted file uploads:** Photos uploaded to private storage bucket with signed URLs
- **Audit trail:** Every status change on jobs/leads tracked with user ID and timestamp

---

## Phase 7: Website Positioning Bundle

### New Pages

- **`/how-it-works`** -- Enhanced version (already exists as component, promote to full page)
  - Step-by-step visual guide
  - Quote -> Book -> Move -> Done flow
  - AI technology explanation

- **`/pricing`** -- Pricing Transparency Page
  - Full rate card display
  - "No hidden fees" messaging
  - Iron Law explanation
  - Comparison table vs competitors

- **`/for-business`** -- SaaS Positioning Page
  - "AI-Powered Moving Operations Platform"
  - White-label SaaS pitch for other movers
  - Feature comparison grid
  - Contact form for B2B leads
  - Revenue model explanation

- **`/customer-stories`** -- Customer Stories/Testimonials
  - Featured move stories
  - Before/after photos
  - Video testimonials (embedded)
  - Neighborhood-specific stories

- **`/service-areas`** -- Service Areas Map Page
  - Interactive map of Denver metro
  - Neighborhood list with links
  - "We serve 30+ cities" messaging

### Brand Authority Updates

- Update homepage hero with cleaner positioning
- Add fleet/team visuals section
- Insurance info prominent display
- Pricing logic transparency section

---

## Phase 8: Scalability Structure

- **SaaS licensing model page** (`/for-business`)
- **White-label preparation:** Abstract company name into config
- **Multi-tenant foundation:** Company settings already in `business_settings` table
- **API documentation page** for future integrations

---

## Technical Details

### New Edge Functions

1. `calculate-distance` -- Google Maps Distance Matrix API proxy
2. `generate-agreement-pdf` -- PDF generation for signed agreements
3. `optimize-route` -- AI-powered route optimization using Google Directions API

### New Routes (App.tsx additions)

```text
/my-account          -- Customer dashboard
/crew                -- Crew mobile panel
/admin/dispatch      -- Dispatcher calendar
/admin/crew          -- Crew management
/admin/equipment     -- Equipment tracking
/admin/insights      -- AI Business Insights
/pricing             -- Pricing transparency
/for-business        -- SaaS positioning
/customer-stories    -- Customer stories
/service-areas       -- Service areas map
/legal/service-agreement
/legal/liability-waiver
/legal/cancellation-policy
```

### Google Maps API Integration

- Will need the API key stored as a secret for the edge function
- Client-side Places Autocomplete uses a restricted browser key
- Distance Matrix calls proxied through edge function for security

### Files Changed (Estimated)

- ~25 new page/component files
- ~8 modified existing files
- ~3 new edge functions
- ~1 database migration (all new tables)
- ~2 storage bucket configurations

### Implementation Order

Since this is everything at once, implementation will follow dependency order:
1. Database tables + RLS policies (foundation)
2. Google Maps API secret + `calculate-distance` edge function
3. Enhanced quote engine with address autocomplete
4. Operations pages (dispatch, crew, equipment)
5. Customer dashboard + digital agreements
6. AI insights dashboard
7. Website positioning pages (pricing, for-business, customer-stories, service-areas)
8. Legal document pages
9. Activity logging + security enhancements

