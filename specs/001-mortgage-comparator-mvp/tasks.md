# Tasks: MVP de comparador y simulador de hipotecas

**Input**: Design documents from `/specs/001-mortgage-comparator-mvp/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Financial calculation, business-rule, affordability, privacy and security tests are MANDATORY for this feature and must be written before implementation work in each user story phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **API**: `apps/api/src/`, `apps/api/tests/`
- **Web**: `apps/web/src/`, `apps/web/tests/`
- **Domain**: `packages/domain/src/`, `packages/domain/tests/`
- **Docs**: `README.md`, `specs/001-mortgage-comparator-mvp/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the pnpm monorepo workspace and package boundaries required by the implementation plan.

- [ ] T001 Create root workspace scripts and shared commands in package.json
- [ ] T002 Create pnpm workspace package mapping for apps and packages in pnpm-workspace.yaml
- [ ] T003 [P] Create shared TypeScript compiler baseline for the monorepo in tsconfig.base.json
- [ ] T004 [P] Create Express API workspace package manifest with build/test scripts in apps/api/package.json
- [ ] T005 [P] Create React web workspace package manifest with Vite/Playwright scripts in apps/web/package.json
- [ ] T006 [P] Create domain workspace package manifest with Decimal.js and Vitest exports in packages/domain/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the domain, validation, privacy and API foundations that MUST exist before any user story implementation begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Implement AnalisisHipotecario root types, retention TTL fields, ownership token metadata and policy version in packages/domain/src/types/analysis.ts
- [ ] T008 [P] Implement EscenarioHipotecario and CosteAsociado types with source tracking in packages/domain/src/types/scenario.ts
- [ ] T009 [P] Implement Zod input schemas and contradiction detection for mortgage payloads in packages/domain/src/validation/analysis-input.ts
- [ ] T010 [P] Implement explainability primitives and trace-reference DTOs for user_provided/inferred/calculated values in packages/domain/src/explainability/explainable-value.ts
- [ ] T011 Implement exact decimal helpers and HALF_UP money formatting rules in packages/domain/src/formulas/decimal.ts
- [ ] T012 [P] Implement privacy, secure cookie/token ownership and retention middleware with redacted logging defaults in apps/api/src/middleware/privacy.ts
- [ ] T013 [P] Implement analysis repository for PostgreSQL persistence, token-hash ownership, 4h session-only expiry and 30-day save-analysis TTL in apps/api/src/modules/analyses/analysis-repository.ts
- [ ] T014 Implement Express app bootstrap and `/api/v1` analyses route registration in apps/api/src/app.ts
- [ ] T015 Implement DELETE `/api/v1/analyses/{analysisId}` retention cleanup flow in apps/api/src/routes/analyses.ts
- [ ] T016 [P] Add privacy, token-bound ownership, session retention, save-analysis TTL and delete cleanup integration coverage in apps/api/tests/integration/analysis-retention.test.ts

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Comparar escenarios hipotecarios (Priority: P1) 🎯 MVP

**Goal**: Permitir capturar una hipoteca actual y una oferta alternativa para devolver siempre los escenarios actual y alternativa sin bonificaciones, y añadir la alternativa con bonificaciones cuando exista, con ranking por coste total real.

**Independent Test**: Crear un análisis con hipoteca actual, oferta alternativa y costes completos, ejecutar la comparación y verificar que la API y la UI muestran siempre `current` y `alternative_without_bonus`, añaden `alternative_with_bonus` solo cuando existe, y exponen el desglose de costes, el coste total real, el coste final pagado, las diferencias frente al escenario actual y las referencias de trazabilidad.

