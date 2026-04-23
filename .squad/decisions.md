# Squad Decisions

## Frontend Architecture

### Editorial Dark Financial Desk Shell (Lambert)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
Use an editorial dark "financial desk" shell with:
- Explanation-first page for capture + comparison
- Structured sections: current mortgage, alternative offer, switch costs, household profile, retention
- Visible local preview fallback when `/api/v1` unavailable
- Reserved but working space for recommendation and affordability evidence

**Rationale:**
Keeps product understandable before full stack lands. Avoids shipping pretty shell that hides switch costs, bonification tradeoffs or retention implications.

**Consequences:**
- Frontend can demonstrate core narrative immediately
- API integration can replace preview path without page rewriting
- Data quality, assumptions and affordability warnings stay first-class in UI

---

## Access Control & Data Retention

### MVP Access Control & Retention Semantics (Ripley)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- **MVP Access:** Each analysis protected by opaque `analysis_session` token emitted in `POST /api/v1/analyses`; `analysisId` without valid token grants no access
- **Retention:** 
  - `session_only` expires on logout or 4h inactivity, purged within 15 min
  - `save_analysis` retains max 30 days, purged within 24h post-expiry
- **Affordability Calculation:** Only after valid comparison, always on target scenario defined by active recommendation
- **Affordability Classification:** Maintained in `asumible`, `ajustada`, `no_asumible`; data gaps/uncertainty expressed via `dataQualityStatus`
- **Traceability:** All calculated outputs include versioned formula/rule references with code, version, document source

**Rationale:**
Closes critical spec gaps across access ownership, retention mechanics, affordability prerequisites, and formula provenance. Unambiguous semantics for implementation.

**Consequences:**
- No possession ambiguity; access clearly tied to session token + opaque analysis ID
- Retention timing explicit; no orphan data or surprise purges
- Affordability never orphaned; always calculated against known scenario
- All rules traceable to source; regression stories possible

---

## Domain & Rules

### Test Scaffolding & Quality Baseline (Hicks)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Test skeletons created for contract, integration, and E2E; marked `skip` when dependent on unimplemented features
- Shared fixtures in `packages/domain/tests/fixtures/` and `apps/api/tests/helpers/` encode financial scenarios: no-bonus, conditional estimates, retention, ranking-by-total-cost
- Domain public surface (`packages/domain/src/index.ts`) corrected to expose formulas and rules, enabling suite bootstrap

**Rationale:**
Tests encode expected contract before implementation, preventing regressions when features land. Shared fixtures eliminate payload duplication. Public surface correction unblocks test execution and feedback loop.

**Consequences:**
- Test suite is regression-safe; all builds and existing tests pass
- E2E framework ready for activation when compare endpoint and affordability orchestration land
- Financial scenarios documented via fixtures; next implementer has reference payload set

---

### Rule Provenance Centralization (Bishop)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Centralize formula and rule provenance in `packages/domain/src/rules/rule-sources.ts`
- All formulas/validation must emit or reference rule IDs/versions from that catalog
- Current-installment consistency treated as warning when declared differs from estimated by >0.50 EUR

**Rationale:**
Constitution requires every rule to have source, version and regression story. Single catalog lets API/UI surface evidence without re-encoding. 0.50 EUR threshold is technical rounding guard, not product affordability threshold.

**Consequences:**
- Future formulas/thresholds must register in shared catalog before shipping
- Current-installment mismatch degrades quality to `conditional_estimate`; product can tighten/relax post-real-data

---

## Backend

### Backend Foundation & In-Memory Default (Parker)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Backend boots with in-memory repository as default implementation (real)
- `save_analysis` does not fake durability; response exposes `retentionMetadata` + explicit warning when PostgreSQL not yet wired
- Access is possession-based via opaque `analysisId`, explicitly surfaced in headers/response

**Rationale:**
Honest about infrastructure maturity. No pretense. Possession-based access clearly documented.

**Consequences:**
- Backend can run standalone for testing/demo without database dependency
- Saves/retention behavior is transparent; no surprise data loss
- Access control semantics explicit in wire protocol

