# File & Folder Structure

## Top-Level

```
parents-education/
  api/                  # Vercel serverless entry point
  data/                 # Local SQLite DB files (dev only, gitignored data)
  dist/                 # Vite build output
  public/               # Static assets served as-is (favicon, images)
  server/               # Express backend
  src/                  # React frontend source
  index.html            # SPA entry HTML
  package.json          # Dependencies and scripts
  tsconfig.json         # TypeScript config (frontend)
  vite.config.ts        # Vite bundler config (proxy, aliases, Tailwind plugin)
  vercel.json           # Vercel deployment config (rewrites, serverless function settings)
```

## `api/` -- Vercel Serverless Adapter

```
api/
  index.ts              # Re-exports the Express app for Vercel Functions
```

Single file that imports `server/index.ts` and exposes it as the default export.
Vercel routes all `/api/*` requests to this function.

## `server/` -- Express Backend

```
server/
  index.ts              # Express app setup (middleware, route mounting, static serving)
  tsconfig.json         # Server-specific TS config
  config/
    database.ts         # sql.js initialization, better-sqlite3 compatibility wrapper
  db/
    schema.sql          # Full DDL: 15+ tables (users, patients, content, vitals, etc.)
    seed.sql            # Initial data (admin user, sample patients, journey templates)
    seed-content.ts     # Programmatic content seeding (categories and cards)
  middleware/
    auth.ts             # JWT verification, role guards, patient access control
    errorHandler.ts     # Global error handler middleware
  routes/
    auth.ts             # Login, register, /me endpoint
    content.ts          # Content categories and modules CRUD
    notices.ts          # Hospital notices
    discharge.ts        # Discharge manual categories/items
    patients.ts         # Patient data, journey, examinations, vitals
    notifications.ts    # Push-style notifications (in-app)
    admin.ts            # Admin-only endpoints (stats, bulk publish, patient management)
    ai.ts               # AI chat sessions and messages (Gemini integration)
  services/
    geminiService.ts    # Google Gemini API client for AI chat
  types/
    index.ts            # Server-side TypeScript interfaces (AuthenticatedRequest, etc.)
```

## `src/` -- React Frontend

### Entry

```
src/
  main.tsx              # ReactDOM.createRoot, renders <App />
  App.tsx               # Route definitions, global providers (AuthProvider, ErrorBoundary)
  index.css             # Global styles, Tailwind directives
  types.ts              # Shared TypeScript interfaces (User, Patient, ContentModule, etc.)
```

### `src/api/` -- API Communication

```
src/api/
  client.ts             # Generic fetch wrapper with JWT auth and error handling
  endpoints.ts          # Named API functions organized by domain (content, patients, admin, AI)
```

### `src/context/` -- React Context

```
src/context/
  AuthContext.tsx        # Auth state (user, token, patient), login/logout/register methods
```

Single context provider. No other global state management.

### `src/hooks/` -- Custom Hooks

```
src/hooks/
  useApi.ts                     # Generic data-fetching hook (loading, error, refetch)
  useContentData.ts             # Content categories and modules with icon resolution
  useScreenCaptureProtection.ts # Detects screen capture attempts
```

### `src/components/` -- Shared Components

```
src/components/
  ProtectedRoute.tsx        # Auth guard wrapper (redirects unauthenticated/unauthorized)
  ErrorBoundary.tsx         # React error boundary with fallback UI
  LoadingSpinner.tsx        # Reusable loading indicator
  NotificationBell.tsx      # Notification icon with unread count badge
  Watermark.tsx             # Overlay watermark for screenshot deterrence
  ScreenCaptureWarning.tsx  # Warning overlay triggered on capture detection
  CaptureNoticeModal.tsx    # One-time notice modal about capture restrictions
  admin/
    CategoryForm.tsx        # Admin form for creating/editing content categories
    CardForm.tsx            # Admin form for creating/editing content cards (modules)
    IconPicker.tsx          # Icon selection UI using Lucide icon map
```

### `src/layouts/` -- Layout Components

```
src/layouts/
  AdminLayout.tsx           # Admin shell: bottom nav bar, header with search and logout
```

### `src/lib/` -- Utilities

```
src/lib/
  iconMap.ts                # Maps icon name strings to Lucide React components (45+ icons)
  utils.ts                  # cn() helper (clsx + tailwind-merge)
```

### `src/pages/` -- Page Components

```
src/pages/
  LandingPage.tsx           # Public landing with chart-number login for parents
  LoginPage.tsx             # Staff login (code-gated, then admin credentials)
  ParentDashboard.tsx       # Main parent view: journey steps, content cards, notices
  DischargeManual.tsx       # Discharge education manual with categorized checklists
  AdminEditor.tsx           # Content management: categories, cards, drag-and-drop reorder
  VitalsPage.tsx            # Patient vital signs display
  AiChatPage.tsx            # AI chatbot interface (Gemini-powered)
  NotFoundPage.tsx          # 404 fallback
  admin/
    NotificationCenter.tsx      # Broadcast notifications to parents
    AdmissionConfirmations.tsx  # Track parent acknowledgment of admission info
    PatientManagement.tsx       # Patient list and management
```

## Naming Conventions

- **Pages**: PascalCase with `Page` suffix (e.g., `LoginPage.tsx`, `ParentDashboard.tsx`)
- **Components**: PascalCase (e.g., `ProtectedRoute.tsx`, `ErrorBoundary.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useApi.ts`, `useContentData.ts`)
- **Utilities/libs**: camelCase (e.g., `iconMap.ts`, `utils.ts`)
- **Server routes**: lowercase (e.g., `auth.ts`, `content.ts`, `admin.ts`)
- **All source files**: TypeScript (`.ts`/`.tsx`)
