# Design Direction — Editorial Financial Desk

## 1. Intent

This redesign keeps the mortgage comparator recognizable as the same product while bringing the shipped UI into explicit alignment with the team-approved direction:

- **Editorial Financial Desk**
- explanation-first financial UI
- no glossy or marketing hero-first drift
- visible truth for total real cost, switch costs, linked products, data quality, fallback state, retention/ownership metadata, and traceability

This is an evolution of the current frontend in `apps/web`, not a new brand system and not a semantic rewrite.

## 2. Source-of-truth guardrail

Product semantics remain owned by `specs/001-mortgage-comparator-mvp/spec.md`. This document may change hierarchy, emphasis, grouping, and component styling, but it may not change:

- scenario-count honesty
- ranking by total real cost
- affordability prerequisite and thresholds
- fallback honesty
- retention/ownership semantics
- traceability visibility

## 3. Filtered inspiration from `awesome-design-md`

### Adopt

| Inspiration family | What to adopt | Why it fits this mortgage product |
|---|---|---|
| **WIRED** | editorial density, strong headlines, deliberate reading rhythm | Helps a serious financial product read like analysis, not advertising |
| **Wise** | clarity around costs, friendly but sober evidence treatment | Supports explanation-first money decisions without hype |
| **IBM** | structured information architecture, metadata discipline, accessibility | Supports dense comparison, rule visibility, and trustworthy state communication |

### Reject

| Inspiration family | What to reject | Why it is wrong here |
|---|---|---|
| Glossy fintech systems | gradient-heavy polish, lifestyle sheen, over-designed cards | Competes with evidence and invites “marketing landing page” drift |
| Developer-tool minimalism | terminal coldness, icon-first austerity, hidden context | Mortgage decisions need warmth, clarity, and explanatory framing |
| Consumer/retail systems | photography-first heroes, playful illustration, high-emotion CTA design | Buries analysis and introduces the wrong emotional posture |

## 4. Visual theme and atmosphere

**Tone**: sober, deliberate, literate, trustworthy, Spanish-first  
**Metaphor**: a financial desk prepared for review, not a hero campaign and not a banking brochure  
**Reading goal**: a reviewer should understand what is compared, what wins, and why within the first scan

The product should feel like:

- a working analysis surface
- a reviewed financial document
- a decision aid that shows its evidence

The product should not feel like:

- a promotional mortgage funnel
- a crypto trading dashboard
- a developer console disguised as a banking app

## 5. Design tokens and roles

These tokens codify the existing visual posture already present in `apps/web/src/styles.css`.

### Core palette

| Role | Token/value | Usage |
|---|---|---|
| Page background | `#0b1014`, `#121821`, `#181d27` | editorial dark foundation |
| Main surface | `rgba(18, 25, 34, 0.78)` | primary panels |
| Strong surface | `rgba(10, 14, 20, 0.9)` | denser evidence blocks |
| Soft surface | `rgba(245, 238, 224, 0.06)` | nested metric cards |
| Main text | `#f4efe4` | high-legibility primary text |
| Muted text | `#b1b7bf` | secondary prose and labels |
| Accent | `#cf9e53` | editorial emphasis, headings, focus tone |
| Accent soft | `rgba(207, 158, 83, 0.2)` | subtle emphasis and focus glow |
| Positive | `#7acc9b` | good cost outcome / positive evidence |
| Warning | `#f1c168` | conditional estimate / caution |
| Danger | `#ef7e6d` | blocked or unavailable states |

### Usage rules

- Accent color highlights hierarchy and focus; it must not become decorative glitter.
- Positive/warning/danger colors support meaning but cannot be the only signal.
- Surface differences should separate evidence layers, not create glossy visual spectacle.

## 6. Typography

### Families

- **Display / section headings**: serif (`"Iowan Old Style"`, `"Palatino Linotype"`, `"Book Antiqua"`, serif)
- **Body / UI**: sans (`"Avenir Next"`, `"Segoe UI"`, sans-serif)
- **Dense metadata / IDs**: monospace or mono-styled treatment where needed

### Hierarchy

| Level | Use |
|---|---|
| H1 | page briefing headline only |
| H2 | major result sections: comparison, recommendation, affordability |
| H3 | panels and subsection headers |
| Eyebrow | compact semantic labels, never the only label |
| Body | explanations, caveats, notes |
| Meta/mono | IDs, timestamps, policy/version references |

### Rules

