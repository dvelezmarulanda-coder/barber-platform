-- BARBER PLATFORM - FULL SCHEMA
-- Run this in the Supabase SQL Editor to initialize a NEW project.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

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

-- HORARIOS_DISPONIBILIDAD
create table horarios_disponibilidad (
  id uuid default uuid_generate_v4() primary key,
  barbero_id uuid references perfiles(id) on delete cascade not null,
  dia_semana integer check (dia_semana between 0 and 6), -- 0 = Domingo
  hora_inicio time not null,
  hora_fin time not null,
  activo boolean default true,
  unique(barbero_id, dia_semana, hora_inicio)
);

-- CITAS (Updated for Guest Booking)
create table citas (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references perfiles(id) on delete cascade, -- Nullable for guests
  barbero_id uuid references perfiles(id) on delete cascade not null,
  servicio_id uuid references servicios(id) on delete set null not null,
  fecha_hora timestamptz not null,
  estado text check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')) default 'pendiente',
  nota_cliente text,
  
  -- Guest Fields
  cliente_nombre text,
  cliente_telefono text,
  cliente_email text,
  
  created_at timestamptz default now()
);

-- 3. ROW LEVEL SECURITY (RLS)
alter table perfiles enable row level security;
alter table servicios enable row level security;
alter table horarios_disponibilidad enable row level security;
alter table citas enable row level security;

-- 4. POLICIES

-- PERFILES
-- Anyone can read profiles (needed for booking UI to see barbers)
create policy "Perfiles públicos" on perfiles for select using (true);
-- Users can insert their own profile
create policy "Usuarios crean su perfil" on perfiles for insert with check (auth.uid() = id);
-- Users can edit their own profile
create policy "Usuarios editan su perfil" on perfiles for update using (auth.uid() = id);
-- Admins can do everything
create policy "Admins full access perfiles" on perfiles for all using (
  auth.uid() in (select id from perfiles where rol = 'admin')
);

-- SERVICIOS
-- Public read
create policy "Servicios públicos" on servicios for select using (true);
-- Admin write
create policy "Admins gestionan servicios" on servicios for all using (
  auth.uid() in (select id from perfiles where rol = 'admin')
);

-- HORARIOS
-- Public read
create policy "Horarios públicos" on horarios_disponibilidad for select using (true);
-- Barber/Admin write
create policy "Barberos gestionan horarios" on horarios_disponibilidad for all using (
  auth.uid() = barbero_id or 
  auth.uid() in (select id from perfiles where rol = 'admin')
);

-- CITAS
-- Clients see own
create policy "Clientes ven sus citas" on citas for select using (auth.uid() = cliente_id);
-- Barbers see assigned
create policy "Barberos ven sus citas" on citas for select using (auth.uid() = barbero_id);
-- Admins see all
create policy "Admins ven todas las citas" on citas for select using (
  auth.uid() in (select id from perfiles where rol = 'admin')
);
-- Create: Authenticated users or Public (for guests)?
-- Guests insert via public API key, but RLS usually requires auth.
-- For anon/guest booking to work with RLS, we typically need a policy for 'anon' role or bypass RLS for specific logic.
-- Use basic Insert policy for authenticated users:
create policy "Usuarios agendan citas" on citas for insert with check (auth.uid() = cliente_id);
-- Allow public insert for guests (careful with spam, but needed for guest feature)
create policy "Invitados agendan citas" on citas for insert with check (cliente_id is null);

-- Updates (Cancel/Confirm)
create policy "Participantes actualizan citas" on citas for update using (
  auth.uid() = cliente_id or 
  auth.uid() = barbero_id or
  auth.uid() in (select id from perfiles where rol = 'admin')
);

-- 5. INDEXES & CONSTRAINTS
-- Prevent double booking (Active appointments only)
CREATE UNIQUE INDEX unique_active_appointment 
ON public.citas (barbero_id, fecha_hora) 
WHERE estado != 'cancelada';
