# Design Analysis Summary — Lambert

**Date:** 2026-04-23  
**Requested by:** Sergio Valverde  
**Task:** Analyze external design systems and propose design direction for batalla-ias

---

## What I Analyzed

1. **External Reference:** VoltAgent/awesome-design-md catalog containing 69 design systems from:
   - Developer tools (Vercel, Linear, Superhuman)
   - Fintech platforms (Stripe, Coinbase, Wise, Revolut)
   - Editorial sites (WIRED, The Verge)
   - Consumer tech (Apple, Nike, Tesla)

2. **Current MVP UI:** All React components, CSS tokens, and page structures in `apps/web/`

3. **Target Context:** Spanish-speaking families making high-stakes mortgage decisions (€150k-€400k at risk, 20-30 year commitment)

---

## Key Finding: Current UI is Already 90% Correct

**Your MVP instinctively landed on the right design posture:**
- Dark editorial surfaces convey seriousness
- Warm gold accent signals financial authority without aggression
- Serif headings + sans body = editorial credibility + readability
- Explanation-first panels = trust through transparency

**The problem is NOT visual design. It's:**
1. Codifying what's working so it doesn't drift
2. Documenting anti-patterns to avoid
3. Establishing accessibility and localization standards

---

## Proposed Design Direction: "Editorial Financial Desk"

**Core Metaphor:**  
Bloomberg Terminal meets WIRED meets your mortgage broker's spreadsheet.  
Not a slick consumer app. Not a sterile banking portal. Not a trading dashboard.

**Brand Posture:**
- Authoritative but not cold
- Transparent about uncertainty
- Shows the math, doesn't hide it
- Spanish-first, no anglicisms unless technical

**Visual System (Refinements, Not Redesign):**

| Element | Current Status | Refinement |
|---------|----------------|------------|
| Color Palette | ✅ Dark editorial + gold accent | Codify exact hex values |
| Typography | ✅ Serif display + sans body + mono data | Document hierarchy table |
| Cards & Surfaces | ✅ 28px radius, gradient overlays | Codify shadow system |
| Form UX | ✅ Progressive disclosure, visible errors | Document validation timing |
| Comparison Table | ✅ Rank by total cost, show deltas | Add sticky header on scroll |
| Status Badges | ✅ Source-based colors (api/local/unavailable) | Standardize sizes |

---

## What NOT to Copy from External Systems

### ❌ From Developer Tools (Vercel, Linear)
- Ultra-minimal chrome that hides context
- Monochrome extremes
- Terminal-first aesthetics (too cold for mortgage decisions)

### ❌ From Fintech (Stripe, Coinbase, Revolut)
- Trading dashboard aesthetics (green/red candlesticks)
- Gradient overload
- Crypto-native slang or hype language
- Real-time price tickers

### ❌ From Editorial (WIRED, The Verge)
- Full-bleed hero imagery (we need form density)
- Article pagination
- Paywall patterns

### ❌ From Consumer Apps (Nike, Airbnb)
- Playful illustrations or mascots
- Gamification (badges, streaks, likes)
- Photography-first layouts

### ❌ General Anti-Patterns
- Carousels (all content must be scannable)
- Hidden tooltips for critical info
- Fake progress bars
- Optimistic UI that lies about backend state
- Generic success copy ("Saved!" without retention context)

---

## Recommended Artifacts to Create

### 1. `design.md` (Design System Document)

**Purpose:** AI agents read this to generate consistent UI.

**Structure (10 sections):**
1. Visual Theme & Atmosphere
2. Color Palette & Roles (with hex codes)
3. Typography Rules (hierarchy table)
4. Component Stylings (buttons, forms, cards, tables)
5. Layout Principles (spacing scale, grid system)
6. Depth & Elevation (shadow system)
7. Do's and Don'ts (anti-patterns)
8. Responsive Behavior (breakpoints, touch targets)
9. Accessibility Standards (WCAG 2.1 AA, Spanish localization)
10. Agent Prompt Guide (quick reference)

**Location:** Project root (`/design.md`)

---

### 2. `ux-study.md` (User Experience Documentation)

**Purpose:** Capture user context, form flows, copy guidelines, edge cases.

**Structure (9 sections):**
1. User Context (target audience, stakes, literacy level)
2. Core User Jobs (compare, understand savings, validate affordability, trust)
3. Information Architecture (page structure, navigation)
4. Form Flow (input capture, progressive disclosure, validation)
5. Result Presentation (comparison, recommendation, affordability storytelling)
6. Interaction Patterns (states: loading, empty, error, fallback)
7. Copy Guidelines (tone, terminology, currency/date formatting)
8. Edge Cases & Degraded States (API unavailable, no bonus, retention warnings)
9. User Testing Insights (to be filled post-testing)

**Location:** `/specs/001-mortgage-comparator-mvp/ux-study.md` or project root

---

## Accessibility & Localization Standards

### WCAG 2.1 AA Compliance
- **Color contrast:** 4.5:1 for body text, 3:1 for large text
- **Focus indicators:** 4px outline with accent-soft glow
- **Keyboard navigation:** Full tab order, visible focus states
- **Screen readers:** Semantic HTML, ARIA labels for status/currency

### Spanish Localization
- **Primary language:** Spanish (Spain), no Spanglish
- **Date format:** DD/MM/YYYY or "23 abr 2026"
- **Number format:** 1.234,56 € (European decimal comma)
- **Currency:** Always include symbol (€) in aria-label for screen readers

### Touch Targets (Mobile)
- Minimum 44x44px for all interactive elements
- Buttons: 48px min height
- Form inputs: 52px min height, 16px font size (prevents iOS zoom)

---

## Next Steps (Recommended Order)

### Phase 1: Documentation (No Code Changes)
1. ✅ Design direction proposal written (`.squad/decisions/inbox/lambert-redesign-direction.md`)
2. ⏭️ Review with Sergio — approve design posture and anti-patterns
3. ⏭️ Create `design.md` with codified color/typography/component specs
4. ⏭️ Create `ux-study.md` with form flow and copy guidelines

### Phase 2: Refinement (Minor Code Changes)
5. ⏭️ Extract exact hex codes from `styles.css` into CSS variables
6. ⏭️ Add sticky table headers to comparison table
7. ⏭️ Standardize status badge sizes across components
8. ⏭️ Validate WCAG contrast ratios with automated tool

### Phase 3: Validation (Testing)
9. ⏭️ Run axe-core or Lighthouse accessibility audit
10. ⏭️ User test with 3-5 Spanish homeowners
11. ⏭️ Refine copy based on comprehension feedback
12. ⏭️ Update `ux-study.md` with testing insights

---

## Impact

**What changes:**
- Design system codified and traceable
- UX patterns documented for consistency
- Accessibility standards explicit
- Anti-patterns called out to prevent drift

**What stays:**
- Current color palette (minor refinements only)
- Current typography hierarchy
- Current component structure
- Explanation-first philosophy

**What improves:**
- Clarity on what NOT to copy from external systems
- Explicit Spanish localization standards
- Responsive patterns codified
- Accessibility compliance tracked

---

## Decision Location

Full design direction proposal with detailed specs:  
**`.squad/decisions/inbox/lambert-redesign-direction.md`**

Review, approve, or request changes there.

---

**— Lambert**  
Frontend Dev, Batalla IAS
