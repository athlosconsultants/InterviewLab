# Accessibility Audit Checklist (T145)

**Goal:** Achieve WCAG 2.1 AA compliance

**Status:** 🟡 In Progress

---

## Automated Testing

### 1. Run axe DevTools Audit

```bash
# Install axe DevTools extension for Chrome/Firefox
# Visit each page and run audit:
# - Home page (/)
# - Sign-in page (/sign-in)
# - Setup page (/setup)
# - Interview page (/interview/[id])
# - Report page (/report/[id])
# - Pricing page (/pricing)

# Target: 0 critical issues, 0 serious issues
```

### 2. Run Lighthouse Accessibility Audit

```bash
# Chrome DevTools → Lighthouse → Accessibility
# Target score: 95+
```

---

## Manual Testing Checklist

### Keyboard Navigation

- [ ] **Tab Order**: Logical tab sequence on all pages
- [ ] **Focus Indicators**: Visible focus rings on all interactive elements
- [ ] **Trapped Focus**: Modals trap focus correctly (Tab cycles within modal)
- [ ] **Skip Links**: "Skip to content" link present and functional
- [ ] **Escape Key**: Modals/dialogs close with Esc key
- [ ] **Enter Key**: Buttons activate with Enter
- [ ] **Arrow Keys**: Dropdown/select navigation works with arrow keys

**Test Interview Flow (Keyboard Only):**
1. Navigate to /setup using Tab
2. Upload CV using keyboard (Space to activate file picker)
3. Fill form using Tab and Enter
4. Start interview
5. Answer questions using Enter to submit
6. Navigate through report

### Screen Reader Testing

**Tools:** NVDA (Windows), VoiceOver (macOS), JAWS (Windows)

- [ ] **Page Titles**: Each page has unique, descriptive title
- [ ] **Headings**: Proper heading hierarchy (h1 → h2 → h3, no skips)
- [ ] **Landmarks**: Main, nav, aside, footer landmarks present
- [ ] **Alt Text**: All images have descriptive alt text
- [ ] **Form Labels**: All inputs have associated labels
- [ ] **Error Messages**: Form errors announced to screen reader
- [ ] **Dynamic Content**: ARIA live regions for dynamic updates
- [ ] **Button Labels**: Buttons have descriptive labels (not just icons)

**VoiceOver Test (macOS):**
```bash
# Enable VoiceOver: Cmd + F5
# Navigate: Ctrl + Option + Arrow keys
# Interact: Ctrl + Option + Space
```

Test complete user flow and verify:
- All content is readable
- Interactive elements are announced correctly
- Current state is communicated (e.g., "Interview in progress")

---

## WCAG 2.1 AA Requirements

### Perceivable

#### 1.1 Text Alternatives
- [ ] All images have alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Icons have ARIA labels or sr-only text

#### 1.2 Time-based Media
- [ ] Audio interviews have text transcripts available
- [ ] TTS playback has visual alternative (text display)

#### 1.3 Adaptable
- [ ] Content structure is semantic HTML
- [ ] Information conveyed by color alone also uses text/icons
- [ ] Content readable without CSS

#### 1.4 Distinguishable
- [ ] **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- [ ] **Text Resize**: Readable at 200% zoom without horizontal scroll
- [ ] **Reflow**: No horizontal scrolling at 320px width
- [ ] **Text Spacing**: Readable with increased line/letter spacing
- [ ] **Images of Text**: Use actual text instead of images where possible

**Contrast Checker:**
```bash
# Use WebAIM Contrast Checker:
# https://webaim.org/resources/contrastchecker/

# Check these color pairs:
- Primary text on background
- Secondary text on background
- Link text on background
- Button text on button background
- Form labels on background
```

### Operable

#### 2.1 Keyboard Accessible
- [ ] All functionality available via keyboard
- [ ] No keyboard traps (can navigate away from all elements)
- [ ] Keyboard shortcuts don't conflict with assistive tech

#### 2.2 Enough Time
- [ ] **Interview Timer**: User can extend or turn off timer
- [ ] **Session Timeout**: Warning before timeout with option to extend
- [ ] No auto-refreshing content

#### 2.3 Seizures
- [ ] No flashing content (> 3 flashes per second)
- [ ] Animations can be paused/disabled

#### 2.4 Navigable
- [ ] **Skip Links**: "Skip to main content" link at top
- [ ] **Page Titles**: Unique, descriptive titles for each page
- [ ] **Focus Order**: Logical tab order matches visual layout
- [ ] **Link Purpose**: Link text describes destination
- [ ] **Multiple Ways**: Can navigate via menu, breadcrumbs, search
- [ ] **Headings**: Descriptive heading structure
- [ ] **Focus Visible**: Clear focus indicators

