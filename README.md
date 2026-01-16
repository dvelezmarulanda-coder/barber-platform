# 💈 TRIM APP

**La forma más fácil de reservar tu corte de cabello**

TRIM APP es una Progressive Web Application (PWA) moderna para gestión de citas de barbería, diseñada específicamente para el mercado colombiano.

## ✨ Características

- 🗓️ **Sistema de Reservas en Tiempo Real** - Los clientes pueden agendar citas 24/7
- 👤 **Multi-Usuario** - Roles de Cliente, Barbero y Administrador
- 📱 **Mobile First** - Diseño responsive optimizado para móviles
- 🔐 **Autenticación Segura** - Magic Links vía Supabase Auth
- 💰 **Precios en COP** - Formato de moneda colombiana
- 🎨 **UI Premium** - Diseño moderno con tipografía Outfit
- ⚡ **Tiempo Real** - Sincronización instantánea de citas
- 🚫 **Prevención de Doble Reserva** - Sistema inteligente de disponibilidad

## 🚀 Inicio Rápido

### Prerequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- Cuenta en **Supabase** ([Crear cuenta gratis](https://supabase.com))

### Instalación

1. **Clonar el repositorio**
```bash
cd barber-platform
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

4. **Configurar la base de datos**

- Ve a tu proyecto en Supabase
- Abre el **SQL Editor**
- Ejecuta el archivo `supabase/schema.sql`

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Roles de Usuario

### 👤 Cliente
- Agendar citas
- Ver historial de citas
- Cancelar citas
- Reservar como invitado (sin cuenta)

### 💈 Barbero
- Ver citas asignadas
- Gestionar su calendario
- Acceso al código QR de reservas

### 🔑 Administrador
- Ver TODAS las citas
- Gestionar servicios (crear, editar, eliminar)
- Asignar rol de barbero a usuarios
- Acceso completo al panel de administración

## 🗂️ Estructura del Proyecto

```
barber-platform/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── login/             # Autenticación
│   ├── dashboard/         # Dashboard de usuario
│   ├── book/              # Sistema de reservas
│   ├── services/          # Catálogo de servicios
│   └── admin/             # Panel de administración
├── components/            # Componentes reutilizables
│   ├── Logo.tsx          # Logo de TRIM APP
│   ├── booking/          # Componentes de reserva
│   └── dashboard/        # Componentes del dashboard
├── lib/                  # Utilidades
│   ├── supabase.ts      # Cliente de Supabase
│   └── database.types.ts # Tipos de TypeScript
└── supabase/            # Scripts SQL
    └── schema.sql       # Schema de la base de datos
```

## 🎨 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Tipografía**: Outfit (Google Fonts)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (Magic Links)
- **Hosting**: Vercel (recomendado)

## 🔧 Configuración Inicial

### 1. Crear tu primer servicio

1. Inicia sesión con tu email
2. Ve a `/admin/services`
3. Crea servicios con:
   - Nombre (ej: "Corte Clásico")
   - Descripción
   - Precio en COP
   - Duración en minutos

### 2. Asignar barberos

1. Ve a `/admin/barbers`
2. Busca usuarios por email
3. Asigna el rol de "barbero"

### 3. Probar el flujo de reserva

1. Ve a `/book`
2. Selecciona servicio, barbero y horario
3. Confirma la reserva
4. Verifica en el dashboard

## 📊 Base de Datos

### Tablas Principales

- **perfiles**: Información de usuarios (nombre, rol, email)
- **servicios**: Catálogo de servicios de la barbería
- **citas**: Reservas de clientes
- **horarios_disponibilidad**: Horarios de trabajo de barberos

### Seguridad (RLS)

Todas las tablas tienen Row Level Security (RLS) habilitado para proteger los datos.

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno
3. Despliega automáticamente

Ver guía completa en `DEPLOYMENT_MANUAL.md`

## 🤝 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

**Hecho con ❤️ para barberías colombianas**
