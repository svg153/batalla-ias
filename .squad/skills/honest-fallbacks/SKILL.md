---
name: "honest-fallbacks"
description: "Use degraded modes without lying about source, storage, or confidence"
domain: "integration, product-integrity"
confidence: "high"
source: "earned (2026-04-23 mortgage comparator MVP session)"
---

## Context

Fallbacks are acceptable only when they preserve truth. This session worked because the UI attempted the live API first, fell back locally only when the backend was unavailable, and surfaced retention/access/data-quality state instead of pretending everything was fully backed or fully certain.

## Patterns

### Fallback order

1. Try the real dependency first
2. Fall back only on unavailability or clearly defined unsupported paths
3. Keep the same core contract shape whenever possible
4. Tell the user which path they are seeing

### Truthfulness rules

- **No fake durability** — in-memory or partial persistence must be explicit
- **No hidden local calculations** — when UI computes locally, expose that provenance
- **No generic success copy** — retention, expiry and access limits must stay visible
- **No silent confidence inflation** — warnings and quality flags remain first-class

### Good fallback outputs include

- source badges or path indicators
- retention metadata
- access/ownership state
- warning text when capabilities are degraded

## Examples

- Backend returns retention metadata and warns when `save_analysis` is not truly durable
- Frontend uses API-first comparison/affordability and only computes locally when backend is unavailable
- No-bonus offers stay at two scenarios instead of inventing a missing bonus path

## Anti-Patterns

- Saying "analysis saved" when storage is only in memory
- Falling back locally even when the live API disagrees
- Hiding access-control failures behind generic load errors
- Rendering polished results without provenance or quality status
