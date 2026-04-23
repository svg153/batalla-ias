# Research — mortgage redesign

## Context

The feature is a redesign of the existing mortgage comparator UI, not a rewrite of mortgage semantics. Source-of-truth product behavior remains `specs/001-mortgage-comparator-mvp/spec.md`, while this research resolves how to evolve `apps/web` toward the approved **Editorial Financial Desk** direction without losing financial truth visibility.

## Decision 1: Redesign approach

**Decision**: Implement an evolutionary redesign in `apps/web` that preserves current route structure, data contracts, and feature semantics.

**Rationale**: The current frontend already contains the correct product skeleton: guided capture, visible scenario comparison, recommendation, affordability, data-quality treatment, and retention/fallback honesty. Replacing that skeleton would introduce unnecessary risk against the constitution’s exactness and explainability requirements.

**Alternatives considered**:
- Full UI rewrite around a new component architecture — rejected because it increases delivery risk without improving mortgage semantics.
- Pure style refresh only — rejected because the feature also needs documented hierarchy, mobile defaults, traceability, and validation expectations.

## Decision 2: Approved inspiration filter for `awesome-design-md`

**Decision**: Use `awesome-design-md` as inspiration input, but only adopt patterns that support serious, explanation-first mortgage decisions for Spanish-speaking households.

**Rationale**: The collection is useful as a catalog of visual systems, but the mortgage product needs filtered adoption. WIRED contributes editorial density and reading confidence, Wise contributes financial clarity and evidence-led trust, and IBM contributes structured information architecture and accessibility discipline.

**Alternatives considered**:
- Copy a single external DESIGN.md wholesale — rejected because the product context is narrower, more regulated, and less marketing-friendly.
- Ignore external inspiration entirely — rejected because the feature explicitly requires precedent analysis and adoption/rejection rationale.

## Decision 3: What to adopt

**Decision**: Adopt editorial density, restrained accent usage, clear label/value blocks, serious typography, and comparison-as-primary-surface composition.

**Rationale**:
- **WIRED-like editorial density** supports deliberate reading instead of empty whitespace or campaign-style hero design.
- **Wise-like evidence clarity** supports explicit cost comparison and readable financial explanation.
- **IBM-like structured information** supports state labels, metadata, and accessibility-friendly layouts for complex information.

**Alternatives considered**:
- Stripe/Revolut-style fintech polish — rejected because gradients and glossy motion can compete with the evidence.
- Linear/Vercel-style minimalism — rejected because the product needs warmth and guidance, not tool-chrome austerity.

## Decision 4: What to reject

**Decision**: Reject glossy hero-first layouts, photography-led presentation, critical-info tooltips, collapsible-first mobile patterns, terminal-minimal coldness, and any UI that visually promotes monthly installment over total real cost.

**Rationale**: The mortgage product exists to support a high-stakes household decision. Anything that turns the experience into a landing page, a trading dashboard, or a minimalist dev tool creates avoidable interpretation risk.

**Alternatives considered**:
- Large aspirational hero with key metrics below the fold — rejected because it demotes evidence.
- Accordion-heavy mobile experience — rejected because essential evidence must remain visible by default.

## Decision 5: Information hierarchy

**Decision**: The stable reading hierarchy is:
1. what is being compared,
2. which scenario leads by total real cost,
3. why that recommendation wins or fails,
4. whether the recommended scenario is affordable,
5. what caveats, assumptions, fallback states, and retention/ownership metadata condition the reading.

**Rationale**: This sequence mirrors the product semantics in feature 001 and supports fast, honest interpretation. It also gives a concrete acceptance trace from design artifacts to frontend implementation.

**Alternatives considered**:
- Lead with recommendation before comparison — rejected because the explanation must come before persuasion.
- Lead with affordability before recommendation — rejected because affordability depends on a valid comparison and target scenario.

## Decision 6: Mobile visibility defaults

**Decision**: On mobile, essential evidence must remain directly visible or expanded by default: scenario count, total real cost winner, switch-cost visibility, break-even state, data-quality status, fallback/local-preview status, and retention/ownership metadata.

**Rationale**: The feature spec explicitly forbids burying essential evidence behind closed accordions, hidden tabs, or tooltips. Mobile redesign should change layout density, not truth visibility.

**Alternatives considered**:
- Tabbed comparison/recommendation/affordability with only one visible at a time — rejected because it hides evidence sequencing.
- Collapse cost breakdown and metadata behind “more info” drawers by default — rejected because users may miss critical caveats.

## Decision 7: Testing strategy

**Decision**: Preserve existing service and Playwright regression coverage, and extend the redesign with component-level UI tests plus automated accessibility checks.

**Rationale**: The current frontend already has service-level fallback tests and E2E flows proving key semantics. The redesign adds presentation risk, responsive behavior risk, and accessibility risk, so coverage must expand at the component layer and through automated a11y assertions.

**Alternatives considered**:
- Rely on E2E only — rejected because section hierarchy and visible-evidence regressions are cheaper and clearer to catch in component tests.
- Manual accessibility review only — rejected because the constitution requires rigorous validation and repeatability.

## Decision 8: Acceptance traceability mechanism

**Decision**: Add a UI contract artifact that maps design and UX requirements to concrete frontend sections, behaviors, and validation expectations.

**Rationale**: The feature needs an explicit bridge between `design.md` / `ux-study.md` and implementation in `apps/web`. A contract artifact turns subjective redesign review into a repeatable acceptance checklist.

**Alternatives considered**:
- Put all traceability only inside plan prose — rejected because a standalone contract is easier to use during implementation and review.
- Skip a contract because the app is “just frontend” — rejected because the feature spec explicitly asks for acceptance traceability.
