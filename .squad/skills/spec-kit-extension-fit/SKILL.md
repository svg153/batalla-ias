---
name: "spec-kit-extension-fit"
description: "Choose Spec Kit extensions that reinforce real repo gaps without duplicating existing orchestration"
domain: "workflow, architecture"
confidence: "high"
source: "earned (2026-04-24 spec-kit recommendation for batalla-ias)"
---

## Context

Spec Kit now has a broad community extension catalog, but most repos should not install extensions just because they exist. In `batalla-ias`, the useful move was to identify the actual operating gap first, then prefer extensions that strengthen governance and review over ones that add a second orchestrator on top of Squad.

## Patterns

### Start with fit, not novelty

Before recommending any extension, classify the repo's current state:

1. What Spec Kit pieces are already present?
2. What agent/integration is already active?
3. What workflow is already owned by local tooling or team conventions?
4. What high-risk gap is still weak?

If the extension does not close a real gap, it is noise.

### Prefer reinforcement over replacement

High-value extensions usually reinforce an existing workflow:

- governance gates
- drift detection
- adversarial review
- bug-to-spec traceability

Low-value extensions often replace orchestration the repo already has:

- alternate coordinators
- agent routers tied to a different runtime
- bootstrap tools after bootstrap is already done

### In high-risk domains, prioritize truth gates first

For money, privacy, explainability, or contract-heavy products:

1. add compliance / drift enforcement first
2. add adversarial review second
3. add maintenance helpers third

Do not start with convenience automation if the repo still lacks a strong spec→code gate.

### Treat community extensions as untrusted until piloted

The upstream Spec Kit docs explicitly say community extensions are not audited or endorsed. For adoption:

1. pilot by direct URL in one repo
2. validate on a real feature
3. only then promote into an internal curated catalog

## Examples

- `spec-kit-ci-guard` fits a repo that already has spec artifacts and team review, but lacks an automated compliance gate.
- `spec-kit-red-team` fits a repo whose features touch money paths, privacy, contracts, or silent failure risk before architecture locks in.
- `spec-kit-bugfix` fits once the repo shifts from initial build-out to iterative maintenance and drift repair.
- Reject `agent-assign`, `conduct`, or `maqa` when the repo already has a mature local coordinator and agent routing model.

## Anti-Patterns

- Installing a second multi-agent orchestrator without deciding who is actually in charge
- Choosing `brownfield` after the repo already has working Spec Kit artifacts and conventions
- Assuming catalog presence means trustworthiness
- Recommending Memory/Onboarding extensions when the real gap is merge-time compliance