---

### API Integration & Orchestration (Parker)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Protect `GET/DELETE/compare/affordability` with the opaque `analysis_session` cookie; treat unknown/mismatched cookies as ownership misses (`404` after cookie presence, `401` when absent)
- Keep `session_only` as 4-hour inactivity window with sliding `lastAccessedAt/expiresAt/purgeAfter` metadata; keep `save_analysis` on same 30-day/24-hour retention contract even with in-memory fallback
- Orchestrate comparison in API by composing finished domain formulas/ranking primitives; calculate affordability only against active recommendation target scenario

**Rationale:**
API remains boring and explicit: ownership token-bound, retention honest about memory fallback, affordability cannot drift from shown recommendation.

**Consequences:**
- `compare` and `affordability` endpoints now orchestrate real domain scenarios
- Recommendation-driven affordability: scoped only to active recommendation target
- Cookie-based ownership on all data access endpoints
- Retention semantics transparent even with in-memory fallback

---

## Frontend Integration (Lambert)

### UI Integration & Honest API Consumption (Lambert)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Frontend uses API honestly in stages: `POST /analyses` and `GET /analyses/{id}` attempted live first; comparison and affordability fall back locally only when backend unavailable/unimplemented
- Offer form treats bonus variant as optional; if user does not declare bonus, UI submits only base offer and results stay at two scenarios
- Recommendation, affordability, retention and access status surfaced as first-class UI states with visible source badges, warnings, backend retention copy instead of generic success language

**Rationale:**
Transparent about fallbacks and user choice. No hidden scenarios. Retention and affordability state always visible.

**Consequences:**
- Graceful degradation when backend unavailable
- User controls scenario count: explicit bonus choice
- State and confidence visible in UI; no surprises on backend wiring

---

## Squad Operating Model & Routing

### Earned Hicks Skills: Test Scaffolding & Honest Fallback Review

**Status:** Approved (routing)  
**Date:** 2026-04-23  
**Author:** Hicks

**Decision:**
Route future quality work through these established patterns:
- `.squad/skills/test-skeleton-tripwires/SKILL.md` — Lock cross-layer test contracts before implementation
- `.squad/skills/honest-fallback-review/SKILL.md` — Validate fallback paths stay visible and honest

**Where Used:**
- `packages/domain/tests/regression/comparison-scenarios.test.ts`
- `apps/api/tests/integration/compare-analysis.test.ts`
- `apps/web/tests/e2e/mortgage-comparison.spec.ts`

**Next Action:**
Coordinator loads these skills for regression scaffolding, staged backend rollouts, and E2E hardening tasks.

---

### Earned Parker Skills: Session Ownership & Vercel Monorepo Deployment

**Status:** Approved (routing)  
**Date:** 2026-04-23  
**Author:** Parker

**Decision:**
Route backend and deployment work through these patterns:
- `.squad/skills/session-cookie-ownership/SKILL.md` — Possession-based API access without account infrastructure
- `.squad/skills/static-monorepo-vercel/SKILL.md` — Honest Vercel deployment from pnpm monorepo with explicit fallback

**Context:**
Both patterns apply beyond this repo. Covers access semantics, retention/access on wire, and static-web deployment with honest fallback signaling.

**Next Action:**
Coordinator loads these for API-access, retention, fallback, or Vercel-boundary tasks.

---

### Earned Lambert Skills: Explanation-First UI & Honest Degradation

**Status:** Approved (routing)  
**Date:** 2026-04-23  
**Author:** Lambert

**Decision:**
Route frontend work through these patterns:
- `.squad/skills/explanation-first-financial-ui/SKILL.md` — Financial outputs prioritize explanation and transparency over aesthetics
- `.squad/skills/honest-degraded-analysis-states/SKILL.md` — Frontend handles partial backend delivery and degraded modes truthfully

**Why Reusable:**
Same problems recur: explanation-heavy outputs, partial backend delivery, retention/access semantics, optional scenario handling.

