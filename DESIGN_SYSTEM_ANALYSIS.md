# Design System & Accessibility Analysis
## Comprehensive UI/UX Consistency Audit

**Date:** Analysis for full accessibility-focused redesign  
**Scope:** Timeline, AskMemvella (Memories tab), Memory Detail, Save, Edit pages + shared components

---

## Section A: File-by-File Issues

### 1. `src/app/timeline/page.tsx`

#### Typography Issues
- **Line 94:** Date text uses `text-sm font-medium` ✅ (correct)
- **Line 97:** Card title uses `text-lg` ✅ (consistent with AskMemvella)
- **Line 104:** Description text uses `text-base` ❌ (should be `text-sm` to match AskMemvella collapsed state)
- **Line 116:** People text uses `text-base` ❌ (should be `text-sm` to match AskMemvella)
- **Line 129:** Section label uses `mv-section-label` ✅ (correct)
- **Line 130:** H1 uses `text-3xl sm:text-4xl md:text-5xl` ✅ (matches home screen)
- **Line 131:** Helper text uses `text-lg` ❌ (should be `text-sm` for helper text)
- **Line 186:** Helper text uses `text-lg` ❌ (should be `text-sm`)
- **Line 203:** Helper text uses `text-lg` ❌ (should be `text-sm`)

#### Spacing Issues
- **Line 93:** Card content uses `space-y-3` ✅ (consistent)
- **Line 127:** Loading state missing `py-12 sm:py-16` ❌ (has `gap-6 sm:gap-8 py-12 sm:py-16` but structure is wrong - should be container with padding)
- **Line 145:** Empty state missing `py-12 sm:py-16` ❌ (same issue)
- **Line 181:** Main container has `gap-6 sm:gap-8 py-12 sm:py-16 space-y-8` ❌ (mixing gap and space-y is inconsistent)
- **Line 182:** Section uses `space-y-5` ❌ (should be `space-y-3` or `space-y-4` for consistency)
- **Line 184:** Nested section uses `space-y-3` ✅ (correct)
- **Line 190:** Nested section uses `space-y-3` ✅ (correct)
- **Line 209:** Bucket container uses `space-y-8` ✅ (correct for major sections)
- **Line 221:** Bucket section uses `space-y-3` ✅ (correct)
- **Line 239:** Memory cards container uses `space-y-6 md:space-y-8` ❌ (should be `space-y-4` to match AskMemvella)

#### Color Issues
- **Line 94:** Date uses `text-[var(--mv-text-muted)]` ✅ (correct)
- **Line 97:** Title uses `text-[var(--mv-primary)]` ✅ (correct)
- **Line 104:** Description uses `text-[var(--mv-text)]` ❌ (should be `text-[var(--mv-text-muted)]` when collapsed, like AskMemvella)
- **Line 116:** People uses `text-[var(--mv-text-muted)]` ✅ (correct)

#### Component Geometry Issues
- **Line 88:** Image uses `rounded-xl` ✅ (consistent)
- **Line 81:** Card has `hover:-translate-y-0.5` ✅ (consistent)
- **Line 75-121:** Memory card wrapped in `<Link>` ❌ (should use expand-first pattern like AskMemvella, then navigate on button click)

#### Navigation Issues
- **Line 75-121:** Entire card is a `<Link>` ❌ (conflicts with expand-first UX pattern)
- **Line 79:** Has `aria-label` ✅ (good)
- **Line 78:** Has focus styles ✅ (good)

#### Accessibility Issues
- **Line 221:** Bucket sections missing `role="region"` and `aria-label` ❌
- **Line 230:** Toggle button has `aria-expanded` ✅ (good)
- **Line 239:** Container has `aria-live="polite"` ✅ (good)
- **Line 228-236:** Toggle button missing `role="button"` (implicit but explicit is better) and `aria-controls` ❌
- **Line 239:** Memory list missing `role="list"` and items missing `role="listitem"` ❌

---

### 2. `src/components/AskMemvellaPanel.tsx` (Memories Tab Only)

