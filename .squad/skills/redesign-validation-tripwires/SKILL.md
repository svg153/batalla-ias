---
name: "redesign-validation-tripwires"
description: "Test tripwires for mortgage analysis UI redesign — preserves logic integrity through visual changes"
domain: "quality, design-qa"
confidence: "high"
source: "earned — mortgage comparator MVP redesign validation research (2026-04-24)"
---

## Context

Design-heavy UI changes (visual refresh, layout reorganization) can accidentally break financial logic without code changes. This pattern locks the behavioral contracts before visual redesign work begins, ensuring style changes don't degrade honesty or explainability.

## The Risk

Redesign can silently break these without changing a single line of domain code:

| Fragility | Bad Redesign Move | Why It Breaks | Impact |
|-----------|------------------|--------------|--------|
| Bonus trap ranking | Highlight installment before total cost | User sees lower installment, ignores ranking | Wrong mortgage choice |
| Scenario count | Hard-code 3-column table for bonus variant | Shows empty bonus column when user omits bonus | Confusion, data dishonesty |
| Data quality visibility | Collapse conditional_estimate banner | User reads false certainty; acts on degraded data | Bad decision on uncertain inputs |
| Affordability prerequisite | Move affordability form above comparison | Form shows target scenario without calculation | Calculates against wrong scenario |
| Fallback honesty | Remove stage badge when API unavailable | User thinks fallback result is real API | False confidence in local preview |
| Retention metadata | Hide session expiry on mobile view | User doesn't know when data expires | Privacy violation, surprise purge |

## Patterns

### Before Redesign: Lock the Component Contracts

Write these tests **against the current implementation** as a green baseline. They will guide the redesign and catch regressions.

**1. Scenario Count Tripwire** (`ScenarioComparisonTable.test.tsx`)

```typescript
it('renders exactly 2 rows when user omits bonus variant', () => {
  const comparison = noBonusComparisonFixture.comparison;
  render(<ScenarioComparisonTable comparison={comparison} />);
  
  // Hard contract: no third row invented
  expect(screen.getAllByRole('row')).toHaveLength(3); // thead + 2 tbody
  expect(screen.queryByText('Oferta con bonificaciones')).not.toBeInTheDocument();
  expect(screen.getByText('No hay escenario con bonificaciones porque la oferta no lo definía.')).toBeInTheDocument();
});

it('renders exactly 3 rows when user includes bonus variant', () => {
  const comparison = bonusTrapComparisonFixture.comparison;
  render(<ScenarioComparisonTable comparison={comparison} />);
  
  expect(screen.getAllByRole('row')).toHaveLength(4); // thead + 3 tbody
  expect(screen.getByText('Oferta sin bonificaciones')).toBeInTheDocument();
  expect(screen.getByText('Oferta con bonificaciones')).toBeInTheDocument();
});
```

**2. Ranking Order Tripwire**

```typescript
it('ranks by total real cost, not installment', () => {
  const comparison = bonusTrapComparisonFixture.comparison;
  render(<ScenarioComparisonTable comparison={comparison} />);
  
  const rows = screen.getAllByRole('row').slice(1); // skip thead
  
  // First row = alternative_without_bonus (lowest total cost)
  expect(rows[0]).toHaveTextContent('Oferta sin bonificaciones');
  expect(rows[0]).toHaveTextContent('€23,000.00'); // total cost
  
  // Second row = alternative_with_bonus (higher total, lower installment trap)
  expect(rows[1]).toHaveTextContent('Oferta con bonificaciones');
  expect(rows[1]).toHaveTextContent('€23,850.00'); // higher total
  expect(rows[1]).toHaveTextContent('€890.00');    // lower installment (the trap)
});
```

**3. Data Quality Degradation Tripwire** (`DataQualityBanner.test.tsx`)

```typescript
it('shows conditional_estimate banner when data quality degraded', () => {
  const missingData = ['Cuota actual declarada'];
  const assumptions = ['Cuota estimada por diferencia'];
  
  render(
    <DataQualityBanner 
      status="conditional_estimate"
      missingData={missingData}
      assumptions={assumptions}
    />
  );
  
  expect(screen.getByRole('heading', { name: 'Estimación condicionada' })).toBeInTheDocument();
  expect(screen.getByText('Cuota actual declarada')).toBeInTheDocument();
  expect(screen.getByText('Cuota estimada por diferencia')).toBeInTheDocument();
});

it('hides data quality banner when status is complete', () => {
  const { container } = render(
    <DataQualityBanner status="complete" missingData={[]} assumptions={[]} />
  );
  
  expect(container.querySelector('.quality-banner--complete')).toBeInTheDocument();
  expect(container.querySelector('ul')).not.toBeInTheDocument(); // no lists
});
```

**4. Affordability Prerequisite Tripwire** (`AffordabilityPanel.test.tsx`)

