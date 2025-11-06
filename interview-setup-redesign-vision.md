# Interview Setup Redesign - High-Level Vision

## Executive Summary

Transform the premium interview setup experience from a single-page form into an intelligent two-screen flow that prioritizes user control, eliminates redundant data entry through smart prefilling, and creates a psychologically superior experience where users feel empowered rather than interrogated.

**Core Philosophy:** "Configure First, Context After"

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Proposed Solution Overview](#proposed-solution-overview)
3. [Screen 1: Interview Configuration](#screen-1-interview-configuration)
4. [Screen 2: Role Context](#screen-2-role-context)
5. [Intelligence & Prefilling Logic](#intelligence--prefilling-logic)
6. [Mobile-First Optimizations](#mobile-first-optimizations)
7. [User Experience Flows](#user-experience-flows)
8. [Technical Architecture](#technical-architecture)
9. [Design System Guidelines](#design-system-guidelines)
10. [Implementation Roadmap](#implementation-roadmap)
11. [Success Metrics](#success-metrics)

---

## Current State Analysis

### What's Wrong

1. **Psychological Flow is Backwards**
   - Users do "homework" (5 fields of data entry) before seeing the "fun part" (customization)
   - Feels like bureaucratic gatekeeping, not premium service
   - No sense of control or agency until second screen

2. **Zero Memory Between Sessions**
   - Users re-enter job title, company, location every single time
   - CV must be re-uploaded for every interview
   - Job description must be re-pasted every time
   - No learning or intelligence in the system

3. **Mobile Friction Points**
   - 50-character minimum on job description (arbitrary and annoying)
   - Large empty text boxes feel intimidating
   - File upload on mobile is clunky
   - No indication of what comes next

4. **Hidden Value**
   - Interview customization (mode, stages, questions) buried on second screen
   - Users don't see premium features until after data entry
   - No preview of what they're building

5. **Inconsistent Experience**
   - First-time users and returning users get identical experience
   - System doesn't recognize or reward loyalty
   - Every interview feels like starting from scratch

### Impact

- Setup feels like work, not premium experience
- Higher friction = lower completion rates
- Users don't feel the intelligence they paid for
- Missed opportunity to build habit/retention

---

## Proposed Solution Overview

### Two-Screen Intelligent Flow

**Screen 1: Interview Configuration** (NEW)
- Let users design their interview first
- Show the premium customization immediately
- Create sense of control and ownership
- Prefill from last interview if available

**Screen 2: Role Context** (REDESIGNED)
- Collect role-specific information
- Maximum intelligence: prefill everything possible
- Show CV status, don't ask for re-upload
- Clear value exchange: "Better questions if you add details"

### Key Principles

1. **Intelligence First:** Remember everything, ask nothing twice
2. **Control First:** Let users configure before contextualizing
3. **Transparency:** Show what we remember and why
4. **Optionality:** Minimum 2 fields required, rest optional but encouraged
5. **Mobile-Native:** Optimized for Safari and in-app browsers (TikTok)

---

## Screen 1: Interview Configuration

### Purpose
Let premium users design their interview experience. This is the "fun part" - giving them control over how their interview will work.

### Layout (Mobile-First)

```
┌─────────────────────────────────────┐
│ 🎯 Customize Your Interview         │
│                                      │
│ Interview Mode                       │
│ ┌──────────┐  ┌──────────┐         │
│ │ T Text   │  │ 🎤 Voice │ ✓       │
│ └──────────┘  └──────────┘         │
│ (Last used: Voice)                   │
│                                      │
│ Interview Depth                      │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │  1  │ │  2  │ │  3  │ ✓          │
│ └─────┘ └─────┘ └─────┘            │
│ 2 stages selected (Last used)        │
│                                      │
│ Questions Per Stage                  │
│ ●━━━━━━━○━━━━━━ 7                   │
│ (Last used: 7)                       │
│                                      │
│ 📊 Total: ~14 questions, ~15 min    │
│                                      │
│                                      │
│ [Continue to Role Setup →]          │
│                                      │
│ ← Back to Dashboard                  │
└─────────────────────────────────────┘
```

### Components

**Interview Mode**
- Two large toggle buttons: Text | Voice
- Clear selected state (border + checkmark)
- Min height: 56px for mobile tap targets

**Interview Depth**
- Three buttons: 1 | 2 | 3 stages
- Single selection (radio button behavior)
- Clear visual hierarchy

**Questions Per Stage**
- Slider control with large touch target
- Range: 3-10 questions
- Shows current value next to slider
- Updates total calculation immediately

**Total Display**
- Calculated: stages × questionsPerStage
- Shows estimated time (rough: 1 question ≈ 1 minute)
- Example: "~14 questions, ~15 min"

### Smart Prefilling Behavior

**First-Time User:**
- Mode: Text (default)
- Stages: 1 (default)
- Questions: 5 (default)
- No hints shown

**Returning User:**
- Mode: Last used (e.g., Voice)
- Stages: Last used (e.g., 2)
- Questions: Last used (e.g., 7)
- Muted hints: "(Last used: X)" below each control

### Interaction Details

- All selections update immediately (no "apply" needed)
- Smooth animations between states
- Total recalculates on any change
- "Continue to Role Setup" enabled at all times
- Back button returns to dashboard (doesn't save settings)

### Technical Requirements

```javascript
// Load user's last interview settings
GET /api/user/profile
Response: {
  lastInterview: {
    mode: "voice",
    stages: 2,
    questionsPerStage: 7
  }
}

// Store selections in session/context for next screen
sessionStorage.setItem('interviewConfig', JSON.stringify({
  mode: selectedMode,
  stages: selectedStages,
  questionsPerStage: selectedQuestions
}));
```

---

## Screen 2: Role Context

### Purpose
Collect role-specific information to personalize interview questions. Use maximum intelligence to minimize data entry.

### Layout - State 1: Returning User, CV on File

```
┌─────────────────────────────────────┐
│ 🎯 Tell Us About the Role            │
│                                      │
│ What role? *                         │
│ [Senior Software Engineer____]       │
│ (From last interview)                │
│                                      │
│ At which company? *                  │
│ [Google___________________]          │
│ (From last interview)                │
│                                      │
│ ─── Optional (Better Questions) ───  │
│                                      │
│ Location                             │
│ [San Francisco, CA________]          │
│ (From last interview)                │
│                                      │
│ 📎 Your CV/Resume                    │
│ ✓ Using CV on file (uploaded 3d ago) │
│   [Update CV]                        │
│                                      │
│ 📋 Job Description                   │
│ [Paste if different role_____]       │
│ [____________________________]       │
│                                      │
│ ℹ️ Interviewing for same role?       │
│    Just tap Start below              │
│                                      │
│ [Start Interview →]                  │
│                                      │
│ ← Back                               │
└─────────────────────────────────────┘
```

### Layout - State 2: First-Time User, No Data

```
┌─────────────────────────────────────┐
│ 🎯 Tell Us About the Role            │
│                                      │
│ What role? *                         │
│ [___________________________]        │
│ e.g., Senior Software Engineer       │
│                                      │
│ At which company? *                  │
│ [___________________________]        │
│ e.g., Google                         │
│                                      │
│ ─── Optional (Better Questions) ───  │
│                                      │
│ Location                             │
│ [___________________________]        │
│ e.g., San Francisco, CA              │
│                                      │
│ 📎 Your CV/Resume                    │
│ ┌─────────────────────────────────┐ │
│ │   Drop file or click to browse  │ │
│ │   .PDF, .DOC, .DOCX (max 10MB)  │ │
│ └─────────────────────────────────┘ │
│                                      │
│ 📋 Job Description                   │
│ [____________________________]       │
│ [____________________________]       │
│ Paste key requirements or URL        │
│                                      │
│                                      │
│ [Start Interview →]                  │
│                                      │
│ ← Back                               │
└─────────────────────────────────────┘
```

### Required Fields

**Job Title**
- Single-line text input
- Autocomplete with user's past roles
- Example placeholder: "e.g., Senior Software Engineer"
- Prefills from lastInterview.jobTitle if available

**Company**
- Single-line text input
- Autocomplete with user's past companies
- Datalist with common tech companies
- Example placeholder: "e.g., Google"
- Prefills from lastInterview.company if available

### Optional Fields

**Location**
- Single-line text input
- Prefills from lastInterview.location if available
- Not required (many interviews are remote/virtual)
- Example: "e.g., San Francisco, CA"

**CV/Resume**
- Conditional display based on database state
- If CV on file: Show status + [Update CV] button
- If no CV: Show drag-and-drop upload zone
- Accept: .PDF, .DOC, .DOCX (max 10MB)
- Status shows age: "uploaded 3d ago" or "uploaded 2mo ago"

**Job Description**
- Multi-line textarea (auto-expanding)
- Accept plain text OR URL
- No minimum character requirement (removed!)
- If URL detected, scrape job posting
- Placeholder: "Paste key requirements or URL"

### Contextual Help Messages

Display different messages based on user state:

**Same role as last time:**
```
ℹ️ Interviewing for same role?
   Just tap Start below
```

**New role, CV on file:**
```
ℹ️ Your CV is already uploaded
   Just fill in the new role details
```

**No CV, first time:**
```
ℹ️ Uploading your CV helps us ask
   better, more personalized questions
```

### CV Status Display Variations

**No CV on file:**
```
📎 Your CV/Resume
┌─────────────────────────────────┐
│   Drop file or click to browse  │
│   .PDF, .DOC, .DOCX (max 10MB)  │
└─────────────────────────────────┘
```

**CV on file (recent):**
```
📎 Your CV/Resume
✓ Using CV on file (uploaded 2d ago)
  [Update CV]
```

**CV on file (old - 3+ months):**
```
📎 Your CV/Resume
✓ Using CV on file (uploaded 3mo ago)
  [Update CV] ← Consider updating
```

**CV just uploaded:**
```
📎 Your CV/Resume
✓ CV updated ← Green checkmark animation
  [Update again]
```

### Auto-Save & Draft Recovery

**Auto-Save Behavior:**
- Save to localStorage on every field change
- Debounced (500ms after typing stops)
- Includes timestamp of last save
- Survives page refresh/close

**Draft Recovery:**
```
If draft exists and < 60 minutes old:
  Show banner at top:
  "📝 We saved your setup from 20m ago [Restore] [Start Fresh]"

If draft exists and > 60 minutes old:
  Clear draft silently
  Start fresh
```

### Validation Rules

**On Submit (not while typing):**
- Job Title: Required, min 2 characters
- Company: Required, min 2 characters
- Location: Optional, any length
- CV: Optional (use on-file reference if not uploaded)
- Job Description: Optional, any length (NO MINIMUM)

**Error Display:**
```
Show inline errors below field:
"Job title is required"

Don't show errors until user tries to submit
```

---

## Intelligence & Prefilling Logic

### Data Model: User Profile

```javascript
{
  userId: "user_abc123",
  
  // Stored CV reference
  cvFile: {
    filename: "john_doe_resume.pdf",
    uploadDate: "2024-11-03T10:30:00Z",
    s3Key: "cvs/user_abc123/resume_v2.pdf",
    fileSize: 245600 // bytes
  },
  
  // Most recent interview
  lastInterview: {
    jobTitle: "Senior Software Engineer",
    company: "Google",
    location: "San Francisco, CA",
    jobDescription: "We're looking for...",
    mode: "voice",
    stages: 2,
    questionsPerStage: 7,
    completedAt: "2024-11-03T11:45:00Z"
  },
  
  // Historical interviews for suggestions
  interviewHistory: [
    {
      jobTitle: "Product Manager",
      company: "Meta",
      location: "Menlo Park, CA",
      completedAt: "2024-10-15T09:20:00Z"
    },
    {
      jobTitle: "Senior Software Engineer",
      company: "Amazon",
      location: "Seattle, WA",
      completedAt: "2024-09-22T14:10:00Z"
    }
    // ... more interviews
  ]
}
```

### Prefilling Algorithm: Screen 1

```javascript
function loadConfigurationDefaults(user) {
  // Check for previous interview
  if (user.lastInterview) {
    return {
      mode: user.lastInterview.mode,
      stages: user.lastInterview.stages,
      questionsPerStage: user.lastInterview.questionsPerStage,
      showHints: true, // Display "(Last used: X)" hints
      isReturningUser: true
    };
  }
  
  // First-time defaults
  return {
    mode: "text", // Easier for first-timers
    stages: 1, // Start simple
    questionsPerStage: 5, // Not overwhelming
    showHints: false,
    isReturningUser: false
  };
}
```

### Prefilling Algorithm: Screen 2

```javascript
function loadRoleDefaults(user) {
  const state = {
    jobTitle: "",
    company: "",
    location: "",
    cvFile: null,
    jobDescription: "",
    suggestions: [],
    helpMessage: null
  };
  
  // 1. Check for CV on file
  if (user.cvFile) {
    const daysAgo = calculateDaysAgo(user.cvFile.uploadDate);
    state.cvFile = {
      exists: true,
      filename: user.cvFile.filename,
      uploadDate: user.cvFile.uploadDate,
      daysAgo: daysAgo,
      isOld: daysAgo > 90 // Flag if 3+ months old
    };
  }
  
  // 2. Prefill from last interview
  if (user.lastInterview) {
    state.jobTitle = user.lastInterview.jobTitle;
    state.company = user.lastInterview.company;
    state.location = user.lastInterview.location || "";
    state.showHints = true; // Show "(From last interview)"
    
    // Don't prefill job description (likely different role)
    state.jobDescription = "";
    
    // Determine help message
    if (state.cvFile?.exists) {
      state.helpMessage = "same-role"; // "Just tap Start below"
    }
  } else if (state.cvFile?.exists) {
    state.helpMessage = "cv-on-file"; // "Your CV is already uploaded"
  } else {
    state.helpMessage = "first-time"; // CV upload explanation
  }
  
  // 3. Generate autocomplete suggestions
  if (user.interviewHistory?.length > 0) {
    state.suggestions = extractUniqueSuggestions(user.interviewHistory);
  }
  
  return state;
}

function extractUniqueSuggestions(history) {
  const roles = new Set();
  const companies = new Set();
  
  history.forEach(interview => {
    roles.add(interview.jobTitle);
    companies.add(interview.company);
  });
  
  return {
    roles: Array.from(roles).slice(0, 5), // Top 5 past roles
    companies: Array.from(companies).slice(0, 5) // Top 5 past companies
  };
}

function calculateDaysAgo(dateString) {
  const uploadDate = new Date(dateString);
  const now = new Date();
  const diffMs = now - uploadDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}
```

### Hint Display Logic

```javascript
// When to show "(From last interview)" hint
function shouldShowHint(fieldValue, lastInterviewValue, userHasEdited) {
  return (
    lastInterviewValue && // We have historical data
    fieldValue === lastInterviewValue && // Current value matches
    !userHasEdited // User hasn't touched this field yet
  );
}

// When user edits a prefilled field, remove hint
function onFieldEdit(fieldName) {
  // Clear the hint for this field
  setFieldHint(fieldName, null);
  
  // Mark field as edited
  markAsEdited(fieldName);
}
```

### Draft Auto-Save Logic

```javascript
// Save every field change to localStorage
function autosaveDraft(fieldName, value) {
  const draft = JSON.parse(localStorage.getItem('interviewDraft') || '{}');
  
  draft[fieldName] = value;
  draft.lastSaved = new Date().toISOString();
  draft.screenOneConfig = sessionStorage.getItem('interviewConfig');
  
  localStorage.setItem('interviewDraft', JSON.stringify(draft));
}

// Debounced save (500ms after typing stops)
const debouncedSave = debounce(autosaveDraft, 500);

// On every input change
onInputChange((fieldName, value) => {
  debouncedSave(fieldName, value);
});
```

### Draft Recovery Logic

```javascript
function checkForDraft() {
  const draft = JSON.parse(localStorage.getItem('interviewDraft') || '{}');
  
  if (!draft.lastSaved) {
    return null; // No draft found
  }
  
  const minutesAgo = calculateMinutesAgo(draft.lastSaved);
  
  if (minutesAgo > 60) {
    // Draft too old, clear it
    localStorage.removeItem('interviewDraft');
    return null;
  }
  
  return {
    draft: draft,
    minutesAgo: minutesAgo
  };
}

function showDraftRecoveryBanner(draft, minutesAgo) {
  return `
    <div class="draft-banner">
      📝 We saved your setup from ${minutesAgo}m ago
      <button onclick="restoreDraft()">Restore</button>
      <button onclick="clearDraft()">Start Fresh</button>
    </div>
  `;
}

function restoreDraft(draft) {
  // Restore Screen 1 config
  if (draft.screenOneConfig) {
    sessionStorage.setItem('interviewConfig', draft.screenOneConfig);
    // Navigate back to Screen 1 or restore state
  }
  
  // Restore Screen 2 fields
  Object.keys(draft).forEach(key => {
    if (key !== 'lastSaved' && key !== 'screenOneConfig') {
      setFieldValue(key, draft[key]);
    }
  });
}
```

---

## Mobile-First Optimizations

### Input Attributes for Mobile

```html
<!-- Job Title Input -->
<input 
  type="text"
  id="jobTitle"
  name="jobTitle"
  value="${prefilled.jobTitle}"
  placeholder="e.g., Senior Software Engineer"
  autocomplete="organization-title"
  autocapitalize="words"
  enterkeyhint="next"
  required
/>

<!-- Company Input -->
<input 
  type="text"
  id="company"
  name="company"
  value="${prefilled.company}"
  placeholder="e.g., Google"
  autocomplete="organization"
  autocapitalize="words"
  enterkeyhint="next"
  list="company-suggestions"
  required
/>
<datalist id="company-suggestions">
  <option value="Google">
  <option value="Meta">
  <option value="Amazon">
  <option value="Apple">
  <option value="Microsoft">
  <!-- Plus user's past companies -->
</datalist>

<!-- Location Input -->
<input 
  type="text"
  id="location"
  name="location"
  value="${prefilled.location}"
  placeholder="e.g., San Francisco, CA"
  autocomplete="address-level2"
  autocapitalize="words"
  enterkeyhint="done"
/>

<!-- Job Description Textarea -->
<textarea
  id="jobDescription"
  name="jobDescription"
  placeholder="Paste key requirements or URL"
  rows="4"
  style="resize: vertical;"
></textarea>
```

### Why These Attributes Matter

- `autocomplete`: Browser suggests relevant values (faster input)
- `autocapitalize`: Proper capitalization (e.g., "Google" not "google")
- `enterkeyhint`: Changes keyboard button ("next" vs "done" vs "go")
- `list`: Native browser autocomplete dropdown
- `type="text"`: Prevents unwanted mobile keyboards (e.g., email keyboard)

### Touch Target Sizes

```css
/* All interactive elements */
button, input, select, textarea {
  min-height: 44px; /* iOS minimum tap target */
  font-size: 16px; /* Prevents iOS zoom on focus */
}

/* Larger for primary actions */
.primary-button {
  min-height: 56px;
  font-size: 18px;
}

/* Generous spacing between fields */
.form-field {
  margin-bottom: 24px;
}

/* Large tap area for toggle buttons */
.toggle-button {
  min-width: 45%;
  min-height: 56px;
  padding: 12px 24px;
}

/* Slider handle */
.slider-handle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
```

### Mobile File Upload

```html
<input 
  type="file"
  id="cvUpload"
  name="cvUpload"
  accept=".pdf,.doc,.docx"
  capture="environment" <!-- Allows camera on some mobile browsers -->
/>

<!-- Styled upload zone -->
<label for="cvUpload" class="upload-zone">
  <div class="upload-icon">📎</div>
  <div class="upload-text">
    Drop file or click to browse
  </div>
  <div class="upload-hint">
    .PDF, .DOC, .DOCX (max 10MB)
  </div>
</label>
```

### Auto-Expanding Textarea

```javascript
// Automatically grow textarea as user types
function autoExpandTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// Attach to job description field
const jobDescTextarea = document.getElementById('jobDescription');
jobDescTextarea.addEventListener('input', (e) => {
  autoExpandTextarea(e.target);
});
```

### Keyboard Behavior

```javascript
// Move to next field on Enter (except textarea)
document.querySelectorAll('input:not([type="file"])').forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.from(form.elements).indexOf(e.target);
      const nextElement = form.elements[index + 1];
      
      if (nextElement && nextElement.type !== 'submit') {
        nextElement.focus();
      }
    }
  });
});
```

### Responsive Viewport Handling

```css
/* Ensure form stays visible when keyboard appears */
.setup-form {
  padding-bottom: 100px; /* Extra space for keyboard */
}

/* Smooth scroll to focused input */
input:focus, textarea:focus {
  scroll-margin-top: 100px;
}
```

```javascript
// Scroll focused input into view (mobile keyboards)
document.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('focus', (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 300); // Wait for keyboard animation
  });
});
```

---

## User Experience Flows

### Flow 1: Complete First-Timer

**Context:** User has never done an interview, no data on file

**Steps:**

1. **Screen 1: Interview Configuration**
   - Sees default selections (Text, 1 stage, 5 questions)
   - Decides they want Voice mode
   - Taps Voice button ✓
   - Sees total: "~5 questions, ~8 min"
   - Taps "Continue to Role Setup →"
   - **Time: ~30 seconds**

2. **Screen 2: Role Context**
   - All fields empty, no hints
   - Types "Senior Software Engineer" in Job Title
   - Types "Google" in Company (gets autocomplete suggestion)
   - Optionally types "San Francisco, CA" in Location
   - Sees upload zone for CV
   - Drags/selects CV file from device
   - Sees upload progress
   - Pastes job description from clipboard
   - Taps "Start Interview →"
   - **Time: ~90 seconds**

**Total Time: ~2 minutes**

**Experience:** Clear, straightforward. Each step has purpose. Feels like building something, not filling bureaucracy.

---

### Flow 2: Returning User, Same Role

**Context:** User has done interview before, same job/company

**Steps:**

1. **Screen 1: Interview Configuration**
   - Sees prefilled selections (Voice ✓, 2 stages ✓, 7 questions)
   - Sees hints: "(Last used: Voice)", etc.
   - Happy with settings
   - Taps "Continue to Role Setup →"
   - **Time: ~5 seconds**

2. **Screen 2: Role Context**
   - Job Title prefilled: "Senior Software Engineer" (From last interview)
   - Company prefilled: "Google" (From last interview)
   - Location prefilled: "San Francisco, CA" (From last interview)
   - CV status: "✓ Using CV on file (uploaded 3d ago)"
   - Job Description empty (likely same role)
   - Sees message: "ℹ️ Interviewing for same role? Just tap Start below"
   - Taps "Start Interview →"
   - **Time: ~5 seconds**

**Total Time: ~10 seconds**

**Experience:** Feels magical. System remembers everything. Zero friction. Premium intelligence.

---

### Flow 3: Returning User, Different Role

**Context:** User has history, but interviewing for new position

**Steps:**

1. **Screen 1: Interview Configuration**
   - Sees prefilled settings from last time (Voice, 2 stages, 7 questions)
   - Decides to adjust: changes to Text mode
   - Keeps 2 stages, 7 questions
   - Taps "Continue to Role Setup →"
   - **Time: ~10 seconds**

2. **Screen 2: Role Context**
   - Job Title prefilled with last role: "Senior Software Engineer"
   - Clears it, types "Product Manager"
   - Company prefilled: "Google"
   - Clears it, types "Meta"
   - Location auto-updates to "Menlo Park, CA" (from past Meta interview in history)
   - CV status: "✓ Using CV on file (uploaded 1w ago)"
   - Pastes new job description for PM role
   - Taps "Start Interview →"
   - **Time: ~45 seconds**

**Total Time: ~55 seconds**

**Experience:** System is smart but flexible. Easy to change what needs changing, keeps what doesn't.

---

### Flow 4: User Who Abandoned Setup

**Context:** User started setup, got interrupted, returns later

**Steps:**

1. **Returns to Setup Page**
   - Sees banner at top: "📝 We saved your setup from 20m ago [Restore] [Start Fresh]"
   - Taps "Restore"
   - **Time: ~3 seconds**

2. **Screen 1: Restored**
   - All configuration selections restored exactly as left them
   - Taps "Continue to Role Setup →"
   - **Time: ~2 seconds**

3. **Screen 2: Restored**
   - All fields restored with what they typed
   - CV upload remembered (if was in progress)
   - Everything exactly as they left it
   - Taps "Start Interview →"
   - **Time: ~3 seconds**

**Total Time: ~8 seconds to resume**

**Experience:** Feels respectful of their time. System doesn't make them start over. Reduces abandonment anxiety.

---

### Flow 5: User Updates Old CV

**Context:** Returning user, CV on file is 4 months old

**Steps:**

1. **Screen 1: Configuration**
   - Keeps prefilled settings
   - Taps "Continue to Role Setup →"
   - **Time: ~3 seconds**

2. **Screen 2: Role Context**
   - Fields prefilled from last interview
   - CV status: "✓ Using CV on file (uploaded 4mo ago) [Update CV] ← Consider updating"
   - Decides to update CV
   - Taps "[Update CV]"
   - File picker opens
   - Selects new CV
   - Sees upload progress
   - New status: "✓ CV updated" (green checkmark animation)
   - Taps "Start Interview →"
   - **Time: ~30 seconds**

**Total Time: ~33 seconds**

**Experience:** System proactively suggests update (old CV). Easy to update. Feels maintained, not nagging.

---

### Flow 6: User Tries Job URL

**Context:** User has job posting URL instead of pasted text

**Steps:**

1. **Screen 1 & 2:** (Standard flow, prefilled or not)

2. **Job Description Field:**
   - Instead of pasting text, pastes URL
   - Example: `https://careers.google.com/jobs/results/12345`
   - System detects URL format
   - Shows loader: "Fetching job details..."
   - Backend scrapes job posting
   - Extracts job description text
   - If job title/company empty, suggests prefilling from scraped data
   - User reviews, taps "Start Interview →"
   - **Time saved: ~30 seconds vs. manual copy-paste**

**Experience:** Smart system does work for them. Premium convenience.

---

## Technical Architecture

### Frontend Stack

**Assumed Stack (adjust as needed):**
- React / Next.js for UI components
- TypeScript for type safety
- Tailwind CSS for styling (matches existing app)
- React Hook Form for form state management
- localStorage for draft persistence
- sessionStorage for screen-to-screen state

### Backend Endpoints

#### 1. Get User Profile (for prefilling)
```
GET /api/user/profile

Response:
{
  "userId": "user_abc123",
  "cvFile": {
    "filename": "resume.pdf",
    "uploadDate": "2024-11-03T10:30:00Z",
    "s3Key": "cvs/user_abc123/resume.pdf"
  },
  "lastInterview": {
    "jobTitle": "Senior Software Engineer",
    "company": "Google",
    "location": "San Francisco, CA",
    "jobDescription": "...",
    "mode": "voice",
    "stages": 2,
    "questionsPerStage": 7,
    "completedAt": "2024-11-03T11:45:00Z"
  },
  "interviewHistory": [
    {
      "jobTitle": "Product Manager",
      "company": "Meta",
      "location": "Menlo Park, CA",
      "completedAt": "2024-10-15T09:20:00Z"
    }
    // ... more
  ]
}
```

#### 2. Upload CV
```
POST /api/user/cv
Content-Type: multipart/form-data

Body:
- file: [CV file]

Response:
{
  "success": true,
  "cvFile": {
    "filename": "resume.pdf",
    "uploadDate": "2024-11-06T14:52:00Z",
    "s3Key": "cvs/user_abc123/resume_v3.pdf"
  }
}
```

#### 3. Start Interview (submission)
```
POST /api/interview/start

Body:
{
  "interviewConfig": {
    "mode": "voice",
    "stages": 2,
    "questionsPerStage": 7
  },
  "roleContext": {
    "jobTitle": "Senior Software Engineer",
    "company": "Google",
    "location": "San Francisco, CA",
    "cvFileKey": "cvs/user_abc123/resume.pdf",
    "jobDescription": "We are looking for..."
  },
  "userId": "user_abc123",
  "timestamp": "2024-11-06T14:52:00Z"
}

Response:
{
  "success": true,
  "interviewId": "interview_xyz789",
  "questionCount": 14,
  "estimatedDuration": 15,
  "redirectUrl": "/interview/interview_xyz789"
}
```

#### 4. Scrape Job URL (optional feature)
```
POST /api/jobs/scrape

Body:
{
  "url": "https://careers.google.com/jobs/results/12345"
}

Response:
{
  "success": true,
  "jobData": {
    "title": "Senior Software Engineer",
    "company": "Google",
    "location": "Mountain View, CA",
    "description": "We are looking for an experienced..."
  }
}
```

#### 5. Update User Profile (after successful interview)
```
PATCH /api/user/profile

Body:
{
  "lastInterview": {
    "jobTitle": "Senior Software Engineer",
    "company": "Google",
    "location": "San Francisco, CA",
    "jobDescription": "...",
    "mode": "voice",
    "stages": 2,
    "questionsPerStage": 7,
    "completedAt": "2024-11-06T15:10:00Z"
  }
}

Response:
{
  "success": true
}
```

### Frontend State Management

```typescript
// types.ts
interface InterviewConfig {
  mode: 'text' | 'voice';
  stages: 1 | 2 | 3;
  questionsPerStage: number; // 3-10
}

interface RoleContext {
  jobTitle: string;
  company: string;
  location?: string;
  cvFileKey?: string; // S3 reference
  jobDescription?: string;
}

interface UserProfile {
  userId: string;
  cvFile?: {
    filename: string;
    uploadDate: string;
    s3Key: string;
  };
  lastInterview?: {
    jobTitle: string;
    company: string;
    location?: string;
    jobDescription?: string;
    mode: 'text' | 'voice';
    stages: number;
    questionsPerStage: number;
    completedAt: string;
  };
  interviewHistory?: Array<{
    jobTitle: string;
    company: string;
    location?: string;
    completedAt: string;
  }>;
}

// hooks/useSetupFlow.ts
function useSetupFlow() {
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [context, setContext] = useState<RoleContext>({
    jobTitle: '',
    company: '',
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState<any | null>(null);

  // Load user profile on mount
  useEffect(() => {
    fetchUserProfile().then(setProfile);
    checkForDraft().then(setDraft);
  }, []);

  return {
    config,
    setConfig,
    context,
    setContext,
    profile,
    draft,
    restoreDraft,
    clearDraft
  };
}
```

### Session Flow

```typescript
// Screen 1: Configuration
function ConfigurationScreen() {
  const { profile, setConfig } = useSetupFlow();
  const [mode, setMode] = useState(profile?.lastInterview?.mode || 'text');
  const [stages, setStages] = useState(profile?.lastInterview?.stages || 1);
  const [questions, setQuestions] = useState(profile?.lastInterview?.questionsPerStage || 5);

  const handleContinue = () => {
    const config = { mode, stages, questionsPerStage: questions };
    setConfig(config);
    sessionStorage.setItem('interviewConfig', JSON.stringify(config));
    navigate('/setup/role-context');
  };

  return (
    // ... UI
  );
}

// Screen 2: Role Context
function RoleContextScreen() {
  const { profile, context, setContext } = useSetupFlow();
  const config = JSON.parse(sessionStorage.getItem('interviewConfig') || '{}');
  
  const [jobTitle, setJobTitle] = useState(profile?.lastInterview?.jobTitle || '');
  const [company, setCompany] = useState(profile?.lastInterview?.company || '');
  // ... other fields

  // Auto-save to localStorage
  useEffect(() => {
    const draft = { jobTitle, company, /* ... */ };
    debouncedSave(draft);
  }, [jobTitle, company /* ... */]);

  const handleSubmit = async () => {
    const payload = {
      interviewConfig: config,
      roleContext: {
        jobTitle,
        company,
        location,
        cvFileKey: profile?.cvFile?.s3Key,
        jobDescription
      },
      userId: profile?.userId,
      timestamp: new Date().toISOString()
    };

    const response = await startInterview(payload);
    
    // Clear draft on success
    localStorage.removeItem('interviewDraft');
    
    // Navigate to interview
    navigate(`/interview/${response.interviewId}`);
  };

  return (
    // ... UI
  );
}
```

### Draft Persistence

```typescript
// utils/draftManager.ts
const DRAFT_KEY = 'interviewDraft';
const DRAFT_EXPIRY_MINUTES = 60;

export function saveDraft(data: any) {
  const draft = {
    ...data,
    lastSaved: new Date().toISOString(),
    screenOneConfig: sessionStorage.getItem('interviewConfig')
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): { draft: any; minutesAgo: number } | null {
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) return null;

  const draft = JSON.parse(stored);
  const lastSaved = new Date(draft.lastSaved);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - lastSaved.getTime()) / 60000);

  if (minutesAgo > DRAFT_EXPIRY_MINUTES) {
    clearDraft();
    return null;
  }

  return { draft, minutesAgo };
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function restoreDraft(draft: any) {
  if (draft.screenOneConfig) {
    sessionStorage.setItem('interviewConfig', draft.screenOneConfig);
  }
  return draft;
}

// Debounced save
export const debouncedSave = debounce(saveDraft, 500);
```

---

## Design System Guidelines

### Color Palette

**From Existing App (Free Landing Page):**
- Primary Gradient: Cyan (#06b6d4) → Blue (#3b82f6)
- Background: White (#ffffff)
- Text Primary: Dark Gray (#1f2937)
- Text Secondary: Medium Gray (#6b7280)
- Text Muted: Light Gray (#9ca3af)
- Success: Green (#10b981)
- Border: Light Gray (#e5e7eb)

**Specific Applications:**

```css
/* Primary CTA Button */
.btn-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

/* Selected State (Toggle/Button) */
.selected {
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

/* Hints / Muted Text */
.hint-text {
  color: #6b7280;
  font-size: 14px;
  font-style: italic;
}

/* Success Indicator */
.success-indicator {
  color: #10b981;
}

/* Input Focus State */
input:focus, textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}
```

### Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica', 'Arial', sans-serif;
```

**Hierarchy:**

```css
/* Page Title */
h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

/* Section Label */
.section-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

/* Field Label */
label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  display: block;
}

/* Input Text */
input, textarea {
  font-size: 16px; /* Prevents iOS zoom */
  color: #1f2937;
}

/* Placeholder Text */
::placeholder {
  color: #9ca3af;
  font-style: normal;
}

/* Hint Text */
.hint {
  font-size: 14px;
  color: #6b7280;
  font-style: italic;
  margin-top: 4px;
}

/* Help Message */
.help-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}
```

### Spacing System

**Use Tailwind's spacing scale (or equivalent):**

```css
/* Vertical rhythm */
.section {
  margin-bottom: 32px; /* 8 × 4px */
}

.field-group {
  margin-bottom: 24px; /* 6 × 4px */
}

.hint {
  margin-top: 4px; /* 1 × 4px */
  margin-bottom: 0;
}

/* Horizontal spacing */
.button-group {
  gap: 12px; /* 3 × 4px */
}

/* Container padding */
.container {
  padding: 24px; /* 6 × 4px */
}
```

### Component Specifications

#### Toggle Button (Interview Mode)

```css
.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  min-width: 45%;
  padding: 12px 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-button:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.toggle-button.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.toggle-button .icon {
  margin-right: 8px;
  font-size: 20px;
}
```

#### Stage Button (1/2/3)

```css
.stage-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  min-height: 56px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stage-button:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.stage-button.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
```

#### Slider (Questions Per Stage)

```css
.slider-container {
  position: relative;
  width: 100%;
  height: 28px;
  margin: 16px 0;
}

.slider-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
}

.slider-fill {
  position: absolute;
  height: 4px;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  border-radius: 2px;
}

.slider-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: grab;
}

.slider-handle:active {
  cursor: grabbing;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.slider-value {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
```

#### Input Field

```css
.input-field {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  font-size: 16px;
  color: #1f2937;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.input-field::placeholder {
  color: #9ca3af;
}

.input-field.prefilled {
  background: rgba(59, 130, 246, 0.02);
}
```

#### Text Area

```css
.textarea-field {
  width: 100%;
  min-height: 120px;
  padding: 12px 14px;
  font-size: 16px;
  font-family: inherit;
  color: #1f2937;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  transition: all 0.2s ease;
}

.textarea-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}
```

#### CV Upload Zone

```css
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-zone:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.upload-zone.dragover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
  color: #6b7280;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
}
```

#### CV Status Display

```css
.cv-status {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
}

.cv-status-icon {
  font-size: 20px;
  color: #10b981;
  margin-right: 8px;
}

.cv-status-text {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.cv-status-button {
  padding: 4px 12px;
  font-size: 14px;
  color: #3b82f6;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  cursor: pointer;
}
```

#### Primary Button

```css
.btn-primary {
  display: block;
  width: 100%;
  min-height: 56px;
  padding: 14px 24px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
}
```

#### Help Message

```css
.help-message {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.05);
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  margin: 16px 0;
}

.help-message-icon {
  font-size: 18px;
  color: #3b82f6;
  margin-right: 8px;
  margin-top: 2px;
}

.help-message-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}
```

#### Draft Recovery Banner

```css
.draft-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  margin-bottom: 24px;
}

.draft-banner-text {
  font-size: 14px;
  color: #78350f;
  margin-right: 12px;
}

.draft-banner-buttons {
  display: flex;
  gap: 8px;
}

.draft-banner-button {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.draft-banner-button.primary {
  color: white;
  background: #f59e0b;
  border: none;
}

.draft-banner-button.secondary {
  color: #78350f;
  background: white;
  border: 1px solid #fbbf24;
}
```

### Animation Guidelines

```css
/* Smooth transitions on all interactive elements */
* {
  transition: all 0.2s ease;
}

/* Button hover lift */
@keyframes lift {
  0% { transform: translateY(0); }
  100% { transform: translateY(-2px); }
}

/* Success checkmark animation */
@keyframes checkmark {
  0% { 
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% { 
    opacity: 1;
    transform: scale(1);
  }
}

.success-check {
  animation: checkmark 0.3s ease;
}

/* Loading spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease;
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal:** Build basic two-screen flow without intelligence

**Tasks:**
1. Create Screen 1: Configuration page
   - Mode toggle (Text/Voice)
   - Stage selection (1/2/3)
   - Questions slider
   - Total calculation display
   - Continue button
2. Create Screen 2: Role context page
   - Job title input (required)
   - Company input (required)
   - Location input (optional)
   - CV upload zone
   - Job description textarea
   - Start button
3. Session state management
   - Pass config from Screen 1 to Screen 2
   - sessionStorage for config
4. Form validation
   - Required field checking
   - Error display
5. API integration
   - Submit to interview start endpoint
   - Handle response and redirect

**Deliverable:** Functional two-screen setup that works for first-time users

---

### Phase 2: CV Intelligence (Week 2)
**Goal:** Add CV storage and reuse logic

**Tasks:**
1. Backend: CV storage
   - Add cvFile to user profile model
   - Create CV upload endpoint
   - Store to S3 (or file storage)
   - Store metadata (filename, date, key)
2. Frontend: CV status detection
   - Check if user has CV on file
   - Conditional UI: show status vs. upload zone
   - Display CV age (e.g., "uploaded 3d ago")
   - [Update CV] button
3. CV upload handling
   - File picker
   - Upload progress indicator
   - Success feedback
   - Update user profile on successful upload
4. CV reference in submission
   - Pass cvFileKey instead of re-uploading
   - Backend uses stored CV for question generation

**Deliverable:** Users with CV on file don't need to re-upload

---

### Phase 3: Smart Prefilling (Week 3)
**Goal:** Remember user preferences and past data

**Tasks:**
1. Backend: Store lastInterview
   - Update user profile after successful interview
   - Store: jobTitle, company, location, description, config
2. Frontend: Load user profile on page load
   - Fetch profile data
   - Parse lastInterview and cvFile
3. Screen 1 prefilling
   - Prefill mode, stages, questions from lastInterview
   - Show "(Last used: X)" hints
   - Allow override
4. Screen 2 prefilling
   - Prefill job title, company, location
   - Show "(From last interview)" hints
   - Clear hint when user edits
5. Interview history for suggestions
   - Extract unique roles/companies from history
   - Populate datalist for autocomplete

**Deliverable:** Returning users see their last settings and can start in seconds

---

### Phase 4: Draft Auto-Save & Recovery (Week 4)
**Goal:** Don't lose user data on abandonment

**Tasks:**
1. Auto-save to localStorage
   - Save on every field change (debounced)
   - Include timestamp
   - Store Screen 1 config with Screen 2 data
2. Draft detection on load
   - Check localStorage for recent draft (<60 min)
   - Calculate time since last save
3. Draft recovery UI
   - Show banner: "We saved your setup from Xm ago"
   - [Restore] and [Start Fresh] buttons
   - Restore both screens if user chooses
4. Draft cleanup
   - Clear on successful submission
   - Clear if > 60 minutes old
   - Clear if user clicks "Start Fresh"

**Deliverable:** Users can abandon and resume setup within 60 minutes

---

### Phase 5: Mobile Polish (Week 5)
**Goal:** Perfect mobile experience

**Tasks:**
1. Input attributes
   - Add autocomplete, autocapitalize, enterkeyhint
   - Test on iOS Safari and in-app browsers
2. Touch targets
   - Ensure 44px minimum
   - Test tap accuracy
3. Keyboard behavior
   - Auto-focus next field on Enter
   - Scroll focused field into view
   - Handle keyboard appearance/disappearance
4. File upload on mobile
   - Test drag-and-drop
   - Test file picker from Photos/Files
   - Test upload from camera (if supported)
5. Auto-expanding textarea
   - Grow as user types
   - Don't let it get too large
6. Visual feedback
   - Loading states
   - Success animations
   - Error messages

**Deliverable:** Smooth, polished mobile experience

---

### Phase 6: Advanced Features (Optional - Week 6)
**Goal:** Nice-to-haves that enhance experience

**Tasks:**
1. Job URL scraping
   - Detect URL in job description field
   - Scrape job posting data
   - Suggest prefilling title/company
2. Contextual help messages
   - Different messages based on user state
   - "Same role? Just tap Start"
   - "Your CV is already uploaded"
3. Smart suggestions
   - Show past roles as quick-select buttons
   - Show past companies as quick-select buttons
4. Analytics & optimization
   - Track field completion rates
   - Track time to complete
   - A/B test different messaging

**Deliverable:** Enhanced intelligence and convenience features

---

## Success Metrics

### Primary Metrics

**1. Setup Completion Rate**
- **Current baseline:** Unknown (measure first)
- **Target:** 95%+ (since users have already paid)
- **Measure:** (Started setup / Completed setup) × 100

**2. Time to Complete Setup**
- **First-time users:** <2 minutes
- **Returning users (same role):** <15 seconds
- **Returning users (new role):** <60 seconds
- **Measure:** Timestamp(screen 1 load) to Timestamp(submit)

**3. Field Prefill Accuracy**
- **Target:** 80%+ of prefilled fields unchanged
- **Measure:** (Fields unchanged / Total prefilled fields) × 100
- **Indicates:** Smart prefilling is working correctly

**4. CV Reuse Rate**
- **Target:** 90%+ of returning users
- **Measure:** (Used CV on file / Total returning users) × 100
- **Indicates:** CV storage is valuable

**5. Draft Recovery Rate**
- **Target:** 60%+ of abandoned setups restored
- **Measure:** (Restored drafts / Total draft offers) × 100
- **Indicates:** Auto-save is preventing data loss

### Secondary Metrics

**6. Optional Field Completion**
- **Location:** Track completion rate
- **Job Description:** Track completion rate
- **Indicates:** Whether optional fields are valuable

**7. Mobile vs. Desktop Performance**
- **Compare:** Completion time by device
- **Compare:** Completion rate by device
- **Compare:** Field accuracy by device
- **Indicates:** Whether mobile experience is truly optimized

**8. Error Rate**
- **Track:** Validation errors shown
- **Track:** Failed submissions
- **Indicates:** Whether validation is too strict or unclear

**9. Configuration Preferences**
- **Track:** Most common mode (Text vs. Voice)
- **Track:** Most common stage count (1/2/3)
- **Track:** Average questions per stage
- **Indicates:** What defaults should be

**10. Interview Quality Correlation**
- **Track:** Interview satisfaction by setup completion
- **Compare:** Ratings for minimal vs. full setup
- **Indicates:** Whether optional fields actually improve experience

### How to Track

```typescript
// Analytics events to implement

// Screen 1
trackEvent('setup_screen1_loaded', {
  userId: string,
  hasLastInterview: boolean,
  prefilledConfig: InterviewConfig | null
});

trackEvent('setup_screen1_completed', {
  userId: string,
  selectedConfig: InterviewConfig,
  changedFromPrefill: boolean,
  timeSpent: number // seconds
});

// Screen 2
trackEvent('setup_screen2_loaded', {
  userId: string,
  hasCV: boolean,
  prefilledFields: string[], // ['jobTitle', 'company', ...]
  hasDraft: boolean
});

trackEvent('setup_field_changed', {
  userId: string,
  fieldName: string,
  wasPrefilled: boolean,
  valueLength: number
});

trackEvent('setup_cv_uploaded', {
  userId: string,
  isUpdate: boolean, // vs. first upload
  fileSize: number
});

trackEvent('setup_draft_restored', {
  userId: string,
  draftAge: number, // minutes
  fieldsRestored: string[]
});

trackEvent('setup_submitted', {
  userId: string,
  totalTime: number, // seconds from Screen 1 load
  fieldsCompleted: string[],
  fieldsSkipped: string[],
  usedCV: boolean,
  changedConfig: boolean
});

// Interview outcome (for correlation)
trackEvent('interview_completed', {
  interviewId: string,
  userId: string,
  satisfactionRating: number,
  setupFieldsCompleted: string[], // From setup
  setupTime: number // From setup
});
```

### Dashboard to Build

Create internal dashboard showing:
1. **Setup Funnel:**
   - Started Screen 1 → Completed Screen 1 → Started Screen 2 → Submitted
   - Drop-off points highlighted
2. **Time Distribution:**
   - Histogram of completion times
   - Broken down by user type (first-time vs. returning)
3. **Prefill Performance:**
   - % of fields prefilled correctly
   - % of fields changed after prefill
   - Most commonly changed fields
4. **CV Status:**
   - % of users with CV on file
   - Average CV age
   - CV update rate
5. **Draft Recovery:**
   - # of drafts saved per day
   - # of drafts restored vs. abandoned
   - Average draft age when restored
6. **Configuration Preferences:**
   - Mode distribution (Text vs. Voice)
   - Stage distribution (1/2/3)
   - Questions per stage distribution
7. **Quality Correlation:**
   - Scatter plot: setup completeness vs. interview satisfaction
   - Identify optimal setup level

---

## Conclusion

This redesign transforms the interview setup from a static form into an intelligent system that:

1. **Respects user time** by remembering everything
2. **Empowers users** by letting them configure first
3. **Reduces friction** through smart prefilling
4. **Prevents data loss** with auto-save
5. **Optimizes for mobile** as the primary use case
6. **Feels premium** through attention to detail

The two-screen flow creates a natural progression: configure (fun) → contextualize (easy) → start (rewarding).

For returning users, the experience goes from 2 minutes to 10 seconds. For first-timers, it goes from "bureaucratic form" to "building my interview."

This is the experience that justifies the premium price point.

---

## Appendix: Common Questions

**Q: Why not make everything one screen?**
A: Tried it. Cognitive overload. Separating configuration (fun) from context (work) creates better psychological flow.

**Q: Why prefill from last interview instead of asking "same role?"**
A: Prefilling is faster and less intrusive. Users who want same role can just hit Start. Users who want different role can quickly edit.

**Q: What if user's CV is outdated?**
A: We show age ("uploaded 3mo ago") and suggest updating if old. But we don't force it—maybe they're actively interviewing and it's current enough.

**Q: Why store job description if it's different every time?**
A: We don't prefill it, but we do use it for question generation. Some users interview for same role at multiple companies—they might paste a similar description.

**Q: What about privacy/GDPR with stored CV?**
A: Users must explicitly upload CV. It's stored securely with their account. They can delete it anytime. Include in privacy policy. Add "Delete CV" option in profile settings.

**Q: Why localStorage instead of database for drafts?**
A: Faster (no API call). Works offline. Auto-expires (60 min). Reduces server load. For persistent storage, we use user profile.

**Q: What if user has multiple devices?**
A: Profile data (CV, lastInterview) syncs across devices. Draft (localStorage) is device-specific—acceptable tradeoff for speed.

**Q: Why not voice input for fields (speech-to-text)?**
A: Considered it. Browser support is inconsistent, especially in in-app browsers (TikTok). Native inputs with good autocomplete are more reliable. Could add as Phase 6 enhancement.

**Q: How do we handle job URL scraping failures?**
A: Show error: "Couldn't load job posting. Please paste the description manually." Fallback to text input. Don't block submission.

**Q: What if OpenAI API fails during submission?**
A: Save user's setup data. Show error: "Something went wrong. We've saved your setup—try again in a moment." Let them retry without re-entering data.

---

**End of Document**

Total Length: ~20,000 words
Created: November 6, 2024
Version: 1.0