#### Typography Issues
- **Line 342:** Date uses `text-sm font-medium` ✅ (correct)
- **Line 345:** Card title uses `text-lg` ✅ (correct)
- **Line 352-359:** Description uses `text-sm` ✅ (correct - matches collapsed/expanded pattern)
- **Line 362:** People uses `text-sm font-medium` ✅ (correct)
- **Line 409:** Heading uses `text-base sm:text-lg` ❌ (should match home screen pattern or be consistent with page headings)
- **Line 415:** Description uses `text-base` ❌ (should be `text-sm` for helper text)
- **Line 642:** Bucket label uses `text-xs font-semibold uppercase tracking-wide` ✅ (correct for section labels)

#### Spacing Issues
- **Line 341:** Card content uses `space-y-3` ✅ (consistent)
- **Line 608:** Memory list uses `space-y-6` ❌ (should be `space-y-4` for tighter spacing)
- **Line 641:** Bucket section uses `space-y-3` ✅ (correct)
- **Line 645:** Memory cards use `space-y-4` ✅ (correct)

#### Color Issues
- **Line 342:** Date uses `text-[var(--mv-text-muted)]` ✅ (correct)
- **Line 345:** Title uses `text-[var(--mv-primary)]` ✅ (correct)
- **Line 352-359:** Description uses `text-[var(--mv-text-muted)]` ✅ (correct)
- **Line 362:** People uses `text-[var(--mv-text-muted)]` ✅ (correct)

#### Component Geometry Issues
- **Line 336:** Image uses `rounded-xl` ✅ (consistent)
- **Line 329:** Card has `hover:-translate-y-0.5 cursor-pointer` ✅ (consistent)
- **Line 370-388:** Action buttons use `rounded-full` ❌ (should use Button component for consistency)
- **Line 370:** View button uses custom styling ❌ (should use Button component)
- **Line 380:** Edit button uses custom styling ❌ (should use Button component)

#### Navigation Issues
- **Line 321-394:** Card is a `<button>` with expand/collapse ✅ (correct expand-first pattern)
- **Line 373:** View button uses `router.push()` ✅ (correct)
- **Line 383:** Edit button uses `router.push()` ✅ (correct)
- **Line 326:** Has `aria-expanded` ✅ (good)
- **Line 327:** Has `aria-label` ✅ (good)

#### Accessibility Issues
- **Line 321:** Button has proper ARIA ✅ (good)
- **Line 367-388:** Expanded content missing `role="region"` and `aria-label` ❌
- **Line 640:** Bucket sections missing `role="region"` and `aria-label` ❌
- **Line 645:** Memory list missing `role="list"` and items missing `role="listitem"` ❌

---

### 3. `src/app/memory/[id]/page.tsx`

