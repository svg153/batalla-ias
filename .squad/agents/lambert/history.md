# Project Context

- **Owner:** Sergio Valverde
- **Project:** batalla-ias
- **Stack:** TypeScript monorepo with React, Express, Decimal.js, PostgreSQL, Vitest, Playwright
- **Created:** 2026-04-23T20:09:48Z


## 2026-04-24 — Landing UX Comparative Analysis & Recommended IA

**Session:** lambert-landing-ux-analysis (completed 2026-04-24)

### Analysis Scope
Compared hipoteca-2 landing/homepage UX against batalla-ias current public entry experience to identify gaps and design a landing that preserves battle-ias's transparency DNA while adding acquisition-layer trust signals.

### Key Findings

**hipoteca-2 Pattern (Reference):**
- Multiple independent micro-tools (4 tabs) addressing household questions
- Hero positioning around "simple & powerful"
- Trust signals: PDF export, regional economics defaults, soft validation hints
- Breadth-first navigation (not a single decision story)

**batalla-ias Current (Analytical):**
- Single focused comparison flow (current vs. alternative)
- Hero positioning defensive: "real cost, no BS"
- Trust signals: backend honesty, staged progress, formula tracing
- Depth-first (too many explanations for first-time visitors)

**Gap:** batalla-ias lacks a published landing for acquisition. No intermediate trust scaffolding or breadth signaling. Currently a tool for users who already decided to compare.

### Recommended Landing IA (8 Sections)

1. **Hero** — "¿Tu hipoteca actual es la mejor oferta?" with trust statement
2. **Trust Scaffold** — 3 signals (100+ analyzed, ranked by real cost, session-only privacy)
3. **Value Proposition** — What you'll discover (comparison, savings, affordability)
4. **Breadth Signal** — 3 visual cards (scenario comparison, break-even, affordability)
5. **Explanation Block** — Why switches matter + what gets compared
6. **Examples or Stats** — Social proof or case studies
7. **Form Entry** — Progressive disclosure (start analysis)
8. **Footer** — Links, trust stamp, advanced paths

### Design-System & Redesign-002 Dependencies

**Safe to Plan Now:**
- Landing IA document (structure, info hierarchy, content)
- React component skeleton
- Copy outline
- Mobile breakpoints

**Should Wait (After Redesign-002):**
- Hero color scheme (depends on brand direction)
- Card styling refinement (depends on design tokens)
- Status badge consumer variants

**Blocking Implementation:**
- `compare` endpoint (currently 501)
- `affordability` endpoint (currently 501)
- Design token finalization

### Artifacts Created
- `.squad/decisions/inbox/lambert-landing-ia.md` — Full analysis, IA structure, dependencies, decision points

### Strategic Implications
- Landing IA expands acquisition funnel without compromising transparency
- Borrows hipoteca-2's proven trust patterns while keeping battle-ias's explanation-first DNA
- Defers style work to after redesign-002, finalizes structure now
- Unblocks Parker/Hicks: clear on what backend and data structures landing needs

## 2026-04-24 — Design Direction & Redesign Strategy Merged

**Session:** lambert-redesign-direction (merged to decisions.md) + lambert-editorial-redesign (merged to decisions.md)

**Outcome:** ✅ Both decisions merged to `.squad/decisions.md`

**Design Direction Approved:**
- **Brand posture:** "Editorial Financial Desk" — Bloomberg Terminal meets WIRED meets broker spreadsheet
- **Visual system:** Current dark editorial base is 90% correct; codified color palette, typography, spacing
- **Component patterns:** Documented existing components with explicit CSS patterns
- **Anti-patterns:** Called out what NOT to copy (purple gradients, trading dashboards, playful illustrations)

**Editorial Redesign Delivery:**
- Comparison as dominant surface (desktop table + mobile card stack)
- Dedicated metadata rail for retention/ownership/stage provenance
- Shared `analysis-ui.tsx` primitives for consistent evidence formatting across blocks
- Evidence-first layout with compact briefing header (no marketing hero)

**Key Documentation:**
- Designed `design.md` (10 sections: theme, colors, typography, components, layout, depth, responsiveness, accessibility, anti-patterns, agent guide)
- Designed `ux-study.md` (9 sections: user context, jobs, IA, form flow, results, patterns, copy, edge cases, testing)

### Team Impact
- Design system codified; patterns locked; anti-patterns called out
- Redesign validation gates integrated with Hicks finish-gate
- Landing IA now can plan after redesign-002 brand tokens finalized
- Component architecture ready for Editorial Desk implementation

## 2026-04-24 — Landing Page Architecture Approved

**Outcome:** ✅ Decision merged to `.squad/decisions.md` (Landing Page Information Architecture section)

**Next Steps:**
- [ ] Sergio approves landing IA + trust narrative + example data strategy
- [ ] Create `landing-ia.md` spec + component skeleton + copy outline
- [ ] Coordinator schedules redesign-002 brand review + unblock compare/affordability endpoints
- [ ] Team implements landing after redesign-002 tokens available


## Learnings

- The MVP UI must expose comparison, recommendation and affordability without opaque outputs.
- The main page will be form-heavy and explanation-heavy, not marketing-heavy.
- The frontend shell works better with a visible local preview fallback than with a dead results area while API/domain pieces are still arriving.
- The mortgage flow needs retention choice, switch costs and affordability guardrails in the first screen or users will misread the outcome.
- The redesign now treats comparison as the primary evidence surface with a mobile card stack that keeps ranking and costs visible.
- Supporting metadata is now a dedicated rail (ownership, retention, stage sources) backed by shared analysis UI primitives.

