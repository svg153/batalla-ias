---
name: "explanation-first-financial-ui"
description: "Design financial result flows that explain cost, quality, and provenance before persuasion"
domain: "frontend-ui"
confidence: "high"
source: "earned (Lambert mortgage comparator shell + live integration)"
---

## Context

Use this skill for mortgage, affordability, or comparison screens where users could misread a polished UI as certainty. The goal is to make the product understandable even when some calculations, evidence, or backend paths are still arriving.

## Patterns

### Start from the truth the user needs
- Build the page around the analytical story, not around decorative chrome.
- Keep the capture flow structured around the actual decision inputs: current mortgage, alternative base offer, switch costs, household profile, and retention choice.
- Reserve visible space for comparison, recommendation, affordability, and ownership early so the UI does not need a rewrite when the backend lands.

### Make every output explain itself
- Show **what scenario won**, **what cost basis ranked it**, **what quality status applies**, and **what rules or traces support it**.
- Use explicit quality language such as `Completo`, `Estimación condicionada`, and `Bloqueado`.
- Put assumptions and missing data in the surface itself; do not bury them in tooltips or logs.

### Keep decision math visible
- Rank scenarios by **total real cost**, never by installment alone.
- Pull switch costs into recommendation copy so the user can see why a cheaper monthly payment may still lose overall.
- Keep affordability thresholds visible in the panel, not implied.

### Explain retention and ownership in product language
- Treat access mode, retention preference, expiry, and purge timing as first-class UI data.
- Use backend wording when it exists; do not invent friendlier permanence claims on the client.

## Examples

- `apps/web/src/pages/mortgage-analysis-page.tsx`: hero, stage strip, notice stack, recommendation, affordability, and ownership panels all explain what is real, missing, or provisional.
- `apps/web/src/components/data-quality-banner.tsx`: quality state has a title, description, missing-data list, and assumptions list.
- `apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx`: comparison centers ranking by total real cost, scenario assumptions, cost breakdown, and trace references.
- `apps/web/tests/e2e/mortgage-comparison.spec.ts`: regression coverage checks that UX exposes conditional estimates and retention semantics, not just numbers.

## Anti-Patterns

- Leading with marketing copy while costs, caveats, or retention semantics stay hidden
- Recommending a switch without showing switch costs or break-even
- Treating affordability as a binary badge without threshold context
- Hiding assumptions, blocked states, or formula provenance behind secondary UI
- Using generic success language when the backend is still provisional
