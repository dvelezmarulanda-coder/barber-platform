-- 1. Actualizar RLS para permitir que los 'admin' lo vean/editen todo
CREATE POLICY "Admins full access servicios" ON servicios
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'admin')
  );

CREATE POLICY "Admins full access horarios" ON horarios_disponibilidad
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'admin')
  );

CREATE POLICY "Admins full access perfiles" ON perfiles
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'admin')
  );

-- 2. Promover tu usuario a ADMIN (Reemplaza con tu ID real si es diferente al que usaste antes)
-- UPDATE perfiles SET rol = 'admin' WHERE email = 'TU_EMAIL@GMAIL.COM';