### Mandatory Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [P] [US1] Add unit tests for amortización francesa, redondeo exacto y cuota estimada in packages/domain/tests/unit/mortgage-formulas.test.ts
- [ ] T018 [P] [US1] Add regression fixtures for ranking por coste total real y escenarios con y sin bonificaciones in packages/domain/tests/regression/comparison-scenarios.test.ts
- [ ] T019 [P] [US1] Add contract test for POST `/api/v1/analyses` and GET `/api/v1/analyses/{analysisId}` including `Set-Cookie` ownership semantics in apps/api/tests/contract/analyses-lifecycle.contract.test.ts
- [ ] T020 [P] [US1] Add contract test for POST `/api/v1/analyses/{analysisId}/compare` explainable response fields, trace references and cookie-bound access in apps/api/tests/contract/analyses-compare.contract.test.ts
- [ ] T021 [P] [US1] Add integration test for complete comparison flow with `complete` and `conditional_estimate` statuses plus explicit no-bonus coverage in apps/api/tests/integration/compare-analysis.test.ts
- [ ] T022 [P] [US1] Add Playwright MVP comparison journey for capture form and ranking table covering bonus and no-bonus offers in apps/web/tests/e2e/mortgage-comparison.spec.ts

### Implementation for User Story 1

- [ ] T023 [P] [US1] Implement ResultadoComparacion types, scenario difference DTOs and trace reference arrays in packages/domain/src/types/comparison.ts
- [ ] T024 [P] [US1] Implement `calculateEstimatedInstallment` with Decimal.js inputs in packages/domain/src/formulas/calculate-estimated-installment.ts
- [ ] T025 [P] [US1] Implement `calculateTotalRealCost` including interests, recurring costs and switch costs in packages/domain/src/formulas/calculate-total-real-cost.ts
- [ ] T026 [US1] Implement `rankScenariosByTotalCost` and data quality derivation rules for 2-scenario and 3-scenario comparisons in packages/domain/src/rules/rank-scenarios-by-total-cost.ts
- [ ] T027 [US1] Implement comparison explainability builder with included costs, assumptions, triggered rules and versioned trace references in packages/domain/src/explainability/build-comparison-explanation.ts
- [ ] T028 [P] [US1] Implement analysis creation and retrieval service for AnalisisHipotecario persistence defaults, token issuance and TTL metadata in apps/api/src/modules/analyses/create-analysis-service.ts
- [ ] T029 [P] [US1] Implement comparison service orchestration for EscenarioHipotecario calculation in apps/api/src/modules/analyses/compare-analysis-service.ts
- [ ] T030 [US1] Implement POST `/api/v1/analyses` and GET `/api/v1/analyses/{analysisId}` handlers with `analysis_session` cookie handling in apps/api/src/routes/analyses.ts
- [ ] T031 [US1] Implement POST `/api/v1/analyses/{analysisId}/compare` handler returning comparison evidence in apps/api/src/routes/analyses.ts
- [ ] T032 [P] [US1] Implement TanStack Query API client for create/get/compare requests in apps/web/src/services/analysis-api.ts
- [ ] T033 [P] [US1] Implement mortgage analysis capture form with retention selector and client validation in apps/web/src/features/mortgage-analysis/analysis-form.tsx
- [ ] T034 [P] [US1] Implement shared data quality banner for missing data and assumptions in apps/web/src/components/data-quality-banner.tsx
- [ ] T035 [P] [US1] Implement scenario comparison table with total real cost, final amount and deltas in apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx
- [ ] T036 [US1] Compose the mortgage comparison page using form, warnings and ranking table in apps/web/src/pages/mortgage-analysis-page.tsx

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Saber si compensa cambiar de hipoteca (Priority: P2)

**Goal**: Transformar la comparación en una recomendación clara sobre si compensa cambiar y cuándo se recuperan los gastos del cambio.

**Independent Test**: Partiendo de una comparación calculada con gastos de cambio completos, verificar que la API y la UI indican si compensa cambiar, muestran el ahorro neto esperado, explican los costes que influyen y muestran el punto de equilibrio o la ausencia del mismo dentro del horizonte analizado.

### Mandatory Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T037 [P] [US2] Add unit tests for ahorro acumulado y cálculo de break-even in packages/domain/tests/unit/break-even.test.ts
- [ ] T038 [P] [US2] Add regression tests for bonificaciones engañosas y prioridad por coste total real in packages/domain/tests/regression/switch-recommendation.test.ts
- [ ] T039 [P] [US2] Add contract test for recommendation payload, `targetScenarioType` and trace references on POST `/api/v1/analyses/{analysisId}/compare` in apps/api/tests/contract/switch-recommendation.contract.test.ts
- [ ] T040 [P] [US2] Add integration test for break-even reached and not reached scenarios in apps/api/tests/integration/switch-recommendation.test.ts
- [ ] T041 [P] [US2] Add Playwright recommendation journey for break-even timeline and blocker explanation in apps/web/tests/e2e/switch-recommendation.spec.ts

