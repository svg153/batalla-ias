# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Scope, architecture, cross-cutting trade-offs | Ripley | Resolve spec gaps, review APIs, set implementation order |
| Cross-cutting contract lock | Ripley | Access/retention semantics, recommendation target, traceability before fan-out |
| Frontend UI and UX | Lambert | Forms, tables, user journeys, explanatory UI |
| Backend API and persistence | Parker | Express routes, repositories, services, retention flows |
| Financial formulas and business rules | Bishop | Decimal formulas, explainability, ranking, break-even, affordability |
| Integration finish gate | Hicks | Final repo-level validation after parallel API/UI work |
| Code review | Ripley | Review PRs, check quality, suggest improvements |
| Testing | Hicks | Write tests, find edge cases, verify fixes |
| Scope & priorities | Ripley | What to build next, trade-offs, decisions |
| Session logging | Scribe | Automatic — never needs routing |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Ripley |
| `squad:ripley` | Pick up issue and complete the work | Ripley |
| `squad:lambert` | Pick up issue and complete the work | Lambert |
| `squad:parker` | Pick up issue and complete the work | Parker |
| `squad:bishop` | Pick up issue and complete the work | Bishop |
| `squad:hicks` | Pick up issue and complete the work | Hicks |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, the **Lead** triages it — analyzing content, assigning the right `squad:{member}` label, and commenting with triage notes.
2. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
3. Members can reassign by removing their label and adding another member's label.
4. The `squad` label is the "inbox" — untriaged issues waiting for Lead review.

## Rules

1. **Eager by default** — spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn an agent for "what port does the server run on?"
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work.** If a feature is being built, spawn the tester to write test cases from requirements simultaneously.
7. **Issue-labeled work** — when a `squad:{member}` label is applied to an issue, route to that member. The Lead handles all `squad` (base label) triage.
8. **Contract-lock first for cross-cutting work.** If privacy, retention, explainability, recommendation semantics, or shared wire/UI meaning are in scope, route Ripley first and load `.squad/skills/contract-lock/SKILL.md` before broad fan-out.
9. **Finish-gate last for integrated work.** If backend and frontend both touched the same feature, route Hicks for a repo-level validation pass and load `.squad/skills/integration-finish-gate/SKILL.md` before calling the work complete.
10. **Load earned skills by concern.** Backend/session/deploy work should prefer `.squad/skills/session-cookie-ownership/SKILL.md`, `.squad/skills/static-monorepo-vercel/SKILL.md`, and `.squad/skills/honest-fallbacks/SKILL.md`; frontend explanation/fallback work should prefer `.squad/skills/explanation-first-financial-ui/SKILL.md`, `.squad/skills/honest-degraded-analysis-states/SKILL.md`, and `.squad/skills/honest-fallbacks/SKILL.md`; quality/review work should prefer `.squad/skills/test-skeleton-tripwires/SKILL.md` and `.squad/skills/honest-fallback-review/SKILL.md`.
11. **Spec Kit maintenance should use the pinned repo wrapper.** For Spec Kit updates, checks, or extension/integration work, load `.squad/skills/spec-kit-pinned-cli/SKILL.md` and prefer `corepack pnpm speckit -- ...` plus `corepack pnpm speckit:setup` over a globally installed `specify`.
12. **Community Spec Kit pilots stay explicit and advisory.** For community extension adoption, load `.squad/skills/community-spec-kit-pilot/SKILL.md`, install through the repo wrapper (`corepack pnpm speckit:ci:setup` for `ci-guard` here), and treat `speckit.ci-guard.check` / `speckit.ci-guard.drift` / `speckit.ci-guard.report` as guidance unless a recorded decision promotes them to a gate.
