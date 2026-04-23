---
name: "session-cookie-ownership"
description: "Design possession-based API access with opaque session cookies and explicit miss semantics"
domain: "api-design"
confidence: "high"
source: "earned"
---

## Context

Use this pattern when a product has no user accounts yet, but individual resources still need private ownership semantics. The goal is boring transport behavior: possession-based access, explicit retention, and no leakage about whether a resource exists for someone else.

## Patterns

### Create grants access; identifiers do not

- Emit an opaque session token when the resource is created.
- Store only a server-side hash of that token.
- Treat the resource identifier as a locator, never as proof of ownership.

### Transport ownership in a cookie

- Prefer `HttpOnly`, `SameSite=Lax`, `Secure` cookies for the opaque token.
- Only relax `Secure` in local development.
- Require the cookie on every read, compare, recalculate, and delete endpoint touching the owned resource.

### Keep miss semantics explicit

- Return `401` when the ownership cookie is absent.
- After a cookie is present, return `404` for unknown, expired, deleted, or not-owned resources.
- Use blunt error text that explains the rule without confirming whether another session owns the record.

### Retention is part of the contract

- Refresh inactivity-based TTL only after authorized access.
- Expose access mode and retention mode in response metadata or headers.
- Keep delete semantics under the same ownership rule as read/update semantics.

## Examples

- `apps/api/src/routes/analyses.ts` requires `analysis_session` on `GET`, `DELETE`, `compare`, and `affordability`, returning `401` when missing and `404` on ownership miss.
- `apps/api/src/modules/analyses/analysis-service.ts` stores hashed session ownership and emits retention metadata tied to the cookie-based access model.
- `specs/001-mortgage-comparator-mvp/plan.md` documents the expected possession, TTL, and purge semantics before implementation.

## Anti-Patterns

- ❌ Treating resource IDs as secret enough to double as authorization.
- ❌ Returning `403` for not-owned resources and leaking that the record exists.
- ❌ Storing the ownership token in request payloads or localStorage when an `HttpOnly` cookie fits.
- ❌ Letting reads succeed without the same ownership proof required for deletes.
- ❌ Hiding TTL or purge behavior from the API contract.
