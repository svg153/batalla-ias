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

## Skills Earned: Test Scaffolding & Honest Fallback Review

**Date:** 2026-04-23  
**Crystallized into:**
- `.squad/skills/test-skeleton-tripwires/SKILL.md`
- `.squad/skills/honest-fallback-review/SKILL.md`

**Where Applied:** All test suites, contract validation, E2E framework  
**Reusable Pattern:** Cross-layer test contracts lock before implementation drifts; fallback paths stay visible and scoped

**Impact:** Future quality work across regression scaffolding, staged rollouts, and E2E hardening automatically loads these skills

## Session: Redesign Validation Research (2026-04-24)

**Scope:** Map current user flows, define validation matrix, identify fragile areas for visual redesign of mortgage analysis UI

**Completed Research:**
- User flows mapped: Compare scenarios (P1), asequibilidad gate (P3), data ownership/retention (implicit)
- Edge cases documented: no-bonus, bonus-bait, missing data, high switch costs, no break-even, session expiry
- 6 fragile areas flagged for redesign review: bonus trap ranking, data quality visibility, affordability prerequisite, fallback honesty, retention metadata, scenario count logic

**Test Coverage Strategy Locked:**
- Domain: 2 existing test suites (untouched by redesign)
- API: Contract shape locked, no new tests needed
- Frontend:
  - 4 component unit test files to add: ScenarioComparisonTable (8 tests), RecommendationPanel (6), AffordabilityPanel (5), DataQualityBanner (4)
  - 2 new E2E tests: high-cost scenario, no break-even month
  - All 3 existing E2E tests must stay green
  - Lighthouse accessibility audit ≥ 85

**Key Patterns Identified:**
- Bonus trap: lower installment ≠ lower total cost; ranking visual must honor total cost column priority
- Data quality degradation: conditional_estimate must stay visible in main flow, not collapsed
- Affordability lock: backend enforces comparison prerequisite; frontend must not bypass with separate form
- Fallback clarity: stage badges and notices required; silent fallback unacceptable
- Retention honesty: session expiry/purge dates must remain accessible; default session_only enforced

**Decision Artifact:** `.squad/decisions/inbox/hicks-redesign-validation.md` — full validation matrix with success criteria and reviewer checklist

**Baseline Commands Verified (Ready to Validate):**
- `corepack pnpm build` — full monorepo build
- `corepack pnpm --filter @batalla-ias/domain test` — domain rules
- `corepack pnpm --filter @batalla-ias/api test` — API contract + integration
- `cd apps/web && corepack pnpm exec playwright test mortgage-comparison.spec.ts` — E2E framework operational

**Next Action:**
- Team reviews redesign validation strategy
- Component unit tests added before visual work begins
- All baseline commands pass before redesign implementation
- Finish gate runs before merge

## 2026-04-24 — Redesign Validation Strategy Merged

**Outcome:** ✅ Decision merged to `.squad/decisions.md` (Redesign Validation Strategy section)

### Team Impact
- Redesign work cannot ship until all 10 critical dimensions pass validation
- Component tests lock contract; UI changes verify against spec
- Fragile areas become explicit review checkpoints
- Hicks finish-gate now includes redesign-specific validation gates
