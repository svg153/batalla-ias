# UX Study — mortgage redesign

## 1. Product context

The product is for Spanish-speaking households reviewing an existing mortgage against a concrete alternative offer. The decision is high stakes, long horizon, and financially sensitive. Users are not browsing for inspiration; they are validating whether changing mortgage conditions is truly worth it.

## 2. Source-of-truth UX constraint

This redesign does not change mortgage semantics. The reading flow must preserve the existing product truth:

1. capture a valid analysis
2. compare scenarios honestly
3. explain whether switching is worth it
4. evaluate affordability only after a valid comparison
5. keep caveats, fallback state, retention/ownership metadata, and traceability visible

## 3. Audience and user posture

### Primary audience

- people or households with an existing mortgage
- comparing current conditions vs a real alternative offer
- often financially literate enough to understand repayments, but not necessarily technical
- high need for trust, clarity, and explicit caveats

### User mindset

- “No me vendas: explícame.”
- “Enséñame el coste real, no solo la cuota.”
- “Si faltan datos o esto es una estimación, dímelo antes de que me equivoque.”

## 4. Core reading jobs

### Job 1 — Understand the comparison

The user must quickly see:

- how many scenarios really exist
- which scenario wins by total real cost
- whether bonus-linked products damage the result
- what evidence supports the ranking

### Job 2 — Understand the recommendation

The user must quickly see:

- whether switching is worth it
- net savings
- break-even timing or absence
- switching friction
- why the recommendation was reached

### Job 3 — Understand affordability

The user must quickly see:

- which scenario is being evaluated
- whether household income supports it
- the debt-ratio classification
- whether the result is conditional or blocked

### Job 4 — Understand confidence and operational truth

The user must quickly see:

- data quality
- missing data and assumptions
- fallback/local-preview status
- retention, expiry, purge, and ownership metadata
- traceability references

## 5. Content hierarchy

### Global hierarchy

1. comparison
2. recommendation
3. affordability
4. supporting metadata and caveats

### Why this hierarchy

- comparison is the evidence base
- recommendation is the interpreted outcome of the comparison
- affordability is a downstream evaluation, not a competing top-level story
- metadata and caveats condition trust across all sections

## 6. Desktop flow

### Before result

- editorial briefing header
- guided worksheet-like form
- visible notes about retention, scenario honesty, and affordability prerequisites

### After result

- comparison becomes the main focal block
- recommendation sits immediately after it and references the winner
- affordability follows as a dependent evaluation
- supporting metadata remains in a stable rail or anchored footer

## 7. Mobile flow

### Rule

Mobile may reduce width, but it may not reduce evidence truthfulness.

### Mobile defaults

The following must be directly visible in the first reading path:

- compared scenarios
- winner by total real cost
- switch-cost visibility
- break-even state
- data quality state
- fallback/local-preview state
- retention/ownership metadata

### Mobile anti-patterns

- no essential evidence only inside a closed accordion
- no hidden tabs as the sole access path to recommendation or caveats
- no tooltip-only explanation

## 8. Mapping from current UI to target UI in `apps/web`

| Current UI | Current role | Target role |
|---|---|---|
| `mortgage-analysis-page.tsx` hero | large framing surface | compact editorial briefing header |
| `analysis-form.tsx` | guided capture | guided capture with stronger analyst worksheet hierarchy |
| `scenario-comparison-table.tsx` | comparison table | primary evidence surface with clearer responsive behavior |
| recommendation panel in page | summary and rationale | more explicit “why this wins” block with stronger evidence grouping |
| affordability panel in page | post-comparison panel | explicitly dependent evaluation tied to target scenario |
| `data-quality-banner.tsx` | standalone status banner | trust gate that conditions how later results should be interpreted |
| ownership sidebar | supporting metadata | supporting evidence rail/footer that stays visible and easier to scan |

## 9. Critical states

### Honest happy path

- valid comparison
- visible winner by total real cost
- recommendation with net savings + break-even + switch costs
- affordability for recommended scenario

### Conditional estimate

- assumptions visible before recommendation is trusted
- missing data and uncertainty explained in-line

### Blocked state

- show what data is missing or contradictory
- do not imply a final recommendation

### Fallback / local preview

- clearly say that some results come from local preview, not supported backend routes
- keep the result useful, but visibly provisional

### No bonus variant

- show exactly two scenarios
- explicitly explain why the third one does not exist

## 10. Copy posture

### Tone

- serious
- direct
- transparent
- non-promotional

### Vocabulary

Prefer:

- coste total real
- punto de equilibrio
- productos vinculados
- estimación condicionada
- estado de retención
- trazabilidad

Avoid:

- savings hype
- marketing superlatives
- English fintech jargon
- ambiguity about provisional or fallback states

## 11. Anti-patterns to avoid

- recommendation-first persuasion without visible comparison evidence
- monthly-installment-led framing that hides real total cost
- hero-first composition that pushes evidence below the fold
- decorative motion or gradient spectacle
- metadata hidden behind tiny “info” affordances
- inaccessible state communication that depends only on color or hover

## 12. Testing strategy

### Component tests

Cover:

- section order and hierarchy
- scenario-count honesty
- visibility of switch costs, net savings, break-even, and metadata
- mobile-visible essential evidence
- conditional and blocked state rendering

### E2E tests

Preserve and extend:

- bonus trap ranking
- no-bonus two-row state
- conditional estimate visibility
- retention and ownership messaging
- fallback/local-preview honesty
- responsive evidence visibility

### Accessibility checks

Validate:

- heading order
- keyboard navigation
- focus visibility
- semantic labels
- readable mobile alternative to comparison table
- non-color-only state communication

## 13. Acceptance traceability

Implementation is accepted only if reviewers can trace:

- design intent from `design.md`
- UX behavior from this document
- concrete UI obligations from `contracts/ui-redesign-contract.md`
- preserved mortgage semantics from feature 001
