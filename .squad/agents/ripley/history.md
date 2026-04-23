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

**Coordinator Recommendations Approved:**
1. Auto-route final validation to Hicks after backend+frontend convergence
2. Require contract-lock preflight for cross-cutting privacy/retention/recommendation features
3. Load all three skills into normal coordinator routing workflow

**Impact:** Future iterations have explicit convergence gates, contract safety checks, and honest fallback patterns baked into routing
