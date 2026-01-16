-- Permitir a usuarios actualizar el estado de sus PROPIAS citas
-- (Ya sea si son el cliente O el barbero asignado)

create policy "Usuarios pueden cancelar sus citas" on citas
for update
using (
  auth.uid() = cliente_id OR auth.uid() = barbero_id
)
with check (
  auth.uid() = cliente_id OR auth.uid() = barbero_id
);
