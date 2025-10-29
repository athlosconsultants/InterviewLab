# Button Design System

## Overview

This document outlines the standardized button system for InterviewLab, ensuring consistent UI/UX across desktop, mobile browser, and in-app browsers.

## Design Principles

1. **Touch-friendly**: Minimum 44px height for all interactive elements
2. **Text clarity**: Generous padding prevents text cutoff/crushing
3. **Visual hierarchy**: Clear distinction between primary and secondary actions
4. **Brand consistency**: Cyan-blue gradient matches overall design language
5. **Accessibility**: High contrast, clear focus states, proper sizing

---

## Button Variants

### 1. **Default (Primary)**

- **Use case**: Primary actions, CTAs
- **Style**: Cyan-to-blue gradient background, white text
- **Visual**: `from-cyan-500 to-blue-600` → `from-cyan-600 to-blue-700` on hover
- **Shadow**: Large shadow that expands on hover
- **Example**: "Start My Free Assessment", "Get Instant Feedback"

```tsx
<Button size="default">Start Interview</Button>
<Button size="lg">Start My Free 3-Question Assessment →</Button>
```

### 2. **Outline (Secondary)**

- **Use case**: Secondary actions, alternative options
- **Style**: White background, cyan border (2px), cyan text
- **Hover**: Light cyan background (`cyan-50`)
- **Shadow**: Small shadow that grows on hover
- **Example**: "Explore Premium Plans", "Try Free Assessment"

```tsx
<Button variant="outline" size="default">Explore Plans</Button>
<Button variant="outline" size="lg">Try Free Assessment</Button>
```

### 3. **Secondary**

- **Use case**: Tertiary actions, less prominent options
- **Style**: Light slate background (`slate-100`), dark slate text
- **Hover**: Darker slate background (`slate-200`)
- **Example**: "Cancel", "Go Back"

```tsx
<Button variant="secondary" size="default">
  Cancel
</Button>
```

### 4. **Destructive**

- **Use case**: Dangerous actions, deletions
- **Style**: Red gradient background, white text
- **Visual**: `from-red-500 to-red-600` → `from-red-600 to-red-700` on hover
- **Example**: "Delete Account", "Cancel Subscription"

```tsx
<Button variant="destructive" size="default">
  Delete
</Button>
```

### 5. **Ghost**

- **Use case**: Subtle actions, inline buttons
- **Style**: No background, cyan text on hover
- **Hover**: Light cyan background (`cyan-50`)
- **Example**: Navigation items, inline actions

```tsx
<Button variant="ghost" size="default">
  Learn More
</Button>
```

### 6. **Link**

- **Use case**: Text links styled as buttons
- **Style**: Cyan text, underline on hover
- **Example**: "Terms & Conditions", "Learn more"

```tsx
<Button variant="link">Terms & Conditions</Button>
```

---

## Button Sizes

### Default

- **Height**: `min-h-[44px]` (44px minimum)
- **Padding**: `px-6 py-3` (24px horizontal, 12px vertical)
- **Text**: `text-base` (16px), `font-semibold`
- **Border radius**: `rounded-lg` (8px)
- **Use case**: Most common size, works for all contexts

```tsx
<Button size="default">Submit</Button>
```

### Small (sm)

- **Height**: `min-h-[40px]` (40px minimum)
- **Padding**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Text**: `text-sm` (14px), `font-semibold`
- **Use case**: Compact spaces, secondary actions within cards

```tsx
<Button size="sm">Edit</Button>
```

### Large (lg)

- **Height**: `min-h-[52px]` (52px minimum)
- **Padding**: `px-8 py-4` (32px horizontal, 16px vertical)
- **Text**: `text-lg` (18px), `font-semibold`
- **Use case**: Hero CTAs, primary page actions

```tsx
<Button size="lg">Start My Free 3-Question Assessment →</Button>
```

### Icon

- **Size**: `h-11 w-11 min-h-[44px]` (44x44px)
- **Use case**: Icon-only buttons
- **Note**: Still maintains 44px minimum for touch targets

```tsx
<Button variant="ghost" size="icon">
  <X className="h-4 w-4" />
</Button>
```

---

## Technical Specifications

### Base Classes

All buttons inherit these base classes:

```
inline-flex items-center justify-center gap-2
whitespace-nowrap rounded-lg text-sm font-semibold
transition-all duration-200
focus-visible:outline-none focus-visible:ring-2
focus-visible:ring-cyan-500 focus-visible:ring-offset-2
disabled:pointer-events-none disabled:opacity-50
```

### Key Features

