-- Ajout de la colonne pour GeniusPay
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS geniuspay_transaction_id TEXT;