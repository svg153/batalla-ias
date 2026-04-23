---
name: "contract-lock"
description: "Freeze cross-cutting contracts before parallel implementation starts"
domain: "architecture, delivery"
confidence: "high"
source: "earned (2026-04-23 mortgage comparator MVP session)"
---

## Context

This pattern is for stories where one ambiguity would ripple across domain, API, UI and tests. In the mortgage comparator session, delivery sped up once access control, retention, affordability target and rule provenance were decided once and then copied consistently into spec, plan, tasks and contracts.

## Patterns

### Use a contract lock when any of these are true

- Multiple agents will implement the same feature in parallel
- A rule affects both wire contract and UI copy
- Privacy, retention, ownership or explainability semantics are involved
- A reviewer would otherwise need to guess what "correct" means

### What the lead must lock first

Write the non-negotiables before fan-out:

1. **Ownership/access semantics** — who can read or mutate the resource
2. **Retention semantics** — TTL, purge timing, visible user-facing consequences
3. **Canonical scenario/decision target** — what downstream calculations must anchor to
4. **Quality vs. business output split** — uncertainty flags separate from final labels
5. **Traceability requirements** — source/version references required in outputs

### Definition of done for the lock

A contract lock is only real when the same rule appears consistently in:

- decision record
- spec/design artifacts
- API contract or DTO shape
- reviewer expectations/tests

If any layer drifts, the lock failed.

## Examples

- `analysisId` alone never grants access; `analysis_session` ownership is required
- `session_only` and `save_analysis` carry explicit TTL and purge windows
- Affordability runs only after valid comparison and only on the active recommendation target
- `dataQualityStatus` expresses uncertainty; affordability label stays business-facing

## Anti-Patterns

- Letting each agent infer privacy or retention semantics independently
- Using vague language like "saved" when durability is partial or absent
- Mixing uncertainty states into business classifications
- Starting parallel implementation while critical contract fields are still hand-wavy
