-- Add quote_number column to quote_requests table
ALTER TABLE public.quote_requests 
ADD COLUMN quote_number TEXT UNIQUE;

-- Backfill existing quotes with sequential numbers
WITH numbered_quotes AS (
  SELECT id, 'HM-' || to_char(created_at, 'YYYY') || '-' || LPAD(
    (ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 4, '0'
  ) as new_number
  FROM public.quote_requests
  WHERE quote_number IS NULL
)
UPDATE public.quote_requests q
SET quote_number = nq.new_number
FROM numbered_quotes nq
WHERE q.id = nq.id;