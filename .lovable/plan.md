
# Plan: Update Insurance Liability Amount to $750,000

## Summary
Change all instances of "$2M+ Insured" to "$750,000 General Liability" across the codebase and documentation.

## Files to Update

### 1. Frontend Components

| File | Line | Current Text | New Text |
|------|------|--------------|----------|
| `src/pages/Quote.tsx` | 325 | `$2M+ Insured` | `$750K Insured` |
| `src/components/layout/Footer.tsx` | 106 | `USDOT Licensed & $2M+ Insured` | `USDOT Licensed & $750K Insured` |
| `src/components/services/ServiceCTA.tsx` | 95 | `Fully licensed and $2M+ insured` | `Fully licensed and $750K insured` |

### 2. Documentation

| File | Line | Current Text | New Text |
|------|------|--------------|----------|
| `docs/04-component-library.md` | 440 | `$2M+ Insurance` | `$750K General Liability` |
| `docs/jack-knowledge-base.md` | Multiple | `Licensed & Insured` references | Add specific `$750,000 General Liability` |

## Technical Details

### Consistent Formatting Options
Two formatting approaches for the amount:

**Option A: Abbreviated ($750K)**
- Shorter, fits better in badges and compact UI
- Examples: `$750K Insured`, `$750K General Liability`

**Option B: Full ($750,000)**
- More professional, clearer for legal/compliance
- Examples: `$750,000 Insured`, `$750,000 General Liability`

**Recommendation:** Use `$750K` for UI badges (space-constrained) and `$750,000` for documentation/knowledge base.

### Jack Knowledge Base Updates
The voice agent knowledge base will be updated to include:
```text
CREDENTIALS:
- General Liability Insurance: $750,000 coverage
```

And in FAQ responses:
```text
Q: Are you insured?
"Yes, we carry $750,000 in general liability insurance, plus workers' compensation coverage for all team members."
```

## Implementation Steps

1. Update `src/pages/Quote.tsx` line 325
2. Update `src/components/layout/Footer.tsx` line 106  
3. Update `src/components/services/ServiceCTA.tsx` line 95
4. Update `docs/04-component-library.md` line 440
5. Update `docs/jack-knowledge-base.md` with specific liability amount in credentials and FAQ sections

## Impact
- All customer-facing trust badges will display accurate insurance information
- Jack (voice agent) will have correct information for customer calls
- Maintains brand consistency across all touchpoints
