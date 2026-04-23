---
description: "Task list for mortgage redesign feature implementation"
---

# Tasks: mortgage redesign

**Input**: Design documents from `/specs/002-mortgage-redesign/`
**Prerequisites**: plan.md, spec.md, design.md, ux-study.md, research.md, data-model.md, contracts/ui-redesign-contract.md

**Tests**: Component, E2E, and accessibility tests are MANDATORY for this redesign to preserve existing semantics and prevent regressions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a pnpm monorepo with:
- **Web app**: `apps/web/src/` for frontend
- **Domain**: `packages/domain/src/` for mortgage semantics (DO NOT MODIFY)
- **Tests**: `apps/web/tests/` for E2E, component tests alongside source files

---

## Phase 1: Documentation Lock & Preparation

**Purpose**: Ensure all design artifacts are approved and ready before implementation begins

- [ ] T001 Review and lock design.md in specs/002-mortgage-redesign/design.md
- [ ] T002 Review and lock ux-study.md in specs/002-mortgage-redesign/ux-study.md
- [ ] T003 Review and lock contracts/ui-redesign-contract.md in specs/002-mortgage-redesign/contracts/ui-redesign-contract.md
- [ ] T004 Verify that design artifacts cover Editorial Financial Desk direction, mobile visibility defaults, and accessibility requirements

**Checkpoint**: All design documentation approved - frontend implementation can begin

---

## Phase 2: Foundational Refactoring (Blocking Prerequisites)

**Purpose**: Core style and structure changes that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Extract design tokens from design.md into apps/web/src/styles.css (palette, typography, spacing)
- [ ] T006 [P] Define shared component primitives for editorial briefing headers in apps/web/src/components/editorial-header.tsx
- [ ] T007 [P] Define shared responsive utility hooks for mobile visibility in apps/web/src/hooks/use-mobile-visibility.ts
- [ ] T008 Refactor apps/web/src/pages/mortgage-analysis-page.tsx to use explicit section blocks (comparison, recommendation, affordability, metadata)
- [ ] T009 [P] Create accessibility testing utilities in apps/web/tests/utils/a11y-helpers.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Entender la comparación sin perder evidencia (Priority: P1) 🎯 MVP

**Goal**: Redesign the comparison section so users can quickly understand scenario ranking by total real cost without losing supporting evidence

**Independent Test**: Load a valid analysis with current mortgage, base offer, and bonus variant; verify the comparison section shows honest scenario count, ranking by total real cost, cost breakdown, and data quality status without requiring additional navigation

### Component Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Component test for comparison section hierarchy and scenario-count honesty in apps/web/src/features/mortgage-analysis/scenario-comparison-table.test.tsx
- [ ] T011 [P] [US1] Component test for total-real-cost-first emphasis vs monthly installment in apps/web/src/features/mortgage-analysis/scenario-comparison-table.test.tsx
- [ ] T012 [P] [US1] Component test for visible cost breakdown including linked products and switch costs in apps/web/src/features/mortgage-analysis/scenario-comparison-table.test.tsx
- [ ] T013 [P] [US1] Component test for two-scenario rendering when no bonus variant exists in apps/web/src/features/mortgage-analysis/scenario-comparison-table.test.tsx
- [ ] T014 [P] [US1] Component test for data quality banner integration with comparison evidence in apps/web/src/components/data-quality-banner.test.tsx

### Implementation for User Story 1

- [ ] T015 [US1] Update apps/web/src/components/data-quality-banner.tsx to increase hierarchy and linkage to recommendation risk per design.md
- [ ] T016 [US1] Redesign apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx as the primary evidence surface with editorial density and sticky headers
- [ ] T017 [US1] Add mobile card-stack alternative to comparison table in apps/web/src/features/mortgage-analysis/scenario-comparison-mobile.tsx
- [ ] T018 [US1] Implement visible trace references and triggered rules display in apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx
- [ ] T019 [US1] Add responsive behavior preserving essential evidence visibility by default per ux-study.md mobile rules in apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx
- [ ] T020 [US1] Integrate redesigned comparison section into apps/web/src/pages/mortgage-analysis-page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - comparison section shows honest evidence with editorial hierarchy

---

## Phase 4: User Story 2 - Leer la recomendación y la asequibilidad con honestidad en cualquier dispositivo (Priority: P2)

**Goal**: Redesign recommendation and affordability sections to maintain financial honesty and accessibility across all devices

**Independent Test**: Load analyses with different recommendation states (positive, blocked, conditional); verify recommendation shows net savings, break-even, switch costs together and affordability remains downstream with visible prerequisites

