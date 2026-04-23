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

