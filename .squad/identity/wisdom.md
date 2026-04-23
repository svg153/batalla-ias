---
last_updated: 2026-04-23T23:20:51.752+02:00
---

# Team Wisdom

Reusable patterns and heuristics learned through work. NOT transcripts — each entry is a distilled, actionable insight.

## Patterns

<!-- Append entries below. Format: **Pattern:** description. **Context:** when it applies. -->

**Pattern:** Lock the contract before fan-out. **Context:** If a feature spans API, UI, quality and domain semantics, freeze ownership/access, retention, recommendation target, uncertainty split and traceability first so parallel work does not drift.

**Pattern:** Honest fallbacks beat fake completeness. **Context:** API-first with visible `local_preview` is acceptable; silent fallback, fake durability and invented scenarios are not.

**Pattern:** Integrated work is not done until the repo-level finish gate passes. **Context:** After backend and frontend both touch the same feature, run root `typecheck`, `test`, `build`, plus relevant E2E and contract checks before calling the feature finished.

**Pattern:** Explanation-first UI should carry product truth, not hide it. **Context:** For financial/recommendation interfaces, keep quality status, retention/access semantics, assumptions, scenario count and rule/cost basis visible in the surface itself.

**Pattern:** Cross-layer test skeletons should share named edge cases. **Context:** Reuse the same scenario vocabulary and fixtures (`no bonus`, `conditional estimate`, `no break-even`, `cookie ownership`) across domain, API and UI to prevent implementation drift.