**Next Action:**
Coordinator loads these for frontend work on financial outputs, fallbacks, recommendation UX, or retention/access handling.

---

### Earned Ripley Skills & Coordinator Improvements

**Status:** Approved (routing & coordination)  
**Date:** 2026-04-23  
**Author:** Ripley

**Decision:**
Integrate three improvements into coordinator/routing workflow:

1. **Contract-Lock Preflight** (`.squad/skills/contract-lock/SKILL.md`)
   - For cross-cutting features with privacy, retention, or recommendation semantics: Ripley locks the contract before parallel implementation fan-out
   - Lock captures: access/ownership, retention TTL + purge semantics, canonical target for downstream calculations, uncertainty vs. business-output split, traceability requirements

2. **Honest Fallbacks** (`.squad/skills/honest-fallbacks/SKILL.md`)
   - Degradation patterns must stay truthful about provenance, durability, and confidence

3. **Integration Finish Gate** (`.squad/skills/integration-finish-gate/SKILL.md`)
   - After backend + frontend work converge: spawn Hicks for repo-level finish gate
   - Hicks validates root build/typecheck/test, E2E, and checks for stale contract assumptions in tests and UI copy

**Rationale:**
Session was effective because team aligned early on non-negotiable contracts and stayed honest about degraded modes. Main gap was endgame convergence: validation should be explicit routing step, not discovered late.

**Consequences:**
- No mid-implementation ambiguity; contracts lock before fan-out
- Repo-level validation automated; stale mocks/contracts caught early
- UI fallback behavior stays truthful about backend state

---

## User Directive

### Lessons Learned & Squad Self-Improvement

**Status:** Captured  
**Date:** 2026-04-23  
**Captured By:** Coordinator (Copilot)  
**Original:** User Sergio Valverde, 2026-04-23T23:20:51+02:00

**Directive:**
Extract lessons learned from all work on mortgage comparator MVP and improve Squad with new skills, instructions, memory, and agent adjustments for better future iterations.

**Evidence:**
- 9 new skills extracted and registered in `.squad/skills/`
- Coordinator updated routing, agent charters, identity/wisdom, and identity/now
- Operating patterns codified for future iterations
- Session effectiveness attributed to early contract alignment and honest degradation modes

---

## Spec Kit & Governance Tooling

### Spec Kit Extension Adoption Strategy (Ripley)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Ripley

**Decision:**
Adopt Spec Kit extensions in three tiers:

1. **Tier 1 — Primary:** `spec-kit-ci-guard` (advisory spec drift gate)
   - Pilot phase: advisory mode, no hard merge blocking
   - Maturation: escalate to strict mode for money/privacy/contract features
   - Rationale: Closes gap between Squad manual review and automated merge-gate

2. **Tier 2 — Secondary:** `spec-kit-red-team` (adversarial review for high-risk features)
   - Deploy after ci-guard pilot succeeds
   - Trigger on features touching: money calculations, privacy, contracts, retention

3. **Hold/Deferred:** `spec-kit-bugfix`, `agent-assign`, `conduct`, `maqa`, `brownfield`, `memory-loader`
   - Either lower priority or redundant with Squad model

**Rationale:**
Battle-ias already has strong constitution and Squad operating model. Extensions should close real gaps (spec drift detection, adversarial review for financial logic) without adding parallel coordinators or duplicating Squad authority.

**Consequences:**
- Official tooling (copilot + git) remains default, verified path
- Community tooling clearly labeled as optional, vendored locally
- CLI pinning removes environment brittleness
- Governance boundary explicit: verified vs. optional

---

### Spec Kit CLI Wrapper & Official Integration (Parker)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Parker

**Decision:**
- Pin official `github/spec-kit` CLI to version `v0.8.0`
- Create reproducible wrapper: `corepack pnpm speckit -- <cmd>`
- Route all Spec Kit commands through wrapper (humans and Squad use same entrypoint)
- Preflight entrypoint: `corepack pnpm speckit:setup`

