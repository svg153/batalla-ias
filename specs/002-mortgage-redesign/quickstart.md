# Quickstart — implementing the mortgage redesign

## 1. Read the feature package first

Review these files in order:

1. `specs/002-mortgage-redesign/spec.md`
2. `specs/002-mortgage-redesign/plan.md`
3. `specs/002-mortgage-redesign/research.md`
4. `specs/002-mortgage-redesign/design.md`
5. `specs/002-mortgage-redesign/ux-study.md`
6. `specs/002-mortgage-redesign/contracts/ui-redesign-contract.md`
7. `specs/001-mortgage-comparator-mvp/spec.md`

## 2. Keep these non-negotiables

- do not rewrite mortgage semantics
- keep total real cost as the primary comparison signal
- preserve exact scenario-count honesty
- preserve fallback/local-preview honesty
- preserve retention/ownership metadata visibility
- keep affordability downstream from a valid comparison

## 3. Main implementation area

Primary files expected to change:

- `apps/web/src/pages/mortgage-analysis-page.tsx`
- `apps/web/src/features/mortgage-analysis/analysis-form.tsx`
- `apps/web/src/features/mortgage-analysis/scenario-comparison-table.tsx`
- `apps/web/src/features/mortgage-analysis/recommendation-block.tsx`
- `apps/web/src/features/mortgage-analysis/affordability-block.tsx`
- `apps/web/src/components/data-quality-banner.tsx`
- `apps/web/src/components/analysis-ui.tsx`
- `apps/web/src/components/supporting-metadata.tsx`
- `apps/web/src/styles.css`

Potential support files:

- new presentation components inside `apps/web/src/components` or `apps/web/src/features/mortgage-analysis`
- new component tests alongside redesigned blocks
- updated E2E tests in `apps/web/tests/e2e`

## 4. Recommended build shape

1. Refactor the page into explicit blocks:
   - editorial briefing header
   - capture worksheet
   - comparison evidence block
   - recommendation rationale block
   - affordability block
   - supporting metadata rail/footer
2. Keep existing result types as the UI data boundary.
3. Move repeated visual primitives into clearer shared styles/tokens.
4. Add responsive behavior that preserves essential evidence visibility on mobile.

## 5. Validation expectations

### Component

Add tests for:

- visible hierarchy by comparison / recommendation / affordability
- total-real-cost-first emphasis
- no-bonus two-scenario rendering
- switch-cost and linked-product visibility
- data-quality / fallback / retention metadata visibility

### E2E

Preserve and extend:

- `apps/web/tests/e2e/mortgage-comparison.spec.ts`

Add mobile and accessibility-focused checks around:

- essential evidence visibility by default
- recommendation explanation
- fallback honesty

### Accessibility

Add automated checks for:

- heading order
- keyboard navigation
- focus visibility
- semantic labels
- non-color-only state communication

## 6. Useful commands

From repo root:

- `corepack pnpm --filter @batalla-ias/web check`
- `corepack pnpm --filter @batalla-ias/web test`
- `corepack pnpm --filter @batalla-ias/web test:e2e`

Repository-wide:

- `corepack pnpm test`
- `corepack pnpm typecheck`

## 7. Definition of done

The redesign is ready when:

- the frontend in `apps/web` matches `design.md` and `ux-study.md`
- critical evidence remains visible on mobile and desktop
- semantic behavior from feature 001 is unchanged
- component, E2E, and accessibility regression coverage all pass
- reviewers can trace each critical UI behavior back to the feature artifacts
