# CURSOR IMPLEMENTATION PROMPT: Interview Report Page Redesign

## HIGH-LEVEL VISION

Transform the interview report page from an aggressive upsell interface into a sophisticated, high-value assessment report that naturally creates desire for premium through behavioral economics principles. The user should feel they've received genuine value from the free assessment while experiencing a compelling information gap that makes upgrading feel like the obviously intelligent next step.

## END GOAL

Users view their free report and think: "This feedback is legitimately valuable. I can see I scored 30/100 on Communication. I earned scores on Technical and Problem Solving too, but I can only see Communication. I need to see the complete picture." The upgrade decision should feel inevitable for serious candidates, not coerced.

---

## SPECIFIC IMPLEMENTATION TASKS

### TASK 1: PAGE STRUCTURE REORGANIZATION

**Current problematic structure:**

- Unlock CTAs appear at the top
- Yellow "What You're Missing" box is prominent
- Cyan "Don't Stop Now" boxes are aggressive
- User results are buried below sales messaging

**New structure (top to bottom):**

1. **Report Header** (new)

   ```
   Interview Report
   Senior Project Manager at Company
   Completed 3 questions • 02/11/2025
   ```

2. **Overall Assessment Card**
   - Score: 25/100 with grade F
   - Full assessment text currently shown
   - Keep existing layout but apply new color palette

3. **Performance Breakdown Section** (enhanced)
   - Show all 3 dimensions in consistent card layout
   - Communication: 30/100 (unlocked - full details visible)
   - Technical Competency: ??/100 (locked - specific treatment below)
   - Problem Solving: ??/100 (locked - specific treatment below)

4. **Progress Indicator** (new)

   ```
   Your Full Analysis:
   ✓ Communication Assessment (unlocked)
   🔒 Technical Competency Assessment (available in Premium)
   🔒 Problem Solving Assessment (available in Premium)
   ```

5. **Subtle Upgrade CTA** (complete redesign - see Task 3)

6. **Footer with 7-day reset message** (new)

### TASK 2: LOCKED CATEGORY IMPLEMENTATION

**For Technical Competency and Problem Solving cards:**

**Visual Treatment:**

- Background: `#F9FAFB` (light gray)
- Same card dimensions as Communication card
- Display score as: "Technical Competency: ??/100"
- Show grayed-out progress bar with question marks
- Reduce opacity to 0.65 for the entire card
- Lock icon: `#9CA3AF` (medium gray), positioned top-right

**Content Display:**

- Category title: visible but lighter color `#6B7280`
- Score structure: "??/100" in same position as unlocked card
- Placeholder progress bar (grayed out)
- Feedback text area: Apply subtle 2px blur with text: "Available in Premium"

**Information Link (Critical):**
Add small info icon (ℹ️) next to category title that expands/reveals:

```
Technical Competency Assessment includes:
• Problem decomposition and solution architecture
• Code quality and best practices awareness
• Technical communication and documentation
• System thinking and scalability considerations

[See detailed feedback in Premium →]
```

```
Problem Solving Assessment includes:
• Structured thinking under pressure
• Creative solution generation
• Tradeoff analysis and prioritization
• Edge case handling and risk mitigation

[See detailed feedback in Premium →]
```

**Key Principle:** The user should clearly see they HAVE a score (it exists), they just can't view it. This is not hidden content, it's earned-but-locked content.

### TASK 3: REDESIGN CTA SECTIONS

**Remove entirely:**

- Bright cyan "Unlock Full Analysis" button at top
- Bright cyan "Unlock Full Report" button at top
- Large yellow box with "Here's What You're Missing:"
- Cyan box "Don't Stop Now - You're Just Getting Started"
- "Try Again" and "Unlock Full" buttons at bottom

**Replace with single subtle CTA section:**

**Location:** After Performance Breakdown, before footer

**Design Specifications:**

```css
Container:
  background: #F7F8FA
  border: 1px solid #E5E7EB
  border-radius: 8px
  padding: 32px 24px
  margin: 40px 0

Heading:
  text: "Want the Full Picture?"
  font-size: 20px
  font-weight: 600
  color: #2C3E50
  margin-bottom: 16px

Body Text:
  text: "This free assessment analyzed all 3 competencies but only shows Communication. Premium interviews give you complete feedback across all dimensions, unlimited practice sessions, and realistic voice mode."
  font-size: 16px
  line-height: 1.6
  color: #5A6C7D
  margin-bottom: 20px

Primary Button:
  text: "See Premium Features"
  background: #3B82F6
  color: white
  padding: 12px 24px
  border-radius: 6px
  font-weight: 500
  font-size: 16px
  hover: darken background to #2563EB

Secondary Link:
  text: "Not ready? Your next free assessment unlocks in 7 days"
  font-size: 14px
  color: #6B7280
  margin-top: 12px
  display: block
  text-decoration: underline on hover
```

