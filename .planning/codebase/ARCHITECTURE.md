# Architecture Overview

## Pattern: Full-Stack SPA with Express API

The application is a **React SPA** (Vite-built) paired with an **Express.js REST API** server.
In development, Vite dev-server proxies `/api` requests to the Express backend (port 3001).
In production on Vercel, a single serverless function (`api/index.ts`) re-exports the Express app,
and all non-API routes are rewritten to `index.html` for client-side routing.

## Data Flow

```
Browser (React SPA)
  --> fetch("/api/...")   (via src/api/client.ts wrapper)
  --> Express router      (server/routes/*.ts)
  --> sql.js in-memory DB (server/config/database.ts)
```

1. **API client** (`src/api/client.ts`): thin wrapper around `fetch` that auto-attaches the JWT
   from `localStorage` and handles 401 redirects. Exposes `api.get/post/put/delete`.
2. **Endpoint functions** (`src/api/endpoints.ts`): named functions for each API call (content,
   patients, notifications, admin, AI chat).
3. **Custom hooks** (`useApi`, `useContentData`): React hooks that call endpoint functions and
   manage loading/error/data state via `useState`/`useEffect`.
4. **Server routes** receive requests, run SQL via the `db` compatibility wrapper, and return JSON.

## Database

- **sql.js** (ASM.js build) creates an **in-memory SQLite database** on each cold start.
- Schema is applied from `server/db/schema.sql`; seed data from `server/db/seed.sql` and
  `server/db/seed-content.ts`.
- **Data is ephemeral** -- resets on every Vercel deployment or serverless cold start.
  A persistent storage migration is pending (see project memory).

## State Management

- **No external state library** (no Redux, Zustand, etc.).
- **AuthContext** (`src/context/AuthContext.tsx`): provides `user`, `token`, `patient`, and auth
  methods (`login`, `loginParent`, `registerParent`, `setNickname`, `logout`) via React Context.
- Page-level state is managed with local `useState`/`useEffect`.
- Content data is fetched through `useContentCategories` and `useContentModules` hooks.

## Routing (react-router-dom v7)

| Path                      | Component              | Access       |
|---------------------------|------------------------|--------------|
| `/`                       | LandingPage            | Public       |
| `/login`                  | LoginPage              | Public       |
| `/dashboard`              | ParentDashboard        | Parent       |
| `/manual`                 | DischargeManual        | Parent       |
| `/admin`                  | AdminEditor            | Admin        |
| `/admin/notifications`    | NotificationCenter     | Admin        |
| `/admin/confirmations`    | AdmissionConfirmations | Admin        |
| `*`                       | NotFoundPage           | Public       |

Routes are wrapped with `<ProtectedRoute role="parent|admin">` which checks `useAuth()`.
Admins can access parent routes; parents cannot access admin routes.

## Auth Flow

1. **Parents**: Enter chart number on LandingPage --> `POST /api/auth/login-parent` -->
   server returns JWT --> stored in `localStorage`.
2. **Staff/Admin**: Navigate to `/login?role=staff`, enter staff code (client-side gate),
   then `POST /api/auth/login` with hardcoded admin credentials --> JWT returned.
3. **Token verification**: On page load, `AuthContext` calls `GET /api/auth/me` with stored
   JWT to restore the session.
4. **Server middleware** (`authenticateToken`): verifies JWT, attaches `req.user`.
   `requireRole` and `requirePatientAccess` guard specific routes.

## Key Architectural Decisions

- **sql.js over better-sqlite3**: chosen for Vercel serverless compatibility (no native binaries).
  A compatibility wrapper in `database.ts` emulates the better-sqlite3 API.
- **No build-time SSR**: pure client-side SPA. Vercel rewrites handle SPA fallback.
- **Screen capture protection**: `ScreenCaptureWarning`, `CaptureNoticeModal`, and `Watermark`
  components are rendered at the app root to discourage screenshots of patient data.
- **AI Chat**: integrates Google Gemini (`@google/genai`) via `server/services/geminiService.ts`.
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin; utility merging via `clsx` + `tailwind-merge`.
- **Icons**: Lucide React icons mapped by string name (`src/lib/iconMap.ts`) so the DB can
  reference icons by name and the UI resolves them at render time.
- **Drag-and-drop**: `@dnd-kit` used in the admin editor for reordering content.
- **Animations**: `motion` (Framer Motion) used for page transitions and UI polish.
