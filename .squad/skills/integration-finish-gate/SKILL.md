---
name: "integration-finish-gate"
description: "Final convergence check for parallel domain/API/UI work"
domain: "quality, orchestration"
confidence: "high"
source: "earned (2026-04-23 mortgage comparator MVP session)"
---

## Context

Parallel work is not done when each agent's local slice is green. It is done when the repo-level gates pass and the integrated UI/API/domain contract no longer carries stale mocks, stale copy or missing end-to-end coverage. Hicks' final pass caught exactly those cross-boundary misses.

## Patterns

### Trigger this gate when

- backend and frontend touched the same feature
- a reviewer approved partial scaffolding earlier
- retention/access semantics changed
- local fallbacks were used during implementation

### Finish gate checklist

1. Run the root validation commands, not just package-local ones
2. Recheck UI copy and mocks against the live integrated contract
3. Verify reviewer-critical invariants end-to-end
4. Patch stale assumptions immediately or reject the artifact
5. Record the exact validated commands in history/review output

### Reviewer focus

- ownership/access behavior
- retention and expiry truthfulness
- scenario count and recommendation targeting
- fallback provenance
- root typecheck/test/build status

## Examples

- Root validation included build, typecheck, test and web E2E
- Integrated review caught stale session semantics in web tests and incomplete repo-level validation
- High-switch-cost/no-break-even path gained explicit regression coverage before sign-off

## Anti-Patterns

- Declaring done because one package passed
- Leaving mocked contract values after the real API changed
- Treating E2E as optional once unit and integration tests are green
- Approving integrated work without a repo-level command list
