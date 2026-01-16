-- Make cliente_id nullable to support guest bookings
ALTER TABLE public.citas
ALTER COLUMN cliente_id DROP NOT NULL;

-- Add columns for guest details
ALTER TABLE public.citas
ADD COLUMN cliente_nombre text,
ADD COLUMN cliente_telefono text,
ADD COLUMN cliente_email text;

-- Optional: Add a check constraint to ensure either cliente_id OR (cliente_nombre AND cliente_telefono) are present?
-- For now we handle this in application logic to keep it simple.
