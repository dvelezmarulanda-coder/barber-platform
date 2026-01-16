-- 1. Crear una función segura para verificar si es admin (Evita el bucle infinito)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from perfiles
    where id = auth.uid() and rol = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Limpiar políticas recursivas
drop policy if exists "Admins full access perfiles" on perfiles;

-- 3. Crear política para Admins usando la función segura
-- Esta política permite a los admins hacer TODO en perfiles, sin causar bucle
create policy "Admins full access safe" on perfiles
for all using (
  public.is_admin()
);

-- 4. Asegurar que TU usuario tiene el rol correcto (por si acaso)
update perfiles set rol = 'admin' where email = 'dvelezmarulanda@gmail.com';
