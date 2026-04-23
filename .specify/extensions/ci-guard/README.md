# CI Guard pilot source

This directory vendors a **local pilot** of the community Spec Kit extension
[`spec-kit-ci-guard`](https://github.com/Quratulain-bilal/spec-kit-ci-guard).

## Why this exists

- Ripley recommended `ci-guard` as the next useful Spec Kit extension for this repo.
- The upstream `v1.0.0` manifest exists, but the pinned official Spec Kit CLI rejects it:
  the extension id is `ci-guard` while the upstream commands are named `speckit.ci.*`.
- To keep the install reproducible with the official repo-pinned CLI, this repo carries an
  explicit local pilot derived from upstream commit
  `856bce5924fbdbb519e5aa61f796bf8aca6f1f36`.

## Local changes vs upstream

1. Command namespace renamed from `speckit.ci.*` to `ci-guard.*` so the official CLI accepts it.
2. Prompts are explicit that this repo treats the extension as **community / unverified / advisory only**.
3. `.speckit-ci.yml` defaults to warning/report behavior instead of a hard merge gate.

## How to install in this repo

```bash
corepack pnpm speckit:ci:setup
corepack pnpm speckit:ci:status
```

## Human/Squad invocation after setup

- `/ci-guard.check`
- `/ci-guard.drift`
- `/ci-guard.report`
- `/ci-guard.gate`
- `/ci-guard.badge`

Use `check`, `drift`, and `report` for normal review. Treat outputs as guidance unless the
repo explicitly decides to promote them into a blocking gate.
