---
name: "honest-degraded-analysis-states"
description: "Degrade financial flows visibly: API first, local preview only when warranted, and no invented scenarios"
domain: "frontend-integration"
confidence: "high"
source: "earned (Lambert API-first fallback strategy for mortgage comparator MVP)"
---

## Context

Use this skill when the frontend depends on partial backend delivery. In financial UI, degraded states must stay truthful: users should always know whether they are seeing a backend result, a local preview, an unavailable step, or a step that was never requested.

## Patterns

### Model the journey in stages
- Track analysis, comparison, and affordability as separate stages with their own `source`, `label`, and `detail`.
- Prefer explicit sources like `api`, `local_preview`, `unavailable`, and `not_requested`.
- Surface the stage model in visible badges or notices so users understand which parts of the flow are real.

### Fall back only when the degradation is product-safe
- Try the live API path first.
- Allow local preview when the API is unavailable or the route is not implemented yet.
- If the backend returns an unexpected failure, keep the stage unavailable and avoid manufacturing success.

### Make local preview obviously local
- State that local preview does **not** create ownership, cookie-backed access, or durable retention.
- Carry the fallback reason into visible notices and assumptions.
- If comparison is local, affordability derived from it must also stay marked as local so it does not look backend-validated.

### Never invent optional scenarios
- Add the bonus scenario only when the user explicitly declares it.
- Validate that the bonus variant actually differs from the base offer; otherwise block it as UI makeup.
- When there is no bonus variant, keep exactly two scenarios and say so in notices, copy, and tables.

### Only ask for downstream analysis when prerequisites exist
- Do not emit affordability when household inputs are absent.
- Do not emit affordability when there is no valid comparison/recommendation chain.

## Examples

- `apps/web/src/services/analysis-api.ts`: API-first orchestration, stage status creation, safe fallback rules, and explicit local-preview notices.
- `apps/web/src/features/mortgage-analysis/analysis-form.tsx`: retention guardrails, explicit bonus-variant toggle, and validation that blocks fake bonus scenarios.
- `apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx`: visible two-scenario note instead of an empty or implied bonus row.
- `apps/web/src/services/analysis-api.test.ts`: tests prove local fallback is visible, no-bonus stays at two scenarios, and unexpected compare failures do not fabricate output.

## Anti-Patterns

- Silent client-side fallback that looks identical to backend truth
- Treating a 500/runtime failure as a preview-worthy success
- Showing a third scenario row just because the layout expects one
- Claiming data was saved when the flow only ran locally
- Computing affordability without household inputs or without a valid comparison target