**Rationale:**
Avoids silent breakage when developer's global `specify` binary differs from repo requirements. Single entrypoint keeps environment predictable for both interactive and agent-driven workflows.

**Consequences:**
- Humans and Squad share identical Spec Kit invocation path
- Repo stops depending on caller's global Python tool state
- Future upgrades managed via repo-pinned version, not developer initiative

---

### CI Guard Community Pilot & Vendoring (Parker)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Parker

**Decision:**
Adopt `spec-kit-ci-guard` as a **local, advisory-only pilot**:

- Keep official `github/spec-kit` CLI wrapper as verified default
- Vendor patched local copy under `.specify/community/ci-guard-pilot/`
  - Reason: Upstream `v1.0.0` manifest exists but fails validation against pinned CLI (namespace conflict on `speckit.ci.*`)
  - Patch: minimal compatibility layer; maintains update path to upstream
- Install pilot via separate entrypoint: `corepack pnpm speckit:ci:setup` (not official `speckit:setup`)
- Configure `.speckit-ci.yml` in **advisory mode** (`fail_*: false`)
  - Findings guide review without blocking merges
  - Preserve integrity boundary: official vs. community distinction clear

**Rationale:**
Ripley's recommendation directionally sound, but upstream incompatibility required local wrapper to keep pilot reproducible and transparent about unverified (community) status. Local piloting lets team validate before committing to hard merge gates.

**Consequences:**
- Humans get explicit setup/status commands
- Squad gets wired agent prompts for `speckit.ci-guard.check`, `speckit.ci-guard.drift`, `speckit.ci-guard.report`
- Community tooling stays clearly labeled and optional
- Advisory mode prevents false blocking; recommendations inform human judgment

---

## UI Redesign & Design System

### Redesign Contract Lock: Mortgage Comparator Decision Desk (Ripley)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Ripley

**Decision:**
Before visual redesign work begins, lock this product as a **decision desk for mortgage switching analysis**, with five immutable semantic rules:

1. **Ancla de Decisión (Decision Anchor)**
   - Total real cost is primary signal, not monthly installment
   - Recommendation exposes: net savings, break-even point, switching costs in one view

2. **Jerarquía de Contenido (Content Hierarchy)**
   - Capture flow: retention/access → horizon → current mortgage → offer base → bonus variant (optional) → switch costs → household profile
   - Results: always three panels: comparison → recommendation → affordability

3. **Semántica de Escenarios (Scenario Semantics)**
   - Always compare `current` vs. `alternative_without_bonus`
   - `alternative_with_bonus` only if explicitly offered
   - Affordability only after valid comparison and always on recommendation's target scenario

4. **Verdad Visible (Visible Truth)**
   - Cannot hide: switch costs, linked products, assumptions, data gaps, fallback mode, ownership/retention, formula traceability
   - May improve aesthetics and responsiveness, cannot degrade to secondary/hidden

5. **Forma de Experiencia (Experience Form)**
   - Optimized for deliberate, evidence-dense reading
   - Mobile stacking allowed; evidence not behind tabs, collapsed accordions, or mandatory tooltips

**Rationale:**
Context is economic decision with high cost sensitivity, bonus-bait risks, privacy concerns. If redesign prioritizes aesthetics over total-cost ranking, bonus clarity, or affordability prerequisite, product stops telling truth even if backend stays correct.

**Consequences:**
- Redesign spec must describe this target explicitly
- Design, UX, copy cannot treat retention/fallback as support details
- Any proposal hiding comparison, creating implicit scenario, or decoupling affordability must be rejected before implementation
- If artifact contradicts this lock, lock prevails; resolve inconsistency in spec before fan-out

---

### Redesign Validation Strategy (Hicks)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Hicks

**Decision:**
Before visual redesign work, establish locked validation matrix covering 10 critical dimensions:

