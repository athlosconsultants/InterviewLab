# Mobile Responsiveness Checklist (T146)

**Goal:** Excellent UX on all mobile devices

**Status:** 🟡 In Progress

---

## Test Devices & Viewports

### Critical Breakpoints to Test

| Device | Width | Height | Notes |
|--------|-------|--------|-------|
| iPhone SE | 375px | 667px | Smallest modern iPhone |
| iPhone 12/13/14 | 390px | 844px | Most common iPhone |
| iPhone 14 Pro Max | 430px | 932px | Largest iPhone |
| Samsung Galaxy S21 | 360px | 800px | Common Android |
| iPad Mini | 768px | 1024px | Small tablet |
| iPad Pro | 1024px | 1366px | Large tablet |

### Testing Methods

1. **Chrome DevTools** (Cmd+Option+I → Toggle device toolbar)
2. **Real devices** (borrow from team or use BrowserStack)
3. **Safari Responsive Design Mode** (for iOS-specific issues)

---

## Page-by-Page Checklist

### Home Page (/)

- [ ] Hero section readable on 375px width
- [ ] CTAs visible without scrolling
- [ ] Feature cards stack properly
- [ ] Testimonials readable
- [ ] Footer doesn't overlap content
- [ ] No horizontal scrolling at any breakpoint

### Sign-In/Sign-Up (/sign-in)

- [ ] Form fits in viewport
- [ ] Input fields large enough to tap (44x44px minimum)
- [ ] Keyboard doesn't obscure submit button
- [ ] Email keyboard shows @ symbol
- [ ] Password field shows show/hide toggle
- [ ] Social auth buttons not too small

### Setup Page (/setup)

- [ ] **File Upload:**
  - [ ] Upload button large enough to tap
  - [ ] Camera option works on mobile
  - [ ] File picker native UI appears
  - [ ] Upload progress visible
  - [ ] Preview shows uploaded file
- [ ] **Form Fields:**
  - [ ] All inputs visible
  - [ ] Dropdown selects open correctly
  - [ ] Text areas expand appropriately
  - [ ] Submit button always visible
- [ ] **Progress Steps:**
  - [ ] Steps component responsive
  - [ ] Current step indicator clear
  - [ ] Steps don't overflow

### Interview Page (/interview/[id])

#### Voice Mode
- [ ] **Voice Orb:**
  - [ ] Orb scales appropriately (not too large)
  - [ ] Orb animations smooth on mobile
  - [ ] Orb doesn't interfere with controls
- [ ] **Controls:**
  - [ ] Record button large enough (minimum 60x60px)
  - [ ] Timer visible
  - [ ] Replay button accessible
  - [ ] Skip button not accidentally tappable
- [ ] **Layout:**
  - [ ] Question text readable (min 16px font)
  - [ ] Controls don't overlap content
  - [ ] Safe area insets respected (notch, home indicator)
  - [ ] Fixed bottom controls stay above keyboard

#### Text Mode
- [ ] **Text Area:**
  - [ ] Text input large enough
  - [ ] Text area expands with content
  - [ ] Keyboard doesn't obscure submit button
  - [ ] Auto-scroll to input on focus
- [ ] **Question Display:**
  - [ ] Question readable at all sizes
  - [ ] Stage indicator visible
  - [ ] Progress bar clear

### Report Page (/report/[id])

- [ ] **Score Dial:**
  - [ ] Dial scales appropriately
  - [ ] Score readable
  - [ ] Legend fits
- [ ] **Category Bars:**
  - [ ] Bars stack vertically on mobile
  - [ ] Labels don't overlap
  - [ ] Bars interactive/tappable
- [ ] **Feedback Cards:**
  - [ ] Cards readable
  - [ ] No text cutoff
  - [ ] Expand/collapse works
- [ ] **Actions:**
  - [ ] Download PDF button visible
  - [ ] Share button works
  - [ ] New interview CTA clear

### Pricing Page (/pricing)

- [ ] **Tier Cards:**
  - [ ] Cards stack vertically on mobile
  - [ ] Prices readable
  - [ ] Feature lists not truncated
  - [ ] CTA buttons prominent
- [ ] **Comparison Table:**
  - [ ] Table scrolls horizontally if needed
  - [ ] OR stacks for mobile view
  - [ ] Headers sticky on scroll
- [ ] **Checkout Flow:**
  - [ ] Stripe checkout mobile-optimized
  - [ ] Apple Pay/Google Pay available

---

## Common Mobile Issues & Fixes

### Issue 1: Text Too Small

```css
/* ❌ Bad: Fixed small text */
.description {
  font-size: 12px;
}

/* ✅ Good: Responsive text with minimum */
.description {
  font-size: clamp(14px, 4vw, 16px);
}
```

### Issue 2: Buttons Too Small

```css
/* ❌ Bad: Small tap target */
.icon-button {
  width: 24px;
  height: 24px;
}

/* ✅ Good: Minimum 44x44px tap target */
.icon-button {
  width: 44px;
  height: 44px;
  padding: 10px;
}

/* ✅ Better: Larger on touch devices */
@media (hover: none) and (pointer: coarse) {
  .icon-button {
    width: 56px;
    height: 56px;
  }
}
```

### Issue 3: Horizontal Scrolling

```css
/* ❌ Bad: Fixed width */
.container {
  width: 1200px;
}

/* ✅ Good: Responsive width */
.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 16px;
}
```

### Issue 4: Viewport Scaling

