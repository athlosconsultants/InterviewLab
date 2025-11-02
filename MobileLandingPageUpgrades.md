# Mobile Landing Page Improvements

## Context

These improvements target the mobile landing page experience across:

- Mobile web browsers (Safari, Chrome, etc.)
- In-app browsers (TikTok, Instagram, Facebook, etc.)

## Task 1: Fix QuickTryWidget Visual Issue

**Problem**: In the "Select Your Role" section, there's an unwanted visual element or spacing appearing below the dropdown menu that creates an awkward appearance within the card.

**Goal**: Investigate and fix the styling or component layering issue causing this unwanted space/element. The dropdown should sit cleanly within the card without any visual artifacts below it.

**Scope**:

- Locate the QuickTryWidget or "Select Your Role" component
- Identify what's causing the extra spacing/visual element below the dropdown
- Fix the styling to ensure clean, professional appearance
- Test across multiple mobile browsers and in-app browsers

---

## Task 2: Update CTA Button Styling

**Problem**: Button style inconsistency between sections.

**Goal**: The "Start Free 3-Question Assessment" button (located just underneath the hero section) should match the visual style of the "See What Your Answers Are Missing" button found in the "See What You're Missing" section.

**Specific Requirements**:

- Match the exact button style (border, padding, typography, etc.)
- Match the color scheme
- Ensure consistency across both mobile web and in-app browsers

**Scope**:

- Locate both buttons
- Apply the "See What Your Answers Are Missing" button's styles to the "Start Free 3-Question Assessment" button
- Verify visual consistency

---

## Task 3: Redesign "See What You're Missing" Section

**Current Problem**: The section has a generic template aesthetic that doesn't signal expertise or build trust. The dual-card layout with red X's and green checkmarks feels like a basic comparison chart.

**Goal**: Transform this section into a polished, trust-building component that demonstrates expertise through design quality itself.

### Key Design Improvements Needed:

**1. Visual Hierarchy**

- Simplify the dual-card layout to reduce visual clutter
- Use whitespace more effectively between elements
- Create a more premium feel, moving away from the "comparison chart" aesthetic

**2. Color & Tone**

- Replace harsh red/green color scheme with a softer, more sophisticated palette
- Remove or replace red X's (they create negative friction) with neutral indicators
- Consider blue/gold or muted tones that build trust
- Avoid binary good/bad visual language

**3. Layout & Structure**

- Move away from the stacked red card/green card pattern (too template-like)
- Explore alternative layouts: side-by-side, slider, progressive disclosure, or accordion pattern
- Reduce text density throughout the section
- Show value through design, don't just tell through text

**4. Micro-interactions**

- Add subtle animations or hover states (where appropriate for mobile)
- Consider interactive elements like toggles, accordions, or sliders
- Signal craft and investment in UX through thoughtful interactions

**5. Trust Signals**

- If available, incorporate data visualization or statistics
- Add subtle social proof elements if data is available
- Make the section feel intentionally "designed" rather than "generated from a template"

**Overall Design Direction**:

- Modern, sophisticated, trustworthy
- Less "marketing comparison chart", more "premium product showcase"
- Use design quality itself as a trust signal
- Ensure mobile-first optimization

---

## Task 4: Fix Global Horizontal Alignment Issues

**Problem**: There's a noticeable horizontal alignment issue throughout the mobile landing page. Content appears to have inconsistent left/right padding or margins, making elements feel off-center or awkwardly positioned within the viewport.

**Affected Areas** (likely systematic across the entire page):

- Hero section: "Select Your Role" card and "Want more?" CTA section appear misaligned
- Pricing cards section: alignment inconsistencies
- Comparison section: horizontal spacing issues
- FAQ section: padding/margin problems

**Root Cause Hypothesis**: This appears to be a global container or padding problem rather than isolated component issues. The viewport width may not be utilized properly for mobile optimization.

**Goal**: Achieve consistent, professional horizontal alignment throughout the entire mobile landing page.

**Requirements**:

- Investigate global container widths, padding, and margin settings
- Ensure all major sections (hero, pricing, comparison, FAQ, etc.) have consistent horizontal alignment
- Content should feel properly centered and balanced within the mobile viewport
- Left and right padding/margins should be consistent across all sections
- Utilize the mobile viewport width effectively and professionally

**Scope**:

- Review global layout containers and wrappers
- Standardize horizontal spacing across all sections
- Test across various mobile device widths
- Verify in both mobile browsers and in-app browsers
- Ensure responsive behavior maintains alignment at different breakpoints

---

## Testing Requirements

For all tasks, please verify:

1. Visual correctness in mobile Safari (iOS)
2. Visual correctness in mobile Chrome (Android)
3. Visual correctness in TikTok in-app browser
4. Visual correctness in Instagram in-app browser
5. Responsive behavior across different mobile device widths (320px - 428px range)
6. No layout breaks or overflow issues

---

## Success Criteria

- QuickTryWidget displays cleanly without visual artifacts
- Button styles are consistent and professional
- "See What You're Missing" section feels premium, trustworthy, and expertly designed
- All content is properly aligned horizontally across the entire mobile landing page
- Professional, polished appearance across all mobile contexts
