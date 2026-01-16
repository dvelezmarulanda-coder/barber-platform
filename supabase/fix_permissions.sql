-- 1. Eliminar políticas antiguas conflictivas para evitar errores de duplicado
drop policy if exists "Ver propio perfil" on perfiles;
drop policy if exists "Admins full access perfiles" on perfiles;

-- 2. Permitir que CUALQUIER usuario vea su propio perfil (Fundamental)
create policy "Ver propio perfil" on perfiles 
for select using (auth.uid() = id);

-- 3. Permitir que los ADMINS hagan todo (Select, Insert, Update, Delete)
create policy "Admins full access perfiles" on perfiles 
for all using (
  auth.uid() in (select id from perfiles where rol = 'admin')
);

-- 4. Asegurar que TU usuario está en la tabla perfiles y es admin
-- Esto busca tu ID real en la tabla de autenticación y lo inserta/actualiza en perfiles
insert into public.perfiles (id, nombre, email, rol)
select id, 'David Admin', email, 'admin'
from auth.users
where email = 'dvelezmarulanda@gmail.com'
on conflict (id) do update
set rol = 'admin', nombre = 'David Admin';
