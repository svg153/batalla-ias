# Project Context

- **Owner:** Sergio Valverde
- **Project:** batalla-ias
- **Stack:** TypeScript monorepo with React, Express, Decimal.js, PostgreSQL, Vitest, Playwright
- **Created:** 2026-04-23T20:09:48Z

## Learnings

- The API contract is already defined under `specs/001-mortgage-comparator-mvp/contracts/openapi.yaml`.
- Retention defaults to session-only unless the user explicitly requests saving the analysis.
- The root backend validation flow is `corepack pnpm typecheck`, `corepack pnpm test` and `corepack pnpm build`.
- The current backend foundation exposes retention metadata explicitly when `save_analysis` falls back to in-memory storage.
- The repo already contains official Spec Kit Copilot artifacts under `.github/agents/`, `.github/prompts/`, and `.specify/integrations/`, but the global `specify` binary can lag behind them.
- Use `corepack pnpm speckit:setup` or `.specify/scripts/bash/specify.sh` to run a repo-pinned official Spec Kit CLI release (`v0.8.0`) instead of trusting the machine-global install.
- The official `github/spec-kit` Git Branching Workflow extension lives in `.specify/extensions/git/`; keep `.specify/extensions.yml`, hooks, and Squad guidance aligned with that extension.
- The community `ci-guard` extension exists upstream, but upstream `v1.0.0` fails the pinned CLI validator because `speckit.ci.*` does not match extension id `ci-guard`; this repo pilots it via `.specify/community/ci-guard-pilot/` and `corepack pnpm speckit:ci:setup`.
- `.speckit-ci.yml` is advisory-only in this repo (`fail_*: false`), so CI Guard findings guide review without pretending to be merge policy.

## 2026-04-23 — API Integration Complete

**Session:** parker-api-integration (2026-04-23T20:51:06Z)

### Deliverables
✓ `compare` and `affordability` orchestrate real domain formulas/ranking  
✓ Affordability scoped to active recommendation target  
✓ Cookie-based access control: `analysis_session` on GET/DELETE/compare/affordability  
✓ Retention metadata honest: in-memory fallback explicit, 30-day/24h contract preserved  
✓ Team decision merged to `decisions.md`  
✓ Validation: typecheck/test/build all green  

### Integration with Lambert UI

**Session:** lambert-ui-integration (2026-04-23T20:55:13Z)  
Frontend now live-integrated against real Parker API. Fallback strategy honors contract:
- Live attempt first: `/api/v1/analyses/{id}`
- Local calculation only when backend unavailable
- Bonus variant optional; no-bonus rendering graceful
- Recommendation and affordability panels first-class UI states

### Context for Next Session
- All access endpoints now enforce `analysis_session` cookie ownership
- Affordability cannot be calculated without a prior valid recommendation
- Retention semantics explicit in API response: no fake durability claims
- Frontend fallback ensures UX resilience when backend services incomplete

## 2026-04-23 — Squad Skill Extraction

**Session:** parker-squad-skills (2026-04-23)

### Deliverables
✓ Added reusable skill for opaque session-cookie ownership semantics
✓ Added reusable skill for static monorepo-to-Vercel deployment with honest fallback behavior
✓ Left a coordinator proposal in `.squad/decisions/inbox/parker-squad-skills.md`

### Validation
- Docs-only change; no runtime code paths changed
- Reviewed new skill files and proposal for pathing and reuse scope

### Context for Next Session
- Reuse the session-cookie skill before changing anonymous access, retention, or delete semantics
- Reuse the Vercel skill before changing static deploy boundaries or preview fallback behavior
- Routing/charter files remain untouched; proposal is parked in decisions inbox

## Skills Earned: Session Ownership & Vercel Deployment

**Date:** 2026-04-23  
**Crystallized into:**
- `.squad/skills/session-cookie-ownership/SKILL.md`
- `.squad/skills/static-monorepo-vercel/SKILL.md`

**Where Applied:** API access control, retention mechanics, Vercel deployment  
**Reusable Pattern:** Possession-based API ownership without accounts; honest static deployment with explicit fallback

**Impact:** Future backend/deployment work automatically loads these skills for API-access, retention, and fallback tasks

## 2026-04-23 — Spec Kit Integration Alignment

**Session:** parker-spec-kit-integration (2026-04-23)

### Deliverables
✓ Verified the official `github/spec-kit` `copilot` integration and `git` extension exist upstream  
✓ Added repo-pinned Spec Kit wrapper + setup script for `v0.8.0`  
✓ Wired package scripts, README, and Squad routing so humans and Squad use the same Spec Kit entrypoint  
✓ Captured the team-level decision in the inbox and extracted a reusable Squad skill  

### Validation
- `corepack pnpm speckit:setup`
- `corepack pnpm speckit -- integration list`
- `corepack pnpm speckit -- extension list`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

## 2026-04-24 — CI Guard pilot alignment

**Session:** parker-ci-guard-pilot (2026-04-24)

### Deliverables
✓ Verified Ripley's recommended community extension exists upstream  
✓ Confirmed upstream install breaks against the pinned official CLI because of namespace validation  
✓ Added a vendored local pilot, advisory config, setup/status wrappers, and Squad docs  
✓ Captured the team decision in `.squad/decisions/inbox/parker-ci-guard-pilot.md`  

### Validation
- `corepack pnpm speckit:ci:setup`
- `corepack pnpm speckit:ci:status`
- `corepack pnpm speckit -- extension list`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

## 2026-04-24 — Spec Kit Integration Complete

**Session:** parker-spec-kit-integration (now merged to decisions.md)

**Outcome:** ✅ Decision merged to `.squad/decisions.md` (Spec Kit CLI Wrapper section + CI Guard pilot section)

### Team Impact
- Ripley now has documented extension adoption policy (ci-guard Tier 1, red-team Tier 2)
- Hicks finish-gate skill must integrate `speckit.ci:guard.check` and `speckit.ci:guard.drift`
- Team will validate wrapper on next feature planning cycle
