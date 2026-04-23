---
name: "financial-redesign-truth-lock"
description: "Lock what an analytical financial redesign may beautify, but never hide, reorder, or distort"
domain: "product-design, architecture"
confidence: "high"
source: "earned (2026-04-24 mortgage comparator redesign research)"
---

## Context

Use this skill before redesigning an explainability-heavy financial product. Visual refreshes create risk when teams preserve backend logic but quietly demote the evidence, caveats, or decision order that make the product trustworthy.

## Patterns

### Lock the decision sequence first
- Define the primary user and decision context in plain language.
- Freeze the canonical order of reasoning: compare scenarios, explain recommendation, then evaluate affordability on the recommendation target.
- Treat layout changes that break this order as product changes, not cosmetic changes.

### Protect the dominant signal
- Keep **total real cost** as the primary comparison anchor.
- Monthly payment, badges, and brand accents may support the story but must not outrank cost, break-even, or switch-cost evidence.
- If a highlighted metric could make the wrong option look better, the redesign failed.

### Never beautify optional or degraded states into certainty
- Show bonus scenarios only when explicitly declared.
- Keep fallback provenance, blocked states, assumptions, and missing data visible in the main flow.
- Preserve access/retention truth: session ownership, expiry, purge timing, and storage limits are product facts.

### Preserve evidence density across breakpoints
- Desktop can use dense comparison layouts; mobile may stack or chunk.
- Do not force critical evidence behind tabs, collapsed accordions, or hover-only UI.
- Every breakpoint must still expose ranking, deltas, included costs, recommendation basis, affordability thresholds, and quality state.

## Examples

- `apps/web/src/pages/mortgage-analysis-page.tsx`: keeps comparison, recommendation, affordability, and ownership as separate evidence-bearing regions.
- `apps/web/src/features/mortgage-analysis/analysis-form.tsx`: capture flow mirrors the actual decision inputs instead of generic lead form fields.
- `apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx`: ranking, deltas, cost breakdown, and no-bonus truth are all explicit.

## Anti-Patterns

- Turning an analysis desk into a marketing landing page
- Hero sections that oversell the monthly payment while total real cost drops below the fold
- Hiding retention, fallback provenance, or data quality in secondary settings/help UI
- Adding a visual slot for a bonus scenario even when the payload only contains two scenarios