1. Scenario Count Logic (exactly 2 when user omits bonus, no silent fake)
2. Ranking by Total Real Cost (not installment)
3. Bonus Clarity (linked products visible, explanation present)
4. Data Quality Honesty (conditional estimate / missing data / assumptions visible)
5. Affordability Eligibility (only after valid comparison, target scenario locked)
6. Fallback Clarity (source badge + notice visible when local/unavailable)
7. Retention Visibility (session expiry/purge dates accessible)
8. Cost Breakdown Structure (timing labeled: monthly vs. one-off)
9. Delta Accuracy (absolute and percentage match API, no rounding surprises)
10. Accessibility Baseline (semantic HTML, color not sole indicator, 44x44 touch targets)

**Test Coverage Before Redesign:**
- Domain: 12 tests, all green (rules locked)
- API: 17 tests, all green (contract stable)
- Web Service: 4 tests, all green (mock + fallback)
- Component Unit: 0 → 23 tests (new: ScenarioComparisonTable, RecommendationPanel, AffordabilityPanel, DataQualityBanner)
- E2E: 3 existing + 2 new (high switch costs, no break-even scenarios)

**Validation Commands (All Must Pass Before Redesign Visual Work):**
```bash
corepack pnpm build
corepack pnpm --filter @batalla-ias/domain test
corepack pnpm --filter @batalla-ias/api test
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm exec playwright test mortgage-comparison.spec.ts
```

