---
name: "honest-fallback-review"
description: "Review staged rollouts so fallback paths stay visible, narrow and never fake success"
domain: "quality"
confidence: "high"
source: "earned — mortgage comparator MVP live-first API consumption and local preview hardening"
---

## Context

Use this when the UI can degrade to local preview or partial backend support. The quality gate is simple: fallback may preserve continuity, but it must never disguise missing or broken backend behavior as a successful live result.

## Patterns

- **Live first, fallback narrowly:** allow local preview only for missing or explicitly unimplemented paths (for example same-origin `/api/v1` missing or `feature_not_implemented` on compare).
- **Unexpected failures stay failures:** `500`, contract drift or malformed payloads should surface `unavailable`/error states, not synthetic comparison success.
- **Make provenance visible per stage:** expose whether analysis/comparison/affordability came from `api`, `local_preview` or `unavailable`, and keep notices/user copy aligned with that source.
- **Carry backend semantics through the UI:** retention/access details must remain visible even when compare or affordability fall back locally.
- **Test the decision ladder directly:** service tests decide when fallback is allowed, contract/integration tests protect ownership and retention semantics, E2E checks the visible copy and stage badges.

## Examples

- Fallback decision tests: `apps/web/src/services/analysis-api.test.ts`
- Visible UX for fallback and non-faked states: `apps/web/src/pages/mortgage-analysis-page.tsx`
- E2E checks for visible source and conditional-estimate messaging: `apps/web/tests/e2e/mortgage-comparison.spec.ts`
- Ownership/retention backend guards: `apps/api/tests/contract/analyses-lifecycle.contract.test.ts`, `apps/api/tests/integration/analysis-retention.test.ts`

## Anti-Patterns

- Turning every compare failure into local preview
- Showing local preview output with API-success language
- Hiding retention or access semantics once the UI has a fallback result
- Inventing extra scenarios during fallback that the user never declared
