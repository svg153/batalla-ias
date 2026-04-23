# Implementation Plan: mortgage redesign

**Branch**: `[002-mortgage-redesign]` | **Date**: 2026-04-23 | **Spec**: `specs/002-mortgage-redesign/spec.md`
**Input**: Feature specification from `/specs/002-mortgage-redesign/spec.md`

## Summary

Deliver an evolutionary redesign of the existing mortgage comparator UI in `apps/web` so the shipped frontend matches the approved **Editorial Financial Desk** direction documented in `design.md` and `ux-study.md`, while preserving the source-of-truth mortgage semantics defined in `specs/001-mortgage-comparator-mvp/spec.md`. The implementation will keep the current capture/comparison/recommendation/affordability flow, reduce hero-first drift, elevate visible evidence for total real cost and switching friction, and extend validation with component, E2E, and accessibility regression checks.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18, CSS, Node >=20  
**Primary Dependencies**: React 18, TanStack React Query 5, Vite 5, Vitest 3, Playwright 1.52  
**Storage**: No new storage for this feature; frontend continues to consume same-origin `/api/v1` analysis endpoints and visible local-preview fallback paths  
**Testing**: Existing Vitest + Playwright; planned extension with component-level React rendering tests and automated accessibility assertions for redesigned blocks  
**Target Platform**: Responsive web app in `apps/web`, optimized for mobile and desktop browsers  
**Project Type**: pnpm monorepo with domain package + API package + web frontend  
**Performance Goals**: Preserve current comparison responsiveness, keep critical evidence visible without extra navigation, and maintain MVP API expectation that compare remains below existing p95 targets from the MVP source-of-truth  
**Constraints**: No semantic rewrite; preserve mortgage rules from feature 001; comparison/recommendation/affordability hierarchy must stay explicit; mobile must show essential evidence by default; fallback/retention/traceability states must remain visible; accessibility must improve, not regress  
**Scale/Scope**: Primary work in one frontend experience (`apps/web/src/pages/mortgage-analysis-page.tsx` plus related components/styles/tests), with traceability back to the existing domain formulas, rules, and validation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Financial Accuracy Gate**: PASS. This feature does not change mortgage formulas or business semantics. Source-of-truth implementations remain in `packages/domain/src/formulas/calculate-estimated-installment.ts`, `packages/domain/src/formulas/calculate-total-real-cost.ts`, `packages/domain/src/rules/rank-scenarios-by-total-cost.ts`, and `packages/domain/src/validation/analysis-input.ts`, with regression coverage in `packages/domain/tests/unit/mortgage-formulas.test.ts` and `packages/domain/tests/regression/comparison-ranking.test.ts`. Frontend work must only reframe, label, and sequence these outputs, never reinterpret ranking logic.
- **Explainability Gate**: PASS. The redesign explicitly increases visibility of calculation rationale through explanation-first section order, always-visible cost evidence, trace references, data-quality banners, fallback honesty, and retention/ownership metadata. Design artifacts define how comparison, recommendation, and affordability explanations stay readable on desktop and mobile.
- **Privacy & Security Gate**: PASS. Sensitive inputs remain mortgage balances, rates, household income, obligations, session/ownership metadata, and retention state. The redesign will preserve explicit retention choices, ownership messaging, and fallback notices, and must avoid new analytics, logging, or persistence behaviors in the UI.
- **Total Cost Reality Gate**: PASS. The plan keeps total real cost as the primary ranking signal and requires continued visibility for linked products, switch costs, bonus traps, assumptions, missing data, and affordability prerequisites. No cost factor currently surfaced by the MVP may be demoted to hidden-only or optional-only disclosure.
- **Business Rule Validation Gate**: PASS. Rules that must remain stable include scenario count honesty, ranking by total real cost, blocked/conditional data treatment, affordability thresholds, fallback honesty, retention semantics, and traceability visibility. Validation will extend existing test coverage with component tests for redesigned blocks, E2E regressions for core journeys, and automated accessibility checks for critical screens.

## Project Structure

### Documentation (this feature)

