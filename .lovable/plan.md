
# Email Template Redesign: Bright & Light Color Palette

## Overview
Transform the quote confirmation email from a dark brown/black theme to a bright, professional light theme using white, orange, and yellow tones that match the Handledly brand identity.

## Current State Analysis

The email template at `supabase/functions/send-quote-email/index.ts` uses dark colors that create a "brown tone" appearance:

| Element | Current (Dark) | Issue |
|---------|----------------|-------|
| Body background | `#0C0A09` (near black) | Too dark |
| Card backgrounds | `#1C1917`, `#292524` | Brown/charcoal |
| Borders | `#44403C` | Brown tint |
| Muted text | `#78716C`, `#A8A29E` | Stone/brown |
| Primary text | `#FAFAF9` | White (only visible on dark) |

## New Color Palette

Replace all dark colors with the bright Handledly brand palette:

| Element | New Color | Hex Code |
|---------|-----------|----------|
| Body background | Soft cream/white | `#FFFBF5` |
| Card background | Pure white | `#FFFFFF` |
| Card shadow | Soft shadow | Light box-shadow |
| Primary text | Navy blue | `#1E3A5F` |
| Secondary text | Medium slate | `#64748B` |
| Muted labels | Slate gray | `#94A3B8` |
| Primary accent | Golden Yellow | `#F9B233` |
| Accent gradient | Orange-Gold | `#F9B233 → #F59E0B` |
| Borders | Light gray | `#E2E8F0` |
| Success green | Fresh green | `#10B981` |

## Visual Changes

### 1. Header Section
- **Before**: Dark background with white text
- **After**: White/cream background with Navy logo text, golden yellow accent

### 2. Quote Number Badge
- **Before**: Black background `#0C0A09` with gold border
- **After**: Light yellow background `#FEF3C7` with golden border, navy text

### 3. Main Content Card
- **Before**: Dark gradient `#1C1917 → #292524`
- **After**: White card with subtle shadow and light border

### 4. Move Details Box
- **Before**: Black background `#0C0A09`
- **After**: Light gray background `#F8FAFC` with subtle border

### 5. Quote Breakdown Box
- **Before**: Black with brown borders
- **After**: White with light gray borders, navy text

### 6. CTA Button
- **Before**: Gold gradient on dark
- **After**: Vibrant golden-orange gradient `#F9B233 → #F59E0B` with shadow

### 7. Iron Law Notice (when applicable)
- **Before**: Dark with gold border
- **After**: Light amber background `#FEF3C7` with orange border, navy text

### 8. Footer
- **Before**: Dark with gray text
- **After**: Light with navy text

## Files to Modify

1. **`supabase/functions/send-quote-email/index.ts`**
   - Lines 143-448: Complete HTML template rewrite
   - Update all color values
   - Adjust text colors for light background readability

## Implementation Details

### Color Mapping (Find → Replace)

```text
#0C0A09 → #FFFBF5 (body bg) or #FFFFFF (card bg)
#1C1917 → #F8FAFC (section bg)
#292524 → #FFFFFF (card bg)
#44403C → #E2E8F0 (borders)
#78716C → #94A3B8 (muted labels)
#57534E → #64748B (footer text)
#A8A29E → #64748B (secondary text)
#FAFAF9 → #1E3A5F (primary text - now navy)
#D4AF37 → #F9B233 (golden yellow - keep/brighten)
#B8860B → #F59E0B (orange accent)
```

### Key Style Changes

1. **Body wrapper**: `background-color: #FFFBF5` (warm cream)
2. **Cards**: `background: #FFFFFF; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #E2E8F0`
3. **Text**: Navy `#1E3A5F` for headings, `#334155` for body, `#64748B` for secondary
4. **Accents**: Golden yellow `#F9B233` for highlights, badges
5. **CTA button**: `background: linear-gradient(135deg, #F9B233, #F59E0B)` with navy text

## Expected Result

A bright, professional, and welcoming email that:
- Uses predominantly white/cream backgrounds
- Features navy blue text for authority and readability
- Highlights golden-yellow/orange accents for warmth and brand consistency
- Removes all brown/dark tones
- Creates a premium, light SaaS aesthetic matching the website design
