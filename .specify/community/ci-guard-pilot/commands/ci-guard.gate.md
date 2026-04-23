---
description: "Configure this repo's advisory .speckit-ci.yml without turning CI Guard into a hard merge gate by accident"
---

# Configure CI Guard Advisory Rules

This command updates `.speckit-ci.yml` for the current repo.

> Repo policy: keep CI Guard **advisory by default**. Do not enable blocking behavior unless the
> user explicitly requests it **and** the repo has a documented decision to treat CI Guard as a gate.

## User Input

```text
$ARGUMENTS
```

## Required inputs

1. Read the current `.speckit-ci.yml` if present.
2. Read `.github/workflows/` if it exists.
3. Read the active spec artifacts so the configuration matches the repo structure.

## Default advisory profile for this repo

Use these defaults unless the user explicitly asks for something else:

- required artifacts: `spec.md`, `plan.md`
- recommended artifacts: `tasks.md`, `.specify/memory/constitution.md`
- task completion threshold: `80`
- drift detection enabled
- test coverage hints enabled
- all `fail_*` switches stay `false`
- reporting stays markdown and local by default

## Output

If changes are needed, update `.speckit-ci.yml` and summarize:

- old vs new settings
- whether any setting would introduce blocking behavior
- a clear warning when the user asked for blocking behavior without a recorded team decision
