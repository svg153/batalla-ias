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

## 2026-04-23 — API Integration Complete

**Session:** parker-api-integration (2026-04-23T20:51:06Z)

### Deliverables
✓ `compare` and `affordability` orchestrate real domain formulas/ranking  
✓ Affordability scoped to active recommendation target  
✓ Cookie-based access control: `analysis_session` on GET/DELETE/compare/affordability  
✓ Retention metadata honest: in-memory fallback explicit, 30-day/24h contract preserved  
✓ Team decision merged to `decisions.md`  
✓ Validation: typecheck/test/build all green  

### Integration with Lambert UI

**Session:** lambert-ui-integration (2026-04-23T20:55:13Z)  
Frontend now live-integrated against real Parker API. Fallback strategy honors contract:
- Live attempt first: `/api/v1/analyses/{id}`
- Local calculation only when backend unavailable
- Bonus variant optional; no-bonus rendering graceful
- Recommendation and affordability panels first-class UI states

### Context for Next Session
- All access endpoints now enforce `analysis_session` cookie ownership
- Affordability cannot be calculated without a prior valid recommendation
- Retention semantics explicit in API response: no fake durability claims
- Frontend fallback ensures UX resilience when backend services incomplete