**Fragile Areas Flagged:**
1. Installment-first visual hierarchy (risk: bonus installment highlighted before total cost)
2. Data quality banner collapsed (risk: false certainty when conditional_estimate not visible)
3. Affordability shown before comparison ready
4. Fallback seamless/unlabeled (risk: user doesn't know backend unavailable)
5. Session expiry invisible (risk: data purged without user awareness)
6. Empty bonus column silently added

**Recommendation for Redesign Team:**
- Add 6 component unit tests before visual changes (tests green on current impl as baseline)
- Redesign visual/CSS; tests stay green through changes
- All existing E2E tests must remain green
- Add visual regression snapshots before/after
- Run Lighthouse accessibility audit (≥85 score)

**Consequences:**
- Redesign cannot ship until all baseline validation commands pass
- Test suite becomes regression gate; no feature loss during redesign
- Fragile areas become explicit review checkpoints before merge
- Component tests lock contract; UI changes verify against spec, not guesswork

---

### Design Direction: Editorial Financial Desk (Lambert)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Lambert

**Decision:**
Codify design system for mortgage comparator as **Editorial Financial Desk** — intersection of:
- Financial precision (Coinbase/Stripe institutional trust)
- Editorial explanation (WIRED information density)
- Developer honesty (Vercel/Linear transparency)

**Visual System:**
- **Brand Posture:** Analyst's desk at financial publication (Bloomberg Terminal meets WIRED meets broker spreadsheet)
- **Color Foundation:** Deep editorial black (`#0b1014`) + warm financial gold accent (`#cf9e53`) + semantic colors (success green, warning yellow, danger red)
- **Typography:** Serif display (H1-H3 only), sans body, monospace for data/currency
- **Component Standards:** Cards with inner gold glow, gradient buttons, sticky table headers, status chips, stage badges
- **Spacing & Layout:** 1440px max-width, 2-column on desktop (1.35fr main + 0.65fr sidebar), 1-column mobile
- **Responsiveness:** Breakpoints at 1180px (desktop), 860px (tablet), mobile stacks all grids with reduced padding
- **Accessibility:** WCAG 2.1 AA, 4.5:1 contrast, keyboard navigation, screen reader patterns, Spanish localization

**What NOT to Copy:**
- ❌ Purple gradients (too tech), terminal aesthetics, monochrome extreme from developer tools
- ❌ Trading UI (green/red candlesticks), real-time tickers, gradient overload from fintech
- ❌ Full-bleed imagery, article pagination, paywall patterns from editorial
- ❌ Playful illustrations, gamification, social features from consumer apps
- ❌ Carousels, hidden tooltips for critical info, fake progress, optimistic UI that lies

**Design Artifact Structure:**
- `design.md` — Color palette, typography rules, component styling, layout principles, depth/elevation, responsiveness, accessibility
- `ux-study.md` — User context, information architecture, form flow, result presentation, interaction patterns, copy guidelines, edge cases

**Consequences:**
- Design system codified and traceable for future iterations
- UX patterns documented for consistency (no drift toward Stripe/Linear aesthetics)
- Accessibility standards explicit and testable
- Anti-patterns called out to prevent regression
- Current palette kept (minor refinements only); existing component structure reusable

---

### Editorial Redesign Delivery Strategy (Lambert)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Lambert

**Decision:**
Ship Editorial Financial Desk redesign as **evidence-first layout** with:

1. **Compact Editorial Briefing Header** (no marketing hero)
2. **Comparison as Dominant Surface**
   - Desktop: full table with sticky header, best-scenario badge on first row, cost breakdown nested
   - Mobile: card stack keeping ranking + cost breakdown visible without hidden tabs/accordions
3. **Dedicated Supporting Metadata Rail** (retention/ownership, stage provenance, fallback info)
4. **Shared Analysis UI Primitives** (`analysis-ui.tsx`)
   - Consistent evidence formatting across comparison → recommendation → affordability blocks
   - Reusable for future modules to maintain hierarchy

**Rationale:**
Preserve comparison → recommendation → affordability ordering while keeping fallback, quality, retention visible on all breakpoints. Table primary on desktop, mobile card stack avoids hiding critical costs or ranking.

**Consequences:**
- Comparison table coexists with mobile-first evidence stack
- Supporting metadata explicit and visible across breakpoints (no secondary navigation required)
- Future changes should reuse analysis UI primitives to maintain consistency
- Responsive design passes Lighthouse accessibility ≥ 85

---

## Landing Page Architecture

### Landing Page Information Architecture & Integration (Lambert)

**Status:** Proposed for Team Review  
**Date:** 2026-04-24  
**Author:** Lambert

**Decision:**
Build public landing page for batalla-ias homepage with hybrid information architecture:

**Proposed Landing IA Structure:**

1. **Hero** — "¿Tu hipoteca actual es la mejor oferta?" + evidence positioning
2. **Trust Scaffold** — 3 cards: "100+ mortgages analyzed", "Ranked by real cost", "Data stays in session"
3. **Headline & Lede** — "What You'll Discover" (positioning block)
4. **Breadth Signal** — 3-4 visual cards: Scenario Comparison, Savings & Break-Even, Affordability Status, [opt] Transparency
5. **Explanation Block** — Editorial 2-column: "Why Switches Matter" + "What Gets Compared" (list)
6. **Example/Stat Block** — "Recent Analysis" or case study data + "How It Works"
7. **Form Entry** — Progressive disclosure: "Start Your Analysis" with current form
8. **Secondary Content** — Expandable: "How We Calculate", "Privacy Model", "Technical Details"
9. **Footer** — Navigation, trust stamp

**Philosophy:**
- Top (Hero → Breadth): Trust, positioning
- Middle (Explanation → Examples): Education, social proof, risk transparency
- Bottom (Form → Footer): Conversion, advanced paths, credibility

**What It Solves:**
- **Gap 1:** No acquisition path (currently tool-only for aware visitors)
- **Gap 2:** No breadth signal (appears to be single feature, not ecosystem)
- **Gap 3:** No trust scaffolding (different philosophy from hipoteca-2 reference landing)
- **Gap 4:** No progressive entry (form too immediate for cold traffic)

**Dependencies & Constraints:**
- **Safe Now:** Landing IA document, React skeleton, copy outline, content strategy, mobile breakpoints
- **Wait For Redesign-002:** Hero color scheme, card token refinement, status badge styling, example data styling
- **Blocks Implementation:** `compare` endpoint (501), `affordability` endpoint (501), design token finalization

**Consequences:**
- battaglia-ias becomes acquirable homepage, not tool-only
- Preserves explanation-first DNA while borrowing hipoteca-2's trust architecture
- IA finalized now, styling deferred until redesign-002 brand locked
- Forms landing structure now; unblocks Parker/Hicks on backend endpoints

**Next Steps:**
1. **Sergio:** Approve landing IA structure + trust narrative choice + example data strategy
2. **Lambert:** Create `landing-ia.md` spec + component skeleton + copy outline
3. **Coordinator:** Schedule redesign-002 brand review + unblock compare/affordability endpoints
4. **Team:** Implement landing after redesign-002 tokens available + Parker endpoints live

---

### Mortgage Redesign Finish Gate (Hicks)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Hicks

**Decision:**
The mortgage redesign passes the finish gate. All quality blockers identified in v1 review have been resolved.

**Evidence:**
- **Heading Hierarchy:** `apps/web/src/components/data-quality-banner.tsx` now uses h2 section title with h3 subsections, preserving results-flow reading order (comparison → recommendation → affordability) without breaks.
- **E2E Coverage:** `apps/web/tests/e2e/mortgage-comparison.spec.ts` now verifies:
  - `local_preview` fallback visibility and honesty
  - Mobile-accessible result headings
  - Comparison table visibility on mobile
- **Repo Validation:** All integration tests pass:
  - `corepack pnpm typecheck`
  - `corepack pnpm test`
  - `corepack pnpm build`
  - `corepack pnpm --filter @batalla-ias/web test:e2e`

**Rationale:**
Finish gate ensures quality barriers are resolved before production integration. Two-phase review (v1: blockers, v2: validation) provides confidence that redesign artifact is complete and safe to integrate.

**Consequences:**
- Editorial Financial Desk redesign ready for backend API integration
- Frontend narrative tier is production-qualified
- Next phase: connect to `analyse` endpoint and affordability orchestration

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
- Earned skills are canonical patterns available to all agents
- Coordinator manages routing and skill attachment to spawn prompts

## Integration & Workflow

### Branch Integration Order (Ripley)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Ripley

**Decision:**
1. **Integrate branch 001 (MVP comparator) to main first.**
2. **Integrate branch 002 (redesign) second, rebased/merged onto main after 001.**
3. **Branch 003 remains plan-only; no merge to main.**

**Context:**
- Local working tree contains artifacts spanning specs 001/002/003 plus core code.
- Branch heads: 001 and 002 both at f14ee0f; 003 at 0202897; main at 94718e8.
- User instruction: integrate 001, then 002, while 003 remains plan-only.

**Rationale:**
Sequential integration ensures that core MVP code lands cleanly, then redesign-specific deltas build on top. Prevents merge conflicts and preserves commit lineage.

**Implications:**
- 001 and 002 share the same commit today; 002 has no divergence yet; avoid redundant merges.
- Any shared core code should land with 001, then 002 should carry redesign-specific deltas only.
- Branch 003 remains isolated for future planning cycle.

**Consequences:**
- MVP comparator available to main first; redesign follows
- Clear separation of concerns: core (001) → styling (002) → planning (003)
- Audit trail shows intentional workflow, not chaotic rebasing

---

## Rebase & Integration Safety

### Safe Rebase Protocol for Dirty Integration Branches (Ripley)

**Status:** Approved  
**Date:** 2026-04-24  
**Author:** Ripley

**Decision:**
When rebasing a dirty feature branch onto `main`, preserve truth in this order:

1. Create an explicit backup ref at the pre-rebase branch tip.
2. Stash local tracked + untracked work before rebasing.
3. Rebase the branch onto `main` without touching `main`.
4. Restore local work after the rebase and verify whether any stash paths were naturally absorbed by the new base.
5. Keep the safety stash until verification is complete if Git reports overlapping untracked paths.

**Rationale:**
A branch can carry local files that are still untracked there but already tracked on `main`. After rebase, stash restore may report `already exists, no checkout`; that is not automatic data loss if the rebased branch now contains the same content. Verification must compare the preserved stash state against the post-rebase worktree before dropping safety backups.

**Consequences:**
- Dirty branch rebases stay reversible.
- `main` stays untouched.
- Overlap between local untracked files and incoming tracked files is treated as a verification step, not as a reason to discard work.
