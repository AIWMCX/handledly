
# Handledly Marketplace Rebuild Plan
## "eBay for Moving" — Two-Sided Marketplace

**Strategy:** Replace current single-company site with multi-tenant marketplace. No payments initially (Stripe Connect later).

---

## Phase 1: Database Foundation (Week 1)
Build the multi-tenant database schema on top of existing Lovable Cloud.

**New Tables:**
- `moving_companies` — Company profiles, licensing (DOT/MC), service areas, rates, ratings, verification status
- `moving_company_users` — Links auth users to companies (multi-user per company)
- `customers` — Customer profiles linked to auth users
- `move_requests` — Customer move details (origin, destination, size, date, inventory, specialty items)
- `quotes` — Mover responses with pricing breakdown, availability, expiration
- `bookings` — Accepted quotes = confirmed transactions with booking numbers (HND-YYYYMMDD-XXX)
- `reviews` — Verified post-move reviews with multi-category ratings (professionalism, care, communication, value)
- `disputes` — Issue tracking with evidence, resolution workflow

**CRM Tables (Free for Movers):**
- `crm_contacts` — Mover's customer database
- `crm_tasks` — Follow-ups, calls, reminders
- `crm_communications` — Email/SMS/call log

**RLS Policies:**
- Customers see only their own data + public company profiles
- Movers see only their own company data + all move requests (for quoting)
- Platform admins see everything
- Multi-tenant isolation via `moving_company_users` join

**Keep Existing:** `user_roles`, `rate_limit_tracker`, `activity_logs`, `business_settings` (repurposed for platform settings)

**Remove/Archive:** Current `leads`, `quote_requests`, `appointments`, `jobs` tables (archive data, then deprecate)

---

## Phase 2: Authentication & Roles (Week 1-2)
Extend auth system for three user types.

- **Customer signup/login** — Email + Google OAuth
- **Mover signup/login** — Email + company registration flow
- **Platform admin** — Existing admin role
- Update `app_role` enum: add `'mover'` role
- Mover onboarding wizard: company details → licensing → service areas → rates

---

## Phase 3: Mover Dashboard & CRM (Week 2-3)
Build the supply side — moving company portal.

**Pages:**
- `/mover/dashboard` — Overview (leads, bookings, revenue, ratings)
- `/mover/quotes` — Incoming move requests, create/send quotes
- `/mover/bookings` — Manage confirmed bookings, status updates
- `/mover/crm` — Contact management, tasks, communication log
- `/mover/profile` — Company profile editor (public-facing)
- `/mover/settings` — Account, team members, notifications

---

## Phase 4: Customer-Facing Marketplace (Week 3-4)
Build the demand side — compare and book.

**Pages:**
- `/` — Marketplace homepage (search bar, top movers, how it works)
- `/search` — Enter move details → see matching companies
- `/compare` — Side-by-side quote comparison from multiple movers
- `/company/:id` — Public company profile (reviews, ratings, services, pricing)
- `/booking/:id` — Booking confirmation & tracking
- `/my-moves` — Customer dashboard (active/past moves, reviews)
- `/write-review/:bookingId` — Post-move review form

**Core Flow:**
1. Customer enters move details (origin, dest, size, date, inventory)
2. System matches to movers in service area
3. Movers receive notification, submit quotes
4. Customer compares quotes side-by-side
5. Customer accepts quote → Booking created
6. Move happens → Customer leaves review

---

## Phase 5: Trust & Safety (Week 4-5)
- DOT number verification (manual initially, API later)
- Insurance verification workflow
- Review moderation system
- Dispute resolution flow (open → review → resolve)
- Company suspension/banning system

---

## Phase 6: Communications & Notifications (Week 5-6)
- Email notifications (new quote request, quote received, booking confirmed)
- SMS notifications (booking reminders, status updates)
- In-app notification center
- Mover ↔ Customer messaging (pre-move communication)

---

## Phase 7: Analytics & Admin (Week 6-7)
- Platform admin dashboard (GMV, bookings, active users, disputes)
- Mover analytics (conversion rates, response times, ratings trends)
- Customer analytics (retention, repeat bookings)
- Daily metrics aggregation

---

## Phase 8: Payments — Stripe Connect (Future)
- Mover onboarding to Stripe Connect
- Customer payment flow (deposit + balance)
- Escrow until move completion
- 24-48hr mover payout
- Platform commission (1-2%) auto-deduction
- Refund & dispute handling

---

## What Gets Removed
- Current single-company quote form (`/quote`)
- AI chat widget (Jack) — repurposed later for marketplace support
- Voice agent integration — paused
- Current admin dashboard — rebuilt for marketplace
- Single-company service pages — replaced with marketplace search

## What Gets Kept
- Design system (Tailwind + shadcn/ui)
- Auth infrastructure (Supabase Auth)
- Rate limiting & security infrastructure
- Email sending (Resend)
- SMS (Twilio)
- Domain & hosting

---

## Success Criteria for MVP Launch
- [ ] 20+ mover profiles with service areas
- [ ] Customer can submit move request in <3 minutes
- [ ] Movers receive and respond to quotes
- [ ] Customer can compare 3+ quotes side-by-side
- [ ] Booking confirmation flow works end-to-end
- [ ] Review system functional
- [ ] Mobile responsive
- [ ] SEO-optimized marketplace pages