```typescript
it('returns UnavailablePanel when affordability is undefined', () => {
  render(
    <AffordabilityPanel affordability={undefined} stage={{ label: 'Asequibilidad', detail: 'Pendiente' }} />
  );
  
  expect(screen.getByText('Asequibilidad pendiente')).toBeInTheDocument();
  expect(screen.queryByText('Ratio de endeudamiento')).not.toBeInTheDocument();
});

it('only calculates for recommendation target scenario', () => {
  const affordability = affordabilityFixture.affordability;
  
  render(<AffordabilityPanel affordability={affordability} stage={...} />);
  
  // UI must show which scenario was evaluated, not allow user override
  expect(screen.getByText('Oferta sin bonificaciones')).toBeInTheDocument();
  expect(screen.getByText('31.08%')).toBeInTheDocument(); // ratio
});
```

**5. Fallback Honesty Tripwire** (E2E in `mortgage-comparison.spec.ts`)

```typescript
test('marks fallback stages with local_preview source, not api', async ({ page }) => {
  // Mock API returning 501 Not Implemented
  await page.route('**/api/v1/analyses/*/compare', async (route) => {
    await route.fulfill({ status: 501, body: JSON.stringify({ code: 'feature_not_implemented' }) });
  });
  
  await page.goto('/');
  await page.getByRole('button', { name: 'Ver coste real' }).click();
  
  // Stage badge must show "local_preview", not "api"
  const stageBadge = page.locator('.stage-badge--local_preview');
  await expect(stageBadge).toBeVisible();
  
  // Notice must explain fallback
  const notice = page.getByText('Comparación aún no soportada en el backend');
  await expect(notice).toBeVisible();
});
```

**6. Retention Visibility Tripwire** (Component + E2E)

```typescript
it('shows expiry and purge dates in OwnershipPanel', () => {
  const analysis = createdAnalysisFixture.analysis;
  render(<OwnershipPanel analysis={analysis} experience={...} />);
  
  expect(screen.getByText('Caduca')).toBeInTheDocument();
  expect(screen.getByText('2026-04-24 01:00')).toBeInTheDocument();
  
  expect(screen.getByText('Purga después')).toBeInTheDocument();
  expect(screen.getByText('2026-04-24 01:15')).toBeInTheDocument();
});
```

### During Redesign: Run Tripwires on Every Layout Change

Each visual commit must pass:

```bash
# Component tests (unit)
corepack pnpm --filter @batalla-ias/web test -- --ui

# E2E tests (integration)
corepack pnpm --filter @batalla-ias/web exec playwright test --ui

# Lighthouse (accessibility)
corepack pnpm --filter @batalla-ias/web exec playwright test --grep="accessibility"
```

### After Redesign: Finish Gate Validation

Before merge approval, Hicks runs:

```bash
# Full repo validation
corepack pnpm build
corepack pnpm --filter @batalla-ias/domain test
corepack pnpm --filter @batalla-ias/api test
corepack pnpm --filter @batalla-ias/web test
corepack pnpm --filter @batalla-ias/web exec playwright test mortgage-comparison.spec.ts

# Verify tripwire tests all green
corepack pnpm --filter @batalla-ias/web test -- --reporter=verbose
```

## Examples

**✅ Good Redesign:**
- Moves affordability panel to sidebar (layout) → component tests catch it renders only when defined (contract preserved)
- Relayout comparison table columns → tripwire test verifies row count unchanged, ranking order unchanged
- Add visual "best cost" badge to winner row → tests check row 0 gets badge class

**❌ Bad Redesign (Caught by Tripwires):**
- Hard-code table for 3 scenarios → bonus scenario tripwire fails (2-row case breaks)
- Hide bonus explanation in collapsible → ranking tripwire catches: "Productos vinculados" text not visible
- Move affordability form above comparison → prerequisite tripwire fails: affordability renders when undefined
- Show stage badge only on error → fallback tripwire fails: notice missing when API unavailable

## Anti-Patterns

- Treating component tests as optional after UI reflow ("tests are for feature logic, not layout")
- Skipping E2E after visual changes ("everything looks right visually")
- Renaming UI copy without updating tripwire assertions (test breaks but catches intent change)
- Removing stage badge/notice "for cleaner UI" without updating contract validation

## Integration with Finish Gate

This pattern pairs with `.squad/skills/integration-finish-gate/SKILL.md`:

1. **Before:** Write tripwire tests, all green
2. **During:** Redesign with tests as green baseline
3. **After:** Hicks runs finish gate, checks tripwires still green + no stale mocks
4. **Sign-Off:** All tripwires pass, full build/typecheck/test passes, E2E passes

## Reusable Across Projects

Any UI redesign touching:
- **Financial outputs** (compare, recommend, affordability)
- **Fallback/degraded states** (loading, error, offline)
- **Privacy/retention metadata** (session, expiry, access)

Should adopt this tripwire pattern before visual work begins.
