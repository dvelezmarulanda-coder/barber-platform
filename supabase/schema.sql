-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PERFILES (Usuarios: Clientes, Barberos, Admins)
create table perfiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text not null,
  telefono text,
  email text,
  rol text check (rol in ('cliente', 'barbero', 'admin')) default 'cliente',
  created_at timestamptz default now()
);

-- SERVICIOS
create table servicios (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  duracion_minutos integer not null,
  precio numeric(10, 2) not null,
  descripcion text,
  imagen_url text,
  activo boolean default true
);

-- HORARIOS_DISPONIBILIDAD (Configuración de barberos)
create table horarios_disponibilidad (
  id uuid default uuid_generate_v4() primary key,
  barbero_id uuid references perfiles(id) on delete cascade not null,
  dia_semana integer check (dia_semana between 0 and 6), -- 0 = Domingo
  hora_inicio time not null,
  hora_fin time not null,
  activo boolean default true,
  unique(barbero_id, dia_semana, hora_inicio)
);

-- CITAS
create table citas (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references perfiles(id) on delete cascade not null,
  barbero_id uuid references perfiles(id) on delete cascade not null,
  servicio_id uuid references servicios(id) on delete set null not null,
  fecha_hora timestamptz not null,
  estado text check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')) default 'pendiente',
  nota_cliente text,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table perfiles enable row level security;
alter table servicios enable row level security;
alter table horarios_disponibilidad enable row level security;
alter table citas enable row level security;

-- Policies

-- Perfiles: Public read (for bios etc), specific update for self
create policy "Perfiles públicos para todos" on perfiles
  for select using (true);

create policy "Usuarios pueden crear su propio perfil" on perfiles
  for insert with check (auth.uid() = id);

create policy "Usuarios pueden editar su propio perfil" on perfiles
  for update using (auth.uid() = id);

-- Servicios: Read public, Write admin (implement admin check later or manually)
create policy "Servicios visibles para todos" on servicios
  for select using (true);

-- Horarios: Read public, Write owner (barber)
create policy "Horarios visibles para todos" on horarios_disponibilidad
  for select using (true);

create policy "Barberos gestionan sus horarios" on horarios_disponibilidad
  for all using (auth.uid() = barbero_id);

-- Citas:
-- Client can see own appointments
create policy "Usuarios ven sus propias citas" on citas
  for select using (auth.uid() = cliente_id);

-- Barbers can see appointments assigned to them
create policy "Barberos ven citas asignadas" on citas
  for select using (auth.uid() = barbero_id);

-- Clients can create appointments
create policy "Clientes pueden agendar citas" on citas
  for insert with check (auth.uid() = cliente_id);

-- Users can update status of own appointments (cancellation) or barbers (confirmation)
create policy "Participantes pueden actualizar citas" on citas
   for update using (auth.uid() = cliente_id or auth.uid() = barbero_id);
