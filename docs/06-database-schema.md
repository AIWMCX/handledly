# Database Schema Documentation

## Overview

The Handledly platform uses PostgreSQL via Supabase with 8 tables, comprehensive RLS policies, and custom database functions.

---

## 1. Schema Diagram (ERD)

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      leads       │     │  quote_requests  │     │   appointments   │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK, UUID)    │     │ id (PK, UUID)    │     │ id (PK, UUID)    │
│ full_name        │────<│ lead_id (FK)     │     │ lead_id (FK)     │>────┐
│ email            │     │ property_type    │     │ scheduled_date   │     │
│ phone            │     │ bedrooms         │     │ scheduled_time   │     │
│ move_from_address│     │ total_quote      │     │ status           │     │
│ move_to_address  │     │ quote_number     │     │ crew_size        │     │
│ move_date        │     │ specialty_items  │     │ move_type        │     │
│ status           │     │ created_at       │     │ created_at       │     │
│ estimated_quote  │     └──────────────────┘     └──────────────────┘     │
│ conversation_id  │                                                       │
│ call_sid         │     ┌──────────────────┐                              │
│ call_transcript  │     │chat_conversations│                              │
│ confirmation_*   │     ├──────────────────┤                              │
│ utm_*            │     │ id (PK, UUID)    │                              │
│ created_at       │────<│ lead_id (FK)     │                              │
│ verification_tok │     │ session_id       │     ┌──────────────────┐     │
└──────────────────┘     │ status           │     │  chat_messages   │     │
        │                │ source_page      │     ├──────────────────┤     │
        │                │ started_at       │────<│ conversation_id  │     │
        │                │ ended_at         │     │ role             │     │
        │                └──────────────────┘     │ content          │     │
        │                                         │ message_type     │     │
        │                ┌──────────────────┐     │ created_at       │     │
        │                │ business_settings│     └──────────────────┘     │
        │                ├──────────────────┤                              │
        │                │ id (PK, UUID)    │     ┌──────────────────┐     │
        │                │ company_name     │     │rate_limit_tracker│     │
        │                │ phone_number     │     ├──────────────────┤     │
        │                │ email            │     │ id (PK, UUID)    │     │
        │                │ address          │     │ identifier       │     │
        │                │ service_areas[]  │     │ table_name       │     │
        │                │ base_rate_per_hr │     │ created_at       │     │
        │                └──────────────────┘     └──────────────────┘     │
        │                                                                   │
        │                ┌──────────────────┐                              │
        │                │    user_roles    │                              │
        │                ├──────────────────┤                              │
        └───────────────>│ id (PK, UUID)    │<─────────────────────────────┘
                         │ user_id (FK)     │
                         │ role (ENUM)      │
                         │ created_at       │
                         └──────────────────┘
