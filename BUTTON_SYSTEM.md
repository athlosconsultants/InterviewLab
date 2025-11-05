# Three-Tier Button System

## Overview
InterviewLab uses a three-tier button hierarchy to create clear visual distinction between different action types and their importance in the user interface.

---

## Button Hierarchy

### 1. PRIMARY (default variant)
**Visual Style:**
- Solid blue gradient background (`from-cyan-500 to-blue-600`)
- White text
- Medium shadow with hover elevation
- Active scale feedback

**When to Use:**
- Main call-to-action (CTA) buttons
- Primary task completion actions
- Actions that advance the user forward in the flow
- Examples: "Start Interview", "Submit Answer", "Continue"

**Usage:**
```tsx
<Button variant="default">Start Interview</Button>
<Button>Submit Answer</Button> // default variant
```

---

### 2. SECONDARY (outline variant)
**Visual Style:**
- Blue gradient border (2px)
- White background
- Dark slate text (`slate-800`)
- Light shadow with hover elevation

**When to Use:**
- Alternative workflow paths
- Secondary actions that don't advance the primary flow
- Navigation between screens
- Cancel or back actions
- Examples: "View Details", "Try Quick Assessment", "Go Back"

**Usage:**
```tsx
<Button variant="outline">View Details</Button>
<Button variant="outline">Cancel</Button>
```

---

### 3. TERTIARY (tertiary variant) ✨ NEW
**Visual Style:**
- Light tonal blue fill (`bg-blue-50/80` - 80% opacity)
- Dark blue text (`text-blue-700`)
- No border or shadow
- Subtle hover state (`bg-blue-100`)
- Height: 32-40px (slightly smaller than secondary)

**When to Use:**
- Operational controls within a task (Play, Pause, Stop)
- Sub-actions that support the main workflow
- Utility functions (Re-record, Refresh, Reset)
- Micro-interactions and controls
- Actions with lowest priority

**DO NOT Use For:**
- Primary task completion
- Alternative workflow paths
- Screen navigation
- Destructive actions

**Usage:**
```tsx
<Button variant="tertiary" size="xs">Play</Button>
<Button variant="tertiary" size="sm">Re-record</Button>
<Button variant="tertiary">Pause</Button>
```

---

## Size Options

| Size | Height | Padding | Font Size | Best For |
|------|--------|---------|-----------|----------|
| `xs` | 32px | px-3 py-1.5 | text-sm | Tertiary buttons, tight spaces |
| `sm` | 40px | px-4 py-2 | text-sm | Compact layouts, secondary actions |
| `default` | 44px | px-6 py-2.5 | text-base | Standard buttons, primary actions |
| `lg` | 52px | px-8 py-3.5 | text-lg | Hero sections, emphasis |
| `icon` | 44x44px | - | - | Icon-only buttons |

---

## Accessibility

### Color Contrast
- **Primary**: White text on blue gradient (7:1+ ratio) ✅
- **Secondary**: Slate-800 text on white (12:1+ ratio) ✅
- **Tertiary**: Blue-700 text on blue-50/80 (5.2:1 ratio) ✅

### Touch Targets
- Minimum 44px height for primary/secondary (desktop & mobile)
- Minimum 32px height for tertiary (meets WCAG 2.1 Level AAA)
- Adequate spacing between adjacent buttons

### Keyboard Navigation
- All buttons support keyboard focus
- Visible focus ring (`focus-visible:ring-2 ring-cyan-500`)
- Press state feedback (`active:scale-[0.98]`)

### Screen Readers
- Semantic `<button>` element
- Include descriptive text or `aria-label`
- Disabled state properly announced

---

## Real-World Examples

### Interview Question Screen
```tsx
{/* Primary: Main action */}
<Button size="lg">Submit Answer</Button>

{/* Secondary: Alternative action */}
<Button variant="outline">Skip Question</Button>

{/* Tertiary: Operational controls */}
<Button variant="tertiary" size="xs">Play Question</Button>
<Button variant="tertiary" size="xs">Pause</Button>
```

### Audio Recorder Component
```tsx
{/* Tertiary: Recording controls */}
<Button variant="tertiary" size="sm">Pause</Button>
<Button variant="tertiary" size="sm">Resume</Button>

{/* Primary: Complete recording */}
<Button variant="destructive">Stop</Button>

{/* Tertiary: Utility */}
<Button variant="tertiary" size="xs">Re-record</Button>
```

### Dashboard Card
```tsx
{/* Primary: Main CTA */}
<Button>Start Premium Interview</Button>

{/* Secondary: Alternative options */}
<Button variant="outline">Quick 3-Question Warmup</Button>
<Button variant="outline">View All Sessions</Button>

{/* Tertiary: Micro-interactions */}
<Button variant="tertiary" size="xs">Refresh</Button>
```

---

## Migration Guide

### Updating Existing Buttons to Tertiary

**Before:**
```tsx
<Button variant="ghost" size="sm">Play</Button>
<Button variant="secondary" size="sm">Re-record</Button>
```

**After:**
```tsx
<Button variant="tertiary" size="xs">Play</Button>
<Button variant="tertiary" size="sm">Re-record</Button>
```

### When to Migrate
Update to tertiary when the button is:
- Inside a task or workflow (not navigating between screens)
- A utility or operational control
- Lower priority than alternative actions
- A micro-interaction (play, pause, refresh, etc.)

---

## Design Tokens

```css
/* Tertiary Button Colors */
--tertiary-bg: rgb(239 246 255 / 0.8);        /* blue-50/80 */
--tertiary-bg-hover: rgb(219 234 254);        /* blue-100 */
--tertiary-text: rgb(29 78 216);              /* blue-700 */
--tertiary-text-hover: rgb(30 64 175);        /* blue-800 */

/* Border Radius (all buttons) */
--button-radius: 0.75rem;                     /* rounded-xl */

/* Transitions */
--button-transition: all 200ms;
```

---

## Do's and Don'ts

### ✅ DO
- Use primary for the main action users should take
- Use secondary for alternative paths or cancellation
- Use tertiary for operational controls and utilities
- Maintain consistent sizing within each context
- Ensure adequate spacing between buttons
- Group related tertiary buttons together

### ❌ DON'T
- Use tertiary for primary task completion
- Mix multiple primary buttons in the same context
- Use tertiary for navigation between screens
- Create custom button styles outside this system
- Use tertiary for destructive actions
- Stack tertiary buttons vertically (prefer horizontal layout)

---

## Browser Compatibility

- ✅ Chrome/Edge (all versions from 2023+)
- ✅ Safari (all versions from iOS 15+)
- ✅ Firefox (all versions from 2023+)
- ✅ Mobile browsers (Safari, Chrome, Samsung Internet)
- ✅ In-app browsers (TikTok, Instagram, Facebook)

---

## Testing Checklist

When implementing buttons:
- [ ] Visual hierarchy is clear (primary > secondary > tertiary)
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Touch targets are at least 32px tall
- [ ] Hover states are visually distinct
- [ ] Focus states are keyboard accessible
- [ ] Disabled states are properly styled
- [ ] Button text is concise and actionable
- [ ] Icons (if used) are properly sized and aligned
- [ ] Works across desktop, mobile browser, in-app browser

---

Last updated: November 2024

