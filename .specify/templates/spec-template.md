# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  For batalla-ias, each story must also state the financial decision being supported,
  the user-visible explanation expected, and the evidence needed to verify accuracy.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when required mortgage data is missing, stale or contradictory?
- How does the system respond when a bonus or linked product changes the total cost ranking?
- What happens when switching costs exceed the projected savings during the evaluation horizon?
- How does the system handle household income volatility, high debt ratio or affordability failure?
- How are rounding differences, zero/negative values or out-of-policy inputs surfaced to the user?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST define every mortgage formula, business rule, rounding rule and
  decision threshold needed by the feature.
- **FR-002**: System MUST calculate and compare the total cost of relevant mortgage scenarios,
  including bonuses and all applicable switching or setup expenses.
- **FR-003**: System MUST explain the result in user-comprehensible terms, including inputs,
  costs considered, triggered rules and final recommendation.
- **FR-004**: System MUST evaluate affordability using household income, declared obligations
  and the debt-ratio logic defined for the feature scope.
- **FR-005**: System MUST protect sensitive financial and family data through access control,
  minimization and redaction of sensitive telemetry.

### Required Evidence

- For every story, specify the source of truth for formulas or rules.
- For every recommendation, define the explanation payload or UI breakdown that will be shown.
- For every sensitive data flow, identify storage, exposure surface and retention expectation.
- For every changed rule, list the tests that will prove the rule still behaves correctly.

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **Mortgage Scenario**: Represents a current or proposed mortgage configuration, including
  rates, term, principal, bonuses and applicable fees.
- **Household Financial Profile**: Represents income, obligations and affordability inputs used
  to assess payment capacity and debt ratio.
- **Decision Explanation**: Represents the user-visible breakdown of formulas, costs, rules and
  conclusions behind a comparison or recommendation.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Relevant mortgage calculations match the approved source of truth for the feature
  in 100% of covered automated regression cases.
- **SC-002**: Users can identify why one scenario is better or worse because the explanation
  shows costs, rules and assumptions for every recommendation.
- **SC-003**: Affordability outcomes correctly classify covered debt-ratio and income scenarios
  in all specified acceptance cases.
- **SC-004**: No acceptance scenario exposes sensitive financial or family data outside the
  authorized feature flow.

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- Household financial inputs provided by the user are truthful unless the feature explicitly
  includes verification steps.
- The feature states the jurisdiction, cost categories and mortgage products it covers.
- Missing financial inputs are treated as explicit assumptions, not silent defaults.
- Existing authentication and authorization layers remain responsible for user identity unless
  the feature explicitly changes them.
