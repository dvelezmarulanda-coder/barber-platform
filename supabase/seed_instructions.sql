-- Insert Services
INSERT INTO servicios (nombre, duracion_minutos, precio, descripcion) VALUES
('Corte Clásico', 30, 30.00, 'Un corte tradicional con máquina y tijera.'),
('Corte y Barba', 45, 45.00, 'Corte completo y perfilado de barba.'),
('Afeitado Real', 30, 35.00, 'Afeitado tradicional con navaja y toallas calientes.');

-- Insert Barber (You will need to manually set the id to a real user id later if you want to login as them, 
-- but for selection display we can create a dummy profile linked to a random uuid if we disable FK check or create a user first.
-- BETTER STRATEGY: Create a profile for the CURRENT user if logged in, or just insert raw into perfiles if the Auth trigger allows it (it might not if strictly 1:1 with auth.users).
-- Safest for now without auth integration: relying on existing users or inserting a dummy if RLS allows.
-- Assuming the user might not have users yet.

-- Actually, let's just create a seed script for the user to run in Supabase SQL Editor which is safer.
