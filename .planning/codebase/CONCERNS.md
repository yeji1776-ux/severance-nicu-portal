# Technical Concerns, Risks, and Debt

## 1. Database / Persistence (CRITICAL)

- **In-memory sql.js database**: All data lives in RAM via `new SQL.Database()`. Every Vercel cold start or server restart wipes all data -- patient records, user accounts, chat history, audit logs, everything.
- No file-backed persistence, no external DB connection. The seed data is re-inserted on each boot, but any admin or parent changes are lost.
- On Vercel serverless, each invocation may get a fresh instance, meaning data can be inconsistent even within a single user session.
- **Action required before any real usage**: migrate to an external database (PostgreSQL, Turso/libSQL, PlanetScale, etc.).

## 2. Security

### Authentication
- **Hardcoded admin credentials in source**: `LoginPage.tsx` contains `STAFF_CODE = '1885'` and calls `login('admin@severance.com', 'password123')` in plaintext. The seed SQL also has the bcrypt hash for `password123`.
- **JWT secret fallback**: `JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'` -- if env var is missing in production, all tokens are signed with a publicly visible key.
- **Parent login has no password**: `login-parent` endpoint authenticates with chart number alone (no PIN, no password). Anyone who guesses or learns a chart number gets full patient access.
- **Token stored in localStorage**: vulnerable to XSS. httpOnly cookies would be safer for a medical application.

### Authorization gaps
- **Patient routes lack auth middleware**: `GET /api/patients/:id`, `GET /api/patients/:id/journey`, `GET /api/patients/:id/examinations`, `GET /api/patients/:id/vitals/*` have **no authentication** -- anyone can read any patient's data by ID.
- **POST /api/patients/:id/vitals** has no auth -- anyone can inject fake vital signs.
- `requirePatientAccess` middleware exists but is never used on patient routes.

### Other
- `helmet({ contentSecurityPolicy: false })` disables CSP entirely.
- CORS origin is permissive when `VERCEL` env is set (`origin: true` accepts any origin).
- Invitation codes are logged in plaintext in audit_logs.

## 3. Data Exposure

- `GET /api/auth/me` for admin role returns **all patients** (`SELECT * FROM patients`) including chart numbers, birth dates, and medical data.
- No field filtering on patient queries -- full row data (including internal IDs) is sent to the client.
- Gemini API key exposure risk: only protected by `.env`, no server-side validation that the key exists before starting.

## 4. Performance

- **sql.js ASM bundle**: `sql-asm.js` is a large JavaScript file (~1.5MB) loaded on every cold start. On Vercel serverless with 30s max duration, this adds latency.
- **No lazy loading**: all page components are eagerly imported in `App.tsx`. `AdminEditor`, `AiChatPage`, `VitalsPage`, etc. all load on first visit regardless of route.
- **motion (framer-motion)** and **lucide-react** are large dependencies. lucide imports may not be tree-shaken if using a centralized icon map.
- No pagination on patient list, notifications, audit logs, or chat history queries.
- AI chat loads full conversation history on every message, with no token/size limit on the history sent to Gemini.

## 5. Technical Debt

- **No input sanitization**: SQL queries use parameterized statements (good), but no validation on field lengths, types, or formats for chart numbers, names, etc.
- **No request body validation**: admin routes accept any shape of body without schema validation (e.g., Zod, Joi).
- `admin.ts` POST `/content/modules` references columns (`subtitle`, `type`) that do not exist in the `content_modules` schema -- these inserts silently fail or produce nulls.
- Multiple capture scripts (`capture.mjs`, `capture_all.mjs`, `capture_dash.mjs`, etc.) in project root appear to be one-off screenshot utilities left behind.
- Unused files in git working tree: lock files, JPEG screenshots, favicon experiments.
- `seed-content.ts` is imported but its implementation was not reviewed -- may contain hardcoded medical content that needs clinical review.

## 6. Missing Features / Patterns

- **No error boundaries per route**: single top-level `ErrorBoundary` catches everything, but a crash in one page takes down the whole app.
- **No 404 handling for API routes**: unknown API paths fall through to the SPA catch-all in production.
- **No session expiry handling on frontend**: expired tokens redirect to login, but no proactive token refresh or "session expiring" warning.
- **No CSRF protection**: stateless JWT over localStorage, no CSRF tokens on state-changing requests.
- **No logging/monitoring**: `console.error` only. No structured logging, no error reporting service (Sentry, etc.).
- **No tests**: no test files, no test framework configured.
- **No rate limiting on auth endpoints**: only the AI chat route has rate limiting. Login endpoints are unprotected against brute force.

## 7. Hardcoded Values

| Value | Location | Concern |
|-------|----------|---------|
| `'1885'` | `LoginPage.tsx:7` | Staff access code in source |
| `'admin@severance.com'` / `'password123'` | `LoginPage.tsx:43` | Admin credentials in client code |
| `'dev-secret-key'` | `auth.ts:7`, `auth route:8` | JWT fallback secret |
| `30` (days) | `auth.ts:166` | Auto-expire threshold |
| `50` (messages) | `ai.ts:73` | Session message limit |
| `7 * 24 * 60 * 60 * 1000` | `admin.ts:207` | Invitation code TTL (7 days) |
| `'02-2228-0000'` | `geminiService.ts:49` | Hospital phone number |
| `'0561528'` | `seed.sql:8` | Test chart number |
| `3001` | `server/index.ts:26` | Default server port |

## 8. Accessibility

- No `aria-label` or `aria-live` regions observed in key components.
- Loading states use only visual spinner -- no screen reader announcements.
- Error messages are visual-only (red text), no `role="alert"`.
- Color contrast not verified for the primary/slate color scheme.
- No keyboard navigation testing evident; mobile-first design may miss desktop a11y.
