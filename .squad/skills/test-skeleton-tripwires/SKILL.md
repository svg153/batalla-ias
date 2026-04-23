---
name: "test-skeleton-tripwires"
description: "Cross-layer test skeletons that lock edge-case promises before implementation drifts"
domain: "quality"
confidence: "high"
source: "earned — mortgage comparator MVP regression, contract, integration and E2E scaffolding"
---

## Context

Use this when a feature lands in slices across domain, API and UI. The safest move is to freeze the product promises as reusable edge-case scenarios before all endpoints or screens are complete.

## Patterns

- **Name the edge cases once and reuse them everywhere:** carry the same scenario vocabulary across layers (`no bonus`, `bonus bait`, `conditional estimate`, `no break-even`, `cookie ownership`).
- **Build one fixture spine per domain concept:** keep canonical payload builders in helpers and mirror them with UI fixtures so contract, integration and E2E assertions stay semantically aligned.
- **Write the thin skeletons early:** cover regression, contract, integration and E2E immediately; if a dependency is missing, skip only the blocked assertion and state the missing capability explicitly.
- **Assert product invariants, not just status codes:** verify scenario count, ranking by total real cost, explainability fields, retention/access metadata and quality-state propagation.
- **Prefer edge cases that expose dishonest shortcuts:** bonus variants that lower installment but lose on total cost, missing current installment that should degrade to `conditional_estimate`, and switch costs that prevent break-even.

## Examples

- Domain regressions: `packages/domain/tests/regression/comparison-scenarios.test.ts`, `packages/domain/tests/regression/comparison-ranking.test.ts`
- API helpers and integration flow: `apps/api/tests/helpers/analysis-fixtures.ts`, `apps/api/tests/integration/compare-analysis.test.ts`, `apps/api/tests/integration/analysis-calculation-flow.test.ts`
- UI/E2E mirrors: `apps/web/tests/e2e/fixtures/mortgage-analysis-fixtures.ts`, `apps/web/tests/e2e/mortgage-comparison.spec.ts`

## Anti-Patterns

- Creating separate fixture stories per layer with different names for the same business case
- Leaving skips as vague TODOs with no blocked capability named
- Testing only the happy-path ranking and ignoring the installment-bait case
- Asserting raw numbers but skipping ownership, retention or explainability contracts
