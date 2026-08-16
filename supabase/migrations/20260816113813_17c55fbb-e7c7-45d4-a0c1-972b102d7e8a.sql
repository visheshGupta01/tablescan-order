ALTER TABLE public.restaurant
  ADD COLUMN IF NOT EXISTS tax_rate numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS tax_label text NOT NULL DEFAULT 'GST',
  ADD COLUMN IF NOT EXISTS tips_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tax_rate numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tip_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;