### TASK 4: COLOR PALETTE STANDARDIZATION

**Apply these colors consistently throughout:**

```css
/* Primary Colors */
--primary-blue: #3b82f6 --primary-blue-hover: #2563eb /* Text Colors */
  --text-dark: #1f2937 --text-body: #4b5563 --text-light: #6b7280
  --text-lighter: #9ca3af /* Background Colors */ --bg-white: #ffffff
  --bg-light: #f9fafb --bg-subtle: #f7f8fa /* Border Colors */
  --border-light: #e5e7eb /* Feedback Colors */ --success: #10b981
  --warning: #f59e0b --error: #ef4444;
```

**Specific applications:**

1. **Overall Assessment Card:**
   - Background: `--bg-white`
   - Border: `--border-light`
   - Score number: `--error` (for low scores like 25)
   - Grade letter: `--error`
   - Text: `--text-dark` for heading, `--text-body` for description

2. **Performance Breakdown - Unlocked (Communication):**
   - Background: `--bg-white`
   - Border: `--border-light`
   - Title: `--text-dark`
   - Score: `--error` (30/100 is poor)
   - Progress bar: `--error`
   - Feedback text: `--text-body`

3. **Performance Breakdown - Locked:**
   - Background: `--bg-light`
   - Border: `--border-light`
   - Lock icon: `--text-lighter`
   - Title: `--text-light`
   - "Available in Premium" text: `--text-light`