```text
specs/002-mortgage-redesign/
├── plan.md
├── research.md
├── data-model.md
├── design.md
├── ux-study.md
├── quickstart.md
├── contracts/
│   └── ui-redesign-contract.md
└── tasks.md            # created later by /speckit.tasks
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── app.tsx
│   ├── components/
│   │   └── data-quality-banner.tsx
│   ├── features/
│   │   └── mortgage-analysis/
│   │       ├── analysis-form.tsx
│   │       ├── scenario-comparison-table.tsx
│   │       └── types.ts
│   ├── pages/
│   │   └── mortgage-analysis-page.tsx
│   ├── services/
│   │   ├── analysis-api.ts
│   │   └── analysis-api.test.ts
│   └── styles.css
└── tests/
    └── e2e/
        ├── fixtures/
        └── mortgage-comparison.spec.ts

packages/domain/
├── src/
│   ├── formulas/
│   ├── rules/
│   └── validation/
└── tests/
    ├── unit/
    └── regression/
```

**Structure Decision**: Keep the existing monorepo split. Implement the redesign almost entirely in `apps/web`, keep mortgage semantics owned by the existing domain package, and use the feature artifacts as the alignment layer between design intent and frontend delivery.

## Phase 0 Research Summary

### Decisions

1. **Implementation style**: evolutionary redesign in `apps/web`, not a semantic rewrite.
2. **Design direction**: codify the already-approved Editorial Financial Desk posture.
3. **Reference filter**: adopt selected traits from WIRED (editorial density), Wise (clarity around financial evidence), and IBM (structured information and accessibility discipline); reject glossy fintech gradients, developer-tool cold minimalism, and marketing hero-first composition from `awesome-design-md`.
4. **Primary reading hierarchy**: comparison first, recommendation second, affordability third; supporting evidence and metadata remain visible throughout.
5. **Mobile behavior**: essential evidence stays expanded or directly visible by default; critical information cannot depend solely on closed accordions, tabs, or tooltips.
6. **Validation approach**: preserve existing service and E2E coverage, add component coverage for redesigned UI blocks, and add automated accessibility regression checks.

### Adopt from external inspiration

- Editorial density and serif-led hierarchy for serious long-form financial reading
- Clear label/value structures and restrained accent use
- Strong comparison surfaces where tables and evidence act as the primary “hero”
- Explicit metadata treatment for provenance, state, and operational honesty

### Reject from external inspiration

- Photography-first, glossy, or marketing-led hero layouts
- Gradient-heavy fintech polish that competes with financial evidence
- Cold terminal-minimal aesthetics that suppress emotional trust for household decisions
- Hidden critical information in tooltips, carousels, or collapsed-by-default UI

## Phase 1 Design Outputs

- `research.md`: documents final research choices and rejected alternatives
- `design.md`: codifies the visual system, layout rules, mobile defaults, anti-patterns, and current-to-target mapping
- `ux-study.md`: documents audience, reading flow, device behavior, content hierarchy, and operational trust needs
- `data-model.md`: defines the redesign entities, states, and traceability relationships
- `contracts/ui-redesign-contract.md`: defines the required UI contract for visible evidence, responsive defaults, accessibility, and acceptance traceability
- `quickstart.md`: reviewer and implementation guide for delivering the redesign in `apps/web`

## Implementation Alignment in `apps/web`

### Current-to-target mapping

| Current area | Current file(s) | Target evolution |
|---|---|---|
| Intro / hero | `apps/web/src/pages/mortgage-analysis-page.tsx`, `apps/web/src/styles.css` | Shrink marketing-like hero into an editorial briefing header that frames the decision, then let comparison evidence become the visual anchor once results exist |
| Capture flow | `apps/web/src/features/mortgage-analysis/analysis-form.tsx` | Keep sections and semantics, but tighten hierarchy, field grouping, and evidence cues so retention, horizon, scenario honesty, switch costs, and household assumptions read like an analyst worksheet |
| Data quality | `apps/web/src/components/data-quality-banner.tsx` | Preserve banner concept, increase hierarchy and inline linkage to downstream recommendation risk |
| Comparison | `apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx` | Make comparison the dominant result surface, add stronger evidence hierarchy, sticky/scannable headers, mobile card-stack fallback, and visible rule/trace support |
| Recommendation | `apps/web/src/pages/mortgage-analysis-page.tsx` | Reframe as “why this scenario wins or does not win”, always co-showing net savings, break-even, switch costs, linked-product impact, and recommendation rationale |
| Affordability | `apps/web/src/pages/mortgage-analysis-page.tsx` | Preserve prerequisite ordering while improving the narrative tie between recommended scenario, household inputs, thresholds, and conditional-estimate caveats |
| Ownership / retention / fallback | `apps/web/src/pages/mortgage-analysis-page.tsx`, `apps/web/src/services/analysis-api.ts` | Keep operational honesty, but move metadata into a clearer supporting evidence rail/footer that remains discoverable on mobile and desktop |
| Shared styling | `apps/web/src/styles.css` | Refactor tokens and section styles toward documented design primitives without throwing away the current palette and typography posture |

