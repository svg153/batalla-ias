# Project Context

- **Owner:** Sergio Valverde
- **Project:** batalla-ias
- **Stack:** TypeScript monorepo with React, Express, Decimal.js, PostgreSQL, Vitest, Playwright
- **Created:** 2026-04-23T20:09:48Z

## Learnings

- The API contract is already defined under `specs/001-mortgage-comparator-mvp/contracts/openapi.yaml`.
- Retention defaults to session-only unless the user explicitly requests saving the analysis.
- The root backend validation flow is `corepack pnpm typecheck`, `corepack pnpm test` and `corepack pnpm build`.
- The current backend foundation exposes retention metadata explicitly when `save_analysis` falls back to in-memory storage.
