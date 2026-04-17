# maps2gpx – Agent Notes

## Project Overview

Two-package monorepo (no root workspace config). Both packages use **pnpm@10.18.3**.

- **backend/** – NestJS 11 (TypeScript). Converts Google Maps URLs to GPX files via the GraphHopper routing API.
- **frontend/** – Angular 21 standalone app with Leaflet maps. Parses Google Maps URLs client-side, calls backend to generate GPX.

## Setup

Both packages need independent `pnpm install` in their directories.

Backend requires a `.env` file (copy from `.env.example`):

```
GRAPHHOPPER_API_KEY=<key>
```

The backend runs on port 3000 and has CORS configured for `http://localhost:4200` (Angular dev server).

## Architecture

### Backend (`backend/src/`)

Single module: `gpx/` (controller, service, DTOs).

- `POST /api/route-to-gpx` – accepts waypoints + profile, returns GPX string + metadata
- `POST /api/resolve-url` – resolves Google Maps short URLs (goo.gl, maps.app.goo.gl)

Key dependency: `gpx-builder` (GarminBuilder) for GPX generation, native `fetch` for GraphHopper API calls.

Imports use `.js` extension (TypeScript `nodenext` module resolution).

### Frontend (`frontend/src/app/`)

- `services/url-parser.service.ts` – parses Google Maps directions/place URLs into waypoints
- `services/gpx-api.service.ts` – calls backend API (hardcoded `http://localhost:3000/api`)
- `models/route.model.ts` – shared types (`Waypoint`, `RouteProfile`, `RouteRequest`, `RouteResponse`)
- `app.ts` – main component (signal-based, standalone)

## Commands

### Backend (run inside `backend/`)

| Command | Description |
|---|---|
| `pnpm start:dev` | Dev server with watch |
| `pnpm lint` | ESLint with auto-fix |
| `pnpm test` | Unit tests (Jest, matches `*.spec.ts` in `src/`) |
| `pnpm test:e2e` | E2E tests (Jest, matches `test/*.e2e-spec.ts`) |
| `pnpm test:cov` | Test coverage |
| `pnpm format` | Prettier |

### Frontend (run inside `frontend/`)

| Command | Description |
|---|---|
| `pnpm start` | Dev server (`ng serve`) |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests (Vitest via Angular builder, matches `*.spec.ts`) |

## Verification Order

After making changes: **lint → typecheck → test**. Backend has an explicit `lint` script; frontend relies on Angular's build for type checking. Always run tests after changes.

## Testing Convention

**Every feature must be validated with unit tests for both frontend and backend.**

- **Backend**: place `*.spec.ts` files next to the source in `src/`. Use `@nestjs/testing` for service/controller unit tests. Mock external APIs (GraphHopper) — do not call real APIs in tests.
- **Frontend**: place `*.spec.ts` files next to the source in `src/app/`. Test services and components in isolation using Angular `TestBed`. Mock HTTP calls to the backend.

Run the relevant test suite after every change:

```bash
# Backend
cd backend && pnpm test

# Frontend
cd frontend && pnpm test
```

## Style Notes

- **Frontend styling: Tailwind CSS** – use Tailwind utility classes for all frontend styling. Do not write custom CSS; prefer Tailwind classes in templates.
- **Backend Prettier**: single quotes, trailing commas (`all`)
- **Frontend Prettier**: printWidth 100, single quotes
- **Backend tsconfig**: `noImplicitAny: false`, `strictNullChecks: true`
- **Frontend tsconfig**: strict mode enabled, `strictTemplates: true`
- ESLint config disables `@typescript-eslint/no-explicit-any` in backend
