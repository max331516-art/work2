# Overview

This is a **construction supply chain management** web application (called "СНАБЖЕНИЕ" / "Supply") designed for managing material delivery requests on construction sites. It serves three user roles:

- **Foreman (Прораб)**: Creates material requests specifying location, material, quantity, unit, and delivery date
- **Supplier (Снабженец)**: Views requests in a Kanban-style board (New/In Progress/Archive tabs), assigns drivers, and manages request lifecycle
- **Driver (Водитель)**: Sees assigned deliveries and marks them as completed

The app is built as a mobile-first web application, originally intended to run as a Telegram Web App. The UI uses Russian language throughout.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Stack Overview
- **Frontend**: React 18 + TypeScript with Vite bundler
- **Backend**: Express 5 (Node.js) with TypeScript (via tsx)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui component library (new-york style)
- **State Management**: TanStack React Query for server state

## Directory Structure
```
client/          → React frontend (Vite SPA)
  src/
    components/  → App components + shadcn ui/ primitives
    hooks/       → Custom React hooks (use-requests, use-users, use-toast, use-mobile)
    lib/         → Utilities (queryClient, cn helper)
    pages/       → Route pages (Home, not-found)
server/          → Express backend
  index.ts       → Server entry, middleware setup
  routes.ts      → API route handlers
  storage.ts     → Database access layer (IStorage interface + DatabaseStorage)
  db.ts          → Drizzle + pg Pool setup
  vite.ts        → Dev server Vite middleware
  static.ts      → Production static file serving
shared/          → Shared between client and server
  schema.ts      → Drizzle table definitions + Zod schemas + TypeScript types
  routes.ts      → API contract definitions (paths, input/output schemas)
migrations/      → Drizzle-generated SQL migrations
```

## Key Design Patterns

### Shared API Contract
The `shared/routes.ts` file defines a typed API contract used by both client and server. It specifies paths, HTTP methods, Zod input schemas, and response schemas. The client hooks (`use-requests.ts`, `use-users.ts`) reference these directly for type-safe API calls and response parsing.

### Storage Abstraction
`server/storage.ts` defines an `IStorage` interface with a `DatabaseStorage` implementation. This separates data access from route handlers, making it possible to swap storage implementations.

### Schema-First Approach
Database tables are defined in `shared/schema.ts` using Drizzle's `pgTable`. Insert schemas are auto-generated via `drizzle-zod`. Types are inferred from the table definitions. This single source of truth prevents schema drift between DB, API validation, and TypeScript types.

### Role-Based UI
The frontend renders different views based on a client-side role switcher (no auth yet). The `Home.tsx` page conditionally renders:
- Foreman: Request creation form + recent requests
- Supplier: Tabbed Kanban view (New / In Progress / Completed)
- Driver: Assigned deliveries list

### Mobile-First UX
Designed for use on construction sites with "dirty hands" — large touch targets (min 48px), big +/- buttons for quantity, construction-themed orange/navy color palette.

## Database Schema

Two tables in PostgreSQL:

**users**: `id`, `username` (unique), `name`, `role` (foreman/supplier/driver), `telegramId`

**requests**: `id`, `location`, `material`, `quantity`, `unit`, `deliveryDate`, `status` (new/in_progress/completed/archived), `comment`, `createdById` (FK to users), `driverId` (FK to users, nullable), `createdAt`

## API Endpoints
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get single user
- `GET /api/requests` — List requests (optional query filters: role, userId)
- `POST /api/requests` — Create new request
- `PATCH /api/requests/:id/status` — Update request status (assign driver, change status)

## Build System
- **Dev**: `tsx server/index.ts` runs the Express server with Vite dev middleware for HMR
- **Production**: Client built via Vite to `dist/public/`, server bundled via esbuild to `dist/index.cjs`
- **DB migrations**: `drizzle-kit push` pushes schema changes directly to the database

# External Dependencies

## Database
- **PostgreSQL** — Required. Connected via `DATABASE_URL` environment variable. Uses `pg` (node-postgres) pool with Drizzle ORM.

## Key NPM Packages
- **drizzle-orm** + **drizzle-zod** + **drizzle-kit** — ORM, schema validation, migrations
- **express** v5 — HTTP server
- **@tanstack/react-query** — Client-side data fetching and caching
- **react-hook-form** + **@hookform/resolvers** — Form management with Zod validation
- **wouter** — Lightweight client-side routing
- **framer-motion** — Page/component animations
- **date-fns** — Date formatting and manipulation
- **shadcn/ui** components (Radix UI primitives) — Full suite of accessible UI components
- **lucide-react** — Icon library
- **vaul** — Drawer component
- **recharts** — Charting (available but not yet used)
- **connect-pg-simple** — Session store (available but not yet used)

## Planned Integration
- **Telegram Web App API** — The app is designed to eventually run inside Telegram as a Mini App, with `initData` validation on the backend for authentication. This is not yet implemented.

## Replit-Specific
- **@replit/vite-plugin-runtime-error-modal** — Error overlay in dev
- **@replit/vite-plugin-cartographer** + **@replit/vite-plugin-dev-banner** — Dev tooling (conditionally loaded)