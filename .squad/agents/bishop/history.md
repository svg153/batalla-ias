# Project Context

- **Owner:** Sergio Valverde
- **Project:** batalla-ias
- **Stack:** TypeScript monorepo with React, Express, Decimal.js, PostgreSQL, Vitest, Playwright
- **Created:** 2026-04-23T20:09:48Z

## Learnings

- Domain logic will live in `packages/domain`.
- Rules must be versioned and formula sources must be traceable under the constitution.
- The domain foundation now centralizes formula/rule provenance in `packages/domain/src/rules/rule-sources.ts` so explainability can carry versioned evidence from day one.
- The current-installment contradiction check uses a provisional 0.50 EUR technical tolerance and degrades to `conditional_estimate` instead of blocking the analysis.
