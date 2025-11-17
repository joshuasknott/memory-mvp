# Timeline & Save Memory Pages - UI & Accessibility Analysis

## A. Problems Found (per page)

### `/timeline` - Timeline Page

#### UX & Consistency Issues
1. **Typography Scale Inconsistency**
   - Main heading uses `text-[2rem]` (32px) instead of responsive scale like home (`text-3xl sm:text-4xl md:text-5xl`)
   - Memory card titles use `text-[1.4rem]` (22.4px) - should use `text-lg` or `text-xl` for consistency
   - Date labels use `text-base` (18px) - acceptable but could be `text-sm` for hierarchy
   - Description text uses `text-lg` - should be `text-base` to match AskMemvellaPanel
   - Section labels (`.mv-section-label`) are correct at `text-sm`

2. **Spacing Inconsistencies**
   - Page container uses `space-y-8` - home uses `gap-6 sm:gap-8` with `py-12 sm:py-16`
   - Memory cards use `space-y-5` - should align with Card component's internal spacing (p-8 = 32px padding)
   - Section gaps use `space-y-3` - inconsistent with overall spacing rhythm

3. **Interaction & Touch Targets**
   - "Show earlier memories" button has `min-h-[44px]` ✓ (correct)
   - Primary action buttons (via Button component) have `min-h-[44px]` ✓ (correct)
   - But overall card spacing between items (`space-y-6 md:space-y-8`) could be tighter to match new design

4. **Visual Hierarchy**
   - Memory cards are clickable but don't show hover states as prominently as AskMemvella memory cards
   - Missing visual connection to home page's gradient aesthetic
   - Badge placement and sizing is consistent ✓

#### Accessibility Issues
1. **Text Size Compliance**
   - Some helper text may fall below 14px minimum - needs verification
   - Section labels at `text-sm` (14px) are acceptable ✓
   - Main body text at `text-base` (18px) exceeds minimum ✓

2. **ARIA & Semantic HTML**
   - Proper use of `<Link>` components with `aria-label` on memory cards ✓
   - Section structure uses semantic `<section>` elements ✓
   - "Show earlier memories" button has `aria-expanded` ✓
   - Missing `aria-live` regions for dynamic content (when showing/hiding earlier memories)

3. **Focus Styles**
   - Links have `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]` ✓
   - Buttons inherit from Button component which has proper focus styles ✓

4. **Contrast**
   - Uses CSS variables for colors (`--mv-text`, `--mv-text-muted`) - should be verified for WCAG AA compliance
   - Text on cards uses proper color tokens ✓

### `/save` - Save Memory Page

#### UX & Consistency Issues
1. **Typography Scale Inconsistency**
   - Main heading uses `text-[2rem]` (32px) with `md:text-[2.25rem]` - should use responsive scale like home
   - Form labels use `text-lg font-semibold` - should be `text-base font-semibold` or `text-sm font-medium` to match AskMemvellaPanel form labels
   - Helper text uses `text-base` - should be `text-sm` for better hierarchy (AskMemvella uses `text-sm` for helper text)
   - Input fields use `text-lg` - should be `text-base` to match AskMemvellaPanel form inputs
   - Submit button text size comes from Button component (text-base) ✓

2. **Spacing Inconsistencies**
   - Page container uses `space-y-8` - should match home's spacing pattern
   - Form uses `space-y-6` - AskMemvellaPanel form uses `space-y-4`
   - Label spacing uses `mb-2` - should use consistent spacing tokens

3. **Form Structure & Layout**
   - Form fields use `rounded-[18px]` ✓ (matches AskMemvellaPanel)
   - But padding is `px-4 py-3.5` vs AskMemvellaPanel's `px-4 py-3.5` (same) ✓
   - Photo upload button uses custom styling instead of Button component - inconsistent
   - Cancel button uses `variant="subtle"` but styling differs from other pages

4. **Interaction Patterns**
   - Photo upload uses custom button with emoji (📷) - should use icon or text only for better accessibility
   - Autosave indicator uses `text-base` - should be `text-sm` to match helper text hierarchy
   - Missing clear visual feedback when draft is saved