#### Typography Issues
- **Line 184:** Loading state missing section label ❌
- **Line 286:** Date uses `text-sm font-medium` ✅ (correct)
- **Line 290:** H1 uses `text-2xl sm:text-3xl` ❌ (should be `text-3xl sm:text-4xl md:text-5xl` to match home screen)
- **Line 293:** Badge has `text-sm` class ❌ (Badge component already has size, shouldn't override)
- **Line 309:** "People" label uses `text-base` ❌ (should be `text-lg` or `text-xl` for section headings)
- **Line 310:** People value uses `text-lg` ❌ (should be `text-base` for body text)
- **Line 315:** "Description" label uses `text-lg` ✅ (correct)
- **Line 316:** Description uses `text-base` ✅ (correct)
- **Line 326:** H2 uses `text-xl sm:text-2xl` ❌ (should be consistent with other h2s - check pattern)
- **Line 329:** Helper text uses `text-base` ❌ (should be `text-sm`)
- **Line 334:** Tone indicator uses `text-lg` ❌ (should be `text-sm` for helper text)
- **Line 342:** Label uses `text-lg` ❌ (should be `text-base` for form labels)
- **Line 374:** Cue card text uses `text-lg` ✅ (correct for body text in card)

#### Spacing Issues
- **Line 183:** Loading state uses `space-y-4` ❌ (should use `space-y-8` for page-level spacing)
- **Line 195:** Not found uses `space-y-6` ❌ (should use `space-y-8`)
- **Line 235:** Main container uses `space-y-8` ✅ (correct)
- **Line 244:** Navigation uses `gap-3` ✅ (correct)
- **Line 259:** Button group uses `gap-3` ✅ (correct)
- **Line 284:** Card content uses `space-y-6` ✅ (correct for card content)
- **Line 285:** Card section uses `space-y-3` ✅ (correct)
- **Line 308:** People section uses `space-y-2` ✅ (correct)
- **Line 314:** Description section uses `space-y-3` ✅ (correct)
- **Line 324:** Cue card section uses `space-y-6` ✅ (correct)
- **Line 340:** Form section uses `space-y-3` ✅ (correct)
- **Line 368:** Cue card display uses `p-5` ❌ (should use Card padding `p-8` or match design system)

#### Color Issues
- **Line 286:** Date uses `text-[var(--mv-text-muted)]` ✅ (correct)
- **Line 290:** Title uses `text-[var(--mv-primary)]` ✅ (correct)
- **Line 310:** People value uses `text-[var(--mv-text)]` ✅ (correct)
- **Line 316:** Description uses `text-[var(--mv-text)]` ✅ (correct)
- **Line 329:** Helper text uses `text-[var(--mv-text-muted)]` ✅ (correct)
- **Line 334:** Tone indicator uses `text-[var(--mv-text-muted)]` ✅ (correct)

#### Component Geometry Issues
- **Line 303:** Image uses `rounded-xl` ✅ (consistent)
- **Line 368:** Cue card uses `rounded-[24px]` ✅ (matches Card component)
- **Line 232:** Tone selector uses `rounded-[18px]` ✅ (matches field geometry)

#### Navigation Issues
- **Line 196-200:** Back link uses `<Link>` ✅ (correct)
- **Line 245-250:** Back link uses `<Link>` ✅ (correct)
- **Line 251-256:** Home link uses `<Link>` ✅ (correct)
- **Line 261-270:** Edit/Timeline buttons use `Button asChild` with `<Link>` ✅ (correct, but check for nested `<a>` issues)

#### Accessibility Issues
- **Line 184:** Loading state missing `role="status"` and `aria-live="polite"` ❌
- **Line 238:** Success message has `role="alert"` ✅ (good)
- **Line 276:** Delete button has `aria-label` ✅ (good)
- **Line 368:** Cue card display has `aria-live="polite"` ✅ (good)
- **Line 342:** Tone selector missing `aria-label` (has label but should be connected) ❌
- **Line 362:** Generate button has `aria-label` ✅ (good)
- **Line 308-312:** People section missing semantic structure ❌
- **Line 314-319:** Description section missing semantic structure ❌

---

### 4. `src/app/save/page.tsx`

#### Typography Issues
- **Line 153:** H1 uses `text-3xl sm:text-4xl md:text-5xl` ✅ (matches home screen)
- **Line 156:** Helper text uses `text-lg` ❌ (should be `text-sm`)
- **Line 167:** Label uses `text-base font-semibold` ❌ (should be `text-sm font-medium` for form labels, or `text-base font-semibold` if that's the pattern - need to check)
- **Line 180:** Helper text uses `text-sm` ✅ (correct)
- **Line 188:** Label uses `text-base font-semibold` ❌ (inconsistent with line 167)
- **Line 201:** Helper text uses `text-sm` ✅ (correct)
- **Line 209:** Label uses `text-base font-semibold` ❌ (inconsistent)
- **Line 222:** Helper text uses `text-sm` ✅ (correct)
- **Line 230:** Label uses `text-base font-semibold` ❌ (inconsistent)
- **Line 255:** Label uses `text-base font-semibold` ❌ (inconsistent)
- **Line 268:** Helper text uses `text-sm` ✅ (correct)
- **Line 276:** Label uses `text-base font-semibold` ❌ (inconsistent)
- **Line 318:** Helper text uses `text-sm` ✅ (correct)
- **Line 341:** Draft saved uses `text-sm` ✅ (correct)

#### Spacing Issues
- **Line 137:** Main container uses `space-y-8` ✅ (correct)
- **Line 138:** Navigation uses `gap-3` ✅ (correct)
- **Line 152:** Header uses `space-y-3` ✅ (correct)
- **Line 163:** Form uses `space-y-4` ❌ (should be `space-y-6` to match edit page)
- **Line 323:** Button group uses `gap-3` ✅ (correct)

#### Color Issues
- **Line 156:** Helper text uses `text-[var(--mv-text-muted)]` ✅ (correct)
- **Line 167:** Label uses `text-[var(--mv-primary)]` ✅ (correct)
- **Line 180:** Helper text uses `text-[var(--mv-text-muted)]` ✅ (correct)

#### Component Geometry Issues
- **Line 24:** Field classes use `rounded-[18px]` ✅ (matches design system)
- **Line 312:** Image preview uses `rounded-xl` ✅ (consistent)
- **Line 303:** Photo button uses `rounded-full` ❌ (should match Button component or use Button)

#### Navigation Issues
- **Line 139-150:** Navigation links use `<Link>` ✅ (correct)
- **Line 335:** Cancel button uses `router.push()` ✅ (correct)

#### Accessibility Issues
- **Line 197:** Textarea has `aria-describedby` ✅ (good)
- **Line 201:** Helper text has matching `id` ✅ (good)
- **Line 219:** Date input has `aria-describedby` ✅ (good)
- **Line 222:** Helper text has matching `id` ✅ (good)
- **Line 264:** People input has `aria-describedby` ✅ (good)
- **Line 268:** Helper text has matching `id` ✅ (good)
- **Line 296:** Image input has conditional `aria-describedby` ✅ (good)
- **Line 302:** Photo button missing `aria-label` (has it) ✅ (good - line 302)
- **Line 341:** Draft saved has `aria-live="polite"` ✅ (good)
- **Line 165:** Title label missing `htmlFor` connection (has it) ✅ (good - line 171)
- **Line 186:** Description label missing `htmlFor` connection (has it) ✅ (good - line 192)

---

### 5. `src/app/memory/[id]/edit/page.tsx`

#### Typography Issues
- **Line 274:** Loading back link uses `text-sm font-semibold uppercase tracking-[0.3em]` ❌ (inconsistent with other back links which use `text-lg font-semibold`)
- **Line 278:** H1 uses `text-3xl sm:text-4xl md:text-5xl` ✅ (matches home screen)
- **Line 296:** Not found back link uses `text-sm font-semibold uppercase tracking-[0.3em]` ❌ (inconsistent)
- **Line 300:** H1 uses `text-3xl md:text-4xl` ❌ (should be `text-3xl sm:text-4xl md:text-5xl`)
- **Line 337:** H1 uses `text-3xl sm:text-4xl md:text-5xl` ✅ (correct)
- **Line 340:** Helper text uses `text-base` ❌ (should be `text-sm`)
- **Line 351:** Label uses `text-base font-semibold` ✅ (consistent with save page)
- **Line 377:** Label uses `text-base font-semibold` ✅ (consistent)
- **Line 406:** Helper text uses `text-sm` ✅ (correct)
- **Line 414:** Label uses `text-base font-semibold` ✅ (consistent)
- **Line 438:** Helper text uses `text-sm` ✅ (correct)
- **Line 446:** Label uses `text-base font-semibold` ✅ (consistent)
- **Line 465:** Label uses `text-base font-semibold` ✅ (consistent)
- **Line 480:** Helper text uses `text-sm` ✅ (correct)
- **Line 488:** Label uses `text-base font-semibold` ✅ (consistent)
- **Line 531:** Helper text uses `text-base` ❌ (should be `text-sm`)
- **Line 593:** Draft saved uses `text-sm` ✅ (correct)

#### Spacing Issues
- **Line 271:** Loading state uses `space-y-6` ❌ (should use `space-y-8`)
- **Line 293:** Not found uses `space-y-6` ❌ (should use `space-y-8`)
- **Line 321:** Main container uses `space-y-8` ✅ (correct)
- **Line 322:** Navigation uses `gap-3` ✅ (correct)
- **Line 336:** Header uses `space-y-3` ✅ (correct)
- **Line 347:** Form uses `space-y-6` ✅ (correct)
- **Line 571:** Button group uses `gap-3` ✅ (correct)

#### Color Issues
- All colors appear consistent ✅

#### Component Geometry Issues
- **Line 70-71:** Field classes use `rounded-[18px]` ✅ (matches design system)
- **Line 523:** Image preview uses `rounded-xl` ✅ (consistent)
- **Line 538:** Existing image uses `rounded-xl` ✅ (consistent)
- **Line 514:** Photo button uses `rounded-full` ❌ (should use Button component)

#### Navigation Issues
- **Line 272-277:** Loading back link uses `<Link>` ✅ (correct)
- **Line 294-299:** Not found back link uses `<Link>` ✅ (correct)
- **Line 323-334:** Navigation links use `<Link>` ✅ (correct)
- **Line 586:** Cancel button uses `router.push()` ✅ (correct)

#### Accessibility Issues
- **Line 362:** Title input has `aria-invalid` and `aria-describedby` ✅ (good)
- **Line 367:** Error message has `role="alert"` ✅ (good)
- **Line 388:** Description textarea has `aria-invalid` and `aria-describedby` ✅ (good)
- **Line 397:** Error message has `role="alert"` ✅ (good)
- **Line 424:** Date input has `aria-invalid` and `aria-describedby` ✅ (good)
- **Line 433:** Error message has `role="alert"` ✅ (good)
- **Line 455:** Importance select has `aria-label` ✅ (good)
- **Line 476:** People input has `aria-describedby` and `aria-label` ✅ (good)
- **Line 508:** Image input has conditional `aria-describedby` ✅ (good)
- **Line 514:** Photo button missing explicit `aria-label` (has it implicitly via onClick) ❌ (should be explicit)
- **Line 549:** Save photo button has `aria-label` ✅ (good)
- **Line 563:** Remove photo button has `aria-label` ✅ (good)
- **Line 577:** Submit button has `aria-label` ✅ (good)
- **Line 588:** Cancel button has `aria-label` ✅ (good)
- **Line 593:** Draft saved has `aria-live="polite"` ✅ (good)

---

### 6. `src/app/globals.css`

#### Design System Tokens
- All CSS variables are defined ✅
- `.mv-section-label` class defined ✅
- Focus styles defined ✅
- All tokens appear consistent ✅

---

### 7. `src/components/ui/Card.tsx`

#### Component Issues
- **Line 12:** Uses `rounded-[24px]` ✅ (correct)
- **Line 12:** Uses `p-8` ✅ (correct default padding)
- **Line 12:** Uses `border border-[var(--mv-border)]` ✅ (correct)
- **Line 12:** Uses `bg-[var(--mv-card)]` ✅ (correct)
- Component is consistent ✅

---

### 8. `src/components/ui/Button.tsx`

#### Component Issues
- **Line 30:** Uses `rounded-full` ✅ (correct)
- **Line 30:** Uses `min-h-[44px]` ✅ (meets touch target requirement)
- **Line 30:** Has focus styles ✅ (correct)
- All variants defined ✅
- Component is consistent ✅

---

### 9. `src/components/ui/Badge.tsx`

#### Component Issues
- **Line 17:** Uses `rounded-full` ✅ (correct)
- **Line 17:** Uses `min-h-[34px]` ❌ (should be `min-h-[44px]` for touch targets, but badges might not be interactive - check usage)
- **Line 17:** Uses `text-[0.95rem]` ❌ (should use standard text size class like `text-sm`)
- Component variants defined ✅

---

## Section B: System-Wide Changes

### Typography System

#### Heading Scale (Standardize)
- **H1 (Page titles):** `text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--mv-primary)]`
  - ✅ Home screen
  - ✅ Timeline
  - ✅ Save page
  - ✅ Edit page
  - ❌ Memory detail page (uses `text-2xl sm:text-3xl`)

- **H2 (Section titles):** `text-xl sm:text-2xl font-semibold text-[var(--mv-primary)]`
  - Need to verify consistency across all pages

- **H3 (Card titles):** `text-lg font-semibold text-[var(--mv-primary)]`
  - ✅ Timeline memory cards
  - ✅ AskMemvella memory cards

#### Text Sizes (Standardize)
- **Body text:** `text-base leading-relaxed text-[var(--mv-text)]`
- **Muted body text:** `text-sm text-[var(--mv-text-muted)]`
- **Helper text:** `text-sm text-[var(--mv-text-muted)]` (MUST be consistent)
- **Date text:** `text-sm font-medium text-[var(--mv-text-muted)]`
- **Section labels:** `.mv-section-label` class (already defined)

#### Issues to Fix
1. Memory detail page H1 size
2. Helper text inconsistencies (many use `text-lg` or `text-base` instead of `text-sm`)
3. Form label size inconsistency (some use `text-base font-semibold`, need to standardize)
4. Badge text size should use `text-sm` class instead of `text-[0.95rem]`

---

### Spacing System

#### Page-Level Spacing
- **Page container padding:** `py-12 sm:py-16` (vertical only, horizontal handled by max-width containers)
- **Page section spacing:** `space-y-8` for major sections
- **Page subsection spacing:** `space-y-3` or `space-y-4` for related content

#### Card-Level Spacing
- **Card default padding:** `p-8` (from Card component)
- **Card content spacing:** `space-y-6` for major card sections
- **Card subsection spacing:** `space-y-3` for related fields

#### Timeline-Specific Spacing
- **Bucket sections:** `space-y-8` between buckets
- **Memory cards within bucket:** `space-y-4` (currently inconsistent: timeline uses `space-y-6 md:space-y-8`, AskMemvella uses `space-y-4`)

#### Issues to Fix
1. Timeline page mixing `gap-6 sm:gap-8` with `space-y-8` - should use only `space-y-8`
2. Memory card spacing inconsistency between timeline and AskMemvella
3. Loading/empty states missing proper page padding structure

---

### Color System

#### Text Colors (Standardize)
- **Primary text:** `text-[var(--mv-primary)]` (headings, labels)
- **Body text:** `text-[var(--mv-text)]` (main content)
- **Muted text:** `text-[var(--mv-text-muted)]` (dates, helper text, descriptions in collapsed state)
- **Muted strong:** `text-[var(--mv-text-muted-strong)]` (section labels)

#### Issues to Fix
1. Timeline memory card descriptions use `text-[var(--mv-text)]` but should use `text-[var(--mv-text-muted)]` when collapsed (to match AskMemvella pattern)

---

### Component Geometry

#### Card Geometry
- **Card rounding:** `rounded-[24px]` ✅ (consistent)
- **Field rounding:** `rounded-[18px]` ✅ (consistent)
- **Image rounding:** `rounded-xl` ✅ (consistent - this is 12px, which is correct)

#### Button Geometry
- **Button rounding:** `rounded-full` ✅ (consistent)
- **Button min-height:** `min-h-[44px]` ✅ (meets touch target)

#### Badge Geometry
- **Badge rounding:** `rounded-full` ✅ (consistent)
- **Badge min-height:** `min-h-[34px]` ❌ (should be `min-h-[44px]` if interactive, but badges appear non-interactive)

#### Issues to Fix
1. AskMemvella action buttons (View/Edit) use custom styling instead of Button component
2. Save/Edit page photo buttons use custom `rounded-full` styling instead of Button component
3. Badge text size should use standard class

---

### Interaction Patterns

#### Expand-First Pattern (Timeline Memory Cards)
- **Current:** Timeline uses `<Link>` wrapper around entire card (click anywhere = navigate)
- **Should be:** Expand-first pattern like AskMemvella (click card = expand, click button = navigate)
- **Implementation:** Change timeline cards to use button with expand/collapse, add View/Edit buttons in expanded state

#### Navigation Patterns
- **Current:** Mix of `<Link>` and `router.push()`
- **Should be:** Use `router.push()` for programmatic navigation, `<Link>` for static links
- **Issues:** Some buttons use `Button asChild` with `<Link>` which can cause nested `<a>` issues

---

## Section C: Proposed Unified Timeline Architecture

### React Structure

```tsx
// Unified timeline page structure
<div className="min-h-screen bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]">
  {/* Fixed header */}
  <header className="sticky top-0 z-10 bg-[var(--mv-bg)]/80 backdrop-blur-sm border-b border-[var(--mv-border-soft)]">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--mv-primary)]">
        Moments you've shared
      </h1>
      <p className="text-sm text-[var(--mv-text-muted)] mt-2">
        Your moments are organised by when they happened. The newest ones appear first.
      </p>
    </div>
  </header>

  {/* Scrollable timeline region */}
  <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 overflow-y-auto" role="main" aria-label="Timeline of memories">
    <div className="space-y-8">
      {bucketOrder.map((bucketKey) => {
        const bucketMemories = bucketedMemories?.get(bucketKey) ?? [];
        if (bucketMemories.length === 0) return null;

        const isExpanded = expandedBuckets.has(bucketKey);
        
        return (
          <section
            key={bucketKey}
            role="region"
            aria-labelledby={`bucket-${bucketKey}-label`}
            className="space-y-4"
          >
            {/* Collapsible bucket header */}
            <button
              type="button"
              onClick={() => toggleBucket(bucketKey)}
              className="flex items-center justify-between w-full text-left"
              aria-expanded={isExpanded}
              aria-controls={`bucket-${bucketKey}-content`}
              id={`bucket-${bucketKey}-label`}
            >
              <p className="mv-section-label">
                {getBucketLabel(bucketKey)} ({bucketMemories.length})
              </p>
              <span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
            </button>

            {/* Bucket content */}
            {isExpanded && (
              <div
                id={`bucket-${bucketKey}-content`}
                role="list"
                aria-label={`Memories from ${getBucketLabel(bucketKey)}`}
                className="space-y-4"
                aria-live="polite"
              >
                {bucketMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    role="listitem"
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  </main>
</div>
```

### MemoryCard Component Structure

```tsx
function MemoryCard({ memory, role }: { memory: Memory; role?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  return (
    <article
      role={role}
      className="..."
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? `Collapse memory: ${memory.title}` : `Expand memory: ${memory.title}`}
      >
        <Card className="hover:-translate-y-0.5">
          {/* Collapsed content */}
          <div className="flex gap-4">
            {memory.imageUrl && (
              <img
                src={memory.imageUrl}
                alt={`Photo for memory: ${memory.title}`}
                className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-[var(--mv-text-muted)]">
                {formatDate(memory.date)}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-lg font-semibold text-[var(--mv-primary)]">
                  {memory.title}
                </h3>
                <Badge variant={memory.importance} className="self-start capitalize sm:self-end text-sm">
                  {memory.importance}
                </Badge>
              </div>
              {isExpanded ? (
                <p className="text-sm text-[var(--mv-text-muted)]">
                  {getMemoryBodyText(memory)}
                </p>
              ) : (
                <p className="text-sm text-[var(--mv-text-muted)] line-clamp-2">
                  {getMemoryBodyText(memory)}
                </p>
              )}
              {memory.people.length > 0 && (
                <p className="text-sm font-medium text-[var(--mv-text-muted)]">
                  With {memory.people.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-[var(--mv-border-soft)]" role="region" aria-label="Memory actions">
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/memory/${memory.id}`);
                  }}
                  className="min-h-[44px]"
                >
                  View
                </Button>
                <Button
                  variant="subtle"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/memory/${memory.id}/edit`);
                  }}
                  className="min-h-[44px]"
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </Card>
      </button>
    </article>
  );
}
```

