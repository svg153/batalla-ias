---
name: "community-spec-kit-pilot"
description: "Pilot a community Spec Kit extension without pretending it is trusted, official, or a hard gate"
domain: "developer-workflow, governance"
confidence: "high"
source: "earned (2026-04-24 batalla-ias ci-guard pilot)"
---

## Context

Sometimes a community Spec Kit extension fits a real repo gap, but the upstream package is not
verified and may not even install cleanly against the pinned official CLI. In that case, do the
boring thing: pin provenance, patch only what is required for compatibility, and keep the rollout
advisory until the repo explicitly decides otherwise.

## Patterns

### Validate installability against the pinned CLI first

- Check the extension catalog/README, but also run the install against the repo-pinned Spec Kit CLI.
- If the upstream manifest fails validation, do not hand-wave it away.
- Capture the concrete incompatibility in repo docs or decisions.

### Vendor a local pilot when compatibility is the only blocker

- Keep the upstream repo, commit, and license explicit.
- Patch only the minimum needed for reproducible install (for example, command namespace fixes).
- Store the pilot source in-repo and install from that local source so future setup does not depend on a mutable remote tag.

### Separate official setup from community setup

- Keep the official CLI/integration setup path clean.
- Add a separate `speckit:ci:setup`-style entrypoint for the community pilot.
- Make the warning unavoidable: community, unverified, advisory.

### Advisory first, gates later

- Start with report/check/drift workflows.
- Default all `fail_*` settings to `false` until the team explicitly chooses a merge gate.
- Document how humans and agents should invoke the pilot so it does not become shelfware.

## Anti-Patterns

- Installing an unverified community extension silently through the same path as official tooling
- Depending on a mutable upstream tag when a local pinned pilot is easy
- Treating advisory findings as blockers without a recorded team decision
- Patching the extension so heavily that provenance becomes unclear
