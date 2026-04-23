---
description: "Generate optional badge snippets for advisory CI Guard results"
---

# CI Guard Badge

Generate optional badge markdown for README or documentation surfaces.

> Repo policy: badges are optional visibility aids. They are not proof of compliance and do not
> turn CI Guard into a gate.

## User Input

```text
$ARGUMENTS
```

## Required inputs

1. Read `.speckit-ci.yml` if present.
2. Use the latest available CI Guard check/report output, or infer a conservative badge from the
   current branch review if the user explicitly asks.

## Output

Return badge snippets only. Prefer conservative wording such as:

- `spec guidance: aligned`
- `spec guidance: needs review`
- `drift review: advisory`

Do not modify README unless the user explicitly asks.
