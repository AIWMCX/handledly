

# Fix Scroll-to-Top Button to Work on All Pages

## Problem Identified

The "Scroll to Top" button is not appearing because it's placed **outside** the Router context in `App.tsx`. The button needs to be inside `BrowserRouter` to work properly with scroll detection.

---

## Current Issue

```
App.tsx structure (broken):
├── ErrorBoundary
│   ├── QueryClientProvider
│   │   ├── AuthProvider
│   │   │   ├── TooltipProvider
│   │   │   │   ├── Toaster
│   │   │   │   ├── Sonner
│   │   │   │   ├── ScrollToTop ← OUTSIDE BrowserRouter (wrong!)
│   │   │   │   └── BrowserRouter
│   │   │   │       └── Routes...
```

---

## Solution

Move `ScrollToTop` **inside** `BrowserRouter` so it can access scroll events correctly and appear on every page:

```
App.tsx structure (fixed):
├── ErrorBoundary
│   ├── QueryClientProvider
│   │   ├── AuthProvider
│   │   │   ├── TooltipProvider
│   │   │   │   ├── Toaster
│   │   │   │   ├── Sonner
│   │   │   │   └── BrowserRouter
│   │   │   │       ├── ScrollToTop ← INSIDE BrowserRouter (correct!)
│   │   │   │       └── Routes...
```

---

## File to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Move `<ScrollToTop />` inside `<BrowserRouter>` |

---

## Z-Index & Positioning (Already Correct)

The button's positioning is already properly configured:

- **Z-index**: `z-30` (below StickyCTA z-40 and MobileStickyCTA z-50)
- **Mobile**: `bottom-24` (above the mobile sticky CTA bar)
- **Desktop**: `bottom-6 right-6` (bottom-right corner)
- **Threshold**: Appears after 400px scroll

---

## Expected Result

After this fix:
- Arrow-up button appears in **bottom-right corner** on all pages
- On mobile: positioned above the sticky CTA bar
- Smooth animation when appearing/disappearing
- Clicking scrolls smoothly to page top
- Works on `/services`, `/quote`, `/about`, `/contact`, and all other pages

