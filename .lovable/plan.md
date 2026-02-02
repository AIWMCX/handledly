

# Launch Day Analytics Reset

Resetting all pre-launch test data to start tracking fresh from February 2, 2026.

## Current Data to Clear

| Table | Records | Purpose |
|-------|---------|---------|
| leads | 57 | All test leads from Jan 10 - Feb 1 |
| quote_requests | 57 | Quote calculations from testing |
| chat_conversations | 115 | Chat sessions during development |
| chat_messages | 108 | Chat message history |
| call_retry_queue | 6 | Pending call retries |
| cost_tracker | 10 | AI/call cost records |
| rate_limit_tracker | 32 | Rate limit entries |

## Reset Strategy

### Phase 1: Archive Test Leads (Optional Backup)
Move all 57 test leads to `leads_archive` table for historical reference before deleting.

### Phase 2: Clear All Analytics Tables
Execute DELETE statements on all tracking tables in the correct order (respecting foreign key dependencies):

1. `chat_messages` (depends on conversations)
2. `chat_conversations` (depends on leads)
3. `quote_requests` (depends on leads)
4. `call_retry_queue` (depends on leads)
5. `cost_tracker` (references leads)
6. `ai_quality_reviews` (references conversations)
7. `rate_limit_tracker` (standalone)
8. `leads` (core table)

### Phase 3: Reset Circuit Breaker Counters
Update `circuit_breaker_config` to reset timestamps to today.

## Technical Details

```text
SQL Execution Order:
┌─────────────────────────────────────────┐
│  1. DELETE FROM chat_messages           │
│  2. DELETE FROM ai_quality_reviews      │
│  3. DELETE FROM chat_conversations      │
│  4. DELETE FROM quote_requests          │
│  5. DELETE FROM call_retry_queue        │
│  6. DELETE FROM cost_tracker            │
│  7. DELETE FROM rate_limit_tracker      │
│  8. DELETE FROM leads                   │
│  9. UPDATE circuit_breaker_config       │
│     SET last_reset_daily = NOW(),       │
│         last_reset_hourly = NOW()       │
└─────────────────────────────────────────┘
```

## What Gets Preserved

- **Admin users** (`user_roles`) - All 3 admin accounts remain
- **Business settings** - Company name, phone, rates
- **Circuit breaker config** - Limits and thresholds (just reset counters)
- **Appointments** - Empty (0 records)
- **Leads archive** - Empty (0 records)

## After Reset

Fresh start with:
- 0 leads
- 0 conversations
- 0 quotes
- 0 cost tracking
- Clean analytics from today forward