### Component Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Component test for recommendation evidence co-visibility (net savings + break-even + switch costs) in apps/web/src/features/mortgage-analysis/recommendation-block.test.tsx
- [ ] T022 [P] [US2] Component test for affordability prerequisite ordering and scenario identification in apps/web/src/features/mortgage-analysis/affordability-block.test.tsx
- [ ] T023 [P] [US2] Component test for blocked/conditional state visibility in recommendation in apps/web/src/features/mortgage-analysis/recommendation-block.test.tsx
- [ ] T024 [P] [US2] Component test for mobile visibility of essential recommendation evidence in apps/web/src/features/mortgage-analysis/recommendation-block.test.tsx

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create recommendation evidence block component in apps/web/src/features/mortgage-analysis/recommendation-block.tsx with co-visible net savings, break-even, and switch costs
- [ ] T026 [P] [US2] Create affordability evidence block component in apps/web/src/features/mortgage-analysis/affordability-block.tsx with explicit scenario identification and threshold visibility
- [ ] T027 [US2] Integrate recommendation block into apps/web/src/pages/mortgage-analysis-page.tsx immediately after comparison section
- [ ] T028 [US2] Integrate affordability block into apps/web/src/pages/mortgage-analysis-page.tsx as downstream evaluation after recommendation
- [ ] T029 [US2] Implement responsive mobile behavior for recommendation and affordability blocks preserving essential evidence visibility in apps/web/src/features/mortgage-analysis/recommendation-block.tsx and apps/web/src/features/mortgage-analysis/affordability-block.tsx
- [ ] T030 [US2] Add keyboard navigation and focus management for recommendation and affordability sections in apps/web/src/pages/mortgage-analysis-page.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - comparison, recommendation, and affordability maintain honesty and accessibility

---

## Phase 5: User Story 3 - Gobernar el rediseño con documentación reusable y ejecución alineada (Priority: P3)

**Goal**: Ensure the delivered UI implementation is traceable to approved design artifacts and maintains documented standards

**Independent Test**: Compare implemented UI against design.md, ux-study.md, and ui-redesign-contract.md; verify all critical sections, visibility rules, and semantic contracts are satisfied

### E2E and Accessibility Tests for User Story 3 ⚠️

- [ ] T031 [P] [US3] E2E test for bonus-trap ranking preservation in apps/web/tests/e2e/mortgage-comparison.spec.ts
- [ ] T032 [P] [US3] E2E test for two-scenario state when no bonus variant in apps/web/tests/e2e/mortgage-comparison.spec.ts
- [ ] T033 [P] [US3] E2E test for conditional-estimate visibility throughout flow in apps/web/tests/e2e/mortgage-comparison.spec.ts
- [ ] T034 [P] [US3] E2E test for fallback/local-preview honesty in apps/web/tests/e2e/mortgage-comparison.spec.ts
- [ ] T035 [P] [US3] E2E test for retention/ownership metadata visibility in apps/web/tests/e2e/mortgage-comparison.spec.ts
- [ ] T036 [P] [US3] E2E test for mobile viewport evidence visibility defaults in apps/web/tests/e2e/mortgage-comparison-mobile.spec.ts
- [ ] T037 [P] [US3] Automated accessibility check for comparison section in apps/web/tests/a11y/comparison.spec.ts
- [ ] T038 [P] [US3] Automated accessibility check for recommendation section in apps/web/tests/a11y/recommendation.spec.ts
- [ ] T039 [P] [US3] Automated accessibility check for affordability section in apps/web/tests/a11y/affordability.spec.ts
- [ ] T040 [P] [US3] Automated accessibility check for keyboard navigation across all sections in apps/web/tests/a11y/keyboard-nav.spec.ts

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create supporting metadata rail/footer component in apps/web/src/components/supporting-metadata.tsx for retention, ownership, expiry, purge, and traceability
- [ ] T042 [P] [US3] Convert editorial briefing header in apps/web/src/pages/mortgage-analysis-page.tsx from marketing hero to compact orientation header per design.md
- [ ] T043 [P] [US3] Refactor capture form in apps/web/src/features/mortgage-analysis/analysis-form.tsx with analyst-worksheet hierarchy and stronger section grouping
- [ ] T044 [US3] Integrate supporting metadata component into apps/web/src/pages/mortgage-analysis-page.tsx as visible rail/footer across all result states
- [ ] T045 [US3] Add semantic heading structure and ARIA labels throughout apps/web/src/pages/mortgage-analysis-page.tsx per accessibility contract
- [ ] T046 [US3] Implement non-color-only state communication for blocked/conditional/complete states in apps/web/src/features/mortgage-analysis/ components
- [ ] T047 [US3] Add visible focus indicators and keyboard navigation support in apps/web/src/styles.css

**Checkpoint**: All user stories should now be independently functional - complete redesign is traceable to approved artifacts and validated

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories and ensure delivery quality

