# Squad Decisions

## Frontend Architecture

### Editorial Dark Financial Desk Shell (Lambert)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
Use an editorial dark "financial desk" shell with:
- Explanation-first page for capture + comparison
- Structured sections: current mortgage, alternative offer, switch costs, household profile, retention
- Visible local preview fallback when `/api/v1` unavailable
- Reserved but working space for recommendation and affordability evidence

**Rationale:**
Keeps product understandable before full stack lands. Avoids shipping pretty shell that hides switch costs, bonification tradeoffs or retention implications.

**Consequences:**
- Frontend can demonstrate core narrative immediately
- API integration can replace preview path without page rewriting
- Data quality, assumptions and affordability warnings stay first-class in UI

---

## Access Control & Data Retention

### MVP Access Control & Retention Semantics (Ripley)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- **MVP Access:** Each analysis protected by opaque `analysis_session` token emitted in `POST /api/v1/analyses`; `analysisId` without valid token grants no access
- **Retention:** 
  - `session_only` expires on logout or 4h inactivity, purged within 15 min
  - `save_analysis` retains max 30 days, purged within 24h post-expiry
- **Affordability Calculation:** Only after valid comparison, always on target scenario defined by active recommendation
- **Affordability Classification:** Maintained in `asumible`, `ajustada`, `no_asumible`; data gaps/uncertainty expressed via `dataQualityStatus`
- **Traceability:** All calculated outputs include versioned formula/rule references with code, version, document source

**Rationale:**
Closes critical spec gaps across access ownership, retention mechanics, affordability prerequisites, and formula provenance. Unambiguous semantics for implementation.

**Consequences:**
- No possession ambiguity; access clearly tied to session token + opaque analysis ID
- Retention timing explicit; no orphan data or surprise purges
- Affordability never orphaned; always calculated against known scenario
- All rules traceable to source; regression stories possible

---

## Domain & Rules

### Test Scaffolding & Quality Baseline (Hicks)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Test skeletons created for contract, integration, and E2E; marked `skip` when dependent on unimplemented features
- Shared fixtures in `packages/domain/tests/fixtures/` and `apps/api/tests/helpers/` encode financial scenarios: no-bonus, conditional estimates, retention, ranking-by-total-cost
- Domain public surface (`packages/domain/src/index.ts`) corrected to expose formulas and rules, enabling suite bootstrap

**Rationale:**
Tests encode expected contract before implementation, preventing regressions when features land. Shared fixtures eliminate payload duplication. Public surface correction unblocks test execution and feedback loop.

**Consequences:**
- Test suite is regression-safe; all builds and existing tests pass
- E2E framework ready for activation when compare endpoint and affordability orchestration land
- Financial scenarios documented via fixtures; next implementer has reference payload set

---

### Rule Provenance Centralization (Bishop)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Centralize formula and rule provenance in `packages/domain/src/rules/rule-sources.ts`
- All formulas/validation must emit or reference rule IDs/versions from that catalog
- Current-installment consistency treated as warning when declared differs from estimated by >0.50 EUR

**Rationale:**
Constitution requires every rule to have source, version and regression story. Single catalog lets API/UI surface evidence without re-encoding. 0.50 EUR threshold is technical rounding guard, not product affordability threshold.

**Consequences:**
- Future formulas/thresholds must register in shared catalog before shipping
- Current-installment mismatch degrades quality to `conditional_estimate`; product can tighten/relax post-real-data

---

## Backend

### Backend Foundation & In-Memory Default (Parker)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Backend boots with in-memory repository as default implementation (real)
- `save_analysis` does not fake durability; response exposes `retentionMetadata` + explicit warning when PostgreSQL not yet wired
- Access is possession-based via opaque `analysisId`, explicitly surfaced in headers/response

**Rationale:**
Honest about infrastructure maturity. No pretense. Possession-based access clearly documented.

**Consequences:**
- Backend can run standalone for testing/demo without database dependency
- Saves/retention behavior is transparent; no surprise data loss
- Access control semantics explicit in wire protocol

---

### API Integration & Orchestration (Parker)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Protect `GET/DELETE/compare/affordability` with the opaque `analysis_session` cookie; treat unknown/mismatched cookies as ownership misses (`404` after cookie presence, `401` when absent)
- Keep `session_only` as 4-hour inactivity window with sliding `lastAccessedAt/expiresAt/purgeAfter` metadata; keep `save_analysis` on same 30-day/24-hour retention contract even with in-memory fallback
- Orchestrate comparison in API by composing finished domain formulas/ranking primitives; calculate affordability only against active recommendation target scenario

**Rationale:**
API remains boring and explicit: ownership token-bound, retention honest about memory fallback, affordability cannot drift from shown recommendation.

**Consequences:**
- `compare` and `affordability` endpoints now orchestrate real domain scenarios
- Recommendation-driven affordability: scoped only to active recommendation target
- Cookie-based ownership on all data access endpoints
- Retention semantics transparent even with in-memory fallback

---

## Frontend Integration (Lambert)

### UI Integration & Honest API Consumption (Lambert)

**Status:** Approved  
**Date:** 2026-04-23

**Decision:**
- Frontend uses API honestly in stages: `POST /analyses` and `GET /analyses/{id}` attempted live first; comparison and affordability fall back locally only when backend unavailable/unimplemented
- Offer form treats bonus variant as optional; if user does not declare bonus, UI submits only base offer and results stay at two scenarios
- Recommendation, affordability, retention and access status surfaced as first-class UI states with visible source badges, warnings, backend retention copy instead of generic success language

**Rationale:**
Transparent about fallbacks and user choice. No hidden scenarios. Retention and affordability state always visible.

**Consequences:**
- Graceful degradation when backend unavailable
- User controls scenario count: explicit bonus choice
- State and confidence visible in UI; no surprises on backend wiring

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
