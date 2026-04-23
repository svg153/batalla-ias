# Project Context

- **Owner:** Sergio Valverde
- **Project:** batalla-ias
- **Stack:** TypeScript monorepo with React, Express, Decimal.js, PostgreSQL, Vitest, Playwright
- **Created:** 2026-04-23T20:09:48Z

## Learnings

- Project starts from Spec Kit artifacts for `001-mortgage-comparator-mvp`.
- Constitution prioritizes exactitud financiera, explicabilidad, privacidad y trazabilidad de reglas.
- El MVP queda alineado con propiedad por token opaco `analysis_session`, TTL de 4 horas por inactividad para `session_only` y 30 días máximos para `save_analysis`.
- La asequibilidad ya no usa `insufficient_data` como clasificación: el flujo canónico evalúa el escenario objetivo recomendado y expresa incertidumbre mediante `dataQualityStatus`.
- Rediseños de esta web deben tratarla como una mesa de análisis para decidir subrogación/cambio, no como landing comercial ni simulador decorativo.
- El lock de rediseño preserva cuatro verdades de producto: ranking por coste total real, escenario bonificado solo si existe explícitamente, asequibilidad solo tras comparación válida sobre el escenario objetivo, y visibilidad de retención/acceso/fallbacks/calidad.
- Rutas clave para cualquier redesign review: `apps/web/src/pages/mortgage-analysis-page.tsx`, `apps/web/src/features/mortgage-analysis/analysis-form.tsx`, `apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx`, `apps/web/src/styles.css`, `specs/001-mortgage-comparator-mvp/{spec,plan,research,data-model,quickstart}.md`.
- El banner de calidad de datos debe usar jerarquía de heading alineada con el flujo de resultados (h2 para estado y h3 para subsecciones) en `apps/web/src/components/data-quality-banner.tsx`.
- La cobertura E2E del redesign incluye fallback/local_preview visible y evidencia accesible en móvil en `apps/web/tests/e2e/mortgage-comparison.spec.ts`.

## 2026-04-23 — Frontend Retention Semantics Live

**Session:** lambert-ui-integration (2026-04-23T20:55:13Z)

Frontend now displays Ripley's retention metadata:
✓ Retention copy backend-driven (not hardcoded)
✓ Session-only vs. save_analysis distinction visible to user
✓ TTL and purge semantics honest in UI copy
✓ Cookie-based ownership enforced at all data access points

## 2026-04-23 — Squad Retrospective & Self-Improvement

**Session:** ripley-squad-improvements

What worked:
- Closing contract gaps early let Parker, Lambert, Bishop and Hicks move in parallel without re-litigating core rules.
- Honest fallbacks kept the product truthful while backend durability and integration matured.
- Final repo-level reviewer convergence caught stale assumptions that package-local validation would have missed.

What Ripley codified for next time:
- New reusable skills: `contract-lock`, `honest-fallbacks`, `integration-finish-gate`
- Recommend coordinator auto-spawn a final Hicks convergence pass whenever UI + API land on the same feature
- Treat root validation plus live contract alignment as the real finish line, not per-package green checks

## Skills Earned & Coordinator Improvements

**Date:** 2026-04-23  
**Crystallized into:**
- `.squad/skills/contract-lock/SKILL.md` — Non-negotiable contracts locked before fan-out
- `.squad/skills/honest-fallbacks/SKILL.md` — Degradation truthfulness guaranteed
- `.squad/skills/integration-finish-gate/SKILL.md` — Repo-level convergence validation

## 2026-04-24 — Mortgage Redesign Revision & Finish Gate Approval

**Session:** mortgage-redesign-finish-gate-v2 (2026-04-24T22:26:01Z)

Revised Editorial Financial Desk redesign to resolve Hicks' finish gate v1 blockers:

**Fixed:**
✓ Heading hierarchy — `data-quality-banner.tsx` now uses h2 section title + h3 subsections, preserving results-flow reading order
✓ E2E coverage — `mortgage-comparison.spec.ts` now verifies `local_preview` honesty and mobile result headings
✓ Repo validation — All integration tests pass (typecheck, test, build, e2e)

**Outcome:** Hicks approved redesign for production integration. Editorial Desk now ready to connect to backend APIs.

**Coordinator Recommendations Approved:**
1. Auto-route final validation to Hicks after backend+frontend convergence
2. Require contract-lock preflight for cross-cutting privacy/retention/recommendation features
3. Load all three skills into normal coordinator routing workflow

**Impact:** Future iterations have explicit convergence gates, contract safety checks, and honest fallback patterns baked into routing

## 2026-04-24 — Landing Page Strategy & Business Model Validation

**Session:** ripley-landing-validation

Analyzed hipoteca-2 landing approach against batalla-ias specs 001/002. Key findings:

- **hipoteca-2 landing** uses education-first funnel: ReportGenerator (PDF leadgen) → 4 tabs (¿Qué cuota?, ¿Puedo pagarlo?, ¿Compro o alquilo?, ¿Caro alquiler?) → Comparador CTA
- **Component reuse opportunity:** MonthlyPaymentCard, AffordabilityCard, BuyVsRentCard, RentAnalysisCard already exist in battle-ias codebase
- **Business risk mitigated by progressive disclosure:** New users enter via education tabs, not deep analysis form
- **Dependency analysis:** Landing requires zero API changes; local calc first, honest fallback when backend ready
- **Decision:** Fold landing into spec 002 (not spec 003) — aligns with "Editorial Financial Desk" + "explanation-first UI" mandate
- **Proposed structure:** `/` (landing) → `/analisis` (existing comparator); landing docs: landing-design.md + landing-ux-study.md
- **Team proposal saved** to `.squad/decisions/inbox/ripley-landing-validation.md` awaiting consensus

