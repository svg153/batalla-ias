# Project Context

- **Owner:** Sergio Valverde
- **Project:** batalla-ias
- **Stack:** TypeScript monorepo with React, Express, Decimal.js, PostgreSQL, Vitest, Playwright
- **Created:** 2026-04-23T20:09:48Z

## Learnings

- Tests are mandatory before implementation in each story phase according to Spec Kit tasks.
- Financial invariants, privacy and explainability must be covered, not just happy paths.

- Primera ola de scaffolding lista: contratos/integración/E2E de compare quedan descritos con fixtures compartidos y tests skip hasta que exista compare real, cookie analysis_session y affordabilidad orquestada.
- Comandos validados en esta rama: corepack pnpm build; corepack pnpm --filter @batalla-ias/domain test; corepack pnpm --filter @batalla-ias/api typecheck; corepack pnpm --filter @batalla-ias/api test; cd apps/web && corepack pnpm exec playwright test --list.

## Session: Test Quality Foundation (2026-04-23T20:43:30Z)

**Completed:** ✅ All builds and tests pass

- Test scaffolding created across domain, contract, integration, E2E with fixtures for financial scenarios
- Shared fixtures for no-bonus, conditional estimates, retention, ranking-by-cost scenarios in both domain and API test helpers
- Domain public surface corrected; formula and rule exports now enable test bootstrap
- Decision merged: Test Scaffolding & Quality Baseline approved into decisions.md

**Next in queue:**
- Parker: Backend compare endpoint and affordability orchestration
- Lambert: Frontend compare form and affordability display
- Ripley: Session cookie and retention mechanics
