# Project Context

- **Owner:** Sergio Valverde
- **Project:** batalla-ias
- **Stack:** TypeScript monorepo with React, Express, Decimal.js, PostgreSQL, Vitest, Playwright
- **Created:** 2026-04-23T20:09:48Z

## Learnings

- The MVP UI must expose comparison, recommendation and affordability without opaque outputs.
- The main page will be form-heavy and explanation-heavy, not marketing-heavy.
- The frontend shell works better with a visible local preview fallback than with a dead results area while API/domain pieces are still arriving.
- The mortgage flow needs retention choice, switch costs and affordability guardrails in the first screen or users will misread the outcome.

## 2026-04-23 — UI Integration Synchronized

**Session:** lambert-ui-integration (merged by Scribe 2026-04-23T20:55:13Z)

### Frontend State
✓ API integration honest: live attempt first, fallback to local only when backend unavailable  
✓ Bonus variant optional: user controls scenario count  
✓ Recommendation, affordability, retention, access status now first-class UI states  
✓ Visible source badges, warnings, backend retention copy instead of generic success  
✓ No-bonus rendering: graceful fallback when alternative scenario unavailable
✓ Conditional affordability: "pending", "estimated", "approved" states visible
✓ Enhanced error/loading/empty UX: robust across all failure modes

### Sync with Parker
Parker's API orchestration now enforces cookie ownership and recommendation-driven affordability.  
Lambert's UI fallback strategy aligns: local comparison/affordability only when backend unavailable.

### Sync with Hicks
Data quality flags now first-class: `dataQualityStatus` visible in recommendation panel.

## 2026-04-23 — Reusable frontend lessons extracted

**Session:** lambert-squad-skills

### What was distilled
- Explanation-first financial UI is now captured as a reusable Squad skill instead of staying trapped in one page implementation.
- Honest degraded states are now encoded as a reusable skill: API-first, visible local preview only when warranted, and no fake success on backend gaps.
- Optional scenario handling is explicit: bonus variants only exist when declared and materially different, otherwise the UI stays at two scenarios and says why.

### Assets created
- `.squad/skills/explanation-first-financial-ui/SKILL.md`
- `.squad/skills/honest-degraded-analysis-states/SKILL.md`
- `.squad/decisions/inbox/lambert-squad-skills.md`

## Skills Earned: Explanation-First UI & Honest Degradation

**Date:** 2026-04-23  
**Crystallized into:**
- `.squad/skills/explanation-first-financial-ui/SKILL.md`
- `.squad/skills/honest-degraded-analysis-states/SKILL.md`

**Where Applied:** Frontend architecture, fallback UI states, affordability display, access/retention copy  
**Reusable Pattern:** Financial outputs prioritize explanation and transparency; partial backend delivery handled truthfully with visible confidence

**Impact:** Future frontend work on financial outputs, fallbacks, recommendation UX automatically loads these skills
