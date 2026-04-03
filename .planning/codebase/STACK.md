# Technology Stack

## Language & Runtime

- **TypeScript** ~5.8.2, target ES2022, module ESNext, bundler module resolution
- **Node.js** (runtime for server, no explicit engine constraint in package.json)
- ESM-first (`"type": "module"` in package.json)

## Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | ^19.0.0 |
| Routing | react-router-dom | ^7.13.1 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) | ^4.1.14 |
| Utility classes | tailwind-merge, clsx | ^3.5.0, ^2.1.1 |
| Icons | lucide-react | ^0.546.0 |
| Animation | motion (Framer Motion successor) | ^12.23.24 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities | ^6.3.1 / ^10.0.0 / ^3.2.2 |

### Frontend Structure

```
src/
  App.tsx          # Root component
  main.tsx         # Entry point
  api/             # HTTP client wrapper & endpoint definitions
  components/      # Shared UI components
  context/         # React context providers
  hooks/           # Custom hooks
  layouts/         # Layout components
  lib/             # Utility libraries
  pages/           # Route page components
  types.ts         # Shared type definitions
```

## Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| HTTP Server | Express | ^4.21.2 |
| Auth | jsonwebtoken + bcryptjs | ^9.0.3 / ^3.0.3 |
| Security | helmet, cors, express-rate-limit | ^8.1.0 / ^2.8.6 / ^8.2.1 |
| Cookie parsing | cookie-parser | ^1.4.7 |
| Database | sql.js (SQLite in-memory, ASM.js build) | ^1.14.0 |
| AI | @google/genai (Gemini) | ^1.29.0 |
| Env vars | dotenv | ^17.2.3 |

### Backend Structure

```
server/
  index.ts           # Express app setup, route mounting
  config/database.ts  # sql.js initialization, better-sqlite3 compat wrapper
  db/schema.sql       # DDL
  db/seed.sql          # Seed data
  db/seed-content.ts   # Programmatic content seeding
  routes/              # auth, content, notices, discharge, patients, notifications, admin, ai
  services/            # geminiService.ts
  middleware/          # auth, errorHandler
  types/               # Server-side type definitions
api/
  index.ts            # Vercel serverless entry point (re-exports Express app)
```

## Build Tools

| Tool | Purpose | Version |
|------|---------|---------|
| Vite | Frontend bundler & dev server | ^6.2.0 |
| @vitejs/plugin-react | React JSX transform | ^5.0.4 |
| @tailwindcss/vite | Tailwind v4 Vite integration | ^4.1.14 |
| tsx | TypeScript execution for server (dev & prod) | ^4.21.0 |
| concurrently | Run client + server in parallel during dev | ^9.2.1 |

## Dev Dependencies

| Package | Purpose |
|---------|---------|
| typescript ~5.8.2 | Type checking (lint script: `tsc --noEmit`) |
| autoprefixer ^10.4.21 | CSS vendor prefixes |
| playwright ^1.58.2 | E2E / browser automation |
| sharp ^0.34.5 | Image processing (icon generation) |
| @types/* packages | Type definitions for Express, JWT, bcryptjs, cors, cookie-parser, Node |

## Deployment

- **Platform:** Vercel (serverless)
- **Config:** `vercel.json` with serverless function at `api/index.ts`
  - `maxDuration: 30` seconds
  - `includeFiles` bundles sql.js ASM dist and server/db/ files
  - Rewrites route `/api/*` to the serverless function, everything else to SPA `index.html`
- **Production URL:** parents-education.vercel.app
- **Build command:** `npm run build` (Vite build)
- **Output directory:** `dist/`

## Known Limitations

- **Database is in-memory only** (sql.js `new SQL.Database()` with no persistence). Data is lost on every cold start / redeploy. A persistent storage solution is needed before production use.
