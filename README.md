# Portal Mundial 2026 — Dashboard Administrativo

Panel de administración full-stack para la Copa del Mundo FIFA 2026.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| ORM | Prisma |
| Base de Datos | PostgreSQL |
| Autenticación | NextAuth.js v5 (JWT + Credentials) |
| Formularios | React Hook Form + Zod |
| Tablas | TanStack Table v8 |
| Gráficos | Recharts |
| Estado | Zustand |

## Módulos

- **Dashboard** — KPIs, próximos partidos, goles recientes
- **Equipos** — CRUD completo, asignación a grupos y confederaciones
- **Jugadores** — CRUD con posición, edad, estadísticas
- **Grupos** — Tabla de posiciones con cálculo automático de puntos/GD
- **Partidos** — Editor completo con marcador, goles, tarjetas y estado
- **Estadios** — Gestión de las 16 sedes de EE.UU., México y Canadá
- **Estadísticas** — Goleadores, tarjetas, gráfico de goles por equipo

## Instalación

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL y AUTH_SECRET

# 3. Configurar base de datos
npx prisma db push

# 4. Cargar datos iniciales (48 equipos + 16 estadios + 45 jugadores)
npm run db:seed

# 5. Iniciar en desarrollo
npm run dev
```

## Credenciales por defecto (seed)

```
Email:    admin@mundial2026.com
Password: admin123456
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx       # Resumen general
│   │       ├── teams/         # Gestión de equipos
│   │       ├── players/       # Gestión de jugadores
│   │       ├── groups/        # Tabla de grupos
│   │       ├── matches/       # Partidos + editor
│   │       ├── stadiums/      # Estadios
│   │       └── statistics/    # Estadísticas
│   └── api/                   # REST API routes
├── components/
│   ├── ui/                    # Componentes base (shadcn/ui)
│   ├── layout/                # Sidebar + Header
│   ├── shared/                # DataTable, StatCard, ConfirmDialog
│   ├── teams/                 # TeamForm
│   ├── players/               # PlayerForm
│   ├── matches/               # MatchForm + MatchEditor
│   ├── stadiums/              # StadiumForm
│   └── statistics/            # GoalsBarChart
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── prisma.ts              # Prisma client singleton
│   ├── utils.ts               # Utilidades + labels
│   └── validations/           # Zod schemas
└── middleware.ts              # Auth guard
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/teams` | Listar / crear equipos |
| GET/PATCH/DELETE | `/api/teams/:id` | Equipo individual |
| GET/POST | `/api/players` | Listar / crear jugadores |
| GET/PATCH/DELETE | `/api/players/:id` | Jugador individual |
| GET | `/api/groups` | Grupos con clasificación calculada |
| GET/POST | `/api/matches` | Listar / crear partidos |
| GET/PATCH/DELETE | `/api/matches/:id` | Partido individual |
| POST/DELETE | `/api/matches/:id/goals` | Gestionar goles |
| POST | `/api/matches/:id/cards` | Registrar tarjetas |
| GET/POST | `/api/stadiums` | Estadios |
| GET/PATCH/DELETE | `/api/stadiums/:id` | Estadio individual |
| GET | `/api/statistics` | Estadísticas agregadas |

## Datos pre-cargados (seed)

- **48 equipos** clasificados con sus grupos y confederaciones reales
- **16 estadios** sede del Mundial 2026 (USA, México, Canadá)
- **45 jugadores** representativos de los equipos principales
- **2 partidos** de muestra programados