#### Accessibility Issues
1. **Text Size Compliance**
   - Helper text at `text-base` (18px) exceeds minimum but should be `text-sm` for hierarchy
   - Form labels at `text-lg` (18px) exceed minimum ✓ but inconsistent with design system
   - Input text at `text-lg` (18px) - should be `text-base` (16px minimum, but 18px exceeds)

2. **Form Labels & Descriptions**
   - Labels are properly associated with inputs via `htmlFor` ✓
   - Helper text uses `id` attributes and `aria-describedby` where needed ✓
   - Date field has `aria-describedby="date-help"` ✓
   - But not all helper texts have proper IDs for `aria-describedby`

3. **Touch Targets**
   - Submit button via Button component has `min-h-[44px]` ✓
   - Photo upload button has `min-h-[44px]` ✓
   - Cancel button via Button component has `min-h-[44px]` ✓
   - File input is hidden with `sr-only` and triggered by visible button ✓

4. **ARIA & Semantic HTML**
   - Form has proper `<form>` element with `onSubmit` ✓
   - Autosave message uses `aria-live="polite"` ✓
   - Missing error announcements - should use `role="alert"` for error messages
   - Photo upload button missing descriptive `aria-label`

5. **Focus Styles**
   - Inputs have proper focus styles via `focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)]` ✓
   - But focus outline offset may not be sufficient (uses default, should be 2-4px)

6. **Contrast**
   - Uses CSS variables - needs verification for WCAG AA
   - Error states not clearly defined in current styling

### `/memory/[id]` - Memory Detail Page

#### UX & Consistency Issues
1. **Typography Scale Inconsistency**
   - Main heading uses `text-[1.75rem]` (28px) - should use `text-2xl` or `text-3xl` scale
   - Section heading (Memory summary) uses `text-[1.5rem]` (24px) - should use `text-xl` or `text-2xl`
   - Date text uses `text-base` - acceptable
   - Description uses `text-lg` - should be `text-base` for consistency
   - People section heading uses `text-lg font-semibold` - should be `text-base font-semibold`

2. **Spacing Inconsistencies**
   - Page uses `space-y-8` - consistent with other pages but should align with home
   - Card content uses `space-y-8` - Card component already has p-8 padding, may be too much
   - Form section (tone selector) uses `space-y-6` - inconsistent with AskMemvellaPanel

3. **Interaction Patterns**
   - Delete button uses `variant="secondary"` with custom text color - should use `variant="danger"` if available
   - Button layout in header uses flex with gaps - good responsive pattern ✓
   - Tone selector uses custom classes instead of shared field styles

#### Accessibility Issues
1. **Text Size Compliance**
   - All text meets minimum 14px requirement ✓
   - But typography scale doesn't match updated design system

2. **ARIA & Semantic HTML**
   - Success message uses `role="alert"` ✓
   - Delete button has `aria-label` ✓
   - Generate button has `aria-label` ✓
   - Missing `aria-live` region for cue card generation status

3. **Touch Targets**
   - All buttons via Button component have `min-h-[44px]` ✓
   - Tone selector dropdown may not meet 44px height requirement - needs verification

4. **Focus Styles**
   - Buttons inherit proper focus styles ✓
   - Links have proper focus styles ✓

### `/memory/[id]/edit` - Edit Memory Page

#### UX & Consistency Issues
1. **Typography Scale Inconsistency**
   - Main heading uses `text-[2rem]` with `md:text-[2.25rem]` - should use responsive scale
   - Description uses `text-base text-[var(--mv-text-dark)]/75` - should use standard text color tokens
   - Form labels use `text-lg font-semibold` - should be `text-base font-semibold` or `text-sm font-medium`
   - Helper text uses `text-sm text-[var(--mv-text-dark)]/65` - good size but color opacity should use standard tokens
   - Error messages use `text-sm` ✓

2. **Field Styling Inconsistency**
   - Uses custom `baseFieldClasses` with `rounded-2xl` (16px) instead of `rounded-[18px]` like AskMemvellaPanel
   - Uses `bg-white/95` instead of `bg-[var(--mv-card)]` for consistency
   - Focus ring uses same pattern but border radius differs

3. **Form Validation**
   - Has proper error handling and display ✓
   - Error messages use proper ARIA attributes ✓
   - But styling uses hardcoded error color `#b42318` instead of CSS variable

#### Accessibility Issues
1. **Text Size Compliance**
   - All text meets minimums ✓
   - But typography hierarchy doesn't match new design system