## 2026-04-23 — UI Integration Synchronized

**Session:** lambert-ui-integration (merged by Scribe 2026-04-23T20:55:13Z)

### Frontend State
✓ API integration honest: live attempt first, fallback to local only when backend unavailable  
✓ Bonus variant optional: user controls scenario count  
✓ Recommendation, affordability, retention, access status now first-class UI states  
✓ Visible source badges, warnings, backend retention copy instead of generic success  
✓ No-bonus rendering: graceful fallback when alternative scenario unavailable
✓ Conditional affordability: "pending", "estimated", "approved" states visible
✓ Enhanced error/loading/empty UX: robust across all failure modes

### Sync with Parker
Parker's API orchestration now enforces cookie ownership and recommendation-driven affordability.  
Lambert's UI fallback strategy aligns: local comparison/affordability only when backend unavailable.

### Sync with Hicks
Data quality flags now first-class: `dataQualityStatus` visible in recommendation panel.

## 2026-04-23 — Reusable frontend lessons extracted

**Session:** lambert-squad-skills

### What was distilled
- Explanation-first financial UI is now captured as a reusable Squad skill instead of staying trapped in one page implementation.
- Honest degraded states are now encoded as a reusable skill: API-first, visible local preview only when warranted, and no fake success on backend gaps.
- Optional scenario handling is explicit: bonus variants only exist when declared and materially different, otherwise the UI stays at two scenarios and says why.

### Assets created
- `.squad/skills/explanation-first-financial-ui/SKILL.md`
- `.squad/skills/honest-degraded-analysis-states/SKILL.md`
- `.squad/decisions/inbox/lambert-squad-skills.md`

## Skills Earned: Explanation-First UI & Honest Degradation

**Date:** 2026-04-23  
**Crystallized into:**
- `.squad/skills/explanation-first-financial-ui/SKILL.md`
- `.squad/skills/honest-degraded-analysis-states/SKILL.md`

**Where Applied:** Frontend architecture, fallback UI states, affordability display, access/retention copy  
**Reusable Pattern:** Financial outputs prioritize explanation and transparency; partial backend delivery handled truthfully with visible confidence

**Impact:** Future frontend work on financial outputs, fallbacks, recommendation UX automatically loads these skills

## 2026-04-23 — Design Direction Research & Documentation

**Session:** lambert-redesign-direction

### Analysis Completed
- Analyzed VoltAgent/awesome-design-md catalog (69 design systems)
- Identified three design tribes: Developer Tools, Fintech Trust, Editorial Premium
- Evaluated current MVP UI against external patterns
- Determined mortgage comparison sits at intersection of financial precision, editorial explanation, and developer-grade honesty

### Design Direction Proposed
- **Brand posture:** "Editorial Financial Desk" — Bloomberg Terminal meets WIRED meets mortgage broker's spreadsheet
- **Visual system:** Current dark editorial base is 90% correct; codified color palette, typography, spacing
- **Component patterns:** Documented existing components (cards, forms, tables, badges) with explicit CSS patterns
- **Layout principles:** Codified spacing scale, grid system, whitespace philosophy
- **Accessibility:** WCAG 2.1 AA compliance standards, Spanish localization rules

### Key Architectural Decisions
1. **Keep current palette:** Dark editorial surfaces + warm gold accent express financial authority without aggression
2. **Serif for headings only:** Iowan Old Style for H1-H3, Avenir Next for body, IBM Plex Mono for data
3. **No redesign needed:** Current UI already demonstrates correct editorial-financial posture
4. **Explicit anti-patterns:** Called out what NOT to copy from Stripe gradients, Linear minimalism, trading dashboards

### Anti-Patterns Documented
- No carousels, hidden tooltips for critical info, fake progress bars, optimistic UI lies, generic success copy
- Don't copy: purple gradients, terminal aesthetics, trading dashboards, playful illustrations, crypto slang

### Artifacts Created
- `.squad/decisions/inbox/lambert-redesign-direction.md` — comprehensive design direction proposal
- Recommended structure for `design.md` (10 sections) and `ux-study.md` (9 sections)

### Key Files Analyzed
- `apps/web/src/pages/mortgage-analysis-page.tsx` — editorial dark UI with explanation-first panels
- `apps/web/src/styles.css` — existing design tokens already match proposed direction
- `apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx` — data-dense comparison already correct

### Learnings
- Current MVP UI instinctively landed on the right design posture without external reference
- The problem is not visual design; it's codifying patterns and preventing future drift
- Spanish-speaking mortgage users need editorial authority, not fintech playfulness
- Design system should document what's working, not chase external trends

## 2026-04-24 — Landing UX & Mortgage Redesign Finish Gate

**Session:** mortgage-redesign-finish-gate-v2 (2026-04-24T22:26:01Z)

### Landing UX Analysis Completed
- Comparative analysis of hipoteca-2 and batalla-ias landing patterns
- Documented landing IA structure for acquisition layer (hero → trust scaffold → breadth → explanation → examples → form → footer)
- Proposed trust signals and progressive entry strategy preserved batalla-ias transparency DNA

### Mortgage Redesign Finish Gate v2
- Hicks approved Editorial Financial Desk redesign after Ripley's revision
- **Status:** Production-ready
- **Key achievements:**
  - Editorial shell with evidence blocks, metadata rail, retention semantics
  - Component tests complete
  - E2E coverage for `local_preview` honesty and mobile accessibility
  - All repo-level validation passing

**Next:** Backend API integration and landing page implementation
