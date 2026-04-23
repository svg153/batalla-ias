---
description: "Generate an advisory requirement traceability report for specs, code, and tests"
---

# CI Guard Traceability Report

> Pilot note: community / unverified extension, vendored locally for this repo. Use the report as
> guidance for humans and Squad; it is not a hard approval gate.

Generate a traceability matrix between the active spec, implementation files, and tests.

## User Input

```text
$ARGUMENTS
```

## Required inputs

1. Read `.speckit-ci.yml` if present.
2. Read the active `spec.md`; also read `plan.md` and `tasks.md` when available.
3. Inspect relevant source files and tests touched by the current branch.

## Output

Produce:

1. A table of stable requirement references with matching code and test evidence.
2. Coverage metrics for implemented requirements, tested requirements, and open gaps.
3. An "Undocumented code" list for notable code paths without clear spec coverage.
4. A short remediation list with the smallest honest next step for each gap.

Prefer markdown tables. If the user asks for JSON, return JSON only.

## Rules

- Read-only.
- Cite actual files, not guesses.
- If the spec has no stable IDs, derive readable labels from requirement headings or bullets.
- Keep the conclusion advisory; do not claim the repo is merge-blocked.