- **Touch targets**: Minimum 44x44px (WCAG AAA standard)
- **Whitespace handling**: `whitespace-nowrap` prevents text wrapping
- **Icon handling**: SVG icons auto-sized to 16x16px
- **Transitions**: 200ms smooth transitions for all state changes
- **Focus states**: 2px cyan ring with 2px offset
- **Active states**: Scale down to 98% (`active:scale-[0.98]`)
- **Disabled states**: 50% opacity, no pointer events

---

## Usage Examples

### Landing Page Hero

```tsx
<Link href="/assessment/setup">
  <Button size="lg">
    Start My Free 3-Question Assessment →
  </Button>
</Link>

<Link href="/pricing">
  <Button size="lg" variant="outline">
    Explore Premium Plans
  </Button>
</Link>
```

### Pricing Cards (Mobile)

```tsx
<Button
  onClick={() => handlePurchase(plan.id)}
  disabled={loading !== null}
  size="default"
  className="w-full mb-6"
>
  {loading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Processing...
    </>
  ) : (
    'Get Interview-Ready'
  )}
</Button>
```

### QuickTryWidget

```tsx
{
  /* Submit button */
}
<Button
  disabled={!isAnswerValid}
  onClick={handleSubmit}
  size="default"
  className="w-full"
>
  Get Instant Feedback
</Button>;

{
  /* CTA after feedback */
}
<Button size="default" className="w-full">
  Get Your Full 3-Question Assessment →
</Button>;
```

### Forms

```tsx
<div className="flex gap-4">
  <Button variant="secondary" size="default" type="button">
    Cancel
  </Button>
  <Button size="default" type="submit">
    Continue
  </Button>
</div>
```

---

## Mobile Optimization

### Touch Targets

- All buttons maintain **minimum 44px height** across all screen sizes
- Full-width buttons on mobile use `className="w-full"` for easy tapping
- Adequate spacing between buttons (minimum 8px gap)

### Text Handling

- `text-base` (16px) on mobile prevents browser zoom on focus
- `font-semibold` ensures readability on small screens
- Generous padding (`px-6`) prevents text from touching edges

### Responsive Behavior

```tsx
{
  /* Desktop: Side by side, Mobile: Stacked */
}
<div className="flex flex-col sm:flex-row gap-4">
  <Button size="lg">Primary Action</Button>
  <Button size="lg" variant="outline">
    Secondary Action
  </Button>
</div>;
```

---

## Accessibility

### Focus States

- **Ring**: 2px cyan ring with 2px offset
- **Visible on keyboard navigation**: Clear focus indicator
- **Not visible on mouse click**: Ring offset prevents visual clutter

### Screen Readers

- Use descriptive text: "Start My Free Assessment" not "Click Here"
- Loading states include text: "Processing..." not just spinner
- Icon buttons must include aria-labels

### Color Contrast

- Primary buttons: White text on cyan-blue gradient (AAA compliant)
- Outline buttons: Cyan text on white (AA compliant)
- Disabled state: 50% opacity clearly indicates non-interactive state

---

## Common Patterns

### Loading State

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### With Icon

```tsx
<Button size="lg">
  Start Interview
  <ArrowRight className="ml-2 h-5 w-5" />
</Button>
```

### Link as Button

```tsx
<Button asChild size="lg">
  <Link href="/pricing">View Plans</Link>
</Button>
```

### Full Width

```tsx
<Button className="w-full" size="default">
  Continue
</Button>
```

---

## Migration Guide

### Old Pattern

```tsx
<Button
  size="lg"
  className="text-lg px-8 py-6 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
>
  Click Me
</Button>
```

### New Pattern

```tsx
<Button size="lg">Click Me</Button>
```

**Benefits:**

- ✅ Consistent styling across app
- ✅ Proper touch targets
- ✅ No text cutoff issues
- ✅ Better maintainability
- ✅ Automatic accessibility features

---

## Testing Checklist

When implementing buttons:

- [ ] Text is fully visible (not cut off or crushed)
- [ ] Minimum 44px height on all devices
- [ ] Touch targets work on mobile browsers
- [ ] Touch targets work in in-app browsers (Instagram, TikTok, etc.)
- [ ] Focus states are visible on keyboard navigation
- [ ] Hover states work on desktop
- [ ] Active/pressed states provide feedback
- [ ] Loading states are clear
- [ ] Disabled states are obvious
- [ ] Button text is descriptive for screen readers

---

## Browser Compatibility

Tested and verified on:

- ✅ Safari (iOS & macOS)
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox
- ✅ Edge
- ✅ TikTok in-app browser
- ✅ Instagram in-app browser
- ✅ Facebook in-app browser

---

## Updates & Maintenance

**Last Updated**: October 29, 2025
**Version**: 2.0.0

### Changelog

- **v2.0.0**: Complete button system overhaul
  - Cyan-blue gradient as default
  - Minimum 44px heights
  - Enhanced padding for text clarity
  - Consistent sizing across all variants
  - Mobile-first design principles
