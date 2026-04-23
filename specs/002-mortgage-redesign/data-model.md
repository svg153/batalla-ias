# Data Model — mortgage redesign

## 1. Scope

This feature does not redefine mortgage-domain entities. It defines the redesign-layer entities that connect approved design intent to frontend implementation in `apps/web` while preserving feature 001 semantics.

## 2. Entities

### A. Design Direction Package

Represents the approved redesign guidance for this feature.

**Fields**
- `planPath`
- `designPath`
- `uxStudyPath`
- `contractPath`
- `sourceSemanticsSpecPath`
- `approvedDirection` = `Editorial Financial Desk`

**Relationships**
- governs `UI Section Contract`
- governs `Component Mapping`
- governs `Validation Expectation`

### B. UI Section Contract

Represents a critical visible section in the frontend.

**Fields**
- `sectionId` (`capture`, `comparison`, `recommendation`, `affordability`, `supporting-metadata`)
- `purpose`
- `mustShowEvidence[]`
- `mustShowStates[]`
- `desktopBehavior`
- `mobileBehavior`
- `accessibilityRequirements[]`

**Relationships**
- implemented by one or more `Frontend Component`
- validated by one or more `Validation Expectation`

### C. Frontend Component

Represents a concrete React component or page block in `apps/web`.

**Fields**
- `filePath`
- `componentName`
- `currentRole`
- `targetRole`
- `dependsOnData[]`

**Relationships**
- implements `UI Section Contract`
- consumes `Frontend Result Model`

### D. Frontend Result Model

Represents the existing UI data boundary already used by the page.

**Fields**
- `analysis` (`AnalysisSummary`)
- `comparison` (`ComparisonResult?`)
- `recommendation` (`SwitchRecommendation?`)
- `affordability` (`AffordabilityResult?`)
- `stages`
- `notices`

**Relationships**
- feeds `Comparison Evidence`
- feeds `Recommendation Evidence`
- feeds `Affordability Evidence`
- feeds `Operational Trust State`

### E. Comparison Evidence

Represents the visible proof that supports scenario comparison.

**Fields**
- `scenarioCount`
- `ranking`
- `bestScenarioType`
- `totalRealCost`
- `deltaVsCurrent`
- `costBreakdown`
- `triggeredRules`
- `traceReferences`
- `dataQualityStatus`

**Validation rules**
- must preserve honest 2-vs-3 scenario count
- must prioritize total real cost over monthly installment
- must keep linked-product and switch-cost evidence visible

### F. Recommendation Evidence

Represents the visible proof that supports the recommendation.

**Fields**
- `recommendedAction`
- `targetScenarioType`
- `netSavingsAtHorizon`
- `breakEvenReached`
- `breakEvenMonth`
- `switchCostsVisible`
- `blockingReasons`
- `explanation`
- `traceReferences`

**Validation rules**
- must show net savings, break-even, and switch costs together
- must explain why the recommended action follows from the comparison
- must remain honest when no final recommendation is available

### G. Affordability Evidence

Represents the visible proof that supports affordability assessment.

**Fields**
- `evaluatedScenarioType`
- `debtRatio`
- `classification`
- `monthlyPaymentConsidered`
- `netMonthlyIncome`
- `monthlyObligations`
- `assumptions`
- `blockingReasons`
- `traceReferences`

**Validation rules**
- only appears after valid comparison context
- must identify the evaluated scenario
- must show thresholds and caveats, not only the outcome label

### H. Operational Trust State

Represents supporting truth metadata that conditions how users interpret the result.

**Fields**
- `dataQualityStatus`
- `missingData[]`
- `assumptions[]`
- `stageSources`
- `fallbackStatus`
- `retentionPreference`
- `accessMode`
- `expiresAt`
- `purgeAfter`
- `traceabilityRefs`

**Validation rules**
- cannot be hidden behind optional-only disclosure
- must remain readable on mobile and desktop

### I. Validation Expectation

Represents required evidence that the redesign still works.

**Fields**
- `type` (`component`, `e2e`, `accessibility`)
- `coverageTarget`
- `relatedSections[]`
- `acceptanceSignals[]`

**Relationships**
- validates `UI Section Contract`
- validates `Frontend Component`

## 3. Key relationships

```text
Design Direction Package
  ├── UI Section Contract
  │     ├── Frontend Component
  │     └── Validation Expectation
  └── Frontend Result Model
        ├── Comparison Evidence
        ├── Recommendation Evidence
        ├── Affordability Evidence
        └── Operational Trust State
```

## 4. State transitions

### Result orchestration states

```text
idle
  -> submitting
  -> result available
      -> api-backed
      -> local-preview
      -> unavailable
```

### Data-quality states

```text
complete
  -> conditional_estimate
  -> blocked
```

### Visibility states

```text
desktop-visible
mobile-visible-by-default
mobile-expanded-detail
```

Critical evidence must never transition into a “hidden unless discovered” state.

## 5. Implementation note

The redesign should continue to use the existing frontend result model in `apps/web/src/features/mortgage-analysis/types.ts`. The new artifacts act as an alignment model for layout, hierarchy, visibility, and validation rather than a replacement data schema.
