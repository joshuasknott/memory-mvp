# Accessibility & Micro-UX Analysis

## 1. Font size & readability

### src/app/page.tsx
- **Line 67**: Subtitle text uses `text-sm sm:text-base text-white/85`
  - Current: `text-sm` (14px) on mobile, `text-base` (16px) on larger screens
  - Risk: Subtitle content may be hard to read on mobile, especially on gradient background
  - Likely fix: Bump to `text-base sm:text-lg` to ensure better readability

- **Line 70**: Hint text uses `text-xs sm:text-sm text-white/70`
  - Current: `text-xs` (12px) on mobile, `text-sm` (14px) on larger screens, with low opacity
  - Risk: Very small text with low opacity on gradient is difficult to read, especially for users with vision impairments
  - Likely fix: Bump to `text-sm sm:text-base text-white/85` (increase size and opacity)

### src/components/VoiceAssistantPanel.tsx
- **Line 456**: Description text uses `text-sm text-[var(--mv-text-muted)] sm:text-base`
  - Current: `text-sm` (14px) on mobile
  - Risk: Important instruction text too small on mobile devices
  - Likely fix: Bump to `text-base` minimum

- **Line 479**: "I looked at:" label uses `text-xs font-medium tracking-wide`
  - Current: `text-xs` (12px)
  - Risk: Meta label but still could be larger for clarity
  - Likely fix: Consider `text-sm` for better readability (though it's meta info, so lower priority)

- **Line 488**: Memory badge links use `text-xs text-[var(--mv-text-muted)]`
  - Current: `text-xs` (12px) for clickable memory links
  - Risk: Clickable content too small, especially for touch targets
  - Likely fix: Bump to `text-sm` minimum

- **Line 521-522**: Date and people labels in pending memory use `text-sm`
  - Current: `text-sm` (14px) for secondary information
  - Risk: Could be slightly larger for better readability
  - Likely fix: Bump to `text-base` for body content

- **Line 552**: Status message uses `text-sm`
  - Current: `text-sm` (14px) for important status feedback
  - Risk: Status messages should be clearly readable
  - Likely fix: Bump to `text-base`

- **Line 558**: "You said" label uses `text-sm font-semibold uppercase`
  - Current: `text-sm` (14px) for section label
  - Risk: Section labels could be more prominent
  - Likely fix: Keep as `text-sm` (acceptable for label), but body content should be larger

- **Line 677**: Compact variant pending memory title uses `text-sm`
  - Current: `text-sm` (14px) for memory title
  - Risk: Title text should be more prominent
  - Likely fix: Bump to `text-base`

- **Line 685-690**: Compact variant date/people labels use `text-xs`
  - Current: `text-xs` (12px) for date and people info
  - Risk: Too small for readable content
  - Likely fix: Bump to `text-sm` minimum

- **Line 731**: Status text on gradient uses `text-sm sm:text-base text-white/80`
  - Current: `text-sm` (14px) on mobile with 80% opacity on gradient
  - Risk: Small text with reduced opacity on gradient may be hard to read
  - Likely fix: Bump to `text-base sm:text-lg` and increase opacity to `text-white/90`

- **Line 746**: Error text uses `text-xs text-[var(--mv-danger)]`
  - Current: `text-xs` (12px) for error messages
  - Risk: Critical error messages too small
  - Likely fix: Bump to `text-sm sm:text-base` minimum

### src/components/AskMemvellaPanel.tsx
- **Line 421**: Badge uses `text-xs`
  - Current: `text-xs` (12px) for importance badge
  - Risk: Badge text may be hard to read
  - Likely fix: Bump to `text-sm` minimum (badges can be slightly smaller but should be readable)

- **Line 486**: Heading uses `text-sm font-semibold sm:text-base`
  - Current: `text-sm` (14px) on mobile for main panel heading
  - Risk: Primary heading too small
  - Likely fix: Bump to `text-base sm:text-lg`

- **Line 492**: Description uses `text-sm sm:text-base`
  - Current: `text-sm` (14px) on mobile
  - Risk: Panel description text too small on mobile
  - Likely fix: Bump to `text-base` minimum

- **Line 504**: "Hide" button uses `text-xs font-medium`
  - Current: `text-xs` (12px) for close button
  - Risk: Interactive button text too small
  - Likely fix: Bump to `text-sm` minimum

- **Line 517-532**: Tab toggle buttons use `text-sm font-medium`
  - Current: `text-sm` (14px) for navigation tabs
  - Risk: Navigation text could be larger for better clarity
  - Likely fix: Bump to `text-base`

- **Line 541**: "Clear conversation" button uses `text-xs font-medium`
  - Current: `text-xs` (12px) for action button
  - Risk: Action button text too small, especially for touch targets
  - Likely fix: Bump to `text-sm` minimum

- **Line 563**: Welcome message hint uses `text-xs`
  - Current: `text-xs` (12px) for helpful hint
  - Risk: Important instruction text too small
  - Likely fix: Bump to `text-sm`

- **Line 578, 583**: Chat message source labels use `text-[11px] uppercase`
  - Current: `text-[11px]` (11px) for "You said (via voice)" and "You wrote" labels
  - Risk: Extremely small text, difficult to read
  - Likely fix: Bump to `text-xs sm:text-sm` (12px minimum)

- **Line 596**: "Memvella" label in chat bubble uses `text-[0.7rem]`
  - Current: `text-[0.7rem]` (~11px) for assistant name label
  - Risk: Very small text within message bubble
  - Likely fix: Bump to `text-xs sm:text-sm` (12px minimum)

- **Line 643**: Error text uses `text-xs`
  - Current: `text-xs` (12px) for error messages
  - Risk: Error messages should be clearly visible
  - Likely fix: Bump to `text-sm sm:text-base`

- **Line 717**: Section label uses `text-xs font-semibold uppercase`
  - Current: `text-xs` (12px) for date bucket labels
  - Risk: Section headers could be more prominent
  - Likely fix: Bump to `text-sm`

- **Line 956**: Helper text "Separate names with commas" uses `text-xs`
  - Current: `text-xs` (12px) for form helper text
  - Risk: Important form instructions too small
  - Likely fix: Bump to `text-sm`

### src/app/timeline/page.tsx
- **Line 228-233**: "Show earlier memories" toggle uses `text-sm font-medium`
  - Current: `text-sm` (14px) for toggle button
  - Risk: Interactive element text could be larger
  - Likely fix: Bump to `text-base`

### src/app/save/page.tsx
- All text sizes appear appropriate (uses `text-lg` for labels, `text-base` for helpers) ✓

### src/app/memory/[id]/page.tsx
- All text sizes appear appropriate ✓

### src/app/memory/[id]/edit/page.tsx
- **Line 368, 400, 406, 434, 438, 480**: Error and helper text use `text-sm`
  - Current: `text-sm` (14px) for form helpers and errors
  - Risk: Form helpers and errors could be more readable
  - Likely fix: Bump to `text-base` for better clarity

- **Line 593**: Autosave message uses `text-sm`
  - Current: `text-sm` (14px) for feedback text
  - Risk: Feedback messages should be clear
  - Likely fix: Bump to `text-base`

## 2. Colour contrast

### src/app/page.tsx
- **Line 67**: Subtitle uses `text-white/85` on gradient background
  - Text: `text-white/85` (85% opacity white)
  - Background: `bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]`
  - Assessment: Likely borderline - 85% opacity on gradient may not meet WCAG AA for all gradient sections. White text on blue gradient should be okay, but on purple/pink sections might be borderline.
  - Likely fix: Increase to `text-white/95` or `text-white` for better contrast

- **Line 70**: Hint text uses `text-white/70` on gradient background
  - Text: `text-white/70` (70% opacity white)
  - Background: Same gradient as above
  - Assessment: Likely fails WCAG AA - 70% opacity is too low for sufficient contrast on gradient
  - Likely fix: Increase to `text-white/90` minimum

- **Line 83**: Timeline link uses `text-white/80 hover:text-white` on gradient
  - Text: `text-white/80` (80% opacity white)
  - Background: Same gradient
  - Assessment: Likely borderline - 80% opacity may not meet WCAG AA on all gradient areas
  - Likely fix: Increase to `text-white/95` or `text-white`

- **Line 132-142**: FAB button uses gradient background with white text
  - Text: `text-white` (full opacity)
  - Background: `bg-gradient-to-br from-[var(--mv-gradient-start)] via-[var(--mv-gradient-mid)] to-[var(--mv-gradient-end)]`
  - Assessment: Likely WCAG-safe - white on blue-purple gradient should meet contrast requirements ✓

### src/components/VoiceAssistantPanel.tsx
- **Line 726**: Orb button uses gradient background with white text
  - Text: `text-white` (full opacity) and `text-base sm:text-lg`
  - Background: `bg-gradient-to-br from-[var(--mv-gradient-start)] via-[var(--mv-gradient-mid)] to-[var(--mv-gradient-end)]`
  - Assessment: Likely WCAG-safe - full opacity white on gradient should meet requirements ✓

- **Line 731**: Status text uses `text-white/80` on gradient (compact variant)
  - Text: `text-white/80` (80% opacity white)
  - Background: Same gradient background
  - Assessment: Likely borderline - 80% opacity may not meet WCAG AA on all gradient sections
  - Likely fix: Increase to `text-white/95` or `text-white`

- **Line 469**: Assistant response text uses `text-[var(--mv-text)]` on `bg-[var(--mv-card)]`
  - Text: `text-[var(--mv-text)]` (#1f2933 - dark gray)
  - Background: `bg-[var(--mv-card)]` (#ffffff - white)
  - Assessment: WCAG-safe - high contrast on white background ✓

- **Line 591**: Status message uses `text-[var(--mv-text-muted)]` on `bg-[var(--mv-card)]`
  - Text: `text-[var(--mv-text-muted)]` (#4b5563 - medium gray)
  - Background: `bg-[var(--mv-card)]` (#ffffff - white)
  - Assessment: Likely WCAG-safe but could be darker for better readability. `#4b5563` on white should meet AA standards, but `text-muted-strong` would be better.

### src/components/AskMemvellaPanel.tsx
- **Line 591**: User message bubble uses `bg-[var(--mv-primary)] text-white`
  - Text: `text-white`
  - Background: `bg-[var(--mv-primary)]` (#2b3f82 - blue)
  - Assessment: WCAG-safe - white on blue should meet contrast requirements ✓

- **Line 596**: "Memvella" label uses `text-[var(--mv-text-muted-strong)]` on `bg-[var(--mv-bg-soft)]`
  - Text: `text-[var(--mv-text-muted-strong)]` (#4a5b8f - blue-gray)
  - Background: `bg-[var(--mv-bg-soft)]` (var(--mv-secondary) = #e3edff - light blue)
  - Assessment: Likely borderline - medium blue-gray on light blue may not meet WCAG AA
  - Likely fix: Use `text-[var(--mv-primary)]` or darker color for better contrast

- **Line 479-488**: Memory badge links use `text-[var(--mv-text-muted)]` on `bg-[var(--mv-card-soft)]`
  - Text: `text-[var(--mv-text-muted)]` (#4b5563)
  - Background: `bg-[var(--mv-card-soft)]` (rgba(255,255,255,0.02) - nearly transparent)
  - Assessment: Likely borderline - medium gray on very light/transparent background needs verification
  - Likely fix: Use darker text color or more opaque background

- **Line 421**: Badge uses variant colors (low/medium/high importance)
  - Need to verify badge colors meet contrast - typically badges use colored backgrounds with white/dark text
  - Assessment: Should verify actual badge component implementation

## 3. Focus & keyboard

### src/app/page.tsx
- **Line 81-86**: Timeline link uses `<Link>` with `focus-visible:outline focus-visible:outline-2 focus-visible:outline-white`
  - Assessment: ✓ Proper semantic element with visible focus styles

- **Line 92-96**: Mobile backdrop overlay uses `<div onClick>` with `aria-hidden="true"`
  - Assessment: ✓ Non-interactive backdrop, correctly marked with aria-hidden

- **Line 129-142**: FAB button uses `<button>` with `focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)]`
  - Assessment: ✓ Proper button element with visible focus styles

### src/components/VoiceAssistantPanel.tsx
- **Line 578-586**: Start/Stop listening button uses `<Button>` component
  - Assessment: ✓ Uses Button component which should have focus styles

- **Line 598-609**: Mode select dropdown uses `<select>` with `focus:ring-2 focus:ring-[var(--mv-primary)]`
  - Assessment: ✓ Native select with focus styles

- **Line 612-619**: Clear button uses `<Button>` component
  - Assessment: ✓ Uses Button component with focus styles

- **Line 632-651**: TTS toggle uses `<button>` with `focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)]`
  - Assessment: ✓ Proper button with focus styles

- **Line 721-729**: Compact variant orb button uses `<button>` with `focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)]`
  - Assessment: ✓ Proper button element with visible focus styles. However, focus ring color is `var(--mv-primary)` which may not contrast well against the gradient background.
  - Risk: Focus indicator may be too subtle on gradient background
  - Likely fix: Use a more contrasting focus ring color, such as white or a bright accent color with sufficient offset

### src/components/AskMemvellaPanel.tsx
- **Line 500-507**: "Hide" button uses `<button>` with `focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)]`
  - Assessment: ✓ Proper button with focus styles

- **Line 514-535**: Tab toggle buttons use `<button>` with focus styles (via transition)
  - Assessment: ⚠️ Buttons have transition-colors but no explicit focus-visible styles
  - Risk: Focus state may not be visible enough
  - Likely fix: Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)] focus-visible:ring-offset-2`

- **Line 538-545**: "Clear conversation" button uses `<button>` with `focus-visible:outline` (implicit)
  - Assessment: ⚠️ No explicit focus-visible styles defined, relying on global styles
  - Risk: Global focus styles may not be sufficient for small text buttons
  - Likely fix: Add explicit focus-visible ring styles

- **Line 607-624**: Action buttons ("Save this", "Not right now") use `<Button>` component
  - Assessment: ✓ Uses Button component which should have focus styles

- **Line 672-679**: Submit button uses `<Button>` component
  - Assessment: ✓ Uses Button component

- **Line 660-669**: Textarea input uses `focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)]`
  - Assessment: ✓ Proper focus styles

- **Line 396-403**: Memory card uses `<Card onClick>` for expansion
  - Assessment: ⚠️ Clickable div pattern - not a semantic button/link
  - Risk: Not keyboard accessible without additional handling
  - Likely fix: Convert to `<button>` with `aria-expanded` or ensure keyboard event handlers (Enter/Space) are added

### src/app/timeline/page.tsx
- **Line 75-121**: Memory cards use `<Link>` with `focus-visible:outline focus-visible:outline-2`
  - Assessment: ✓ Proper semantic links with focus styles

- **Line 228-233**: "Show earlier memories" toggle uses `<button>` with no explicit focus styles
  - Assessment: ⚠️ No explicit focus-visible styles, relying on global styles
  - Risk: Focus state may not be visible enough for text link-style button
  - Likely fix: Add explicit focus-visible ring styles

### src/app/save/page.tsx
- **Line 299-306**: File upload button uses `<button>` with `focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)]`
  - Assessment: ✓ Proper button with focus styles

- All form inputs have appropriate focus styles ✓

### src/app/memory/[id]/page.tsx
- **Line 272-280**: Delete button uses `<Button>` component
  - Assessment: ✓ Uses Button component with focus styles

- All interactive elements use semantic HTML ✓

### src/app/memory/[id]/edit/page.tsx
- All form inputs have appropriate focus styles ✓
- All buttons use Button component or have explicit focus styles ✓

### src/components/PrimaryNav.tsx
- **Line 29-41**: Nav items use `<Button asChild>` wrapping `<Link>`
  - Assessment: ✓ Proper semantic structure with Button component providing focus styles

## 4. ARIA & live regions

### src/components/VoiceAssistantPanel.tsx
- **Line 469**: Assistant response uses `aria-live="polite" role="status"`
  - Assessment: ✓ Appropriate for assistant responses - polite is correct for non-urgent updates

- **Line 552**: Status message uses `aria-live="polite"` without role
  - Assessment: ✓ Appropriate for status updates

- **Line 589-592**: Listening status uses `aria-live="polite" role="status"`
  - Assessment: ✓ Appropriate for status updates, but might be redundant if status changes frequently
  - Risk: Frequent status changes ("Listening..." / "Not listening") may cause screen reader chatter
  - Likely fix: Consider removing aria-live or using `aria-live="off"` if status is already conveyed via button label

- **Line 581-582**: Start/Stop button has `aria-pressed={isListening}` and `aria-label`
  - Assessment: ✓ Good - toggle button properly labeled

- **Line 670**: Compact variant assistant text uses `sr-only` with `aria-live="polite" role="status"`
  - Assessment: ✓ Good pattern for screen reader announcements without visual duplication

- **Line 732-733**: Status text uses `aria-live="polite" role="status"`
  - Assessment: ✓ Appropriate for status updates

- **Line 725**: Compact variant orb button has `aria-pressed` and `aria-label`
  - Assessment: ✓ Good - toggle button properly labeled

### src/components/AskMemvellaPanel.tsx
- **Line 476**: Card has `role="group" aria-labelledby="ask-memvella-heading"`
  - Assessment: ✓ Good semantic structure

- **Line 484-497**: Heading and description properly linked with `aria-labelledby` and `aria-describedby`
  - Assessment: ✓ Good structure

- **Line 542**: "Clear conversation" button has `aria-label="Clear this conversation"`
  - Assessment: ✓ Good - descriptive label

- **Line 634-638**: Loading state uses `aria-live="polite" role="status"`
  - Assessment: ✓ Appropriate for loading states

- **Line 642-645**: Error uses `role="alert"` (no aria-live)
  - Assessment: ⚠️ Alert role implies assertive announcement, but no aria-live means it may not be announced if added dynamically
  - Risk: Error messages added after page load may not be announced
  - Likely fix: Add `aria-live="assertive"` for critical error messages

- **Line 396-403**: Memory card expansion uses clickable Card with no ARIA
  - Assessment: ⚠️ Missing ARIA for expandable content
  - Risk: Screen readers won't know the card is expandable or its expanded state
  - Likely fix: Add `role="button"`, `aria-expanded={expandedMemoryId === memory.id}`, `aria-label` for expand/collapse action, and keyboard handlers

- **Line 569-630**: Chat messages have no ARIA live regions
  - Assessment: ⚠️ New chat messages may not be announced to screen readers
  - Risk: Screen reader users won't know when new messages arrive
  - Likely fix: Wrap message container in `aria-live="polite"` region, or add live region for assistant messages only

### src/app/page.tsx
- **Line 134**: FAB button has `aria-label="Open Ask Memvella"` and `aria-expanded={false}`
  - Assessment: ✓ Good - properly labeled. However, `aria-expanded` should update based on `isAskOpen` state
  - Risk: Screen readers won't know if panel is open or closed
  - Likely fix: Change to `aria-expanded={isAskOpen}`

- **Line 42-47**: Main section has `aria-labelledby="memvella-home-v2-heading"`
  - Assessment: ✓ Good semantic structure

- **Line 103**: Aside has `role="complementary" aria-labelledby="ask-memvella-heading"`
  - Assessment: ✓ Good semantic structure

### src/app/timeline/page.tsx
- **Line 228-233**: "Show earlier memories" button has no aria-label
  - Assessment: ⚠️ Button text is descriptive but could benefit from more context
  - Risk: Screen reader users might not understand what "earlier" refers to
  - Likely fix: Add `aria-label="Show earlier memories from before this week"` or similar descriptive text

### src/app/save/page.tsx
- **Line 340**: Autosave message uses `aria-live="polite"`
  - Assessment: ✓ Appropriate for non-urgent feedback

### src/app/memory/[id]/page.tsx
- **Line 276**: Delete button has `aria-label` that updates based on `isDeleting`
  - Assessment: ✓ Good - dynamic label

- **Line 362**: Generate button has `aria-label="Generate memory summary"`
  - Assessment: ✓ Good - descriptive label

### src/app/memory/[id]/edit/page.tsx
- **Line 362-363**: Title input has `aria-invalid` and `aria-describedby`
  - Assessment: ✓ Good - proper form field accessibility

- **Line 388-393**: Description textarea has `aria-invalid` and `aria-describedby`
  - Assessment: ✓ Good - proper form field accessibility

- **Line 577-579**: Submit button has dynamic `aria-label`
  - Assessment: ✓ Good - contextual label

## 5. Motion & animation

### src/app/globals.css
- **Line 152-165**: `@media (prefers-reduced-motion: reduce)` implementation
  - Assessment: ✓ Good - properly disables animations for users who prefer reduced motion
  - Includes:
    - Animation duration set to 0.01ms
    - Animation iteration count set to 1
    - Transition duration set to 0.01ms
    - Scroll behavior set to auto
    - `.mv-orb-pulse` animation explicitly disabled

### src/app/page.tsx
- **Line 37-39**: Opacity transition on main content when Ask panel opens
  - Assessment: ✓ Transition is subtle and should be acceptable, and would be disabled by prefers-reduced-motion

### src/components/VoiceAssistantPanel.tsx
- **Line 726**: Orb button uses `mv-orb-pulse` class when listening
  - Assessment: ✓ Animation is disabled for prefers-reduced-motion in globals.css
  - However, the animation could be distracting for users with anxiety or cognitive overload
  - Current: Continuous pulsing animation
  - Risk: May be distracting for users with vestibular disorders or anxiety
  - Likely fix: Consider a more subtle animation, or ensure prefers-reduced-motion fully disables it (already done ✓)

### src/components/AskMemvellaPanel.tsx
- **Line 109-113**: Panel transition uses `transition-all duration-300`
  - Assessment: ✓ Should be disabled by prefers-reduced-motion

- **Line 395**: Memory card hover uses `hover:-translate-y-0.5`
  - Assessment: ✓ Subtle hover effect, should be disabled by prefers-reduced-motion

- **Line 83**: Auto-scroll uses `behavior: 'smooth'`
  - Assessment: ⚠️ Smooth scrolling may not be disabled by prefers-reduced-motion (scroll-behavior is handled in globals.css)
  - Risk: Smooth scrolling could cause issues for users with vestibular disorders
  - Likely fix: Check that scroll-behavior: auto is applied (already in globals.css ✓)

### src/components/ui/Button.tsx
- **Line 34**: Primary button has `hover:brightness-[1.05]` and `active:translate-y-[1px]`
  - Assessment: ✓ Subtle effects, should be disabled by prefers-reduced-motion

## 6. Touch targets & spacing

### src/app/page.tsx
- **Line 129-142**: FAB button has `px-4 pr-5 py-2.5` and inner icon `h-11 w-11`
  - Assessment: ✓ Button has adequate padding and inner icon is 44px (meets minimum)

### src/components/VoiceAssistantPanel.tsx
- **Line 578-586**: Start/Stop button uses Button component with `w-full sm:w-auto`
  - Assessment: ✓ Button component has `min-h-[44px]` from Button.tsx

- **Line 632-651**: TTS toggle button
  - Assessment: ⚠️ Button text is `text-sm` and button has minimal padding - may not meet 44px minimum
  - Risk: Touch target likely < 44px tall
  - Likely fix: Add `min-h-[44px]` and increase padding

- **Line 721-729**: Compact variant orb button is `h-48 w-48 sm:h-56 sm:w-56 lg:h-64 lg:w-64`
  - Assessment: ✓ Excellent - well above 44px minimum

- **Line 531-548**: "Save this" / "Dismiss" buttons use Button component
  - Assessment: ✓ Button component has `min-h-[44px]` - good spacing between buttons with `gap-2`

- **Line 695-711**: Compact variant "Save this memory" / "Dismiss" buttons
  - Assessment: ⚠️ Buttons have `gap-1.5` (6px) between them
  - Risk: Buttons may be too close together on mobile, especially for users with motor impairments
  - Likely fix: Increase gap to `gap-2` or `gap-3` minimum

### src/components/AskMemvellaPanel.tsx
- **Line 500-507**: "Hide" button uses `text-xs font-medium` with minimal padding
  - Assessment: ⚠️ Text is very small (`text-xs`) and button has no explicit min-height
  - Risk: Touch target likely < 44px tall
  - Likely fix: Add `min-h-[44px]` and increase text size to `text-sm`

- **Line 514-535**: Tab toggle buttons use `px-4 py-2 text-sm`
  - Assessment: ⚠️ `py-2` (8px top/bottom) with `text-sm` may not reach 44px minimum
  - Risk: Touch target likely < 44px tall
  - Likely fix: Add `min-h-[44px]` or increase padding

- **Line 538-545**: "Clear conversation" button uses `text-xs` with `px-2 py-1`
  - Assessment: ⚠️ Very small touch target - `py-1` (4px) + `text-xs` (12px) ≈ 20px total height
  - Risk: Touch target definitely < 44px, difficult to tap accurately
  - Likely fix: Add `min-h-[44px]` and increase padding to `px-3 py-2`, bump text to `text-sm`

- **Line 607-624**: "Save this" / "Not right now" buttons use Button component with `gap-2`
  - Assessment: ✓ Button component has `min-h-[44px]`, good spacing with `gap-2` (8px)

- **Line 437-446**: Memory card "Edit" button uses Button component with `text-sm`
  - Assessment: ✓ Button component has `min-h-[44px]` regardless of text size

- **Line 488**: Memory badge links use `px-3 py-1 text-xs`
  - Assessment: ⚠️ Very small touch target - `py-1` (4px) + `text-xs` (12px) ≈ 20px total height
  - Risk: Touch target definitely < 44px
  - Likely fix: Increase to `py-2` minimum and add `min-h-[44px]`, or make badges larger

### src/app/timeline/page.tsx
- **Line 228-233**: "Show earlier memories" button uses `text-sm` with no explicit padding/min-height
  - Assessment: ⚠️ Text-only button likely < 44px tall
  - Risk: Touch target too small
  - Likely fix: Add `min-h-[44px]` and increase padding

### src/app/save/page.tsx
- **Line 299-306**: File upload button has `min-h-[44px]`
  - Assessment: ✓ Explicitly meets 44px minimum

- All form inputs have adequate sizing ✓

### src/app/memory/[id]/page.tsx
- All buttons use Button component or have adequate sizing ✓

### src/app/memory/[id]/edit/page.tsx
- All form inputs and buttons have adequate sizing ✓

## 7. Remaining confusion points (small fixes only)

### src/app/page.tsx
- **Line 67-72**: Subtitle text explains voice vs. text interface
  - Assessment: ✓ Clear explanation of dual interface

- **Line 70**: Hint text mentions "Ask Memvella" before user sees the FAB
  - Current: "You can talk to me here, or type to me with Ask Memvella..."
  - Risk: Users might not see the FAB button immediately, causing confusion
  - Likely fix: Consider rephrasing to "You can talk to me here, or tap the Ask Memvella button (bottom right) to type to me" - but this might be too verbose. Current text is probably fine.

### src/components/VoiceAssistantPanel.tsx
- **Line 454-459**: Description says "Tap the microphone" but button says "Start listening"
  - Assessment: ⚠️ Terminology inconsistency - description says "tap" but button uses "listening"
  - Risk: Minor confusion about what the button does
  - Likely fix: Align terminology - either change description to "Start listening" or button to "Tap to talk"

- **Line 726-728**: Orb button shows "Listening…" or "Tap to talk"
  - Assessment: ✓ Clear and descriptive

- **Line 23-28**: Mode labels and messages
  - Assessment: ✓ Clear explanations of each mode

### src/components/AskMemvellaPanel.tsx
- **Line 494-496**: Description text explains interface relationship
  - Assessment: ✓ Clear explanation

- **Line 563-565**: Welcome message explains both interfaces
  - Assessment: ✓ Helpful context for new users

- **Line 490-497**: Panel description changes based on view mode
  - Assessment: ✓ Good - contextual help text

- **Line 710-713**: Empty memories state
  - Assessment: ✓ Clear and encouraging

### src/app/timeline/page.tsx
- **Line 186-188**: Description explains organization
  - Assessment: ✓ Clear explanation of timeline structure

- **Line 228-233**: "Show earlier memories" toggle
  - Assessment: ⚠️ Label is clear but doesn't indicate how many memories are hidden
  - Risk: Users might not know if it's worth clicking
  - Likely fix: Could add count like "Show 15 earlier memories" but current label is probably fine for simplicity

### src/app/save/page.tsx
- **Line 156-159**: Description encourages taking time
  - Assessment: ✓ Supportive and clear

- All form labels are descriptive and clear ✓

### src/app/memory/[id]/page.tsx
- **Line 329-332**: Cue card description explains purpose
  - Assessment: ✓ Clear explanation of AI summary purpose

- **Line 376-378**: Empty cue card state
  - Assessment: ✓ Clear instructions

### src/app/memory/[id]/edit/page.tsx
- **Line 339-343**: Description explains editing purpose
  - Assessment: ✓ Clear and helpful

- All form labels and help text are clear ✓

---

## Summary of High-Priority Issues

1. **Multiple text-xs instances** used for body content (especially in AskMemvellaPanel and VoiceAssistantPanel)
2. **Low contrast white text** on gradients (`text-white/70`, `text-white/80`)
3. **Small touch targets** for several buttons (Hide, Clear conversation, Show earlier memories, TTS toggle, memory badges)
4. **Missing aria-expanded** state on FAB button
5. **Missing ARIA** on expandable memory cards
6. **Missing aria-live** on dynamic chat messages
7. **Subtle focus indicators** on gradient backgrounds (orb button)

## Testing Recommendations

- Test with screen reader (NVDA/JAWS/VoiceOver) to verify ARIA announcements
- Test keyboard navigation through all interactive elements
- Test color contrast with tools like WebAIM Contrast Checker
- Test touch targets on actual mobile device
- Test with prefers-reduced-motion enabled
- Verify focus indicators are visible on all background colors

