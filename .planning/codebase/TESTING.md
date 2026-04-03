# Testing Setup & Coverage

## Current Status: No Tests

This project has **no test suite**. There are no unit tests, integration tests, or end-to-end tests.

## Evidence

- No test files found (`*.test.*`, `*.spec.*`, `__tests__/` directories) in project source.
- No test framework configured:
  - No `jest.config.*` file
  - No `vitest.config.*` file
  - No `@testing-library/*` packages in dependencies
  - No `jest`, `vitest`, `mocha`, or `chai` in dependencies
- No test scripts in `package.json` (no `"test"` script defined).
- The only QA-adjacent script is `"lint": "tsc --noEmit"` which runs TypeScript type checking without emitting files.

## Dev Dependencies of Note

- `playwright` (v1.58.2) is listed as a dev dependency, but it is used for **screenshot capture scripts** (`capture*.mjs` files), not for end-to-end testing. These scripts automate browser screenshots of the app for documentation/demo purposes.
- `sharp` (v0.34.5) is present for image processing in the capture workflow, not testing.

## CI/CD Integration

- Deployed on **Vercel** with automatic builds from git.
- Build command: `npm run build` (Vite build only).
- No test step in the build pipeline.
- No GitHub Actions, CircleCI, or other CI configuration files found.
- No pre-commit hooks or husky configuration.

## Lint / Type Checking

- `tsc --noEmit` is available via `npm run lint`.
- TypeScript config is **not strict** (no `strict: true` in `tsconfig.json`), so type checking catches fewer issues than it could.
- No ESLint configuration.

## Recommendations for Adding Tests

If tests were to be added, the natural choices for this stack would be:

1. **Unit/Component tests:** Vitest + React Testing Library (aligns with Vite toolchain).
2. **API tests:** Vitest or supertest for Express route handlers.
3. **E2E tests:** Playwright is already installed as a dependency -- could be repurposed from screenshot capture to actual test automation.
4. **Minimum viable coverage targets:**
   - `src/api/client.ts` -- request wrapper, 401 handling
   - `src/context/AuthContext.tsx` -- login/logout/token flows
   - `src/hooks/useApi.ts` -- loading/error state management
   - `server/middleware/auth.ts` -- JWT verification
   - `server/routes/auth.ts` -- authentication endpoints
   - `server/middleware/errorHandler.ts` -- error response formatting
