---
description: Detect advisory spec drift in both directions and suggest the smallest
  honest fix
---


<!-- Extension: ci-guard -->
<!-- Config: .specify/extensions/ci-guard/ -->
# CI Guard Drift Review

> Pilot note: this repo uses CI Guard as advisory review only.

Analyze drift between the active spec artifacts and the current implementation.

## User Input

```text
$ARGUMENTS
```

## Required inputs

1. Read the active `spec.md`; add `plan.md` and `tasks.md` when present.
2. Read `.speckit-ci.yml` if present for base branch / thresholds.
3. Inspect the relevant code and tests, especially files changed on the current branch.

## Output

Produce four sections:

1. **Forward drift (spec → code)**
2. **Reverse drift (code → spec)**
3. **Decision drift (plan/constitution → implementation)**
4. **Remediation order**

For each drift item include:

- severity (`critical`, `warning`, `info`)
- evidence (files / sections)
- recommended fix direction (`change code`, `change spec`, or `decide explicitly`)

Finish with an overall advisory verdict:

- `aligned`
- `mostly-aligned`
- `drifted`

## Rules

- Read-only.
- Bidirectional unless the user explicitly narrows the scope.
- Never pretend the spec is always right; code may be ahead of docs.