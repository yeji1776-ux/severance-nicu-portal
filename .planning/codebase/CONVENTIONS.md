# Code Conventions

## Project Stack

- **Frontend:** React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- **Backend:** Express 4 + TypeScript (run via `tsx`)
- **Database:** sql.js (in-memory SQLite)
- **Deployment:** Vercel (serverless functions for API)
- **Animation:** `motion` (Framer Motion successor)
- **Icons:** `lucide-react`

## Code Style & Formatting

- No ESLint or Prettier config present; formatting is informal/manual.
- Indentation: 2 spaces consistently across `.ts` and `.tsx` files.
- Semicolons: used at end of statements.
- Quotes: single quotes for imports and strings.
- Trailing commas: used in multiline objects/arrays.

## Naming Conventions

- **Files:** PascalCase for components (`LoginPage.tsx`, `ErrorBoundary.tsx`), camelCase for hooks (`useApi.ts`), utilities (`utils.ts`), and API modules (`client.ts`).
- **Components:** PascalCase function names matching file names.
- **Hooks:** `use` prefix, camelCase (`useAuth`, `useApi`, `useContentData`).
- **Interfaces:** PascalCase, no `I` prefix (`User`, `Patient`, `AuthContextType`).
- **Constants:** UPPER_SNAKE_CASE for magic values (`STAFF_CODE`).
- **CSS custom properties:** kebab-case (`--color-primary`).

## Component Patterns

- **Functional components exclusively** (except `ErrorBoundary` which uses class-based `Component` for `getDerivedStateFromError`).
- **Default exports** for all components and pages.
- **Named exports** for hooks and API functions.
- Components use `export default function ComponentName()` syntax (no arrow function exports).
- No Higher-Order Components (HOCs) or render props patterns.

## Styling

- **Tailwind CSS 4** with `@tailwindcss/vite` plugin (no `tailwind.config` file -- uses CSS-based config).
- Custom theme defined in `src/index.css` via `@theme` directive: `--color-primary: #004085`, `--color-accent-yellow: #FFD700`, custom font stack.
- Utility function `cn()` from `src/lib/utils.ts` wraps `clsx` + `tailwind-merge` for conditional class merging.
- Inline Tailwind classes directly in JSX; no CSS modules or styled-components.
- Hardcoded color values in some places (e.g., `bg-[#f5f7f8]`), but `primary` used as a theme token.

## Import Ordering

No enforced convention. General observed pattern:
1. React imports (`useState`, `useEffect`, etc.)
2. Third-party libraries (`react-router-dom`, `motion/react`, `lucide-react`)
3. Internal context/hooks (`../context/AuthContext`, `../hooks/useContentData`)
4. Internal components and utilities
5. Types (sometimes inline, sometimes from `../types`)

## TypeScript Usage

- **Interfaces over types** for object shapes (consistently uses `interface`).
- All interfaces in a central `src/types.ts` file for shared domain models; component-local interfaces defined in-file.
- **`any` is used liberally**: API response types are mostly `any` in `src/api/endpoints.ts`, error catches use `catch (err: any)`, and hook parameters accept `any[]`.
- **No strict mode** in `tsconfig.json` (no `strict: true`, no `noImplicitAny`).
- Path alias: `@/*` maps to project root (`./`).
- Lint script is `tsc --noEmit` only.

## State Management

- **React Context** for auth state (`AuthContext`).
- **Local component state** (`useState`) for everything else -- no Redux, Zustand, or other state libraries.
- Custom contexts created inline within page components (e.g., `FontSizeContext`, `BookmarkContext` in `ParentDashboard`).
- Token stored in `localStorage`.

## API & Data Fetching

- **Client-side:** Centralized `api` object in `src/api/client.ts` wrapping `fetch` with auto auth headers and 401 redirect.
- Endpoint functions in `src/api/endpoints.ts` as thin wrappers around `api.get/post/put/delete`.
- Custom `useApi` hook for declarative data fetching with loading/error states.
- Some components use raw `fetch()` directly (e.g., `useContentData`, `AuthContext`).
- **Server-side:** Express router modules in `server/routes/`, one per domain.

## Error Handling

- **Client:** `ErrorBoundary` class component wraps entire app. API client throws on non-OK responses with Korean error messages. Catch blocks often swallow errors (`.catch(() => {})`).
- **Server:** Custom `AppError` class with status codes. Global `errorHandler` middleware returns JSON errors. Korean error messages throughout.

## File Structure

```
src/
  api/          -- API client and endpoint definitions
  components/   -- Reusable UI components
    admin/      -- Admin-specific components
  context/      -- React Context providers
  hooks/        -- Custom hooks
  layouts/      -- Layout wrappers
  lib/          -- Utilities (cn, iconMap)
  pages/        -- Route-level page components
    admin/      -- Admin page components
server/
  config/       -- Database initialization
  db/           -- Schema and seed SQL
  middleware/   -- Auth, error handling
  routes/       -- Express route handlers
  services/     -- External service integrations (Gemini AI)
  types/        -- Server-side type definitions
```

## Other Patterns

- **Icon mapping:** `src/lib/iconMap.ts` maps string icon names to Lucide React components, enabling DB-driven icon selection.
- **Role-based routing:** `ProtectedRoute` component checks user role before rendering children.
- **Screen capture protection:** Watermark overlay, print CSS blocking, and capture detection hooks.
- **Korean language:** All user-facing strings are in Korean, hardcoded (no i18n library).