### Recommended implementation shape

1. **Refactor page composition**
   - Keep `MortgageAnalysisPage` as the orchestration shell.
   - Replace hero-first emphasis with an editorial header + evidence-led results flow.
   - Use a stable three-section reading order: comparison → recommendation → affordability.

2. **Split current large page panels into explicit redesign blocks**
   - Comparison evidence block
   - Recommendation rationale block
   - Affordability evidence block
   - Context/supporting metadata block

3. **Preserve current data contracts**
   - Keep `AnalysisExperience`, `ComparisonResult`, `SwitchRecommendation`, and `AffordabilityResult` as the UI data model boundary.
   - Do not create parallel ranking logic or duplicate scenario semantics in the frontend.

4. **Refine shared tokens in `styles.css`**
   - Keep dark editorial palette and serif/sans contrast.
   - Add documented spacing, heading, border, and state tokens from `design.md`.
   - Add mobile-first rules for visible evidence defaults.

5. **Add traceability hooks**
   - Each redesigned block should map back to specific requirements and to `design.md` / `ux-study.md`.
   - Use the UI contract as the checklist for implementation and review.

## Validation Strategy

### Component coverage

- Add component tests for:
  - capture section hierarchy and guardrails
  - comparison evidence ordering and scenario-count honesty
  - recommendation visibility for net savings / break-even / switch costs
  - affordability prerequisite and explanatory states
  - metadata / fallback / retention visibility
  - mobile default visibility behaviors for essential evidence

### E2E coverage

- Preserve and extend `apps/web/tests/e2e/mortgage-comparison.spec.ts` to cover:
  - bonus-trap ranking by total real cost
  - exactly-two-scenarios state when no explicit bonus variant exists
  - conditional-estimate and retention semantics visibility
  - fallback/local-preview honesty
  - mobile navigation and evidence visibility defaults

### Accessibility coverage

- Add automated accessibility checks for the redesigned route and core result states.
- Validate semantic heading order, keyboard navigation, focus visibility, table/card alternatives, and non-color-only state communication.
- Treat a11y regression failures in comparison, recommendation, affordability, and supporting metadata blocks as release blockers for this feature.

## Acceptance Traceability

| Artifact requirement | Implementation consequence in `apps/web` |
|---|---|
| `design.md` visual hierarchy | page composition, headings, spacing, cards, table/card responsive behavior |
| `ux-study.md` reading flow | section order, copy tone, mobile defaults, fallback visibility, metadata discoverability |
| Scenario honesty | conditional rendering in form + comparison views must preserve 2 vs 3 scenario semantics |
| Total real cost priority | comparison/recommendation views must visually prioritize total real cost over monthly installment |
| Traceability / metadata | support rail/footer must keep retention, ownership, fallback, and trace references visible |
| Validation rigor | component, E2E, and accessibility tests must all expand with redesign coverage |

## Post-Design Constitution Check

- **Financial Accuracy Gate**: PASS. Design artifacts explicitly forbid altering formulas, ranking logic, or affordability thresholds; implementation remains a presentation-layer evolution.
- **Explainability Gate**: PASS. Comparison, recommendation, affordability, data quality, fallback, and metadata are all required as visible explanatory surfaces.
- **Privacy & Security Gate**: PASS. Design artifacts preserve retention and ownership messaging and do not introduce new persistence or sensitive-state hiding.
- **Total Cost Reality Gate**: PASS. The approved hierarchy makes total real cost, switch costs, linked products, and caveats more prominent than in the current UI.
- **Business Rule Validation Gate**: PASS. The plan ties UI delivery to stable rule sources and expands regression validation rather than relaxing it.

## Complexity Tracking

No constitution violations require justification.
