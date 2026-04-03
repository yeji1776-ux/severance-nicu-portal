# External Integrations & APIs

## Google Gemini AI

- **Package:** `@google/genai` ^1.29.0
- **Model:** `gemini-2.0-flash`
- **Service file:** `server/services/geminiService.ts`
- **Env var:** `GEMINI_API_KEY`
- **Purpose:** AI chatbot for NICU parents -- provides general newborn care guidance (feeding, development, hygiene). Acts as an empathetic support assistant in Korean.
- **Safety:** Configures all four HarmCategory filters at BLOCK_MEDIUM_AND_ABOVE. Emergency keyword detection (fever, cyanosis, seizure, apnea, etc.) bypasses the AI and returns a hardcoded emergency response with hospital phone number.
- **Config:** maxOutputTokens=1024, temperature=0.7, system prompt in Korean
- **API route:** `POST /api/ai/chat` (sends message + conversation history)
- **Sessions:** `GET /api/ai/sessions`, `POST /api/ai/sessions`

## Authentication

- **Method:** JWT (jsonwebtoken)
- **Env var:** `JWT_SECRET`
- **Two auth flows:**
  1. **Admin login** (`POST /api/auth/login`) -- email + bcrypt password, 24h token
  2. **Parent login** (`POST /api/auth/login-parent`) -- chart number only, 30d token
  3. **Parent registration** (`POST /api/auth/register-parent`) -- chart number + name
- **Token storage:** Client-side `localStorage`
- **Token delivery:** `Authorization: Bearer <token>` header on every API request
- **Middleware:** `authenticateToken` validates JWT on protected routes

## Database

- **Engine:** sql.js (SQLite compiled to JavaScript via ASM.js)
- **Mode:** In-memory only -- no file persistence
- **Schema:** `server/db/schema.sql`
- **Seed data:** `server/db/seed.sql` + `server/db/seed-content.ts`
- **Tables include:** users, patients, parent_patient, content modules, notices, notifications, audit_logs, vitals, examinations, journey steps, discharge categories, AI chat sessions/messages
- **Env var:** `DB_PATH` is defined in `.env.example` but NOT used -- the database is always created in-memory
- **Limitation:** All data resets on every Vercel cold start or redeploy

## Internal REST API

All endpoints served under `/api/` prefix. Client communicates via `src/api/client.ts` (fetch wrapper with JWT auth).

### Endpoint Groups

| Route prefix | Purpose |
|-------------|---------|
| `/api/auth/*` | Login, registration, session check |
| `/api/content/*` | Educational content categories & modules |
| `/api/notices/*` | Hospital notices/announcements |
| `/api/discharge/*` | Discharge preparation categories |
| `/api/patients/*` | Patient info, journey, examinations, vitals |
| `/api/notifications/*` | Push-style notifications, unread counts |
| `/api/ai/*` | AI chat sessions & messages |
| `/api/admin/*` | Content CRUD, patient management, bulk publish, broadcast notifications |
| `/api/health` | Health check endpoint |

## Security Middleware

| Middleware | Purpose |
|-----------|---------|
| helmet | HTTP security headers (CSP disabled) |
| cors | CORS -- open on Vercel, localhost:3000 in dev |
| express-rate-limit | Rate limiting on API endpoints |
| cookie-parser | Cookie parsing (available but JWT is primary auth) |

## Third-Party Services

- **No analytics** integration detected
- **No payment** integration
- **No email/SMS** notification service
- **No external CDN** or media storage
- **No MCP integrations** in the application code (MCP servers are dev-environment only)

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes (for AI chat) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `PORT` | Server port (default 3001) | No |
| `DB_PATH` | Database file path (unused -- always in-memory) | No |
| `VERCEL` | Set automatically by Vercel runtime | Auto |
| `NODE_ENV` | production/development | Auto |
| `DISABLE_HMR` | Disable Vite HMR in dev | No |