4. **Remove/Replace:**
   - NO cyan (#00BCD4 or similar bright cyan)
   - NO yellow background boxes
   - NO pure black (#000000) - use `--text-dark` instead

### TASK 5: TYPOGRAPHY STANDARDIZATION

**Apply consistent hierarchy:**

```css
/* Page Title */
.report-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

/* Subtitle (role, company) */
.report-subtitle {
  font-size: 18px;
  font-weight: 400;
  color: var(--text-light);
  margin-bottom: 4px;
}

/* Meta info (date, questions completed) */
.report-meta {
  font-size: 14px;
  color: var(--text-lighter);
}

/* Section Headers */
.section-header {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 16px;
}

/* Card Titles */
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
}

/* Body Text */
.body-text {
  font-size: 16px;
  font-weight: 400;
  color: var(--text-body);
  line-height: 1.6;
}

/* Small Text */
.small-text {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-light);
}
```

### TASK 6: 7-DAY RESET MESSAGING

**Location:** Bottom of page, after CTA section, before absolute footer

**Design:**

```
Container:
  background: #F9FAFB
  border-top: 1px solid #E5E7EB
  padding: 24px
  text-align: center

Icon + Text:
  📅 Your next free assessment unlocks in 7 days

Subtext:
  Research shows spaced practice improves retention by 40%

Style:
  Main text: 16px, font-weight 500, color: #4B5563
  Subtext: 14px, color: #6B7280
```

**Key Framing:** This is presented as learning methodology, not a limitation. The user should think "this is good practice structure" not "they're preventing me from using it."

### TASK 7: PROGRESS INDICATOR IMPLEMENTATION

**Location:** Between Overall Assessment and Performance Breakdown sections

**Design:**

```
Container:
  background: #F9FAFB
  border: 1px solid #E5E7EB
  border-radius: 8px
  padding: 20px
  margin: 24px 0

Header:
  "Your Full Analysis:"
  font-size: 16px
  font-weight: 600
  color: #1F2937
  margin-bottom: 12px

List Items:
  ✓ Communication Assessment (unlocked)
    - Green checkmark icon
    - Text color: #1F2937

  🔒 Technical Competency Assessment (available in Premium)
    - Lock icon in #9CA3AF
    - Text color: #6B7280
    - "available in Premium" in lighter color

  🔒 Problem Solving Assessment (available in Premium)
    - Lock icon in #9CA3AF
    - Text color: #6B7280
    - "available in Premium" in lighter color

Spacing:
  8px between items
```

### TASK 8: MOBILE RESPONSIVENESS

**Breakpoints:**

- Mobile: 320px - 767px
- Tablet: 768px - 1024px
- Desktop: 1025px+

**Mobile-specific adjustments:**

- Reduce container padding: 32px → 20px
- Stack all cards vertically with full width
- CTA button: Full width on mobile
- Font sizes: Minimum 14px for body text
- Progress indicator: Vertical list on mobile
- Lock icon position: May need to scale down slightly

### TASK 9: INFORMATION DISCLOSURE INTERACTION

**For the info icon (ℹ️) next to locked category titles:**

**Interaction:**

- Clicking/tapping reveals the detailed list
- Can be accordion-style or modal (your choice based on existing patterns)
- Should feel lightweight, not like navigating away

**Expanded State Content:**

Technical Competency:

```
Technical Competency Assessment includes:
• Problem decomposition and solution architecture
• Code quality and best practices awareness
• Technical communication and documentation
• System thinking and scalability considerations
```

Problem Solving:

```
Problem Solving Assessment includes:
• Structured thinking under pressure
• Creative solution generation
• Tradeoff analysis and prioritization
• Edge case handling and risk mitigation
```

**Link at bottom of expanded content:**
"See detailed feedback in Premium →" (links to pricing/premium page)

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Critical - Do First):

1. Remove all aggressive CTAs (yellow boxes, cyan buttons at top)
2. Implement new color palette throughout
3. Reorder page structure
4. Implement locked category display with "??/100"

### Phase 2 (High Priority):

5. Create new subtle CTA section
6. Add progress indicator
7. Implement 7-day reset messaging
8. Add info disclosure functionality

### Phase 3 (Polish):

9. Typography standardization
10. Mobile responsiveness refinement
11. Micro-interactions and transitions

---

## CRITICAL DESIGN PRINCIPLES

### 1. Information Hierarchy

The user came for a report. Give them a report first, with upgrade prompts integrated naturally.

### 2. Earned Value Visibility

The user completed an interview that assessed all 3 dimensions. Make it clear they HAVE scores for all 3, they're just viewing 1 of 3. This is not "you need to do more" but "you need to see more of what you already created."

### 3. Specificity Over Mystery

Don't hide what the locked categories cover. Telling users exactly what Technical Competency and Problem Solving assess makes them want it MORE, not less. Quality information sells.

### 4. Scarcity as Methodology

The 7-day limit isn't arbitrary business model—it's learning science. Frame it that way.

### 5. Respectful Persuasion

Every element should communicate: "This is legitimate professional development. We're not tricking you. Premium is genuinely valuable for serious candidates."

---

## TESTING CHECKLIST

After implementation, verify:

- [ ] All cyan and yellow aggressive CTAs removed
- [ ] Color palette is consistent (no black text, no cyan, no yellow boxes)
- [ ] Locked categories show "??/100" format
- [ ] Info icons work and reveal detailed category descriptions
- [ ] Progress indicator shows "unlocked 1 of 3 dimensions"
- [ ] New CTA section uses subtle gray background, not aggressive colors
- [ ] 7-day message is visible and frames limit as methodology
- [ ] Mobile layout works properly on 375px width
- [ ] Typography sizes are consistent throughout
- [ ] All buttons use primary blue (#3B82F6)
- [ ] The page feels like a professional report, not a sales page

---

## BEHAVIORAL ECONOMICS PRINCIPLES EMBEDDED

This design implements:

- **Zeigarnik Effect**: Showing "??/100" creates information gap that demands closure
- **Endowment Effect**: User already earned these scores, they just need to unlock viewing them
- **Loss Aversion**: Framing as "unlocked 1 of 3 dimensions" emphasizes what's already earned
- **Authority**: Info disclosures show sophisticated assessment structure
- **Scarcity**: 7-day limit creates natural scarcity
- **Social Proof**: "2,847 people practiced this week" (keep existing stat if present)
- **Reciprocity**: Giving genuine value in free assessment creates obligation to consider premium

---

## FINAL QUALITY CHECK

Show the completed page to someone and ask:

1. "Do you feel like you got value from this free assessment?" (Should be YES)
2. "Do you feel manipulated or tricked?" (Should be NO)
3. "Do you want to see your other two scores?" (Should be YES)

If all three answers are as expected, you've succeeded.

---

## FILE LOCATIONS TO MODIFY

Based on typical React/Next.js structure, you'll likely need to modify:

- `/components/ReportPage.tsx` or similar
- `/styles/report.css` or report-specific styling
- Any existing CTA components
- Color constants/theme file

---

## QUESTIONS FOR DEVELOPER

Before implementing, confirm:

1. What component library are you using? (for consistent icon usage)
2. Do you have existing color constant files I should update?
3. What's the current routing for "See Premium Features" button?
4. Is the 7-day lockout enforced backend or frontend?
5. Do you prefer accordion or modal for info disclosure on locked categories?

---

## SUCCESS METRICS TO TRACK

After deployment, monitor:

- Time spent on report page (should increase)
- Upgrade conversion rate (should improve)
- Rage clicks on locked categories (should decrease)
- "See Premium Features" click-through rate
- User feedback sentiment

The goal isn't just higher conversion—it's users who upgrade and feel GOOD about upgrading because they understand the value.