```

---

## 2. Table Definitions

### 2.1 leads

**Purpose**: Primary customer/lead storage

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| full_name | TEXT | No | - | Customer name |
| email | TEXT | No | - | Email address |
| phone | TEXT | No | - | Phone number |
| move_from_address | TEXT | Yes | NULL | Origin address |
| move_to_address | TEXT | Yes | NULL | Destination address |
| move_date | DATE | Yes | NULL | Scheduled move date |
| status | TEXT | No | 'new' | Lead status |
| estimated_quote | NUMERIC | Yes | NULL | Quote amount |
| bedrooms | INTEGER | Yes | NULL | Number of bedrooms |
| property_type | TEXT | Yes | NULL | Property type |
| has_specialty_items | BOOLEAN | Yes | false | Has special items |
| specialty_items | TEXT[] | Yes | NULL | Array of specialty items |
| notes | TEXT | Yes | NULL | General notes |
| conversation_id | TEXT | Yes | NULL | ElevenLabs conversation ID |
| call_sid | TEXT | Yes | NULL | Twilio call SID |
| call_transcript | TEXT | Yes | NULL | Voice call transcript |
| call_summary | TEXT | Yes | NULL | AI-generated call summary |
| call_duration_seconds | INTEGER | Yes | NULL | Call duration |
| call_notes | TEXT | Yes | NULL | Call metadata (JSON) |
| call_ended_at | TIMESTAMPTZ | Yes | NULL | Call end time |
| confirmation_call_status | TEXT | Yes | 'pending' | Call status |
| confirmation_call_time | TIMESTAMPTZ | Yes | NULL | Call initiation time |
| email_sent | BOOLEAN | Yes | false | Email sent flag |
| email_sent_at | TIMESTAMPTZ | Yes | NULL | Email sent time |
| prefer_email_only | BOOLEAN | Yes | false | No phone calls |
| verification_token | TEXT | Yes | NULL | Security token |
| lead_source | TEXT | Yes | 'website' | Lead origin |
| utm_source | TEXT | Yes | NULL | UTM source |
| utm_medium | TEXT | Yes | NULL | UTM medium |
| utm_campaign | TEXT | Yes | NULL | UTM campaign |
| utm_content | TEXT | Yes | NULL | UTM content |
| utm_term | TEXT | Yes | NULL | UTM term |
| created_at | TIMESTAMPTZ | No | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

**Indexes**:
- `idx_leads_conversation_id` ON (conversation_id) WHERE conversation_id IS NOT NULL
- `idx_leads_call_sid` ON (call_sid) WHERE call_sid IS NOT NULL
- `idx_leads_confirmation_call_status` ON (confirmation_call_status) WHERE confirmation_call_status = 'calling'

**RLS Policies**:
| Policy | Command | Access |
|--------|---------|--------|
| Public can create leads | INSERT | Anonymous (rate limited) |
| Admins can read leads | SELECT | Admin only |
| Admins can update leads | UPDATE | Admin only |
| Admins can delete leads | DELETE | Admin only |
| Deny anon SELECT | SELECT | DENY anonymous |

---

### 2.2 quote_requests

**Purpose**: Detailed quote request storage

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| lead_id | UUID | Yes | NULL | FK to leads |
| quote_number | TEXT | Yes | NULL | Quote reference (HM-YYYY-XXXX) |
| property_type | TEXT | No | - | Property type |
| bedrooms | INTEGER | Yes | NULL | Number of bedrooms |
| square_footage | INTEGER | Yes | NULL | Square footage |
| has_stairs | BOOLEAN | Yes | false | Has stairs |
| floor_number | INTEGER | Yes | NULL | Floor number |
| specialty_items | TEXT[] | Yes | NULL | Special items |
| distance_zone | TEXT | Yes | NULL | Distance zone |
| base_price | NUMERIC | Yes | NULL | Base price |
| distance_fee | NUMERIC | Yes | NULL | Distance fee |
| stairs_fee | NUMERIC | Yes | NULL | Stairs fee |
| specialty_fee | NUMERIC | Yes | NULL | Specialty fee |
| total_quote | NUMERIC | Yes | NULL | Total quote |
| created_at | TIMESTAMPTZ | No | now() | Creation timestamp |

**RLS Policies**:
| Policy | Command | Access |
|--------|---------|--------|
| Public can create | INSERT | Anonymous (rate limited) |
| Admins can read | SELECT | Admin only |
| Admins can update | UPDATE | Admin only |
| Admins can delete | DELETE | Admin only |

---

### 2.3 chat_conversations

**Purpose**: AI chat session tracking

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| session_id | TEXT | No | - | Browser session ID |
| lead_id | UUID | Yes | NULL | FK to leads (set server-side) |
| status | TEXT | No | 'active' | Conversation status |
| source_page | TEXT | Yes | NULL | Page where started |
| started_at | TIMESTAMPTZ | No | now() | Start time |
| ended_at | TIMESTAMPTZ | Yes | NULL | End time |
| metadata | JSONB | Yes | '{}' | Additional data |
| created_at | TIMESTAMPTZ | No | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

**RLS Policies**:
| Policy | Command | Access |
|--------|---------|--------|
| Public can start | INSERT | Anonymous (rate limited, no lead_id) |
| Admins can manage all | ALL | Admin only |
| Deny anon SELECT | SELECT | DENY anonymous |

---

### 2.4 chat_messages

**Purpose**: Individual chat message storage

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| conversation_id | UUID | No | - | FK to chat_conversations |
| role | TEXT | No | - | user/assistant/system/agent |
| content | TEXT | No | - | Message content |
| message_type | TEXT | No | 'text' | Message type |
| tool_data | JSONB | Yes | NULL | Tool call data |
| created_at | TIMESTAMPTZ | No | now() | Creation timestamp |

**RLS Policies**:
| Policy | Command | Access |
|--------|---------|--------|
| Public can create | INSERT | Validated (conversation must exist) |
| Admins can manage | ALL | Admin only |
| Deny anon SELECT | SELECT | DENY anonymous |

---

### 2.5 appointments

**Purpose**: Scheduled move appointments

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| lead_id | UUID | Yes | NULL | FK to leads |
| scheduled_date | DATE | No | - | Appointment date |
| scheduled_time | TEXT | No | - | Appointment time |
| status | TEXT | No | 'scheduled' | Status |
| move_type | TEXT | No | - | Type of move |
| crew_size | INTEGER | Yes | 2 | Crew size |
| estimated_duration | INTEGER | Yes | NULL | Hours |
| notes | TEXT | Yes | NULL | Notes |
| created_at | TIMESTAMPTZ | No | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

**RLS Policies**:
| Policy | Command | Access |
|--------|---------|--------|
| Admins only | ALL | Admin only |
| Deny anon SELECT | SELECT | DENY anonymous |

---

### 2.6 business_settings

**Purpose**: Company configuration (single row)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| company_name | TEXT | No | 'Handledly Moving Services' | Company name |
| phone_number | TEXT | No | '(720) 555-0123' | Phone |
| email | TEXT | Yes | 'hello@handledly.com' | Email |
| address | TEXT | Yes | '1234 Market Street...' | Address |
| service_areas | TEXT[] | Yes | [Denver suburbs array] | Service areas |
| base_rate_per_hour | NUMERIC | Yes | 125.00 | Base rate |
| minimum_hours | INTEGER | Yes | 2 | Minimum hours |
| created_at | TIMESTAMPTZ | No | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

**RLS Policies**:
| Policy | Command | Access |
|--------|---------|--------|
| Admins can read | SELECT | Admin only |
| Admins can update | UPDATE | Admin only |
| No INSERT/DELETE | - | DENY all |

**Public Access**:
Via `get_public_business_info()` security definer function (returns company_name, phone, address, service_areas only).

---

### 2.7 user_roles

**Purpose**: Role-based access control

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | FK to auth.users |
| role | app_role (ENUM) | No | - | 'admin' or 'user' |
| created_at | TIMESTAMPTZ | No | now() | Creation timestamp |

**ENUM**: `app_role` = ('admin', 'user')

**Unique Constraint**: (user_id, role)

**RLS Policies**:
| Policy | Command | Access |
|--------|---------|--------|
| Users can read own roles | SELECT | Own records |
| Admins can manage all | ALL | Admin only |

---

### 2.8 rate_limit_tracker

**Purpose**: DDoS/spam protection

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| identifier | TEXT | No | - | Client identifier hash |
| table_name | TEXT | No | - | Target table |
| created_at | TIMESTAMPTZ | No | now() | Request timestamp |

**RLS Policies**:
| Policy | Command | Access |
|--------|---------|--------|
| Public can insert | INSERT | Anonymous |
| Admins can manage | ALL | Admin only |

---

## 3. Database Functions

### has_role(_user_id, _role)
**Purpose**: Check if user has specific role (avoids RLS recursion)

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### get_public_business_info()
**Purpose**: Safely expose business settings to public

```sql
CREATE OR REPLACE FUNCTION public.get_public_business_info()
RETURNS TABLE(company_name text, phone_number text, address text, service_areas text[])
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bs.company_name, bs.phone_number, bs.address, bs.service_areas
  FROM public.business_settings bs
  LIMIT 1;