2. **Form Labels & Descriptions**
   - Labels properly associated ✓
   - `aria-invalid` used correctly ✓
   - `aria-describedby` links to error messages ✓
   - Helper text has proper IDs ✓

3. **Touch Targets**
   - All buttons meet 44px requirement ✓
   - File input properly handled ✓

4. **Contrast**
   - Error color `#b42318` needs verification for contrast
   - Text opacity (`/75`, `/65`) may reduce contrast below WCAG AA

## B. Required Changes (grouped)

### Timeline – Layout, Typography, Interaction

1. **Typography Updates**
   - Change main heading from `text-[2rem]` to responsive scale: `text-3xl sm:text-4xl md:text-5xl font-semibold`
   - Change memory card titles from `text-[1.4rem]` to `text-xl font-semibold`
   - Change description text from `text-lg` to `text-base leading-relaxed`
   - Keep date labels at `text-base` but consider `text-sm` for better hierarchy
   - Ensure all text uses proper color tokens

2. **Spacing Alignment**
   - Update page container spacing to match home: `gap-6 sm:gap-8` with `py-12 sm:py-16`
   - Adjust section spacing to use consistent `space-y-6` or `space-y-8`
   - Review memory card internal spacing to ensure it matches Card component padding

3. **Interaction Improvements**
   - Ensure hover states match AskMemvellaPanel memory cards
   - Add `aria-live="polite"` region for dynamic content (show/hide earlier memories)
   - Verify all interactive elements have clear focus indicators

### Save Memory – Layout, Form Structure, Helper Text, Interaction

1. **Typography Updates**
   - Change main heading to responsive scale: `text-3xl sm:text-4xl md:text-5xl font-semibold`
   - Change form labels from `text-lg font-semibold` to `text-base font-semibold` (or `text-sm font-medium`)
   - Change helper text from `text-base` to `text-sm`
   - Change input text from `text-lg` to `text-base`
   - Change autosave indicator from `text-base` to `text-sm`

2. **Form Structure Updates**
   - Ensure all form fields use `rounded-[18px]` (already correct)
   - Replace photo upload custom button with Button component or ensure consistent styling
   - Add proper `aria-label` to photo upload button
   - Add `role="alert"` to error messages
   - Ensure all helper text has proper `id` attributes for `aria-describedby`

3. **Spacing & Layout**
   - Update page container spacing to match home pattern
   - Adjust form spacing from `space-y-6` to `space-y-4` to match AskMemvellaPanel
   - Ensure consistent label spacing (`mb-2` is fine but verify hierarchy)

### Shared Visual Alignment with Home Screen

1. **Color & Styling Consistency**
   - Ensure all pages use CSS color variables consistently
   - Verify gradient aesthetics are referenced where appropriate
   - Ensure Card component padding and border radius are consistent (currently `rounded-[24px] p-8`)

2. **Component Alignment**
   - Verify Button component usage is consistent across all pages
   - Ensure Badge component styling matches across timeline and detail pages
   - Ensure Card component usage is consistent

3. **Responsive Patterns**
   - Apply consistent responsive typography scales
   - Ensure spacing patterns scale appropriately on mobile vs desktop
   - Verify button layouts use consistent flex patterns

### Accessibility Improvements

#### Minimum Text Sizes
- Verify all text meets 14px minimum (most already do, but verify helper texts)
- Update helper text to `text-sm` (14px) where currently `text-base` (18px) for hierarchy

#### 44px Touch Targets
- ✅ Most buttons already meet requirement via Button component
- Verify tone selector dropdown height on memory detail page
- Verify photo upload button height (currently has `min-h-[44px]` ✓)

#### ARIA
- Add `aria-live="polite"` regions for dynamic content updates (timeline show/hide, cue card generation)
- Add `role="alert"` to error messages in save/edit forms
- Ensure all form helper text has proper `id` attributes
- Add descriptive `aria-label` to photo upload buttons
- Verify `aria-describedby` links are complete on all form fields

#### Contrast
- Audit all text colors against WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Review opacity usage (`/75`, `/65`) - may need to use standard muted color tokens instead
- Verify error color `#b42318` meets contrast requirements
- Ensure focus indicators have sufficient contrast