Key tripwires for landing:
- Mobile tabs must be usable (not collapsed by default); matches spec 002 mobile equality
- ReportGenerator PDF must not overstate capability vs actual comparador
- CTA hierarchy must be clear: ReportGenerator (low friction) → tabs (education) → Comparador (full analysis)

## 2026-04-24 — Spec Kit Extension Fit for batalla-ias

**Session:** ripley-spec-kit-recommendation

- Hechos confirmados al revisar `github/spec-kit`: el catálogo oficial de integraciones incluye `copilot` y otros agentes, mientras que el catálogo upstream instalable de extensiones está vacío por diseño y la exploración real ocurre en `extensions/catalog.community.json`.
- El proyecto local ya está inicializado con Spec Kit + Copilot (`.specify/integration.json`) y usa hooks del built-in `git` en `.specify/extensions.yml`, pero no tiene extensiones comunitarias instaladas.
- El gap más claro del repo no es de bootstrap ni de orquestación: en `.github/workflows/` solo hay automatizaciones de Squad; no existe una puerta de cumplimiento spec→code/test para producto.
- Recomendación de Ripley: priorizar `spec-kit-ci-guard` como siguiente adopción, con `spec-kit-red-team` como segunda capa para features nuevas de dinero/privacidad/contratos; evitar por ahora `agent-assign`, `conduct` y `maqa` porque duplican o compiten con Squad.
- Puntos de referencia clave para esta evaluación: `.specify/extensions.yml`, `.specify/memory/constitution.md`, `.github/workflows/`, `specs/001-mortgage-comparator-mvp/plan.md`, `.squad/routing.md`.

**Outcome:** ✅ Decision merged to `.squad/decisions.md` (Spec Kit Extension Adoption Strategy section)

## 2026-04-24 — Redesign Contract Lock for Mortgage Comparator

**Session:** ripley-redesign-lock

Locked the redesign as a **decision desk for mortgage switching analysis** with five immutable semantic rules before any visual work begins:

1. **Ancla de Decisión:** Total real cost primary signal; recommendation exposes: net savings, break-even, switching costs in one view
2. **Jerarquía de Contenido:** Structured capture and three-panel results (comparison → recommendation → affordability)
3. **Semántica de Escenarios:** Always current vs. alternative_without_bonus; bonus only if explicitly offered; affordability on recommendation target only
4. **Verdad Visible:** Cannot hide switch costs, linked products, assumptions, data gaps, fallback mode, ownership/retention, formula traceability
5. **Forma de Experiencia:** Evidence-dense, responsive, not behind tabs/accordions/tooltips

**Fragile Areas Flagged for Hicks Validation:**
- Bonus trap ranking (installment ≠ total cost)
- Data quality visibility (conditional_estimate not collapsed)
- Affordability prerequisite (comparison required first)
- Fallback clarity (stage badge + notice)
- Retention honesty (expiry/purge accessible)
- Scenario count (exactly 2 when no bonus)

**Acceptance Gate:** Redesign spec must prove: ranking by cost, no implicit bonuses, affordability locked to recommendation, quality/retention/fallback visible, no secondary navigation hiding evidence.

**Consequence:** If any artifact contradicts this lock, lock prevails; escalate to Sergio before implementation.

**Outcome:** ✅ Decision merged to `.squad/decisions.md` (Redesign Contract Lock section)

## 2026-04-24 — Branch Integration & Workflow Execution

**Session:** scribe-orchestration (2026-04-23T23:08:06Z)

**Outcome:** Branch integration strategy from this session was materialized and validated:
- **Branch 001** (mortgage-comparator-mvp): Committed as d0a3528, merged to main as f82bda4 ✓
- **Branch 002** (mortgage-redesign): Committed as 658d855, merged to main as 4fb25c7 ✓
- **Branch 003** (landing-acquisition): Plan-only commit 620224e, intentionally NOT merged ✓
- Residual working tree mixed changes preserved for review

**Decision Recorded:** Branch Integration Order decision merged to canonical `.squad/decisions.md`

**Validation Notes:** Isolated worktree validation encountered missing `tsc` tool (non-blocking); all merge operations succeeded.

**Impact:** MVP and redesign now on main; landing acquisition planning remains isolated pending team review.

## 2026-04-23 — Safe Rebase of Branch 003 onto main

**Session:** ripley-safe-rebase

- Rebased `003-landing-acquisition-flow` from pre-rebase tip `899b4e2` onto `main` `4fb25c7` without modifying `main`
- Created safety ref `refs/backup/ripley/003-safe-rebase-20260423T231604Z` before history rewrite
- Preserved local tracked + untracked work via stash before rebasing; restored visible dirty state after rebase
- Verified an important integration nuance: several paths that were untracked on 003 were already tracked on `main`, so stash restore reported `already exists, no checkout`; comparison showed the rebased worktree already matched the stashed content, so no product work was lost
- Kept the primary safety stash in place until final verification remains easy to audit
