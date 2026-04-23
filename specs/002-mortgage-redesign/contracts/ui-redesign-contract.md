# UI Redesign Contract — mortgage comparator

## Purpose

This contract defines the minimum visible behavior that implementation in `apps/web` must satisfy for the redesign to be accepted.

## 1. Critical sections

| Section | Must exist | Must show |
|---|---|---|
| Capture | yes | retention choice, horizon, current mortgage, base offer, optional bonus variant, switch costs, household profile |
| Comparison | yes | honest scenario count, total real cost ranking, deltas vs current, cost breakdown, quality status |
| Recommendation | yes | recommended action, target scenario, net savings, break-even, switch costs, explanation |
| Affordability | yes | evaluated scenario, debt ratio, threshold context, blocking or conditional caveats |
| Supporting metadata | yes | fallback/local-preview state, retention/ownership metadata, expiry/purge context, traceability support |

## 2. Visibility contract

### Desktop

- comparison must be the dominant result surface
- recommendation must immediately follow comparison
- affordability must remain clearly downstream
- supporting metadata must remain readable without hunting

### Mobile

The following must be visible by default:

- compared scenarios
- winning scenario by total real cost
- switch-cost visibility
- break-even state
- data quality status
- fallback/local-preview state
- retention/ownership metadata

These items may not depend exclusively on:

- closed accordions
- hidden tabs
- tooltips

## 3. Semantic contract

Implementation must preserve:

- source-of-truth semantics from `specs/001-mortgage-comparator-mvp/spec.md`
- ranking by total real cost
- honest 2-vs-3 scenario rendering
- affordability as a downstream evaluation
- visible distinction between complete / conditional / blocked states
- visible distinction between API-backed and local-preview states

## 4. Accessibility contract

Implementation must provide:

- logical heading order
- keyboard-accessible controls and navigation
- visible focus states
- state communication beyond color alone
- accessible alternative to dense tabular comparison on small screens

## 5. Validation contract

### Component coverage

Must verify:

- hierarchy by comparison / recommendation / affordability
- scenario-count honesty
- total-real-cost-first emphasis
- visibility of switch costs, linked products, caveats, and metadata

### E2E coverage

Must verify:

- bonus-trap ranking behavior
- no-bonus two-scenario behavior
- conditional-estimate visibility
- fallback/local-preview honesty
- retention/ownership visibility

### Accessibility checks

Must verify:

- critical route has no blocking accessibility regressions
- comparison, recommendation, affordability, and support metadata remain navigable and interpretable

## 6. Traceability contract

Reviewers must be able to map:

- `design.md` → visual hierarchy and responsive behavior
- `ux-study.md` → reading flow and content visibility
- this contract → concrete UI obligations
- feature 001 spec → preserved mortgage semantics