### Understandable

#### 3.1 Readable
- [ ] **Language**: Page language declared (`<html lang="en">`)
- [ ] **Unusual Words**: Technical jargon explained or avoided
- [ ] **Abbreviations**: Expanded on first use

#### 3.2 Predictable
- [ ] **On Focus**: No automatic navigation on focus
- [ ] **On Input**: No unexpected context changes on input
- [ ] **Consistent Navigation**: Same nav order across pages
- [ ] **Consistent Identification**: Same icons/labels for same functions

#### 3.3 Input Assistance
- [ ] **Error Identification**: Errors clearly identified in text
- [ ] **Labels**: All form inputs have visible labels
- [ ] **Error Suggestion**: Helpful error messages with correction hints
- [ ] **Error Prevention**: Confirmation for irreversible actions

### Robust

#### 4.1 Compatible
- [ ] **Valid HTML**: No parsing errors
- [ ] **Name, Role, Value**: All custom UI has proper ARIA
- [ ] **Status Messages**: Use ARIA live regions for dynamic updates

---

## Specific Components to Fix

### Buttons

```tsx
// ❌ Bad: Icon-only button with no label
<button onClick={handleClick}>
  <TrashIcon />
</button>

// ✅ Good: ARIA label or visible text
<button onClick={handleClick} aria-label="Delete interview">
  <TrashIcon />
</button>

// ✅ Better: Visible text with icon
<button onClick={handleClick}>
  <TrashIcon />
  <span>Delete</span>
</button>
```

### Forms

```tsx
// ❌ Bad: Label not associated
<label>Email</label>
<input type="email" />

// ✅ Good: Label associated with htmlFor
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Good: Label wrapping input
<label>
  Email
  <input type="email" />
</label>
```

### Modals

```tsx
// ✅ Good: Modal with proper ARIA
<Dialog
  open={open}
  onClose={onClose}
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">Confirm Action</DialogTitle>
  <DialogDescription id="dialog-description">
    Are you sure you want to proceed?
  </DialogDescription>
  {/* Content */}
</Dialog>
```

### Dynamic Content

```tsx
// ✅ Good: Announce updates to screen readers
<div role="status" aria-live="polite" aria-atomic="true">
  {submitting && <span>Submitting your answer...</span>}
  {submitted && <span>Answer submitted successfully</span>}
</div>
```

---

## Priority Fixes

### High Priority (Blockers)

1. **Add ARIA labels to icon-only buttons** (VoiceOrb, ReplayButton, etc.)
2. **Fix form label associations** (IntakeForm, sign-in form)
3. **Add focus indicators** to all interactive elements
4. **Fix heading hierarchy** (ensure h1 → h2 → h3, no skips)
5. **Add alt text** to all images

### Medium Priority

6. **Add skip-to-content link** at top of page
7. **Improve error messages** (more descriptive, helpful)
8. **Add ARIA live regions** for dynamic content (interview status updates)
9. **Test and fix keyboard navigation** in modals
10. **Add keyboard shortcuts documentation** (optional)

### Low Priority

11. **Add high contrast mode support**
12. **Add reduced motion support** (prefers-reduced-motion)
13. **Add focus-within styles** for better nested focus indication

---

## Testing Tools

**Browser Extensions:**
- axe DevTools (Chrome, Firefox)
- WAVE (Chrome, Firefox)
- Lighthouse (built into Chrome DevTools)

**Screen Readers:**
- NVDA (Windows) - Free
- JAWS (Windows) - Commercial
- VoiceOver (macOS) - Built-in
- Orca (Linux) - Free

**Contrast Checkers:**
- WebAIM Contrast Checker
- Contrast Ratio by Lea Verou
- Chrome DevTools Accessibility Tab

**Keyboard Testing:**
- Just use your keyboard! Unplug your mouse if needed.

---

## Acceptance Criteria

- [ ] axe DevTools audit: 0 critical, 0 serious issues
- [ ] Lighthouse accessibility score: 95+
- [ ] Complete keyboard-only navigation: successful
- [ ] Screen reader test: all content accessible
- [ ] Color contrast: all text meets 4.5:1 ratio
- [ ] No accessibility-related user complaints

---

**Estimated Time:** 4-5 hours

**Last Updated:** October 11, 2025

