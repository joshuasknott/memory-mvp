# Accessibility & Cognitive Load Audit - Memvella MVP

## Pages Mapped

### Timeline/Home Views
- **Home Page**: `src/app/page.tsx`
- **Timeline Page**: `src/app/timeline/page.tsx`

### Memory Detail View
- **Memory Detail Page**: `src/app/memory/[id]/page.tsx`

### Add Memory
- **Save Memory Page**: `src/app/save/page.tsx`

### Edit Memory
- **Edit Memory Page**: `src/app/memory/[id]/edit/page.tsx`

---

## Issues & Proposed Fixes by Page

### 1. HOME PAGE (`src/app/page.tsx`)

**Issues:**
- **No clear primary action** - All buttons have equal visual weight, making it unclear what the main action should be
- **Inconsistent button placement** - Buttons change from vertical stack (mobile) to horizontal row (desktop), which can be disorienting
- **Missing semantic landmarks** - No `<main>` tag or ARIA landmarks to help screen readers navigate

**Proposed Fixes:**
- Convert button layout to single-column vertical stack on all screen sizes
- Emphasize primary action ("Save a New Memory") with larger size or distinct styling
- Add `<main>` element with proper role
- Add skip navigation link for keyboard users
- Consider adding visual icons to buttons for better recognition

---

### 2. TIMELINE PAGE (`src/app/timeline/page.tsx`)

**Issues:**
- **Multi-column card layout** - Date/title on left, importance badge on right creates visual scanning difficulty
- **Very small text sizes** - Date uses `text-xs` (12px), importance badge uses `text-xs` (12px) - too small for users with vision or cognitive issues
- **Low contrast on date text** - `text-slate-500` may not meet WCAG contrast requirements
- **Unclear clickable areas** - Entire card is clickable but no visual indication (hover state only)
- **No semantic structure** - Cards should use `<article>` elements, list should use proper list structure
- **Missing headings hierarchy** - No h2 headings for individual memory cards
- **Truncated text without indication** - Description truncation happens silently, no "read more" indicator
- **Importance labels are vague** - "low", "medium", "high" without context or icons

**Proposed Fixes:**
- Convert to single-column layout with all information stacked vertically
- Increase date text to at least `text-base` (16px) with higher contrast (text-slate-700 or text-slate-900)
- Increase importance badge text to `text-sm` (14px) minimum
- Add clear visual indication that cards are clickable (border on hover, pointer cursor, or button-like styling)
- Wrap each memory card in `<article>` with proper heading structure
- Add visible "..." or "Read more" indicator when description is truncated
- Replace importance text with icons + text (e.g., ⭐ Low, ⭐⭐ Medium, ⭐⭐⭐ High) or use more descriptive labels
- Add ARIA labels to clickable cards: `aria-label="View memory: {title}"`

---

### 3. MEMORY DETAIL PAGE (`src/app/memory/[id]/page.tsx`)

**Issues:**
- **Multiple buttons in horizontal row** - Back, Edit, Delete buttons side-by-side can be overwhelming
- **Destructive action without proper confirmation** - Delete uses browser `confirm()` dialog which is not accessible and lacks context
- **Inconsistent button placement** - Back button on left, Edit/Delete on right creates visual confusion
- **Small date text** - Date uses `text-sm` (14px) which may be too small
- **Vague button labels** - "Back to Timeline" is clear, but "Edit Memory" and "Delete Memory" could be more specific (e.g., "Edit This Memory", "Delete This Memory")
- **Missing semantic structure** - Content sections (People, Description, Cue Card) should use proper heading hierarchy
- **Cue Card section lacks context** - No explanation of what a "cue card" is for users who may forget
- **Success message timing** - Success message appears but may be missed if user navigates quickly
- **No keyboard navigation hints** - No visible focus indicators or skip links

**Proposed Fixes:**
- Convert button layout to single-column vertical stack, or group Edit/Delete separately from Back
- Replace browser `confirm()` with accessible modal dialog component that clearly states what will be deleted
- Increase date text size to `text-base` (16px) minimum
- Rename buttons to be more specific: "Edit This Memory", "Delete This Memory"
- Add proper heading structure: Use h2 for "People", "Description", "Cue Card" sections
- Add explanatory text for Cue Card section: "This cue card helps you remember key details about this memory"
- Make success message more persistent or add dismiss button
- Ensure all interactive elements have visible focus indicators
- Add skip to content link