- [ ] T048 [P] Add design token documentation comments in apps/web/src/styles.css mapping to design.md sections
- [ ] T049 [P] Review and refactor shared component styles for consistency in apps/web/src/styles.css
- [ ] T050 Code cleanup and remove unused components/styles from pre-redesign in apps/web/src/
- [ ] T051 Performance audit for redesigned page ensuring no regressions in comparison responsiveness
- [ ] T052 [P] Add implementation notes to specs/002-mortgage-redesign/quickstart.md documenting actual component structure and validation commands
- [ ] T053 Cross-browser testing on Chrome, Firefox, Safari for mobile and desktop viewports
- [ ] T054 [P] Verify all acceptance scenarios from spec.md are covered by component and E2E tests
- [ ] T055 Final visual review against design.md anti-patterns (no glossy hero, no hidden evidence, no tooltip-only critical info)
- [ ] T056 Run full test suite and validate all mortgage semantics from feature 001 remain unchanged

---

## Dependencies & Execution Order

### Phase Dependencies

- **Documentation Lock (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Phase 2
  - User Story 2 (P2) can start after Phase 2 (may integrate with US1 but independently testable)
  - User Story 3 (P3) can start after Phase 2 (validates US1 and US2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Comparison section redesign
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Recommendation & affordability redesign (integrates with US1 visually)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Governance & validation (validates US1 & US2 implementation)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Component refactoring before page integration
- Desktop implementation before responsive mobile variants
- Core evidence visibility before polish and animations
- Story complete and validated before moving to next priority

### Parallel Opportunities

- All documentation lock tasks (T001-T004) can review concurrently
- All foundational tasks marked [P] can run in parallel (T006-T007, T009 within Phase 2)
- Once Foundational phase completes:
  - User Story 1 tests (T010-T014) can all run in parallel
  - User Story 2 tests (T021-T024) can all run in parallel
  - User Story 3 tests (T031-T040) can all run in parallel
- User Story 2 component creation (T025-T026) can run in parallel
- User Story 3 component creation (T041-T043, T046) can run in parallel
- Polish tasks marked [P] (T048-T049, T052, T054) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all component tests for User Story 1 together:
Task: "Component test for comparison section hierarchy" (T010)
Task: "Component test for total-real-cost-first emphasis" (T011)
Task: "Component test for visible cost breakdown" (T012)
Task: "Component test for two-scenario rendering" (T013)
Task: "Component test for data quality banner integration" (T014)

# After tests pass, launch parallel implementation where safe:
Task: "Update data quality banner" (T015)
Task: "Redesign comparison table" (T016)
Task: "Add mobile card-stack alternative" (T017)
# Then sequential: T018, T019, T020 (depend on T016-T017)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Documentation Lock
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (comparison redesign)
4. **STOP and VALIDATE**: Test comparison section independently against design.md and ui-redesign-contract.md
5. Demo comparison redesign for stakeholder approval

### Incremental Delivery

1. Complete Documentation Lock + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo (MVP: honest comparison with editorial hierarchy!)
3. Add User Story 2 → Test independently → Demo (recommendation + affordability honesty)
4. Add User Story 3 → Test independently → Demo (full governance + validation)
5. Complete Polish → Final delivery
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Documentation Lock + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (comparison section)
   - Developer B: User Story 2 (recommendation + affordability)
   - Developer C: User Story 3 (supporting metadata + validation)
3. Stories complete and integrate independently with merge coordination

---

## Notes

- **[P] tasks** = different files, no dependencies, safe to parallelize
- **[Story] label** maps task to specific user story for traceability back to spec.md
- Each user story should be independently completable and testable
- **DO NOT modify** packages/domain/src/ - all mortgage semantics are source-of-truth from feature 001
- **Verify tests FAIL** before implementing each component
- **Mobile-first**: Essential evidence must be visible by default, not hidden in accordions/tooltips
- **Accessibility-first**: Every state must communicate beyond color alone
- **Traceability**: Every UI change must map back to design.md, ux-study.md, or ui-redesign-contract.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

- **Total Tasks**: 56
- **Tasks per User Story**:
  - US1 (Comparison): 11 tasks (5 tests + 6 implementation)
  - US2 (Recommendation & Affordability): 10 tasks (4 tests + 6 implementation)
  - US3 (Governance & Validation): 17 tasks (10 tests + 7 implementation)
- **Setup & Foundation**: 9 tasks
- **Polish**: 9 tasks

**Parallelization Potential**: 28 tasks marked [P] can run in parallel within their phases

**Critical Path**:
1. Documentation Lock (4 tasks) → 
2. Foundational (5 tasks, some parallel) → 
3. User Story 1 tests (5 parallel) → US1 implementation (6 sequential) → 
4. User Story 2 integration → 
5. User Story 3 validation → 
6. Polish

**Suggested MVP Scope**: Phases 1-3 (Documentation Lock + Foundational + User Story 1) = 20 tasks
- Delivers: Honest comparison section with editorial hierarchy, mobile visibility, and validated evidence
- Independent test: Load analysis, verify comparison clarity without losing cost evidence
