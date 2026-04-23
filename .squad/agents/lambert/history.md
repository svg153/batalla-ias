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

**Session:** lambert-ui-integration (merged by Scribe 2026-04-23T20:51:06Z)

### Frontend State
✓ API integration honest: live attempt first, fallback to local only when backend unavailable  
✓ Bonus variant optional: user controls scenario count  
✓ Recommendation, affordability, retention, access status now first-class UI states  
✓ Visible source badges, warnings, backend retention copy instead of generic success  

### Sync with Parker
Parker's API orchestration now enforces cookie ownership and recommendation-driven affordability.  
Lambert's UI fallback strategy aligns: local comparison/affordability only when backend unavailable.