---

### 4. ADD MEMORY PAGE (`src/app/save/page.tsx`)

**Issues:**
- **No cancel/back button** - Users may feel trapped if they want to go back
- **Vague success message** - Just says "Saved" without context of what was saved
- **Success message auto-dismisses** - Disappears after 3 seconds, may be missed
- **Form field labels could be clearer** - "People (comma-separated)" requires cognitive effort to understand format
- **No visual grouping** - All form fields appear equally important
- **Missing form structure** - No `<fieldset>` groupings for related fields
- **Submit button label is generic** - "Save Memory" could be more specific like "Save This Memory"
- **No indication of required fields** - Required fields should have visible asterisks or "required" text

**Proposed Fixes:**
- Add "Cancel" or "Back to Timeline" button
- Improve success message: "Memory saved successfully! View it in your timeline."
- Make success message dismissible with button or keep visible longer (5-7 seconds)
- Improve "People" label: "People (separate names with commas)" with example placeholder
- Add visual grouping with subtle borders or background colors for related fields
- Use `<fieldset>` and `<legend>` for form sections (e.g., "Memory Details", "Additional Information")
- Rename submit button to "Save This Memory" for clarity
- Add visible required field indicators (red asterisk + "required" text)
- Add form validation feedback that's more prominent

---

### 5. EDIT MEMORY PAGE (`src/app/memory/[id]/edit/page.tsx`)

**Issues:**
- **Cancel button behavior** - Goes back to detail page, which is good, but label could be clearer
- **Button layout in horizontal row** - Update and Cancel buttons side-by-side on larger screens
- **Form field labels** - Same issues as Add Memory page (comma-separated format, required indicators)
- **Error messages** - Good validation, but errors appear below fields which may be missed
- **No confirmation on save** - User doesn't know if changes were saved until redirect
- **Missing form structure** - Same as Add Memory page, no fieldset groupings

**Proposed Fixes:**
- Convert button layout to single-column or stack Cancel below Update
- Rename Cancel to "Cancel and Go Back" for clarity
- Apply same fixes as Add Memory page for form structure and labels
- Consider in-line error messages or more prominent error display
- Add loading state indicator during save operation
- Use same fieldset/legend structure as proposed for Add Memory page
- Add visible required field indicators

---

## Cross-Cutting Issues

### Navigation (`src/app/layout.tsx`)
- **Multiple navigation buttons** - Three buttons in nav bar may be overwhelming
- **No active page indication** - Users may not know which page they're on
- **Navigation buttons are small** - May be difficult to click/tap

**Proposed Fixes:**
- Add active state styling to current page in navigation
- Consider reducing navigation to essential links or using a menu
- Ensure navigation buttons meet minimum touch target size (44x44px) - already implemented

### General
- **Text sizes** - Many instances of `text-xs` (12px) and `text-sm` (14px) should be increased to at least `text-base` (16px)
- **Contrast** - Several uses of `text-slate-500` and `text-slate-600` may not meet WCAG AA contrast requirements
- **Focus indicators** - Need to verify all interactive elements have visible focus states
- **Semantic HTML** - Missing proper use of `<main>`, `<article>`, `<section>`, and heading hierarchy
- **ARIA labels** - Many interactive elements could benefit from more descriptive ARIA labels

---

## Priority Summary

### High Priority (Cognitive Load & Accessibility)
1. Convert multi-column layouts to single-column
2. Increase text sizes (especially dates, badges, small text)
3. Improve button labels with context
4. Add delete confirmation modal (replace browser confirm)
5. Add proper semantic HTML structure

### Medium Priority (Usability)
6. Add cancel/back buttons to forms
7. Improve success/error message visibility
8. Add required field indicators
9. Improve form field labels and placeholders
10. Add visual grouping to forms

### Lower Priority (Polish)
11. Add icons to buttons
12. Improve importance badge display
13. Add skip navigation links
14. Enhance focus indicators