```html
<!-- ❌ Bad: Missing or wrong viewport -->
<meta name="viewport" content="width=device-width">

<!-- ✅ Good: Proper viewport with safe-area -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
>
```

### Issue 5: Fixed Positioning & iOS Keyboard

```css
/* ❌ Bad: Fixed bottom without keyboard handling */
.submit-button {
  position: fixed;
  bottom: 0;
}

/* ✅ Good: Use safe-area-inset */
.submit-button {
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  /* Also consider: */
  bottom: max(16px, env(safe-area-inset-bottom));
}

/* ✅ Better: Adjust on keyboard open */
@media (max-height: 500px) {
  .submit-button {
    position: static;
    margin-top: 16px;
  }
}
```

### Issue 6: Scroll Behavior

```tsx
// ✅ Good: Scroll input into view on focus
const inputRef = useRef<HTMLTextAreaElement>(null);

const handleFocus = () => {
  setTimeout(() => {
    inputRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, 300); // Wait for keyboard animation
};

<textarea ref={inputRef} onFocus={handleFocus} />
```

---

## Mobile-Specific Features

### 1. Touch Gestures

```tsx
// ✅ Add swipe to dismiss for modals
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedDown: () => closeModal(),
  preventScrollOnSwipe: true,
});

<Dialog {...handlers} />;
```

### 2. Native Share API

```tsx
// ✅ Use native share on mobile
const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      title: 'My Interview Report',
      url: window.location.href,
    });
  } else {
    // Fallback: copy link
    navigator.clipboard.writeText(window.location.href);
  }
};
```

### 3. Camera/File Picker

```tsx
// ✅ Support camera on mobile
<input
  type="file"
  accept="image/*,application/pdf"
  capture="environment" // Use camera
/>
```

### 4. Haptic Feedback (iOS)

```tsx
// ✅ Add haptic feedback for interactions
const vibrateOnTap = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10); // 10ms vibration
  }
};

<button onClick={vibrateOnTap}>Record</button>;
```

---

## Performance on Mobile

### Optimize for Slow Networks

```tsx
// ✅ Show loading states
{isLoading && <Skeleton />}

// ✅ Lazy load images
<Image
  src="/hero.jpg"
  alt="Hero"
  loading="lazy"
  placeholder="blur"
/>

// ✅ Prefetch critical routes
import { prefetch } from 'next/link';

useEffect(() => {
  prefetch('/interview');
}, []);
```

### Reduce Bundle Size for Mobile

```tsx
// ✅ Dynamic imports for heavy components
const ReportView = dynamic(() => import('@/components/results/ReportView'), {
  loading: () => <Loader />,
  ssr: false,
});
```

---

## iOS-Specific Fixes

### 1. Safari Input Zoom

```css
/* Prevent iOS zoom on input focus */
input,
textarea,
select {
  font-size: 16px; /* Minimum to prevent zoom */
}
```

### 2. iOS Bounce Scroll

```css
/* Prevent bounce on body */
body {
  overscroll-behavior-y: none;
}

/* Allow bounce in scrollable areas */
.scrollable {
  overscroll-behavior-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

### 3. iOS Safe Areas (Notch)

```css
/* Respect notch and home indicator */
.header {
  padding-top: env(safe-area-inset-top);
}

.footer {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Full viewport height accounting for safe areas */
.full-height {
  height: 100dvh; /* Dynamic viewport height */
  /* Fallback for older browsers: */
  height: 100vh;
  height: -webkit-fill-available;
}
```

---

## Testing Checklist

### Functional Testing

- [ ] All features work on touch (no hover-only interactions)
- [ ] Forms submit correctly
- [ ] File uploads work
- [ ] Audio recording works (with permission)
- [ ] TTS playback works
- [ ] Navigation works (swipe back on iOS)
- [ ] External links open in new tab

### Visual Testing

- [ ] No text cutoff
- [ ] No overlapping elements
- [ ] Images load and scale properly
- [ ] Icons readable
- [ ] Colors visible in sunlight (high brightness)
- [ ] Dark mode works (if supported)

### Performance Testing

- [ ] Pages load < 3s on 3G
- [ ] No jank during scrolling
- [ ] Animations smooth (60fps)
- [ ] No memory leaks (monitor DevTools)
- [ ] Battery usage reasonable

### Orientation Testing

- [ ] Landscape mode works
- [ ] Portrait mode works
- [ ] Orientation change doesn't break layout
- [ ] Content re-flows appropriately

---

## Tools

**Desktop Tools:**
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Safari Responsive Design Mode

**Real Device Testing:**
- BrowserStack (cloud devices)
- LambdaTest (cloud devices)
- Physical devices (borrow from team)

**Emulators:**
- iOS Simulator (requires macOS + Xcode)
- Android Studio Emulator

**Chrome DevTools Tips:**
```bash
# Throttle network
DevTools → Network → Throttling → Fast 3G

# Simulate touch
DevTools → Settings → Devices → "Show device frame"

# View safe areas
DevTools → Elements → Computed → Filter "safe-area"
```

---

## Acceptance Criteria

- [ ] All pages usable on iPhone SE (375px)
- [ ] No horizontal scrolling
- [ ] Tap targets ≥ 44x44px
- [ ] Text readable (≥ 14px)
- [ ] Forms work with mobile keyboard
- [ ] Safe areas respected (iOS notch, home indicator)
- [ ] Tested on real devices (iOS + Android)
- [ ] Performance acceptable on 3G
- [ ] No mobile-specific bugs reported

---

**Estimated Time:** 3-4 hours

**Last Updated:** October 11, 2025