#### Focus Styles
- Verify all interactive elements have visible focus indicators
- Ensure focus outline offset is 2-4px (currently varies)
- Verify focus ring color (`--mv-accent`) meets contrast requirements
- Ensure focus styles work on both light and dark backgrounds

## C. Implementation Checklist

### File: `src/app/timeline/page.tsx`

**Changes:**
- Update main heading typography from `text-[2rem]` to `text-3xl sm:text-4xl md:text-5xl font-semibold`
- Update page container spacing from `space-y-8` to match home pattern: `gap-6 sm:gap-8 py-12 sm:py-16`
- Update memory card title from `text-[1.4rem]` to `text-xl font-semibold`
- Update memory card description from `text-lg` to `text-base leading-relaxed`
- Add `aria-live="polite"` region for "earlier memories" show/hide functionality
- Adjust section spacing to use consistent `space-y-6`

### File: `src/app/save/page.tsx`

**Changes:**
- Update main heading typography from `text-[2rem] md:text-[2.25rem]` to `text-3xl sm:text-4xl md:text-5xl font-semibold`
- Update form labels from `text-lg font-semibold` to `text-base font-semibold`
- Update helper text from `text-base` to `text-sm`
- Update input field text from `text-lg` to `text-base`
- Update autosave indicator from `text-base` to `text-sm`
- Change form spacing from `space-y-6` to `space-y-4`
- Add `role="alert"` to error messages (when using StatusContext, ensure it uses alert)
- Add `aria-label` to photo upload button: `aria-label="Add a photo to this memory"`
- Ensure all helper text has proper `id` attributes for `aria-describedby` links

### File: `src/app/memory/[id]/page.tsx`

**Changes:**
- Update main heading from `text-[1.75rem]` to `text-2xl sm:text-3xl font-semibold`
- Update "Memory summary" heading from `text-[1.5rem]` to `text-xl sm:text-2xl font-semibold`
- Update description text from `text-lg` to `text-base leading-relaxed`
- Update "People" section heading from `text-lg font-semibold` to `text-base font-semibold`
- Update card content spacing from `space-y-8` to `space-y-6` (reduce excessive spacing)
- Add `aria-live="polite"` region for cue card generation status
- Update tone selector to use shared field classes (or ensure it meets 44px height)
- Consider using `variant="danger"` for delete button if available, otherwise keep current styling

### File: `src/app/memory/[id]/edit/page.tsx`

**Changes:**
- Update main heading typography from `text-[2rem] md:text-[2.25rem]` to `text-3xl sm:text-4xl md:text-5xl font-semibold`
- Update description text from `text-base text-[var(--mv-text-dark)]/75` to `text-base text-[var(--mv-text-muted)]`
- Update form labels from `text-lg font-semibold` to `text-base font-semibold`
- Update helper text color from `text-[var(--mv-text-dark)]/65` to `text-sm text-[var(--mv-text-muted)]`
- Update field classes: change `rounded-2xl` to `rounded-[18px]` to match AskMemvellaPanel
- Update field background from `bg-white/95` to `bg-[var(--mv-card)]`
- Replace hardcoded error color `#b42318` with CSS variable (or ensure variable exists)
- Verify error message contrast meets WCAG AA requirements

### File: `src/app/globals.css` (if needed)

**Changes:**
- Add CSS variable for error color if not exists: `--mv-danger: #b42318` (verify contrast)
- Ensure all color tokens meet WCAG AA contrast requirements
- Verify focus ring contrast ratios

### Shared Component Verification

**Card Component** (`src/components/ui/Card.tsx`):
- ✅ Already uses `rounded-[24px] p-8` - consistent
- ✅ Uses proper border and shadow tokens - consistent

**Button Component** (`src/components/ui/Button.tsx`):
- ✅ Already has `min-h-[44px]` - meets touch target requirement
- ✅ Uses proper focus styles - consistent

**Badge Component** (`src/components/ui/Badge.tsx`):
- ✅ Already uses proper sizing and colors - consistent

## Notes

- All changes are UI/UX focused - no backend or schema modifications needed
- Typography changes should maintain visual hierarchy while aligning with new design system
- Spacing updates should create visual rhythm consistency across all pages
- Accessibility improvements ensure WCAG AA compliance and better user experience
- Focus on incremental, safe changes that don't break existing functionality