### Accessibility Attributes

#### Required ARIA
- **Bucket sections:** `role="region"`, `aria-labelledby`, `aria-expanded`, `aria-controls`
- **Memory lists:** `role="list"`, `aria-label`, `aria-live="polite"`
- **Memory cards:** `role="listitem"` (when in list), `aria-expanded`, `aria-label`
- **Expanded content:** `role="region"`, `aria-label`
- **Loading states:** `role="status"`, `aria-live="polite"`
- **Error states:** `role="alert"`, `aria-live="assertive"`

#### Keyboard Navigation
- Tab order should follow visual order
- Expand/collapse should work with Enter/Space
- Focus management when expanding/collapsing

#### Screen Reader Support
- All interactive elements have descriptive `aria-label`s
- Dynamic content updates announced via `aria-live`
- Form fields properly labeled with `htmlFor`/`id` connections

---

## Section D: Risks & Dependencies

### Convex Query Dependencies
- **Risk:** Changing memory card structure shouldn't affect queries
- **Mitigation:** Memory data structure is unchanged, only presentation layer changes
- **Dependencies:** `api.memories.getMemories` and `api.memories.getMemoryById` remain unchanged

### Routing Dependencies
- **Risk:** Changing from `<Link>` to `router.push()` could affect prefetching
- **Mitigation:** Prefetching is nice-to-have, not critical. `router.push()` is more flexible for programmatic navigation
- **Dependencies:** Next.js routing remains unchanged