### Implementation for User Story 2

- [ ] T042 [P] [US2] Implement RecomendacionCambio types, `targetScenarioType`, `qualityStatus` and `policyVersion` in packages/domain/src/types/switch-recommendation.ts
- [ ] T043 [P] [US2] Implement `calculateBreakEven` for savings versus switch costs in packages/domain/src/formulas/calculate-break-even.ts
- [ ] T044 [US2] Implement switch-worth-it rules, blocking statuses and recommended action selection in packages/domain/src/rules/recommend-switch.ts
- [ ] T045 [US2] Implement recommendation explainability builder with break-even rationale, blockers and versioned trace references in packages/domain/src/explainability/build-switch-recommendation-explanation.ts
- [ ] T046 [US2] Extend comparison orchestration to persist ResultadoComparacion and RecomendacionCambio in apps/api/src/modules/analyses/compare-analysis-service.ts
- [ ] T047 [US2] Implement recommendation presenter for API responses prioritizing total real cost over installment and exposing `targetScenarioType` in apps/api/src/modules/analyses/recommendation-presenter.ts
- [ ] T048 [P] [US2] Implement recommendation panel with savings summary and break-even evidence in apps/web/src/features/mortgage-analysis/switch-recommendation-panel.tsx
- [ ] T049 [US2] Integrate recommendation panel and explanatory copy into the analysis page in apps/web/src/pages/mortgage-analysis-page.tsx

**Checkpoint**: User Stories 1 and 2 work independently, with comparison plus actionable switching recommendation.

---

## Phase 5: User Story 3 - Evaluar asequibilidad del hogar (Priority: P3)

**Goal**: Evaluar si el escenario objetivo recomendado por la comparación es asumible para el hogar según ingresos netos, obligaciones recurrentes y umbrales de endeudamiento.

**Independent Test**: Completar una comparación válida, enviar ingresos familiares y obligaciones recurrentes, y verificar que la API y la UI evalúan el escenario objetivo recomendado, muestran el ratio de endeudamiento, la clasificación `asumible`/`ajustada`/`no_asumible`, y usan `conditional_estimate` o bloqueo explícito cuando la calidad de datos no permite una salida definitiva.

### Mandatory Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T050 [P] [US3] Add unit tests for debt ratio thresholds 35% and 40% in packages/domain/tests/unit/affordability-rules.test.ts
- [ ] T051 [P] [US3] Add regression tests for ingresos variables, escenario recomendado y salidas condicionadas de asequibilidad in packages/domain/tests/regression/affordability-evaluation.test.ts
- [ ] T052 [P] [US3] Add contract test for POST `/api/v1/analyses/{analysisId}/affordability` using the recommended target scenario and trace references in apps/api/tests/contract/affordability.contract.test.ts
- [ ] T053 [P] [US3] Add integration test for asumible, ajustada, no_asumible plus `conditional_estimate`/blocked affordability quality states in apps/api/tests/integration/affordability.test.ts
- [ ] T054 [P] [US3] Add Playwright affordability journey covering recommended-target ratio explanation and warnings in apps/web/tests/e2e/affordability.spec.ts

### Implementation for User Story 3

