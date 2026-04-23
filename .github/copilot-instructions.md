<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read `specs/003-landing-acquisition-flow/plan.md`
<!-- SPECKIT END -->

For Spec Kit maintenance inside this repo, prefer `corepack pnpm speckit -- <command>`
or `corepack pnpm speckit:setup` instead of a globally installed `specify`. The repo
pins the official `github/spec-kit` CLI release and keeps the official `git` extension
enabled for branch/commit workflow commands.

The repo also carries a **community / unverified / advisory-only** `ci-guard` pilot.
Install or verify it with `corepack pnpm speckit:ci:setup` / `corepack pnpm speckit:ci:status`,
then use `speckit.ci-guard.check`, `speckit.ci-guard.drift`, and `speckit.ci-guard.report`
as guidance only. Do not turn it into a blocking gate unless the user explicitly asks and the
repo records that decision.
