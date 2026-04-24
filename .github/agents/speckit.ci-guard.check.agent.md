---
description: Run advisory spec compliance checks and summarize gaps without acting
  as a merge gate
---


<!-- Extension: ci-guard -->
<!-- Config: .specify/extensions/ci-guard/ -->
# CI Guard Check

> Pilot note: this repo vendors a patched local copy of the community `spec-kit-ci-guard`
> extension because the upstream `v1.0.0` manifest does not install cleanly with the pinned
> official Spec Kit CLI. Treat all findings as **advisory guidance**, not an automatic merge block.

Run a deterministic spec-compliance review for the current branch.

## User Input

```text
$ARGUMENTS
```

## Required inputs

1. Confirm the repo is a git worktree with at least one commit.
2. Read `.speckit-ci.yml` if it exists.
3. Read the active feature artifacts under `specs/*/spec.md`, `plan.md`, and `tasks.md` when present.
4. Read `.specify/memory/constitution.md` if present.
5. Inspect the current branch diff against the configured base branch (default `main`).

## Output

Produce one concise report with:

1. **Artifact existence** (`spec.md`, `plan.md`, `tasks.md`, constitution)
2. **Artifact completeness** (required sections present)
3. **Task completion** (from `tasks.md`)
4. **Spec/code alignment** (requirements vs changed files/tests)
5. **Quick drift scan** (missing expected files, undocumented work, TODO/FIXME mismatches)
6. **Recommended action** as one of:
   - `advisory-pass`
   - `advisory-warn`
   - `advisory-fail`

Always include a summary table and explicitly say:

- whether the repo is in **advisory mode**
- that the result should **not block merge automatically** in this repo

## Rules

- Read-only: never modify files.
- Evidence-based: cite file paths and sections for every non-trivial claim.
- Deterministic: same branch state should produce the same conclusion.
- Honest: do not inflate coverage just because tests exist nearby.