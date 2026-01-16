-- Add a unique constraint (index) to prevent duplicate bookings at the same time
-- This ensures that for a given provider (barber), only ONE active appointment can exist at a specific timestamp.
-- We exclude 'cancelada' appointments so that if one is cancelled, the slot becomes free again.

create unique index unique_active_appointment 
on public.citas (barbero_id, fecha_hora) 
where estado != 'cancelada';
