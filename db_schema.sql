-- TABLA DE PERFILES (Usuarios)
-- Se vincula automáticamente con auth.users
create table public.perfiles (
  id uuid references auth.users not null primary key,
  email text,
  nombre text,
  telefono text,
  rol text check (rol in ('cliente', 'barbero', 'admin')) default 'cliente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar seguridad (RLS)
alter table public.perfiles enable row level security;

-- TABLA DE SERVICIOS
create table public.servicios (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  descripcion text,
  precio numeric not null,
  duracion_minutos integer default 30,
  activo boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA DE CITAS
create table public.citas (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references public.perfiles(id) not null,
  barbero_id uuid references public.perfiles(id), -- Puede ser 'any' lógicamente, pero aquí referenciamos si es asignado
  servicio_id uuid references public.servicios(id) not null,
  fecha_hora timestamp with time zone not null,
  estado text check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')) default 'confirmada',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA DE HORARIOS (Disponibilidad de Barberos)
create table public.horarios_disponibilidad (
  id uuid default uuid_generate_v4() primary key,
  barbero_id uuid references public.perfiles(id) not null,
  dia_semana integer not null, -- 0=Domingo, 1=Lunes...
  hora_inicio time not null,
  hora_fin time not null,
  activo boolean default true
);

-- POLÍTICAS DE SEGURIDAD (Copia y pega esto también) --

-- Perfiles: Todos pueden ver perfiles de barberos (para reservar)
create policy "Perfiles visibles" on perfiles for select using (true);
-- Perfiles: Solo el usuario puede editar su propio perfil
create policy "Usuario edita su perfil" on perfiles for update using (auth.uid() = id);

-- Servicios: Públicos para leer
create policy "Servicios lectura publica" on servicios for select using (true);
-- Servicios: Solo admin edita
create policy "Admin gestiona servicios" on servicios for all using (
  exists (select 1 from perfiles where id = auth.uid() and rol = 'admin')
);

-- Citas: Cliente ve sus citas, Barbero las suyas, Admin todas
create policy "Ver citas propias" on citas for select using (
  auth.uid() = cliente_id or auth.uid() = barbero_id or 
  exists (select 1 from perfiles where id = auth.uid() and rol = 'admin')
);
-- Citas: Cliente puede crear cita
create policy "Cliente crea cita" on citas for insert with check (auth.uid() = cliente_id);
-- Citas: Admin o Barbero o Cliente (propietario) pueden cancelar
create policy "Modificar citas" on citas for update using (
  auth.uid() = cliente_id or auth.uid() = barbero_id or 
  exists (select 1 from perfiles where id = auth.uid() and rol = 'admin')
);

-- Horarios: Lectura pública (para calcular slots)
create policy "Horarios publicos" on horarios_disponibilidad for select using (true);
-- Horarios: Solo admin gestiona
create policy "Admin gestiona horarios" on horarios_disponibilidad for all using (
  exists (select 1 from perfiles where id = auth.uid() and rol = 'admin')
);

-- TRIGGER PARA CREAR PERFIL AUTOMÁTICO AL REGISTRARSE
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.perfiles (id, email, nombre, rol)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'cliente');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