$$;
```

### get_user_id_by_email(email_input)
**Purpose**: Admin-only email lookup

```sql
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_input text)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  RETURN (SELECT id FROM auth.users WHERE email = lower(email_input) LIMIT 1);
END;
$$;
```

### check_rate_limit_readonly(...)
**Purpose**: Rate limit check without side effects (for RLS WITH CHECK)

```sql
CREATE OR REPLACE FUNCTION public.check_rate_limit_readonly(
  p_table_name text,
  p_identifier text,
  p_max_requests integer DEFAULT 10,
  p_time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT COUNT(*) FROM public.rate_limit_tracker rt
     WHERE rt.identifier = p_identifier
       AND rt.table_name = p_table_name
       AND rt.created_at > now() - (p_time_window_minutes || ' minutes')::INTERVAL
    ) < p_max_requests,
    TRUE
  );
$$;
```

### timeout_stale_calls()
**Purpose**: Auto-timeout stuck calls (run periodically)

```sql
CREATE OR REPLACE FUNCTION public.timeout_stale_calls()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.leads
  SET 
    confirmation_call_status = 'timeout',
    call_notes = COALESCE(call_notes, '') || ' | Auto-timeout at ' || NOW()::text
  WHERE 
    confirmation_call_status = 'calling'
    AND confirmation_call_time < NOW() - INTERVAL '5 minutes';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
