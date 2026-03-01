-- Add primary_vibe to sort products by user's vibe in setup wizard
ALTER TABLE public.wraith_products
  ADD COLUMN IF NOT EXISTS primary_vibe text;
