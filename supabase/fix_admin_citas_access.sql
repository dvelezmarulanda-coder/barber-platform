-- Fix: Agregar política RLS para que los administradores puedan ver todas las citas
-- Este script agrega la política faltante que permite a los administradores ver todas las citas

-- Primero, eliminar la política si ya existe (para evitar errores)
DROP POLICY IF EXISTS "Admins ven todas las citas" ON citas;

-- Crear la política para que los administradores puedan ver todas las citas
CREATE POLICY "Admins ven todas las citas" ON citas 
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'admin')
  );

-- También asegurarnos de que los admins puedan actualizar todas las citas
DROP POLICY IF EXISTS "Admins actualizan todas las citas" ON citas;

CREATE POLICY "Admins actualizan todas las citas" ON citas 
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'admin')
  );

-- Y que puedan eliminar citas si es necesario
DROP POLICY IF EXISTS "Admins eliminan citas" ON citas;

CREATE POLICY "Admins eliminan citas" ON citas 
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'admin')
  );