```

### get_client_identifier()
**Purpose**: Generate client identifier for rate limiting

```sql
CREATE OR REPLACE FUNCTION public.get_client_identifier()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.uid()::TEXT,
    encode(sha256(convert_to(
      COALESCE(current_setting('request.headers', true), 'anon-session'),
      'UTF8'
    )), 'hex')
  );
$$;
```

---

## 4. Triggers

### Rate Limit Recording Triggers

```sql
-- Leads table
CREATE TRIGGER record_leads_rate_limit
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.record_rate_limit_on_leads_insert();

-- Quote requests table
CREATE TRIGGER record_quotes_rate_limit
  AFTER INSERT ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.record_rate_limit_on_quotes_insert();

-- Chat conversations table
CREATE TRIGGER record_chat_rate_limit
  AFTER INSERT ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.record_rate_limit_on_chat_insert();

-- Chat messages table
CREATE TRIGGER record_chat_message_rate_limit
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.record_rate_limit_on_chat_message_insert();
```

### Updated At Trigger

```sql
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 5. Security Model

### Access Control Matrix

| Table | Anonymous | Authenticated | Admin |
|-------|-----------|---------------|-------|
| leads | INSERT* | INSERT* | ALL |
| quote_requests | INSERT* | INSERT* | ALL |
| chat_conversations | INSERT* | INSERT* | ALL |
| chat_messages | INSERT** | INSERT** | ALL |
| appointments | - | - | ALL |
| business_settings | get_public_*() | get_public_*() | SELECT, UPDATE |
| user_roles | - | SELECT (own) | ALL |
| rate_limit_tracker | INSERT | INSERT | ALL |

*Rate limited (5-20 per hour)
**Validated (conversation must exist)

### Rate Limits by Table

| Table | Max Requests | Time Window |
|-------|--------------|-------------|
| leads | 5 | 60 minutes |
| quote_requests | 10 | 60 minutes |
| chat_conversations | 20 | 60 minutes |

---

## 6. Sample Queries

### Get Lead with Quote
```sql
SELECT l.*, qr.quote_number, qr.total_quote
FROM leads l
LEFT JOIN quote_requests qr ON qr.lead_id = l.id
WHERE l.id = 'uuid-here';
```

### Get Chat History
```sql
SELECT cm.role, cm.content, cm.created_at
FROM chat_messages cm
JOIN chat_conversations cc ON cc.id = cm.conversation_id
WHERE cc.session_id = 'session-id'
ORDER BY cm.created_at ASC;
```

### Get Admin Dashboard Stats
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'new') as new_leads,
  COUNT(*) FILTER (WHERE confirmation_call_status = 'completed') as calls_completed,
  SUM(estimated_quote) as total_pipeline
FROM leads
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

*Last Updated: January 25, 2026*