- Serif is for analytical emphasis, not decoration.
- Avoid giant hero typography once results exist; the comparison surface becomes the true visual anchor.
- Spanish copy must stay literal and readable; no English fintech slang.

## 7. Layout principles

### Primary hierarchy

1. **Comparison**
2. **Recommendation**
3. **Affordability**
4. **Supporting evidence**

This hierarchy must remain visually obvious in both desktop and mobile layouts.

### Structural rules

- The intro area becomes an **editorial briefing header**, not a marketing hero.
- Once results exist, the comparison block should occupy the most dominant visual position.
- Supporting metadata may live in a rail or footer, but must remain easily discoverable and readable.
- Dense data should use explicit grouping, not ornamental separation.

## 8. Component rules

### Briefing header

- Purpose: orient the user before action or before reviewing results
- Must mention decision posture and truthfulness
- Must not use oversized “conversion” messaging or promotional CTA framing

### Capture sections

- Preserve current sections:
  - retention
  - horizon
  - current mortgage
  - base offer
  - bonus variant
  - switch costs
  - household profile
- Reframe them as an analyst worksheet with stronger grouping and section intros

### Comparison surface

- This is the primary result hero
- Must show:
  - scenario count
  - ranking by total real cost
  - total real cost
  - delta vs current
  - cost breakdown
  - data quality
  - triggered rules / trace references
- Recommended enhancements:
  - sticky header or sticky evidence summary on larger screens
  - mobile card-stack alternative that keeps ranking and evidence visible

### Recommendation block

- Must always co-show:
  - recommended action
  - target scenario
  - net savings at horizon
  - break-even state
  - switch costs
  - explanation text
  - blocking reasons when present
- Monthly installment may appear, but never outrank total real cost or net savings

### Affordability block

- Must remain after valid comparison/recommendation
- Must explicitly identify the evaluated scenario
- Must show thresholds and supporting evidence, not only the label

### Data quality / fallback / retention blocks

- These are not secondary niceties; they are trust-critical evidence
- Data quality, fallback/local-preview state, retention policy, expiry, ownership, and traceability must stay visible and legible

## 9. Mobile visibility defaults

### Essential evidence visible by default

On narrow viewports, the following must remain visible without opening a closed accordion or a hidden tab:

- scenarios being compared
- current leader by total real cost
- switch-cost visibility
- break-even or “no se alcanza”
- data quality status
- fallback/local-preview status
- retention/ownership metadata

### Mobile rules

- Collapse layout, not evidence
- Prefer stacked evidence cards over hidden tabs
- If a detail view expands, the critical summary above it must still remain visible
- Touch targets must meet accessible sizing expectations

## 10. Anti-patterns to avoid

- glossy, campaign-like hero sections
- lifestyle photography or aspirational property imagery
- monthly-payment-first marketing framing
- hidden cost evidence in tooltip-only UI
- closed-by-default accordions for critical evidence
- generic “saved” or “success” messaging without retention context
- optimistic UI that implies backend success when the app is actually in fallback
- relying on color alone for blocked/conditional/complete state

## 11. Current-to-target mapping in `apps/web`

| Current implementation | Target direction |
|---|---|
| `MortgageAnalysisPage` hero section | convert to compact editorial briefing header with less campaign weight |
| `AnalysisForm` | preserve semantic blocks, tighten hierarchy and worksheet-like grouping |
| `ScenarioComparisonTable` | make the primary evidence surface, add stronger responsive and scannability rules |
| `RecommendationPanel` | shift from summary card to evidence-backed decision block |
| `AffordabilityPanel` | reinforce prerequisite story and explanatory support |
| `DataQualityBanner` | increase its structural relationship to recommendation risk and result trust |
| Ownership sidebar | evolve into a clearer supporting evidence rail/footer visible across breakpoints |
| `styles.css` | codify tokens and section primitives rather than relying on one-off panel styling |

## 12. Accessibility and semantics

- heading order must follow reading hierarchy
- keyboard navigation must remain complete and visible
- state communication cannot rely only on color
- tabular data must stay understandable in its mobile alternative
- metadata and caveats must be available to assistive tech, not visually hidden-only

## 13. Acceptance traceability

Every frontend change should be reviewable against:

- this design document
- `ux-study.md`
- `contracts/ui-redesign-contract.md`
- `specs/001-mortgage-comparator-mvp/spec.md`

If a new UI treatment cannot be traced back to those artifacts, it should not be considered accepted for this feature.
