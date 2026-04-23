---
name: "static-monorepo-vercel"
description: "Ship a monorepo web app to Vercel as static output without pretending the backend shipped too"
domain: "deployment"
confidence: "high"
source: "earned"
---

## Context

Use this when a pnpm monorepo contains a static web app and a separate backend service, but the current Vercel deployment only publishes the web output. The important part is not the config itself; it is keeping the deployment boundary honest in product behavior and docs.

## Patterns

### Declare the static boundary in `vercel.json`

- Keep `vercel.json` at the monorepo root.
- Use a workspace-aware install command.
- Build only the web package.
- Point `outputDirectory` at the built web artifact, not the repository root.

### Make frontend-to-API behavior honest

- Default the client API base URL to same-origin `/api/v1`, but allow override with environment config.
- If the deployed origin does not actually serve that API, surface an explicit preview or degraded state.
- Preserve real API state when partial calls succeed; only fall back for the missing stage.

### Document the boundary

- State clearly in README/deployment notes that the Vercel deployment is static-only.
- Say what happens when `/api/v1` is unavailable instead of implying full-stack hosting.
- Keep fallback language visible in the UI or service layer so operators can tell demo mode from live mode.

## Examples

- `vercel.json` installs from the monorepo root, builds `@batalla-ias/web`, and publishes `apps/web/dist`.
- `README.md` explicitly says the Vercel deploy serves only the static frontend and does not upload the Express API.
- `apps/web/src/services/analysis-api.ts` defaults to `/api/v1` and marks missing compare/affordability support as visible local preview instead of fake backend success.

## Anti-Patterns

- ❌ Assuming Vercel static output implies the Express API is deployed too.
- ❌ Hiding a missing backend behind a generic success state.
- ❌ Falling back to local calculations without telling the user which stage is preview-only.
- ❌ Building the entire monorepo when only the web artifact is meant to ship.
- ❌ Writing deployment docs that blur whether persistence or API ownership semantics are live.