- [ ] T055 [P] [US3] Implement PerfilFinancieroFamiliar and EvaluacionAsequibilidad types with quality-status separation from classification in packages/domain/src/types/affordability.ts
- [ ] T056 [P] [US3] Implement `calculateAffordability` with exact decimal ratio output in packages/domain/src/formulas/calculate-affordability.ts
- [ ] T057 [US3] Implement affordability classification and conditional/blocking rules without `insufficient_data` classification in packages/domain/src/rules/evaluate-affordability.ts
- [ ] T058 [US3] Implement affordability explainability builder with thresholds, assumptions and versioned trace references in packages/domain/src/explainability/build-affordability-explanation.ts
- [ ] T059 [US3] Implement affordability evaluation service for the recommendation target scenario in apps/api/src/modules/analyses/evaluate-affordability-service.ts
- [ ] T060 [US3] Implement POST `/api/v1/analyses/{analysisId}/affordability` handler without manual scenario selection in apps/api/src/routes/analyses.ts
- [ ] T061 [P] [US3] Implement affordability panel with household inputs and recommended-scenario classification evidence in apps/web/src/features/mortgage-analysis/affordability-panel.tsx
- [ ] T062 [US3] Integrate the post-recommendation affordability workflow and visible debt-ratio evidence into the analysis page in apps/web/src/pages/mortgage-analysis-page.tsx

**Checkpoint**: All three user stories are independently functional and testable.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Finish cross-story privacy, regression and documentation work for the MVP release.

- [ ] T063 [P] Add contract and integration coverage for GET/DELETE post-deletion behavior in apps/api/tests/contract/analysis-delete.contract.test.ts
- [ ] T064 [P] Add cross-story financial invariant regression suite for comparison, break-even and affordability in packages/domain/tests/regression/mvp-financial-invariants.test.ts
- [ ] T065 [P] Document workspace setup, required test suites and privacy-by-default behavior in README.md
- [ ] T066 [P] Refresh manual validation walkthrough and expected evidence for P1-P3 in specs/001-mortgage-comparator-mvp/quickstart.md
- [ ] T067 [P] Add minimal performance smoke validation for POST `/api/v1/analyses/{analysisId}/compare` asserting p95 < 500 ms over 30 comparisons and 10 concurrent requests in apps/api/tests/integration/compare-analysis.performance.test.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 → Phase 2**: Complete Setup before creating domain, API and web foundations.
- **Phase 2 → Phase 3-5**: Foundational work blocks every user story because all stories depend on shared decimal math, validation, privacy and route scaffolding.
- **Phase 3 → Phase 4**: US2 depends on US1 comparison outputs because recommendation builds on ranked scenarios and cost deltas.
- **Phase 4 → Phase 5**: US3 depends on US2 because the canonical affordability flow evaluates the recommendation target scenario.
- **Final Phase**: Runs after all desired user stories are complete.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after Foundational; no dependency on other user stories.
- **US2 (P2)**: Depends on US1 comparison engine and compare endpoint response shape.
- **US3 (P3)**: Depends on US2 because the affordability endpoint evaluates the scenario chosen by the switch recommendation, not a manually selected scenario.

### Within Each User Story

- Tests MUST be written and observed failing before implementation tasks.
- Domain types and formulas come before rules and explainability.
- API services come before route handlers.
- Web services and components come before page composition.
- Do not start a task in the same file as an unfinished predecessor.

### Parallel Opportunities

- Setup tasks marked **[P]** can run together after T001-T002.
- Foundational tasks **T008-T013** can be split across domain and API contributors once the workspace exists.
- In US1, tests **T017-T022** can run in parallel, then domain tasks **T023-T025** and web tasks **T032-T035** can be parallelized once API contracts stabilize.
- In US2, tests **T037-T041** can run together, while **T042-T043** and **T048** can be developed in parallel before integration tasks **T046-T049**.
- In US3, tests **T050-T054** can run together, while **T055-T056** and **T061** can be developed in parallel before integration tasks **T057-T062**.
- Final-phase tasks **T063-T067** are fully parallel.

---

## Parallel Example: User Story 1

```bash
# Write failing US1 tests together
Task: "T017 Add unit tests for amortización francesa in packages/domain/tests/unit/mortgage-formulas.test.ts"
Task: "T018 Add regression fixtures for ranking in packages/domain/tests/regression/comparison-scenarios.test.ts"
Task: "T019 Add contract test for create/get analysis in apps/api/tests/contract/analyses-lifecycle.contract.test.ts"
Task: "T020 Add contract test for compare analysis in apps/api/tests/contract/analyses-compare.contract.test.ts"

# Implement independent US1 files together after contracts are clear
Task: "T024 Implement calculateEstimatedInstallment in packages/domain/src/formulas/calculate-estimated-installment.ts"
Task: "T025 Implement calculateTotalRealCost in packages/domain/src/formulas/calculate-total-real-cost.ts"
Task: "T032 Implement API client in apps/web/src/services/analysis-api.ts"
Task: "T034 Implement data quality banner in apps/web/src/components/data-quality-banner.tsx"
```

