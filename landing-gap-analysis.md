# Landing UX Gap Analysis — battaglia-ias vs. hipoteca-2

**Date:** 2026-04-24 | **Status:** Analysis Only (No Implementation) | **By:** Lambert

---

## Executive Summary

| Aspect | hipoteca-2 | batalla-ias | Impact |
|--------|-----------|-----------|--------|
| **Purpose** | Self-service household calculators | Mortgage switch analyst workbench | No acquisition landing in battle-ias |
| **Entry Model** | Multiple tools, tab navigation | Single focused form | Too high friction for discovery |
| **Trust Model** | Expertise signal (PDF, defaults) | Backend honesty (stages, formulas) | Different philosophies |
| **User Journey** | Breadth-first (pick your question) | Depth-first (all upfront) | Visitors overwhelmed on first visit |

**Gap:** batalla-ias is optimized for users who already decided to compare mortgages. hipoteca-2 is optimized for users who want to explore housing financial options. For batalla-ias to become a **published acquisition homepage**, it needs hybrid approach: battle-ias's transparency + hipoteca-2's trust scaffolding.

---

## Current State Comparison

### hipoteca-2 Landing Structure
1. Hero ("Calcula en segundos") + lede about simple tools
2. CTA block (ReportGenerator modal → PDF export)
3. Value section ("Resuelve dudas al instante")
4. **4 Independent Micro-Tools (Tabs):**
   - Monthly payment calculator
   - Affordability finder
   - Buy-vs-rent comparison
   - Rent fairness analyzer
5. Advanced comparator CTA
6. Footer

**Result:** Users can start with any question, not forced into full form.

---

### batalla-ias Current Structure
1. Hero (defensive: "Coste real, no humo") + MVP positioning
2. Hero sidebar (principles of transparency)
3. Guided form (all inputs upfront)
4. Live results (if analysis completes)
5. Sidebar (ownership, retention, flow guide)

**Result:** Users hit form immediately; no discovery, no progressive entry.

---

## What batalla-ias Landing Needs (7 Gaps)

| Gap | hipoteca-2 Pattern | Why It Matters | Example from hipoteca-2 |
|-----|------------------|------------------|----------------------|
| 1. **Hero positioning** | "Simple & powerful" | Current is too defensive | "Calcula tu hipoteca en segundos" |
| 2. **Trust signals (top)** | 3 lightweight signals | Users need quick credibility proof | PDF export, region detection |
| 3. **Breadth IA** | Multiple questions → tools | Shows product scope without friction | 4 tabs, pick one to start |
| 4. **Progressive entry** | Tab navigation (low friction) | Let users try before committing to form | MonthlyPaymentCard first |
| 5. **Explanation block** | "Why this matters" + "What's included" | Users don't know what problem is solved | Editorial 2-col section |
| 6. **Social proof** | Stats or anonymized examples | Credibility + expectation-setting | "Recent Analysis" stat block |
| 7. **Secondary CTA** | Link to advanced flows | Power users can skip intro | "Ir al Comparador Avanzado" button |

---

## Recommended Landing IA (8 Sections)

```
┌─ Hero
│  ├─ Headline: "¿Tu hipoteca actual es la mejor oferta?"
│  ├─ Lede: Real costs, real science, real transparency
│  └─ CTA: "See Your Analysis" (primary) + "See Example" (secondary)
│
├─ Trust Scaffold (3 cards, 1 sentence each)
│  ├─ "100+ mortgages analyzed"
│  ├─ "Ranked by real total cost"
│  └─ "Your data stays in this session"
│
├─ Value Proposition Block
│  └─ "What You'll Discover"
│     ├─ Scenario comparison
│     ├─ Savings & break-even
│     └─ Affordability status
│
├─ Breadth Signal (3 visual cards)
│  ├─ "Scenario Comparison" (rank by total cost)
│  ├─ "Savings & Break-Even" (when does switch pay off?)
│  └─ "Affordability Status" (does new mortgage fit?)
│
├─ Explanation Block (2-col editorial)
│  ├─ Left: "Why Mortgage Switches Matter"
│  └─ Right: "What Gets Compared" (structured list)
│
├─ Examples or Stats
│  └─ "Average savings" or 3-4 anonymized case studies
│
├─ Form Entry (Progressive Disclosure)
│  └─ Start Analysis form (same as current)
│
└─ Footer
   └─ Links + trust stamp + advanced paths
```

---

## Design-System Dependencies

### Safe to Plan Now ✅
- IA structure (sections, content blocks, hierarchy)
- React component skeleton
- Copy and headlines
- Mobile breakpoint strategy

### Defer Until After Redesign-002 ⏸️
- Hero accent color (brand direction needed)
- Card styling refinement (design tokens needed)
- Status badge consumer variants (palette update)
- Icon selection for breadth cards

### Blocks Implementation 🚫
- `compare` endpoint returning 501 (Parker)
- `affordability` endpoint returning 501 (Parker)
- Final design token set (Redesign-002 decision)

---

## Decision Points for Sergio

1. **Trust narrative:** Backend transparency or cost science?
   - → **Recommendation:** Mix both ("real science" + "real transparency")

2. **Breadth vs. Focus:** Show multiple tools or just comparison?
   - → **Recommendation:** Show breadth signal, only implement comparison flow

3. **Entry friction:** Form first or questions first?
   - → **Recommendation:** Questions first (lower friction), mirrors hipoteca-2 success

4. **Redesign-002 timing:** Should landing wait for new brand?
   - → **Recommendation:** Plan IA now, implement styling after redesign-002

---

## Full Analysis

See `.squad/decisions/inbox/lambert-landing-ia.md` for:
- Detailed gap matrix
- Content philosophy comparison
- Component-level dependencies
- Implementation safety assessment
- Next steps by team role

---

**Status:** Ready for Sergio review and decision on breadth/entry model before Phase 1 planning begins.

