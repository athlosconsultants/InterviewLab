# InterviewLab UI Elements Documentation

Complete inventory of all UI components, design tokens, and visual elements used throughout the application.

---

## Table of Contents

1. [Core UI Components (shadcn/ui)](#1-core-ui-components-shadcnui)
2. [Interview-Specific Components](#2-interview-specific-components)
3. [Results/Scoring Components](#3-resultsscoring-components)
4. [Form Components](#4-form-components)
5. [Landing Page Components](#5-landing-page-components)
6. [Pricing/Payment Components](#6-pricingpayment-components)
7. [Layout Components](#7-layout-components)
8. [Setup/Onboarding Components](#8-setuponboarding-components)
9. [Admin Components](#9-admin-components)
10. [Interview Mode Components](#10-interview-mode-components)
11. [Dialog/Modal Components](#11-dialogmodal-components)
12. [Utility Components](#12-utility-components)
13. [Icon Library](#13-icon-library-lucide-react)
14. [Design Tokens](#14-design-tokens)

---

## 1. Core UI Components (shadcn/ui)

### Button (`components/ui/button.tsx`)

The primary interactive element with comprehensive variant and size options.

**Variants:**

- `default` - Cyan-to-blue gradient background, primary CTAs
  - Colors: `from-cyan-500 to-blue-600`
  - Hover: `from-cyan-600 to-blue-700`
  - Shadow: `shadow-lg hover:shadow-xl`
  - Active: `active:scale-[0.98]`

- `destructive` - Red gradient, danger actions
  - Colors: `from-red-500 to-red-600`
  - Hover: `from-red-600 to-red-700`

- `outline` - Cyan border, secondary actions
  - Border: `border-2 border-cyan-500`
  - Background: `bg-white`
  - Text: `text-cyan-600`
  - Hover: `hover:bg-cyan-50`

- `secondary` - Slate background, tertiary actions
  - Background: `bg-slate-100`
  - Text: `text-slate-900`
  - Hover: `hover:bg-slate-200`

- `ghost` - Transparent, hover state only
  - Hover: `hover:bg-cyan-50 hover:text-cyan-600`

- `link` - Text link with underline
  - Text: `text-cyan-600`
  - Decoration: `underline-offset-4 hover:underline`

**Sizes:**

- `default` - 44px min-height, 24px (px-6) padding, base text
- `sm` - 40px min-height, 16px (px-4) padding, sm text
- `lg` - 52px min-height, 32px (px-8) padding, lg text
- `icon` - 44px square (h-11 w-11), icon-only buttons

**Features:**

- Rounded corners: `rounded-lg`
- Font weight: `font-semibold`
- Transition: `transition-all duration-200`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-cyan-500`
- Disabled state: `disabled:opacity-50`
- SVG icon sizing: `[&_svg]:size-4`

**Usage:**

```tsx
<Button variant="default" size="lg">Primary CTA</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

---

### Dialog (`components/ui/dialog.tsx`)

Modal dialog system built on Radix UI primitives.

**Sub-components:**

- `Dialog` - Root component, manages open/close state
- `DialogTrigger` - Button/element that opens the dialog
- `DialogPortal` - Portal for rendering outside DOM hierarchy
- `DialogOverlay` - Semi-transparent backdrop
  - Background: `bg-black/80`
  - Animations: Fade in/out
- `DialogContent` - Main modal container
  - Max width: `max-w-lg`
  - Position: `fixed left-[50%] top-[50%]`
  - Transform: `translate-x-[-50%] translate-y-[-50%]`
  - Border radius: `sm:rounded-lg`
  - Padding: `p-6`
- `DialogHeader` - Header section wrapper
  - Layout: `flex flex-col space-y-1.5`
- `DialogFooter` - Footer section wrapper
  - Layout: `flex flex-col-reverse sm:flex-row`
- `DialogTitle` - Title text (h2 semantics)
  - Font: `text-lg font-semibold`
- `DialogDescription` - Description text
  - Font: `text-sm text-muted-foreground`
- `DialogClose` - Close button with X icon
  - Position: `absolute right-4 top-4`

**Features:**

- Focus trap (keyboard navigation)
- ESC key to close
- Click outside to close
- Enter/exit animations (fade, zoom, slide)
- Accessible ARIA attributes

**Usage:**

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Input (`components/ui/input.tsx`)

Single-line text input field.

**Styling:**

- Height: `h-9`
- Padding: `px-3 py-1`
- Border: `border border-input`
- Border radius: `rounded-md`
- Background: `bg-transparent`
- Shadow: `shadow-sm`
- Font: `text-base md:text-sm`

**States:**

- Focus: `focus-visible:ring-1 focus-visible:ring-ring`
- Disabled: `disabled:cursor-not-allowed disabled:opacity-50`
- Placeholder: `placeholder:text-muted-foreground`

**File Input Styling:**

- File button: `file:border-0 file:bg-transparent file:text-sm`

**Usage:**

```tsx
<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
```

---

### Textarea (`components/ui/textarea.tsx`)

Multi-line text input field.

**Styling:**

- Min-height: `min-h-[60px]`
- Padding: `px-3 py-2`
- Border: `border border-input`
- Border radius: `rounded-md`
- Background: `bg-transparent`
- Shadow: `shadow-sm`
- Font: `text-base md:text-sm`

**States:**

- Focus: `focus-visible:ring-1 focus-visible:ring-ring`
- Disabled: `disabled:cursor-not-allowed disabled:opacity-50`
- Placeholder: `placeholder:text-muted-foreground`

**Features:**

- Resizable by default
- Auto-expanding height (if implemented with ref)

**Usage:**

```tsx
<Textarea placeholder="Type your answer here..." rows={6} />
```

---

### Label (`components/ui/label.tsx`)

Form label component with accessibility support.

**Styling:**

- Font: `text-sm font-medium`
- Line height: `leading-none`

**States:**

- Peer disabled: `peer-disabled:cursor-not-allowed peer-disabled:opacity-70`

**Usage:**

```tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

---

### Switch (`components/ui/switch.tsx`)

Toggle switch component (Radix UI).

**Styling:**

- Size: `h-5 w-9`
- Shape: `rounded-full`
- Border: `border-2 border-transparent`
- Shadow: `shadow-sm`

**States:**

- Checked: `data-[state=checked]:bg-primary`
- Unchecked: `data-[state=unchecked]:bg-input`
- Disabled: `disabled:cursor-not-allowed disabled:opacity-50`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`

**Thumb:**

- Size: `h-4 w-4`
- Shape: `rounded-full`
- Background: `bg-background`
- Shadow: `shadow-lg`
- Transition: `data-[state=checked]:translate-x-4`

**Usage:**

```tsx
<div className="flex items-center space-x-2">
  <Switch id="voice-mode" />
  <Label htmlFor="voice-mode">Enable Voice Mode</Label>
</div>
```

---

### Toaster (`components/ui/sonner.tsx`)

Toast notification system using Sonner library.

**Features:**

- Theme-aware (light/dark mode support)
- Multiple toast stacking
- Auto-dismiss with timer
- Action buttons
- Cancel buttons
- Custom styling per toast type

**Toast Types:**

- Success
- Error
- Info
- Warning
- Loading
- Promise (async operations)

**Styling:**

- Background: `bg-background`
- Text: `text-foreground`
- Border: `border-border`
- Shadow: `shadow-lg`
- Description: `text-muted-foreground`

**Usage:**

```tsx
import { toast } from 'sonner';

toast.success('Success!', {
  description: 'Your changes have been saved.',
});

toast.error('Error', {
  description: 'Something went wrong.',
});

toast.loading('Processing...');
```

---

## 2. Interview-Specific Components

### VoiceOrb (`components/interview/VoiceOrb.tsx`)

Animated visual indicator for voice interview states.

**States:**

- `idle` - Gray gradient, no animation, static
  - Colors: `from-primary/20 to-primary/40`
  - Scale: `scale-100`

- `ready` - Same as idle, awaiting user input
  - Colors: `from-primary/20 to-primary/40`
  - Scale: `scale-100`

- `speaking` - Cyan gradient, pulsing rings, AI is speaking
  - Colors: `from-primary to-primary/60`
  - Scale: `scale-105`
  - Animation: Ping rings + pulse effect
  - Glow: `bg-primary/10` outer ring

- `listening` - Blue gradient, larger scale, user is speaking
  - Colors: `from-blue-500 to-blue-600`
  - Scale: `scale-110`
  - Animation: Ping rings + pulse effect
  - Glow: `bg-blue-500/10` outer ring

- `thinking` - Muted gray, slow pulse, AI processing
  - Colors: `from-gray-400 to-gray-500`
  - Animation: `animate-pulse-slow`

**Sizes:**

- `sm` - 96px (w-24 h-24)
- `md` - 128px (w-32 h-32)
- `lg` - 192px (w-48 h-48)

**Visual Features:**

- Inner glow: `bg-gradient-radial from-white/20`
- Outer rings (speaking/listening only):
  - 1.5x size with ping animation
  - 1.8x size with pulse animation
- Pulse effect: Scales from 1.0 to 1.2 with fading opacity
- Shadow: `shadow-2xl`
- Transition: `transition-all duration-300`

**State Text:**

- Positioned below orb
- Font: `text-sm font-medium text-muted-foreground`
- Messages: "Ready", "Speaking...", "Listening...", "Thinking..."

**Usage:**

```tsx
<VoiceOrb state="listening" size="lg" />
<VoiceOrb state="speaking" size="md" />
<VoiceOrb state="thinking" size="sm" />
```

---

### TimerRing (`components/interview/TimerRing.tsx`)

Circular countdown timer with color-coded progress.

**Display:**

- Size: 64×64px (h-16 w-16)
- SVG circle with radius 28
- Clock icon in center (Lucide)
- Time display: MM:SS format

**Colors:**

- **Green** (>50% remaining): `text-green-600` / `stroke-green-600`
- **Yellow** (25-50% remaining): `text-yellow-600` / `stroke-yellow-600`
- **Red** (<25% remaining): `text-red-600` / `stroke-red-600`

**Animation:**

- Progress circle: `transition-all duration-1000`
- Stroke dasharray animates circumference
- Smooth countdown

**Features:**

- Calculates elapsed time from start timestamp
- Updates every second
- Auto-fires callback on expiry
- Background circle (muted color)
- Progress circle (color-coded)

**Usage:**

```tsx
<TimerRing
  timeLimit={90}
  startTime="2024-11-01T12:00:00Z"
  onExpire={() => console.log('Time expired!')}
/>
```

---

### AudioRecorder (`components/interview/AudioRecorder.tsx`)

Full-featured audio recording component with playback.

**Recording States:**

- Not recording (initial)
- Recording (active)
- Paused
- Playback ready (completed)

**Controls:**

- **Record** - Start recording (Mic icon)
- **Pause** - Pause active recording (Pause icon)
- **Resume** - Resume paused recording (Play icon)
- **Stop** - Finish recording (Square icon)
- **Play/Pause** - Preview recorded audio
- **Re-record** - Discard and start over

**Visual Elements:**

- Recording indicator: Red pulsing dot (`bg-red-500 animate-pulse`)
- Timer display: `MM:SS` format in monospace font
- Waveform (if implemented)
- File info display: Filename, file size in KB

**Features:**

- Multiple MIME type support:
  - `audio/webm;codecs=opus` (preferred)
  - `audio/webm`
  - `audio/ogg;codecs=opus`
  - `audio/mp4`
  - `audio/mpeg`
- Browser compatibility detection
- Microphone permission handling
- Audio preview before submission
- Blob URL management
- Stream cleanup on unmount
- Toast notifications for all states

**Layout:**

```
┌─────────────────────────────┐
│ [🎤 Record]                 │  (Not recording)
└─────────────────────────────┘

┌─────────────────────────────┐
│ [⏸ Pause] [⏹ Stop] 🔴 0:23 │  (Recording)
└─────────────────────────────┘

┌─────────────────────────────┐
│ [▶ Play] 0:23 [Re-record]   │  (Playback ready)
│ Recording ready. Submit...   │
└─────────────────────────────┘
```

**Usage:**

```tsx
<AudioRecorder
  onRecordingComplete={(blob) => {
    // Handle audio blob
    console.log('Audio recorded:', blob);
  }}
  disabled={false}
/>
```

---

### QuestionBubble (`components/interview/QuestionBubble.tsx`)

Interview question display with Text-to-Speech playback.

**Visual Structure:**

```
┌──────────────────────────────────────┐
│ ┌────┐                               │
│ │ Q1 │  Question text appears here   │
│ └────┘                                │
│                            [🔊 Play]  │
└──────────────────────────────────────┘
```

**Elements:**

- **Question Badge**: Colored circle with question number (Q1, Q2, etc.)
  - Background: `bg-primary/10`
  - Text: `text-primary font-semibold`
  - Size: `w-10 h-10`

- **Question Text**: Interview question content
  - Font: `text-base`
  - Color: `text-foreground`
  - Line height: `leading-relaxed`

- **Audio Button**: TTS playback control
  - Icon states: Volume2 (default), Play (ready), Pause (playing)
  - Loading: Loader2 with spin animation
  - Size: Button `size="sm" variant="ghost"`

**States:**

- **Loading TTS**: Spinner icon, button disabled
- **Ready to play**: Volume2 icon, clickable
- **Playing**: Pause icon, clickable to pause
- **Cached**: Instant playback, no loading

**Features:**

- Cartesia.ai TTS integration
- Audio caching (stored URL)
- Error handling with toast notifications
- Play/pause toggle
- Auto-stops on audio end
- Session-scoped caching

**Usage:**

```tsx
<QuestionBubble
  question={{
    text: 'Tell me about a time you failed.',
    type: 'behavioral',
  }}
  questionNumber={1}
  turnId="turn-123"
/>
```

---

### ReplayButton (`components/interview/ReplayButton.tsx`)

Replay/retry button with usage counter.

**Visual:**

```
┌─────────────────────┐
│ 🔄 Replay (1/2)     │
└─────────────────────┘
```

**Elements:**

- Replay icon (circular arrow)
- Count display: "X/Y" format
- Button variant: `outline` or `secondary`

**States:**

- **Available**: Normal button state, clickable
- **Limited**: Shows remaining replays (e.g., "1/2")
- **Exhausted**: Disabled state when cap reached

**Usage:**

```tsx
<ReplayButton
  replayCount={1}
  replayCap={2}
  onReplay={() => {
    // Handle replay action
  }}
  disabled={false}
/>
```

---

## 3. Results/Scoring Components

### ScoreDial (`components/results/ScoreDial.tsx`)

Circular score display with letter grade.

**Visual Structure:**

```
    ┌─────────┐
    │    85   │  ← SVG circular progress
    │   /100  │  ← Score display
    └─────────┘
        A       ← Letter grade
```

**Sizes:**

- `sm` - 96px (h-24 w-24), text-2xl
- `md` - 128px (h-32 w-32), text-3xl
- `lg` - 160px (h-40 w-40), text-4xl

**Grade Colors:**
| Grade | Color | Hex |
|-------|-------|-----|
| A | Green | `#22c55e` |
| B | Blue | `#3b82f6` |
| C | Yellow | `#eab308` |
| D | Orange | `#f97316` |
| F | Red | `#ef4444` |

**SVG Details:**

- Stroke width: 8px
- Background circle: Muted gray
- Progress circle: Animated with `transition-all duration-1000`
- Stroke linecap: `round` (rounded ends)
- Rotation: `-90deg` (starts from top)

**Features:**

- Animated progress on mount
- Score number rounded to integer
- Letter grade with color-coded styling
- "/100" suffix in smaller text

**Usage:**

```tsx
<ScoreDial score={85} grade="A" size="lg" />
<ScoreDial score={72} grade="B" size="md" />
<ScoreDial score={45} grade="F" size="sm" />
```

---

### CategoryBars (`components/results/CategoryBars.tsx`)

Horizontal progress bars for skill dimension scores.

**Categories:**

1. **Technical Competency** - Domain knowledge, technical skills
2. **Communication** - Clarity, structure, articulation
3. **Problem Solving** - Analytical thinking, approach
4. **Cultural Fit** - Values alignment, team compatibility

**Visual Structure (per category):**

```
Technical Competency              85/100
[████████████████████░░░░░░░░░░░]
Demonstrated strong understanding of...
```

**Color Coding:**
| Score Range | Color | Class |
|-------------|-------|-------|
| ≥ 80 | Green | `bg-green-500` |
| 70-79 | Blue | `bg-blue-500` |
| 60-69 | Yellow | `bg-yellow-500` |
| 50-59 | Orange | `bg-orange-500` |
| < 50 | Red | `bg-red-500` |

**Elements:**

- **Label**: Category name, `font-medium`
- **Score**: "X/100" display, `text-sm font-semibold`
- **Progress Bar**:
  - Container: `h-3 w-full rounded-full bg-muted`
  - Fill: Color-coded, animated width
  - Animation: `transition-all duration-1000 ease-out`
- **Feedback Text**: Detailed explanation, `text-sm text-muted-foreground`

**Usage:**

```tsx
<CategoryBars
  dimensions={{
    technical_competency: {
      score: 85,
      feedback: 'Strong technical understanding...',
    },
    communication: {
      score: 72,
      feedback: 'Clear communication with minor...',
    },
    problem_solving: {
      score: 78,
      feedback: 'Solid analytical approach...',
    },
    cultural_fit: {
      score: 90,
      feedback: 'Excellent alignment with values...',
    },
  }}
/>
```

---

### CategoryBarsPartial (`components/results/CategoryBarsPartial.tsx`)

Limited version for free tier users - shows only one unlocked category.

**Features:**

- **Communication** category: Fully visible and interactive
- **Other 3 categories**:
  - Blurred: `blur-sm` filter
  - Lock icon overlay
  - Grayscale effect
  - "Unlock with Premium" text

**Upsell Elements:**

- Lock icon (Lucide `Lock`)
- "Upgrade to see all scores" message
- CTA button to pricing page

**Usage:**

```tsx
<CategoryBarsPartial
  dimensions={
    {
      // Same structure as CategoryBars
    }
  }
  planTier="free"
/>
```

---

## 4. Form Components

### FileDrop (`components/forms/FileDrop.tsx`)

Drag-and-drop file upload component with validation.

**States:**

- **Empty**: Drop zone displayed
- **Dragging**: Highlighted border and background
- **File Selected**: Preview with remove option

**Visual Structure (Empty):**

```
┌──────────────────────────────────┐
│            ⬆                     │
│     Drop your file here          │
│      or click to browse          │
│                                  │
│   PDF, PNG, JPG, DOCX (max 10MB)│
└──────────────────────────────────┘
```

**Visual Structure (File Selected):**

```
┌──────────────────────────────────┐
│ 📄  resume.pdf        [✕ Remove] │
│     125.3 KB                     │
└──────────────────────────────────┘
```

**Styling:**

- **Empty state**:
  - Border: `border-2 border-dashed`
  - Default: `border-muted-foreground/25`
  - Hover: `border-primary/50`
  - Dragging: `border-primary bg-primary/5`
  - Padding: `p-8`
  - Cursor: `cursor-pointer`

- **Upload icon**: 40px (h-10 w-10), muted color

- **File preview**:
  - Border: `border rounded-lg`
  - Padding: `p-4`
  - Icon background: `bg-primary/10 p-2 rounded-md`
  - Remove button: `Button variant="ghost" size="sm"`

**Validation:**

- **File types**: Checks MIME type and extension
  - Default: PDF, PNG, JPG, JPEG, DOCX, DOC
  - Customizable via props
- **File size**: Max 10MB by default (customizable)
- **Error messages**: Toast notifications with specific error

**Features:**

- Drag-and-drop zone
- Click to browse (hidden file input)
- File type validation
- File size validation
- Success/error toast notifications
- File preview with size display
- Remove file functionality
- Accepted types display in UI

**Props:**

```tsx
interface FileDropProps {
  onFileSelect: (file: File | null) => void;
  acceptedTypes?: string[];
  acceptedExtensions?: string[];
  maxSizeMB?: number;
  label?: string;
  currentFile?: File | null;
}
```

**Usage:**

```tsx
<FileDrop
  onFileSelect={(file) => setResume(file)}
  label="Upload your CV"
  acceptedTypes={['application/pdf', 'image/png']}
  acceptedExtensions={['.pdf', '.png']}
  maxSizeMB={5}
  currentFile={resumeFile}
/>
```

---

### FileDropMultiple (`components/forms/FileDropMultiple.tsx`)

Multi-file version of FileDrop component.

**Features:**

- Multiple file selection
- File list display
- Individual file removal
- Same validation as FileDrop
- Total size calculation

**Visual Structure:**

```
┌──────────────────────────────────┐
│            ⬆                     │
│     Drop files here              │
│      or click to browse          │
│                                  │
│   3 files selected (2.4 MB total)│
└──────────────────────────────────┘

Files:
📄 document1.pdf (500 KB) [✕]
📄 document2.pdf (1.2 MB) [✕]
🖼️ image.png (700 KB) [✕]
```

**Usage:**

```tsx
<FileDropMultiple
  onFilesSelect={(files) => setDocuments(files)}
  maxFiles={5}
  maxSizeMB={10}
/>
```

---

### IntakeForm (`components/forms/IntakeForm.tsx`)

Multi-step interview setup form with all configuration options.

**Form Fields:**

**Step 1: Basic Information**

- **Job Title**: Text input, required
- **Company**: Text input, required
- **Location**: Text input, optional (default: "Remote")

**Step 2: Documents**

- **CV Upload**: FileDrop component
  - Accepted: PDF, images, DOCX
  - Max size: 10MB
- **Job Description**: Textarea OR FileDrop
  - Toggle between paste/upload
  - Character limit display

**Step 3: Interview Settings**

- **Mode Selection**: Radio buttons
  - Voice mode (Mic icon)
  - Text mode (Type icon)
  - Includes feature descriptions
- **Stages**: Number selector (1-3 stages)
  - Dropdown or button group
- **Questions per Stage**: Number selector (3-8 questions)
  - Slider or dropdown

**Step 4: Plan Selection** (Premium users only)

- **Plan Tier**: Radio cards
  - Free (3 questions, text only)
  - Paid (unlimited, voice + text)
  - Visual comparison table

**Features:**

- Multi-step progress indicator
- Form validation per step
- Data persistence (sessionStorage)
- Error handling with inline messages
- Loading states during submission
- Cloudflare Turnstile integration
- Back/Next navigation
- Submit button (final step)

**Visual Progress:**

```
(1)━━━(2)━━━(3)━━━(4)
 ●      ○      ○      ○
Info  Docs Settings Plan
```

**Usage:**

```tsx
<IntakeForm
  onSubmit={async (data) => {
    // Create session with form data
  }}
  initialData={savedData}
/>
```

---

## 5. Landing Page Components

### QuickTryWidget (`components/landing/QuickTryWidget.tsx`)

Interactive preview question widget for landing page.

**Visual Structure:**

```
┌─────────────────────────────────────┐
│ Select Your Role                    │
│ [Dropdown: Choose a role...      ▼]│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Tell me about a time you...    ││
│ └─────────────────────────────────┘│
│                                     │
│ Your Answer                         │
│ ┌─────────────────────────────────┐│
│ │ Type your answer here...        ││
│ │                                 ││
│ │                                 ││
│ └─────────────────────────────────┘│
│ 156 / 200 characters                │
│                                     │
│ [Get Instant Feedback]              │
└─────────────────────────────────────┘
```

**Roles:**

1. Software Engineer
2. Product Manager
3. Data Scientist
4. Designer
5. Marketing Manager
6. Consultant

**Elements:**

**Role Dropdown:**

- Styling: `rounded-lg border-2 border-slate-300`
- Focus: `ring-2 ring-cyan-500`
- Min-height: 44px (mobile touch target)
- Font: `text-base`

**Question Display:**

- Background: `bg-gradient-to-br from-cyan-50 to-blue-50`
- Border: `border-2 border-cyan-200`
- Padding: `p-5`
- Border radius: `rounded-xl`
- Font: `text-sm font-semibold`
- Animation: `animate-in fade-in slide-in-from-top-2`

**Answer Input:**

- Textarea: 6 rows minimum
- Border: `border-2 border-slate-300`
- Focus: `ring-2 ring-cyan-500`
- Character counter: `text-xs`
  - Valid (≥200 chars): `text-cyan-600 font-semibold`
  - Invalid (<200 chars): `text-slate-500`
  - Remaining: `text-blue-600 font-medium`

**Feedback Display:**

- Card per feedback point
- Background: `bg-gradient-to-br from-cyan-50/50 to-blue-50/50`
- Border: `border-2 border-cyan-200`
- Icons:
  - ✅ Positive feedback (green)
  - ❌ Negative feedback (red)
  - 💡 Suggestion (yellow)
- Staggered animations: `animation-delay`

**Submit Button:**

- Full width
- Disabled when <200 characters
- Text: "Get Instant Feedback"

**CTA (After Feedback):**

- Full width button
- Text: "Get Your Full 3-Question Assessment →"
- Link to: `/assessment/setup?source=quicktry`
- Animation: `animate-in fade-in zoom-in-95`

**Container Styling:**

- Background: `bg-white/97 md:bg-white/92` (mobile/desktop)
- Backdrop blur: `backdrop-blur-[10px] md:backdrop-blur-[12px]`
- Border: `border-2 border-slate-200`
- Border radius: `rounded-2xl`
- Shadow: `shadow-xl md:shadow-2xl`
- Padding: `p-4 sm:p-6`
- Max width: `max-w-2xl`

**Features:**

- Dynamic question fetching from API
- Client-side instant feedback (heuristic)
- Character count validation (200 min)
- Analytics tracking:
  - Widget load
  - Role selection
  - Answer typed
  - Submit clicked
  - Feedback shown
  - CTA clicked
- SessionStorage persistence
- Loading states
- Error handling with fallback questions

**Usage:**

```tsx
<QuickTryWidget />
```

---

## 6. Pricing/Payment Components

### PricingSuperCard (`components/PricingSuperCard.tsx`)

Comprehensive pricing display and purchase flow.

**Plans:**

| Plan                | Duration | Price (AUD) | Daily Cost |
| ------------------- | -------- | ----------- | ---------- |
| Weekend Warrior     | 48 hours | $24.95      | $12.48     |
| 7-Day Deep Practice | 7 days   | $39.95      | $5.71      |
| 30-Day Pro          | 30 days  | $79.95      | $2.67      |
| Lifetime Access     | Forever  | $149.95     | One-time   |

**Visual Structure (Mobile):**

```
┌─────────────────────────────────┐
│ MOST POPULAR                    │
│ The Weekend Warrior             │
│ Cram before your interview      │
│                                 │
│ A$24.95                         │
│ A$12.48/day - less than lunch   │
│                                 │
│ ✓ 48-hour access                │
│ ✓ Unlimited questions           │
│ ✓ Voice + text modes            │
│ ...                             │
│                                 │
│ [Get Weekend Warrior →]         │
└─────────────────────────────────┘
```

**Visual Structure (Desktop):**

```
┌─────────┬─────────┬─────────┬─────────┐
│  48h    │   7d    │   30d   │ Lifetime│
│ (card)  │ (card)  │ (card)  │ (card)  │
└─────────┴─────────┴─────────┴─────────┘

Every Plan Includes:
✓ Bullet point 1
✓ Bullet point 2
...
```

**Elements:**

**Plan Cards:**

- Border: `border-2`
  - Selected: `border-cyan-500`
  - Default: `border-slate-200`
- Background: `bg-white`
- Hover: `hover:border-cyan-400 hover:shadow-lg`
- Padding: `p-6`
- Border radius: `rounded-2xl`

**"MOST POPULAR" Badge:**

- Position: `absolute -top-3`
- Background: `bg-gradient-to-r from-cyan-500 to-blue-600`
- Text: `text-white text-xs font-bold`
- Padding: `px-4 py-1`
- Border radius: `rounded-full`

**Title & Subtitle:**

- Title: `text-2xl font-bold`
- Subtitle: `text-sm text-slate-600`
- Spacing: `mb-4`

**Pricing:**

- Main price: `text-4xl font-bold text-slate-900`
- Daily cost: `text-sm text-slate-600`
- Value anchor: "less than two coffees", "less than lunch"

**Feature List:**

- Checkmark icon: `CheckCircle2` (Lucide), cyan-500
- Text: `text-sm text-slate-700`
- Spacing: `space-y-3`

**CTA Buttons:**

- Mobile: Full width, `size="lg"`
- Desktop: Full width within card, `size="default"`
- Loading state: `Loader2` spinner with "Processing..."
- Text: Plan-specific (e.g., "Get Weekend Warrior →")

**Testimonial Section:**

```
┌─────────────────────────────────┐
│ "I went from nervous to confident│
│  in 48 hours..."                │
│                                 │
│ — Marcus T., SWE at Atlassian   │
│   Hired after 2 days of practice│
└─────────────────────────────────┘
```

**FAQ/Objection Handling:**

- Accordion or static Q&A cards
- Questions:
  - "What if I don't get hired?"
  - "Why not practice with a friend?"
  - "Is this interview prep worth it?"
  - "How is this different from generic tips?"
- Direct, honest answers

**Usage Stats:**

- "2,847 people practiced this week"
- "Avg score improvement: +23 points"
- Positioned above plans

**Legal:**

- Link to Terms & Conditions
- Small print: `text-xs text-muted-foreground`

**Features:**

- Stripe checkout integration
- Loading states during payment
- Error handling with toasts
- Plan selection (desktop: radio-style cards)
- Automatic pass activation
- Mobile/desktop responsive layouts
- Analytics tracking for purchases

**Usage:**

```tsx
<PricingSuperCard />
```

---

### EntitlementBadge (`components/EntitlementBadge.tsx`)

Display user's active time-based pass.

**Visual Styles by Tier:**

| Tier     | Color  | Background                      |
| -------- | ------ | ------------------------------- |
| 48h      | Blue   | `bg-blue-100 text-blue-700`     |
| 7d       | Cyan   | `bg-cyan-100 text-cyan-700`     |
| 30d      | Purple | `bg-purple-100 text-purple-700` |
| Lifetime | Gold   | `bg-yellow-100 text-yellow-700` |

**Display Format:**

```
┌─────────────────┐
│ 🎟️ 48h Pass    │
│ Expires in 23h  │
└─────────────────┘
```

**Elements:**

- Icon: Ticket emoji or similar
- Tier label: "48h Pass", "7-Day Access", "30-Day Pro", "Lifetime"
- Expiry: Countdown format
  - Hours remaining: "Expires in Xh"
  - Days remaining: "X days left"
  - Lifetime: "Never expires"
- Font: `text-xs sm:text-sm font-semibold`
- Padding: `px-3 py-1.5`
- Border radius: `rounded-full`

**Features:**

- Real-time countdown (updates every minute)
- Color-coded by tier
- Compact size for header display
- Responsive text sizing

**Usage:**

```tsx
<EntitlementBadge tier="48h" expiresAt="2024-11-03T12:00:00Z" />
```

---

## 7. Layout Components

### Header (`components/header.tsx`)

Main navigation header with authentication state.

**Structure:**

```
┌─────────────────────────────────────────┐
│ [Logo] Home Pricing Report [Sign In]   │
└─────────────────────────────────────────┘
```

**Desktop Layout:**

- Container: `max-w-7xl mx-auto px-4`
- Height: `h-16`
- Border bottom: `border-b`
- Sticky: `sticky top-0 z-50 bg-white`

**Mobile Layout:**

- Hamburger menu icon
- Slide-out drawer or dropdown
- Full-width CTAs

**Elements:**

**Logo:**

- Image or SVG
- Link to homepage
- Size: 32-40px height
- Padding: `py-2`

**Navigation Links:**

- Font: `text-sm font-medium`
- Hover: `hover:text-primary`
- Active: `text-primary font-semibold`
- Links:
  - Home (/)
  - Pricing (/pricing)
  - Reports (/report)
  - Admin (/admin/analytics) - if authenticated admin

**Auth Buttons:**

- **Signed Out**:
  - "Sign In" button (`variant="ghost"`)
- **Signed In**:
  - User email or name display
  - EntitlementBadge (if active pass)
  - "Sign Out" button (`variant="ghost"`)

**Features:**

- Responsive mobile menu
- Active route highlighting
- Authentication state detection
- Entitlement display
- Smooth transitions

**Usage:**

- Automatically included in root layout
- No manual import needed in pages

---

### Footer (`components/Footer.tsx`)

Site footer with links and legal information.

**Structure:**

```
┌─────────────────────────────────────────┐
│        InterviewLab                     │
│                                         │
│ Privacy | Terms | Pricing              │
│                                         │
│ © 2024 InterviewLab. All rights reserved│
└─────────────────────────────────────────┘
```

**Elements:**

**Company Name:**

- Font: `text-lg font-bold`
- Color: `text-foreground`

**Links:**

- Font: `text-sm`
- Color: `text-muted-foreground`
- Hover: `hover:text-foreground`
- Separator: `|` or `•`
- Links:
  - Privacy Policy (/privacy)
  - Terms of Service (/terms)
  - Pricing (/pricing)

**Copyright:**

- Font: `text-xs text-muted-foreground`
- Year: Dynamic (current year)

**Styling:**

- Background: `bg-slate-50`
- Padding: `py-8 px-4`
- Border top: `border-t`
- Text align: `text-center`

**Usage:**

- Automatically included in root layout
- No manual import needed in pages

---

### MobileCTA (`components/marketing/MobileCTA.tsx`)

Sticky CTA button for mobile conversion.

**Structure:**

```
┌─────────────────────────────────────────┐
│                                         │
│ [Full Width CTA Button]                │
└─────────────────────────────────────────┘
```

**Positioning:**

- Position: `fixed bottom-0 left-0 right-0`
- Z-index: `z-50`
- Background: `bg-white`
- Shadow: `shadow-lg`
- Border top: `border-t`

**Button:**

- Full width
- Size: `lg` (52px min-height)
- Variant: `default` (gradient)
- Padding: `p-4` (container)
- Icon: Arrow right
- Safe area padding (iOS notch)

**Features:**

- Scroll-aware visibility
  - Hidden on scroll down
  - Shown on scroll up
  - Always shown at top/bottom of page
- Smooth slide animation
- Haptic feedback (mobile)
- Large touch target

**Text Variants:**

- "Start Free Assessment"
- "See Pricing"
- "Get Started"
- Dynamic based on page

**Usage:**

```tsx
<MobileCTA
  href="/assessment/setup"
  text="Start Free Assessment"
  icon={<ArrowRight />}
/>
```

---

## 8. Setup/Onboarding Components

### ProgressSteps (`components/setup/ProgressSteps.tsx`)

Multi-step progress indicator for forms.

**Visual (4 steps):**

```
  (1)━━━━(2)━━━━(3)━━━━(4)
   ●      ○      ○      ○
  Info   Docs  Settings Plan
```

**States:**

- **Completed**: Filled circle, cyan color, connected line
- **Active**: Filled circle, cyan color, pulsing animation
- **Upcoming**: Empty circle, gray color

**Styling:**

**Step Circle:**

- Size: `w-8 h-8` (mobile), `w-10 h-10` (desktop)
- Border: `border-2`
- Font: `text-sm font-bold`
- Completed/Active: `bg-cyan-500 border-cyan-500 text-white`
- Upcoming: `bg-white border-slate-300 text-slate-400`

**Connecting Line:**

- Height: `h-0.5`
- Completed: `bg-cyan-500`
- Upcoming: `bg-slate-300`
- Flex: `flex-1`

**Step Label:**

- Font: `text-xs sm:text-sm`
- Active: `text-cyan-600 font-semibold`
- Inactive: `text-slate-500`
- Position: Below circle

**Responsive:**

- Mobile: Smaller circles, shorter labels
- Desktop: Larger circles, full labels
- Touch-friendly spacing (min 44px)

**Usage:**

```tsx
<ProgressSteps
  steps={[
    { label: 'Info', status: 'completed' },
    { label: 'Documents', status: 'active' },
    { label: 'Settings', status: 'upcoming' },
    { label: 'Plan', status: 'upcoming' },
  ]}
  currentStep={2}
/>
```

---

### ReadyScreen (`components/setup/ReadyScreen.tsx`)

Pre-interview confirmation screen.

**Visual:**

```
┌─────────────────────────────────────┐
│         You're Ready!               │
│                                     │
│ 📋 Job: Senior Software Engineer    │
│ 🏢 Company: Google                  │
│ 📍 Location: Sydney                 │
│ 🎙️ Mode: Voice Interview           │
│ 📊 Questions: 24 (3 stages)         │
│                                     │
│ [← Go Back]  [Start Interview →]   │
└─────────────────────────────────────┘
```

**Elements:**

**Header:**

- Title: "You're Ready!"
- Icon: Checkmark or celebration emoji
- Font: `text-3xl font-bold`

**Summary Cards:**

- Icon + Label + Value format
- Icons: Lucide icons (Briefcase, Building, MapPin, Mic/Type)
- Background: `bg-slate-50`
- Border: `border border-slate-200`
- Border radius: `rounded-lg`
- Padding: `p-4`
- Grid layout: 2 columns mobile, 3-4 desktop

**Buttons:**

- Go Back: `variant="outline"`
- Start Interview: `variant="default" size="lg"`
- Layout: Flex row, space between
- Mobile: Stack vertically

**Features:**

- Session data preview
- Edit capability (back button)
- Loading state on start
- Error handling
- Analytics tracking

**Usage:**

```tsx
<ReadyScreen
  sessionData={{
    jobTitle: 'Senior Software Engineer',
    company: 'Google',
    location: 'Sydney',
    mode: 'voice',
    stagesPlanned: 3,
    questionsPerStage: 8,
  }}
  onStart={() => router.push(`/interview/${sessionId}`)}
  onBack={() => router.back()}
/>
```

---

### SetupFlow (`components/setup/SetupFlow.tsx`)

Complete multi-step interview setup wizard.

**Features:**

- Wraps IntakeForm with additional logic
- Progress tracking (ProgressSteps component)
- Step validation before proceeding
- Data persistence between steps
- Back/Next navigation
- Submit handling
- Error states with recovery
- Loading overlays

**Flow:**

1. Step 1: Basic Info → validate → next
2. Step 2: Documents → validate → next
3. Step 3: Settings → validate → next
4. Step 4: Plan → validate → submit
5. Loading: PreparingOverlay
6. Success: Redirect to ReadyScreen

**State Management:**

- useState for current step
- useState for form data
- sessionStorage for persistence
- Context API (optional)

**Usage:**

```tsx
<SetupFlow
  onComplete={(sessionId) => {
    router.push(`/interview/${sessionId}`);
  }}
/>
```

---

### PreparingOverlay (`components/assessment/PreparingOverlay.tsx`)

Full-screen loading animation during session creation.

**Visual:**

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         [Animated Spinner]          │
│                                     │
│      Preparing Your Interview       │
│                                     │
│      [Progress Bar 45%]             │
│                                     │
│    Researching company culture...   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**

**Overlay:**

- Position: `fixed inset-0`
- Background: `bg-white/95 backdrop-blur-sm`
- Z-index: `z-50`

**Spinner:**

- Size: `w-16 h-16`
- Style: Circular spinner (Loader2 icon)
- Color: Cyan gradient
- Animation: `animate-spin`

**Title:**

- Font: `text-2xl font-bold`
- Text: "Preparing Your Interview"
- Color: `text-foreground`

**Progress Bar:**

- Width: `w-64`
- Height: `h-2`
- Background: `bg-slate-200`
- Fill: `bg-gradient-to-r from-cyan-500 to-blue-600`
- Border radius: `rounded-full`
- Animation: Smooth width transition

**Status Text:**

- Font: `text-sm text-muted-foreground`
- Rotating messages:
  - "Analyzing your CV..."
  - "Researching company culture..."
  - "Generating personalized questions..."
  - "Calibrating difficulty..."
  - "Almost ready..."

**Features:**

- Configurable duration
- Auto-dismiss on timeout
- Progress percentage
- Status message rotation (every 2-3s)
- Prevents interaction (overlay)
- Smooth fade-in/fade-out

**Usage:**

```tsx
<PreparingOverlay
  duration={5000}
  onComplete={() => {
    // Redirect or callback
  }}
/>
```

---

## 9. Admin Components

### AdminAuthGuard (`components/admin/AdminAuthGuard.tsx`)

Authentication wall for admin routes.

**Visual (Login Form):**

```
┌─────────────────────────────────────┐
│         Admin Access                │
│                                     │
│ Username                            │
│ [_____________________________]     │
│                                     │
│ Password                            │
│ [_____________________________]     │
│                                     │
│         [Login]                     │
│                                     │
│ Error: Invalid credentials          │
└─────────────────────────────────────┘
```

**Visual (Authenticated):**

```
┌─────────────────────────────────────┐
│ Admin: admin@example.com  [Logout]  │
│                                     │
│ [Child Components Rendered]         │
└─────────────────────────────────────┘
```

**Elements:**

**Login Form:**

- Title: `text-2xl font-bold`
- Username input: `Input type="text"`
- Password input: `Input type="password"`
- Login button: `Button variant="default"`
- Error message: `text-sm text-red-600`
- Layout: Centered card, max-width `max-w-md`

**Authenticated Header:**

- Display: Admin identifier
- Logout button: `Button variant="ghost" size="sm"`
- Position: Top-right corner

**Features:**

- Session management (sessionStorage)
- Server-side credential verification (/api/admin/verify)
- Basic auth headers
- Auto-logout on session expiry
- Error handling with messages
- Protected route wrapping
- Redirect to login if unauthorized

**Environment Variables:**

```bash
ADMIN_USERNAME=admin_user
ADMIN_PASSWORD=secure_password_here
```

**Usage:**

```tsx
// In admin layout or page
<AdminAuthGuard>
  <AdminContent />
</AdminAuthGuard>
```

---

## 10. Interview Mode Components

### VoiceUI (`components/interview/mode/VoiceUI.tsx`)

Voice interview interface (desktop).

**Layout:**

```
┌─────────────────────────────────────┐
│            [VoiceOrb]               │
│            Speaking...              │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Q1: Tell me about a time...    ││
│ │                      [🔊 Play] ││
│ └─────────────────────────────────┘│
│                                     │
│     [🔴 Record Answer]              │
│                                     │
│   [🔄 Replay (1/2)]  [Timer: 1:30] │
└─────────────────────────────────────┘
```

**Components Used:**

- VoiceOrb (large, center)
- QuestionBubble (question display + TTS)
- AudioRecorder (answer recording)
- TimerRing (countdown timer)
- ReplayButton (retry button)

**Features:**

- State-synchronized VoiceOrb
- TTS question playback
- Voice answer recording
- Time limits per question
- Replay functionality
- Auto-submit on timer expiry
- Error handling with recovery
- Smooth transitions between states

---

### TextUI (`components/interview/mode/TextUI.tsx`)

Text interview interface (desktop).

**Layout:**

```
┌─────────────────────────────────────┐
│ Q1: Tell me about a time when...   │
│ [🔊 Play]                   [Timer] │
│                                     │
│ Your Answer                         │
│ ┌─────────────────────────────────┐│
│ │ Type your response here...      ││
│ │                                 ││
│ │                                 ││
│ │                                 ││
│ │                                 ││
│ └─────────────────────────────────┘│
│ 245 characters                      │
│                                     │
│ [🔄 Replay (1/2)]    [Submit Answer]│
└─────────────────────────────────────┘
```

**Components Used:**

- QuestionBubble (question + TTS)
- Textarea (answer input)
- Character counter
- TimerRing (countdown)
- ReplayButton (retry)
- Submit button

**Features:**

- TTS question playback (optional)
- Rich text input (markdown support optional)
- Character counter
- Time limits
- Auto-save draft (localStorage)
- Submit validation
- Replay functionality

---

### MobileVoiceUI (`components/interview/mode/MobileVoiceUI.tsx`)

Mobile-optimized voice interview interface.

**Layout:**

```
┌───────────────────────┐
│   [Smaller VoiceOrb]  │
│     Listening...      │
│                       │
│ Q1: Tell me about...  │
│ [🔊]         [Timer]  │
│                       │
│ [🔴 Tap to Record]    │
│                       │
│ [🔄 Replay]  [Next→]  │
└───────────────────────┘
```

**Mobile Optimizations:**

- Smaller orb size (md vs lg)
- Larger touch targets (min 44px)
- Simplified layout
- Bottom-sheet style controls
- Fixed bottom buttons
- Haptic feedback
- Reduced animations (performance)

---

### MobileTextUI (`components/interview/mode/MobileTextUI.tsx`)

Mobile-optimized text interview interface.

**Layout:**

```
┌───────────────────────┐
│ Q1: Tell me about...  │
│ [🔊]         [Timer]  │
│                       │
│ Your Answer           │
│┌─────────────────────┐│
││                     ││
││ Type here...        ││
││                     ││
││                     ││
│└─────────────────────┘│
│ 245 chars             │
│                       │
│ [🔄 Replay]  [Submit] │
└───────────────────────┘
```

**Mobile Optimizations:**

- Larger text size (base vs sm)
- Simplified controls
- Fixed bottom buttons
- Keyboard-aware layout
- Auto-scroll to input
- Touch-friendly spacing

---

### InterviewModeRouter (`components/interview/InterviewModeRouter.tsx`)

Routes between voice and text interview modes.

**Features:**

- Mode detection from session data
- Device detection (mobile/desktop)
- Dynamic component rendering:
  - Voice + Desktop → VoiceUI
  - Voice + Mobile → MobileVoiceUI
  - Text + Desktop → TextUI
  - Text + Mobile → MobileTextUI
- Shared state management
- Props passing to child components

**Usage:**

```tsx
<InterviewModeRouter
  session={sessionData}
  currentQuestion={question}
  onSubmit={handleSubmit}
/>
```

---

## 11. Dialog/Modal Components

### UpgradeDialog (`components/interview/UpgradeDialog.tsx`)

Premium upgrade modal shown during interview.

**Trigger Scenarios:**

- Free user tries voice mode
- Free user exceeds 3 questions
- Free user attempts replay
- Free user tries to see full report

**Visual:**

```
┌─────────────────────────────────────┐
│              Upgrade                │
│                                     │
│    Unlock Premium Features          │
│                                     │
│  Current (Free):                    │
│  ✓ 3 questions                      │
│  ✓ Text mode only                   │
│  ✓ 1 category score                 │
│                                     │
│  Premium:                           │
│  ✓ Unlimited questions              │
│  ✓ Voice mode                       │
│  ✓ Full feedback (3 categories)     │
│  ✓ Multi-stage interviews           │
│                                     │
│  From A$24.95                       │
│                                     │
│  [See Plans]        [Maybe Later]   │
└─────────────────────────────────────┘
```

**Elements:**

- Comparison table (Free vs Premium)
- Checkmarks for features
- Price display
- Primary CTA: "See Plans" (links to /pricing)
- Secondary: "Maybe Later" (closes dialog)

**Features:**

- Non-intrusive (can dismiss)
- Context-aware messaging
- Analytics tracking
- Conversion-optimized copy

---

### LowBalanceUpsellDialog (`components/interview/LowBalanceUpsellDialog.tsx`)

Warning when pass is about to expire.

**Trigger:**

- <4 hours remaining on 48h pass
- <1 day remaining on 7d pass
- <3 days remaining on 30d pass

**Visual:**

```
┌─────────────────────────────────────┐
│         ⏰ Pass Expiring            │
│                                     │
│   Your 48h pass expires in 2 hours  │
│                                     │
│   Extend your access or upgrade to  │
│   a longer plan to keep practicing. │
│                                     │
│   [Extend Pass]     [Continue]      │
└─────────────────────────────────────┘
```

**Elements:**

- Warning icon (Clock)
- Expiry countdown
- Upsell message
- CTA: "Extend Pass" (links to /pricing)
- Continue button (dismisses)

**Features:**

- Time-sensitive messaging
- One-time per session (don't spam)
- Analytics tracking

---

## 12. Utility Components

### Turnstile (`components/Turnstile.tsx`)

Cloudflare Turnstile bot protection widget.

**Features:**

- Invisible CAPTCHA (no interaction for humans)
- Challenge display when suspicious
- Token generation on success
- Callback with token
- Error handling
- Auto-reset on error
- Configurable site key

**Visual:**

- Usually invisible
- Challenge: Simple checkbox or puzzle
- Size: Compact, normal, or invisible

**Props:**

```tsx
interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}
```

**Usage:**

```tsx
<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
  onVerify={(token) => {
    // Submit form with token
  }}
  theme="auto"
/>
```

---

### Track (`components/analytics/Track.tsx`)

Client-side analytics event tracker.

**Features:**

- Event batching
- Server-side storage (Supabase)
- User identification
- Device fingerprinting
- Error handling
- Offline queue
- Cross-device tracking

**Event Types:**

- Page views
- Button clicks
- Form submissions
- Interview completions
- Purchase events
- Error events

**Usage:**

```tsx
import { track } from '@/lib/analytics';

track({
  name: 'button_clicked',
  payload: {
    button_id: 'start_interview',
    location: 'landing_page',
  },
});
```

---

## 13. Icon Library (Lucide React)

All icons used throughout the application.

### Navigation

- `ArrowRight` - Forward navigation, CTAs
- `ArrowLeft` - Back navigation
- `ChevronDown` - Dropdown indicators
- `Menu` - Mobile menu trigger
- `X` - Close buttons

### Actions

- `Play` - Play audio/video
- `Pause` - Pause playback
- `Mic` - Voice recording
- `Square` - Stop recording
- `Upload` - File upload
- `Download` - Download reports
- `Send` - Submit forms
- `Edit` - Edit actions
- `Trash` - Delete actions

### Status

- `CheckCircle2` - Success, completion
- `XCircle` - Error, failure
- `AlertCircle` - Warning
- `Info` - Information
- `Loader2` - Loading spinner
- `Clock` - Time-related
- `Calendar` - Date-related

### Content

- `Type` - Text mode
- `Volume2` - Audio/sound
- `Briefcase` - Job/work-related
- `Users` - People/team
- `Building` - Company
- `MapPin` - Location
- `Star` - Favorites/rating

### Features

- `Zap` - Speed/power
- `Target` - Goals/focus
- `Brain` - Intelligence/AI
- `BarChart3` - Analytics/scores
- `Award` - Achievement
- `TrendingUp` - Growth/improvement
- `Lock` - Locked content
- `Unlock` - Unlocked content

### Communication

- `MessageSquare` - Messages
- `Mail` - Email
- `Phone` - Phone calls
- `Video` - Video calls

### Settings

- `Settings` - Settings/preferences
- `Filter` - Filtering
- `Search` - Search
- `Eye` - View/preview
- `EyeOff` - Hide

**Icon Sizing:**

- Default: `w-4 h-4` (16px)
- Small: `w-3 h-3` (12px)
- Large: `w-5 h-5` (20px)
- XL: `w-6 h-6` (24px)

**Usage:**

```tsx
import { CheckCircle2, ArrowRight } from 'lucide-react';

<CheckCircle2 className="w-4 h-4 text-green-500" />
<Button>
  Next <ArrowRight className="w-4 h-4" />
</Button>
```

---

## 14. Design Tokens

### Color Palette

**Primary (Brand Colors):**

```css
--cyan-500: #06b6d4 --cyan-600: #0891b2 --blue-500: #3b82f6 --blue-600: #2563eb;
```

**Gradients:**

```css
/* Primary gradient (default buttons, headers) */
from-cyan-500 to-blue-600

/* Hover state */
from-cyan-600 to-blue-700

/* Destructive */
from-red-500 to-red-600
```

**Semantic Colors:**

```css
/* Success */
--green-500: #22c55e /* Warning */ --yellow-500: #eab308 --orange-500: #f97316
  /* Error */ --red-500: #ef4444 --red-600: #dc2626 /* Info */
  --blue-500: #3b82f6;
```

**Neutrals (Slate):**

```css
--slate-50: #f8fafc --slate-100: #f1f5f9 --slate-200: #e2e8f0
  --slate-300: #cbd5e1 --slate-400: #94a3b8 --slate-500: #64748b
  --slate-600: #475569 --slate-700: #334155 --slate-800: #1e293b
  --slate-900: #0f172a;
```

**Backgrounds:**

```css
--white: #ffffff --cyan-50: #ecfeff --blue-50: #eff6ff --slate-50: #f8fafc;
```

### Typography

**Font Family:**

```css
font-family:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  'Helvetica Neue',
  Arial,
  sans-serif;
```

**Font Weights:**

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Font Sizes:**

```css
--text-xs: 0.75rem (12px) --text-sm: 0.875rem (14px) --text-base: 1rem (16px)
  --text-lg: 1.125rem (18px) --text-xl: 1.25rem (20px) --text-2xl: 1.5rem (24px)
  --text-3xl: 1.875rem (30px) --text-4xl: 2.25rem (36px) --text-5xl: 3rem (48px)
  --text-6xl: 3.75rem (60px);
```

**Line Heights:**

```css
--leading-none: 1 --leading-tight: 1.25 --leading-snug: 1.375
  --leading-normal: 1.5 --leading-relaxed: 1.625 --leading-loose: 2;
```

### Shadows

```css
/* Small - cards, inputs */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05) /* Medium - elevated cards */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1) /* Large - buttons, CTAs */
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1) /* XL - dialogs, modals */
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1) /* 2XL - prominent elements */
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

**Drop Shadows (Text):**

```css
/* White glow (mobile, over images) */
drop-shadow-[0_0_12px_rgba(255,255,255,1)]

/* Subtle dark shadow (desktop) */
drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]
```

### Border Radius

```css
--rounded-none: 0 --rounded-sm: 0.125rem (2px) --rounded: 0.25rem (4px)
  --rounded-md: 0.375rem (6px) --rounded-lg: 0.5rem (8px) --rounded-xl: 0.75rem
  (12px) --rounded-2xl: 1rem (16px) --rounded-3xl: 1.5rem (24px)
  --rounded-full: 9999px (circular);
```

**Usage by Component:**

- Inputs: `rounded-md` (6px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-full` (circular)
- Cards (small): `rounded-xl` (12px)
- Cards (large): `rounded-2xl` (16px)
- Widgets: `rounded-2xl` (16px)

### Spacing Scale

Based on Tailwind's 0.25rem (4px) increments:

```css
--spacing-1: 0.25rem (4px) --spacing-2: 0.5rem (8px) --spacing-3: 0.75rem (12px)
  --spacing-4: 1rem (16px) --spacing-5: 1.25rem (20px) --spacing-6: 1.5rem
  (24px) --spacing-8: 2rem (32px) --spacing-10: 2.5rem (40px) --spacing-12: 3rem
  (48px) --spacing-16: 4rem (64px) --spacing-20: 5rem (80px) --spacing-24: 6rem
  (96px);
```

**Common Usage:**

- Gap between elements: 16px (`gap-4`)
- Card padding: 24px (`p-6`)
- Section padding: 96px vertical (`py-24`)
- Button padding: 24px horizontal (`px-6`)
- Mobile padding: 24px (`px-6`)

### Touch Targets

**Minimum Sizes (Mobile):**

- Buttons: `min-h-[44px]` (44px height)
- Inputs: `min-h-[44px]`
- Icons (clickable): `w-11 h-11` (44px)
- Links: Padding to ensure 44px tap area

### Z-Index Layers

```css
--z-base: 0 --z-dropdown: 10 --z-sticky: 20 --z-fixed: 30 --z-modal-backdrop: 40
  --z-modal: 50 --z-popover: 60 --z-tooltip: 70;
```

**Application:**

- Sticky header: `z-20`
- Mobile CTA: `z-50`
- Dialogs: `z-50`
- Toasts: `z-50`
- Tooltips: `z-70`

### Animations

**Transitions:**

```css
/* All properties */
transition-all duration-200

/* Specific properties */
transition-colors duration-200
transition-transform duration-300
```

**Keyframe Animations:**

- `animate-spin` - Loading spinners
- `animate-pulse` - Pulsing elements
- `animate-ping` - Notification rings
- `animate-in` - Entrance animations
- `animate-out` - Exit animations

**Custom Animations:**

```css
/* Fade in */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide in from top */
@keyframes slide-in-from-top {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Scale button press */
active: scale-[0.98];
```

### Backdrop Effects

```css
/* Blur */
backdrop-blur-none
backdrop-blur-sm
backdrop-blur-md
backdrop-blur-lg

/* Opacity */
bg-white/90 (90% opacity)
bg-black/80 (80% opacity)
```

**Usage:**

- Modal overlays: `bg-black/80 backdrop-blur-sm`
- Glass morphism: `bg-white/90 backdrop-blur-lg`
- Widget containers: `bg-white/97 backdrop-blur-[10px]`

---

## Usage Guidelines

### Accessibility

- All buttons have min 44px touch targets
- Focus rings on all interactive elements
- Semantic HTML (headings, labels, buttons)
- ARIA labels where needed
- Color contrast ratios meet WCAG AA

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly on mobile
- Simplified layouts on small screens

### Performance

- Lazy load images
- Code splitting by route
- Minimize animations on low-end devices
- Optimize bundle size

### Consistency

- Use design tokens (colors, spacing)
- Reuse components (don't recreate)
- Follow established patterns
- Maintain visual hierarchy

---

## Component File Locations

```
components/
├── ui/                          # Core shadcn/ui components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── label.tsx
│   ├── switch.tsx
│   └── sonner.tsx
├── interview/                   # Interview-specific
│   ├── VoiceOrb.tsx
│   ├── TimerRing.tsx
│   ├── AudioRecorder.tsx
│   ├── QuestionBubble.tsx
│   ├── ReplayButton.tsx
│   └── mode/
│       ├── VoiceUI.tsx
│       ├── TextUI.tsx
│       ├── MobileVoiceUI.tsx
│       └── MobileTextUI.tsx
├── results/                     # Scoring/results
│   ├── ScoreDial.tsx
│   ├── CategoryBars.tsx
│   └── CategoryBarsPartial.tsx
├── forms/                       # Form components
│   ├── FileDrop.tsx
│   ├── FileDropMultiple.tsx
│   └── IntakeForm.tsx
├── landing/                     # Landing page
│   └── QuickTryWidget.tsx
├── setup/                       # Onboarding
│   ├── ProgressSteps.tsx
│   ├── ReadyScreen.tsx
│   └── SetupFlow.tsx
├── assessment/                  # Assessment-specific
│   └── PreparingOverlay.tsx
├── admin/                       # Admin tools
│   └── AdminAuthGuard.tsx
├── analytics/                   # Analytics
│   └── Track.tsx
├── marketing/                   # Marketing/conversion
│   └── MobileCTA.tsx
├── PricingSuperCard.tsx         # Pricing
├── EntitlementBadge.tsx         # User access display
├── header.tsx                   # Navigation
├── Footer.tsx                   # Footer
└── Turnstile.tsx                # Bot protection
```

---

**Document Version:** 1.0  
**Last Updated:** November 1, 2024  
**Maintained By:** Development Team