## Parallel Example: User Story 2

```bash
# Write failing US2 tests together
Task: "T037 Add break-even unit tests in packages/domain/tests/unit/break-even.test.ts"
Task: "T038 Add misleading-bonification regression tests in packages/domain/tests/regression/switch-recommendation.test.ts"
Task: "T040 Add break-even integration tests in apps/api/tests/integration/switch-recommendation.test.ts"

# Implement independent US2 files together
Task: "T042 Implement RecomendacionCambio types in packages/domain/src/types/switch-recommendation.ts"
Task: "T043 Implement calculateBreakEven in packages/domain/src/formulas/calculate-break-even.ts"
Task: "T048 Implement recommendation panel in apps/web/src/features/mortgage-analysis/switch-recommendation-panel.tsx"
```

## Parallel Example: User Story 3

```bash
# Write failing US3 tests together
Task: "T050 Add affordability threshold unit tests in packages/domain/tests/unit/affordability-rules.test.ts"
Task: "T052 Add affordability contract test in apps/api/tests/contract/affordability.contract.test.ts"
Task: "T054 Add affordability Playwright journey in apps/web/tests/e2e/affordability.spec.ts"

# Implement independent US3 files together
Task: "T055 Implement affordability types in packages/domain/src/types/affordability.ts"
Task: "T056 Implement calculateAffordability in packages/domain/src/formulas/calculate-affordability.ts"
Task: "T061 Implement affordability panel in apps/web/src/features/mortgage-analysis/affordability-panel.tsx"
```

---

## Independent Test Criteria Summary

- **US1**: The system returns and renders the required scenario set for the offer (always current + alternative without bonus, plus alternative with bonus only when it exists) with exact-decimal installment, total real cost, final amount paid, cost breakdowns and ranking deltas versus current.
- **US2**: The system explains whether switching is worth it, shows savings versus switch costs, and reports the break-even month or explicit non-break-even outcome.
- **US3**: The system computes the debt ratio for the recommendation target scenario, classifies affordability by the 35% and 40% thresholds, and surfaces `conditional_estimate` or blocking warnings when data quality prevents a definitive output.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate the P1 independent test end-to-end with contract, integration and Playwright coverage.
5. Demo the comparison MVP before starting recommendation and affordability.

### Incremental Delivery

1. Deliver Setup + Foundational as the shared platform.
2. Deliver US1 as the first usable mortgage comparison increment.
3. Deliver US2 to convert comparison into a switching recommendation.
4. Deliver US3 to add household affordability safety checks.
5. Finish with Final Phase regression, deletion/privacy verification and docs refresh.

### Parallel Team Strategy

1. One developer handles domain formulas/rules, one handles API orchestration, one handles web UI once Phase 2 is complete.
2. Keep shared-file tasks (`apps/api/src/routes/analyses.ts`, `apps/web/src/pages/mortgage-analysis-page.tsx`) serialized.
3. Use [P] tasks to split work across domain, API tests and UI components without merge conflicts.

---

## Notes

- Every checklist item includes an exact file path and is ready for LLM execution.
- Setup, Foundational and Final Phase tasks intentionally omit story labels.
- User story tasks always include `[US1]`, `[US2]` or `[US3]` for traceability.
- The plan enforces mandatory tests for financial accuracy, business rules, affordability and privacy/security.
- Ranking must always use **total real cost**, never installment alone.
- Session-only retention and explicit deletion are part of the MVP definition, not optional hardening extras.
- `insufficient_data` deja de ser una clasificación de asequibilidad; la incertidumbre se expresa mediante `dataQualityStatus`.
- El escenario sin bonificaciones es una ruta explícita de aceptación, no un fallback implícito.