### State Management Dependencies
- **Risk:** Adding expand/collapse state for timeline cards requires new state management
- **Mitigation:** Use local component state (`useState`) for expand/collapse, no global state needed
- **Dependencies:** No changes to existing stores required

### Component Dependencies
- **Risk:** Button component `asChild` prop with `<Link>` can cause nested `<a>` hydration warnings
- **Mitigation:** Use `router.push()` instead of `Button asChild` with `<Link>` for programmatic navigation
- **Dependencies:** Button component remains unchanged, just usage pattern changes

### Performance Considerations
- **Risk:** Rendering all memories expanded by default could impact performance
- **Mitigation:** Keep expand-first pattern but start collapsed, expand on interaction
- **Dependencies:** No performance-critical dependencies

### Accessibility Dependencies
- **Risk:** Adding ARIA attributes incorrectly could break screen readers
- **Mitigation:** Follow WCAG 2.1 AA guidelines, test with screen readers
- **Dependencies:** No external accessibility libraries required

### Design System Dependencies
- **Risk:** Changing typography/spacing could break visual hierarchy
- **Mitigation:** Changes are standardization, not redesign. Test visual regression
- **Dependencies:** CSS variables in `globals.css` remain unchanged

---

## Summary of Critical Issues

### High Priority (Accessibility)
1. Missing `role="region"` and `aria-label` on bucket sections
2. Missing `role="list"` and `role="listitem"` on memory lists
3. Missing `aria-expanded` and `aria-controls` on collapsible sections
4. Timeline cards need expand-first pattern (currently direct navigation)
5. Touch target sizes need verification (Badge component)

### Medium Priority (Consistency)
1. Typography inconsistencies (H1 sizes, helper text sizes)
2. Spacing inconsistencies (memory card spacing, page padding)
3. Color inconsistencies (description text color in timeline)
4. Component usage inconsistencies (custom buttons vs Button component)

### Low Priority (Polish)
1. Form label size standardization
2. Badge text size standardization
3. Loading/empty state padding structure

---

## Implementation Order

1. **Phase 1: Accessibility Foundation**
   - Add ARIA attributes to all collapsible sections
   - Add role attributes to lists
   - Fix touch target sizes
   - Add expand-first pattern to timeline cards

2. **Phase 2: Typography & Spacing**
   - Standardize heading sizes
   - Standardize helper text sizes
   - Fix spacing inconsistencies
   - Fix color inconsistencies

3. **Phase 3: Component Consistency**
   - Replace custom buttons with Button component
   - Standardize form label sizes
   - Fix Badge component text size

4. **Phase 4: Unified Timeline Architecture**
   - Implement collapsible date buckets
   - Implement expand-first memory cards
   - Add full-screen locked layout
   - Test accessibility with screen readers

---

**End of Analysis**

