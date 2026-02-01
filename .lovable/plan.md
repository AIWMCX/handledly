
# Pricing Cheat Sheet PDF Implementation Plan

## Overview
Create a print-ready PDF version of the Pricing Cheat Sheet that can be downloaded and printed for crew reference during calls and on-site jobs.

## Technical Approach

### File 1: `src/components/admin/pdf/PricingCheatSheetPDF.tsx`
A new PDF document component using `@react-pdf/renderer` with the following pages:

**Page 1: Core Pricing Tables**
- Labor Only rates (2/3/4 movers)
- Moving with Truck rates
- 200lb Iron Law section (highlighted with warning color)

**Page 2: Specialty Items**
- Piano Moving (flat fees + hourly by type)
- Safe Moving (by weight class)
- Pool Table Moving (NOT Iron Law - emphasized)
- Other Specialty Items (Hot Tub, Gym Equipment, Motorcycle)

**Page 3: Quick Reference**
- Crew Sizing Guide (property size → crew recommendation)
- What's Included (NO stair fees, NO elevator fees, etc.)
- What's NOT Included
- Key Scripts for objection handling
- Never Do list
- Contact information

### Design Specifications
- Use existing color scheme (`navy: #1E3A5F`, `gold: #F9B233`)
- High contrast tables for print readability
- Warning colors for Iron Law sections
- Helvetica font (system font, no CORS issues)
- A4 size, landscape orientation for better table viewing

### File 2: `src/hooks/usePricingCheatSheetPDF.tsx`
A simple hook that:
- Generates the PDF blob using `pdf().toBlob()`
- Creates a download link with filename `handledly-pricing-cheat-sheet-2026-02.pdf`
- Shows success/error toast notifications

### File 3: Update `src/pages/admin/Settings.tsx` (or create dedicated page)
Add a "Download Pricing Cheat Sheet PDF" button that calls the hook.

Alternatively, we can add a quick download button accessible from the Overview dashboard.

## Implementation Details

### Table Structure
```text
┌─────────────────────────────────────────────────────────────┐
│ PAGE 1: CORE PRICING                                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ LABOR ONLY          │  │ MOVING WITH TRUCK   │          │
│  │ 2 Movers: $139/hr   │  │ 2 + Truck: $159/hr  │          │
│  │ 3 Movers: $169/hr   │  │ 3 + Truck: $189/hr  │          │
│  │ 4 Movers: $239/hr   │  │ 4 + Truck: $259/hr  │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ⚠️ 200LB IRON LAW (HIGHLIGHTED BOX)                       │
│  Any item 200+ lbs = MINIMUM 3 movers                      │
│  WITH TRUCK: $189/hr | LABOR-ONLY: $179/hr                 │
│  Triggers: Piano, Gun Safe, Safe 200+, Hot Tub             │
│  NOT Iron Law: Pool Table → $169/hr                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PAGE 2: SPECIALTY ITEMS                                     │
├─────────────────────────────────────────────────────────────┤
│  PIANO MOVING                SAFE MOVING                   │
│  ┌──────────────────────┐   ┌──────────────────────┐       │
│  │ Upright: $150 flat   │   │ Small (<200): $100   │       │
│  │ Baby Grand: $250     │   │ Med (200-500): $175  │       │
│  │ Grand: $350          │   │ Large (500+): $250   │       │
│  │ All @ $189/hr        │   │ 200+ @ $189/hr       │       │
│  └──────────────────────┘   └──────────────────────┘       │
│                                                             │
│  POOL TABLE (NOT Iron Law!)   OTHER SPECIALTY              │
│  ┌──────────────────────┐   ┌──────────────────────┐       │
│  │ Move Only: $350      │   │ Hot Tub: $400        │       │
│  │ Full Service: $550   │   │ Gym Equip: $125      │       │
│  │ @ $169/hr (2-3 crew) │   │ Motorcycle: $200     │       │
│  └──────────────────────┘   └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PAGE 3: QUICK REFERENCE                                     │
├─────────────────────────────────────────────────────────────┤
│  CREW SIZING             WHAT'S INCLUDED                   │
│  Studio/1BR → 2+truck    ✓ Crew, truck, fuel               │
│  2BR → 2-3+truck         ✓ Blankets, straps                │
│  3BR → 3+truck           ✓ Floor/door protection           │
│  4+BR → 4+truck          ✓ Basic disassembly               │
│  200lb+ → 3+ (Iron Law)  ✓ NO stair/elevator fees          │
│                                                             │
│  KEY SCRIPTS                                                │
│  Price objection: "Rate covers crew, truck..."             │
│  Iron Law: "For items over 200 pounds..."                  │
│  Competitor: "We set crew correctly..."                    │
│                                                             │
│  NEVER DO: 2 movers for 200lb+, skip heavy probe...        │
│                                                             │
│  Version 4.0 | February 2026 | HD-XXXXX format             │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- **High print contrast**: Dark navy headers, white backgrounds
- **Iron Law highlighted**: Gold/warning background so it stands out
- **Pool Table exception**: Explicitly marked as NOT Iron Law
- **Lamination-friendly**: Clean borders, no complex gradients
- **Quote format**: Shows new `HD-XXXXX` format

## Files to Create/Modify
1. **CREATE**: `src/components/admin/pdf/PricingCheatSheetPDF.tsx` - Main PDF component
2. **CREATE**: `src/hooks/usePricingCheatSheetPDF.tsx` - Download hook
3. **MODIFY**: `src/pages/admin/Overview.tsx` - Add download button (or Settings page)

## Download Flow
1. User clicks "Download Pricing Cheat Sheet" button
2. Hook generates PDF blob client-side using `@react-pdf/renderer`
3. Browser triggers download: `handledly-pricing-cheat-sheet-2026-02.pdf`
4. Toast shows "Cheat Sheet Downloaded"

## Print Specifications
- A4 size, portrait orientation
- 3 pages total
- Designed for single-sided printing
- Can be laminated for durability
- All text readable at normal print size (10pt minimum)
