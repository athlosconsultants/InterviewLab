# AI Interview Question Engine - Technical Overview

**Document Purpose**: Technical specification for designing an upgraded B2B version  
**Current Version**: Consumer (B2C) implementation  
**Last Updated**: November 2024

---

## Table of Contents

1. [Inputs](#1-inputs)
2. [Core Logic & Flow](#2-core-logic--flow)
3. [Adaptive Difficulty Mechanism](#3-adaptive-difficulty-mechanism)
4. [Question Memory & State Management](#4-question-memory--state-management)
5. [Outputs](#5-outputs)
6. [Dependencies](#6-dependencies)
7. [Modularity & Extensibility](#7-modularity--extensibility)

---

## 1. INPUTS

The engine receives the following inputs to generate contextually relevant interview questions:

### Session Creation Inputs

#### Core Data

- **CV Text** (`cvText`): Candidate's resume/CV content
- **Job Description** (`jobDescriptionText`, `jobTitle`, `company`, `location`): Target role details
- **Plan Tier** (`'free' | 'paid'`): Determines interview features and limits
  - Free: 3 questions, text-only
  - Paid: Unlimited questions, voice mode, multi-stage interviews
- **Mode** (`'text' | 'voice'`): Interview interaction modality
- **Stages Configuration**: Multi-stage interview setup (e.g., behavioral → technical → system design)

#### Research Snapshot Generation

Generated once at session creation via `generateResearchSnapshot()`:

```typescript
ResearchSnapshot {
  cv_summary: {
    name: string;
    experience_years: number;
    key_skills: string[];
    recent_roles: string[];
    education: string[];
    summary: string;
  };
  job_spec_summary: {
    role: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
    key_requirements: string[];
    nice_to_have: string[];
    responsibilities: string[];
    summary: string;
  };
  company_facts: {
    name: string;
    industry: string;
    mission?: string;
    culture?: string;
  };
  competencies: {
    technical: string[];
    behavioral: string[];
    domain: string[];
  };
  interview_config: {
    tone: string;              // e.g., "professional and conversational"
    styles: string[];          // e.g., ["behavioral", "technical"]
    industry: string;
    sub_industry: string;
    stages?: string[];         // e.g., ["Behavioral Round", "Technical Round"]
  };
}
```

### Per-Question Inputs

Each question generation receives:

```typescript
generateQuestion({
  researchSnapshot: ResearchSnapshot;    // Full candidate/role analysis
  previousTurns: Array<{                 // Conversation history
    question: Question;
    answer_digest?: AnswerDigest;        // Summary of answer
    answer_text?: string;                // Full text for most recent turn
  }>;
  questionNumber: number;                // Current position (1-based)
  totalQuestions: number;                // Interview length
  currentStage?: number;                 // Multi-stage tracking
  stagesPlanned?: number;
  questionsInStage?: number;
  mode?: 'text' | 'voice';              // Modality
  targetDifficulty?: 'easy' | 'medium' | 'hard'; // Adaptive override
})
```

### Question Type Decision Logic

The engine determines the next question type through:

1. **Stage-Based Categorization** (if multi-stage):
   - Maps stage name (e.g., "Technical Round") to category
   - Enforces category consistency within stages
   - Example: "Technical Round" → `category: 'technical'`

2. **Progressive Difficulty**:

   ```typescript
   progress = questionNumber / totalQuestions;
   if (progress < 0.33)
     difficulty = 'easy'; // Warm-up
   else if (progress < 0.66)
     difficulty = 'medium'; // Core
   else difficulty = 'hard'; // Challenge
   ```

3. **Context-Aware Probing**:
   - Analyzes most recent answer for topics, projects, or challenges
   - Generates follow-up questions that probe deeper
   - Example: User mentions "team of 5" → Next question asks about team dynamics

4. **Mode-Aware Adaptation**:
   - **Voice mode**: Concise questions (<30 words), natural conversational flow
   - **Text mode**: Can use complex structures, visual formatting

---

## 2. CORE LOGIC / FLOW

### Session Initialization Flow

```
┌─────────────────┐
│  User Input     │
│  - CV           │
│  - Job Desc     │
│  - Config       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ generateResearchSnapshot()  │
│ - Analyze CV (GPT-4)        │
│ - Extract job requirements  │
│ - Map to industry template  │
│ - Generate competency list  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Store in sessions table     │
│ - research_snapshot (JSONB) │
│ - status: 'ready'           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ startInterview()            │
│ - Generate first question   │
│ - Store in turns table      │
└─────────────────────────────┘
```

### Question-Answer Loop

```
1. generateQuestion()
   ├─ Fetch research snapshot from sessions table
   ├─ Fetch previous turns from turns table
   ├─ Calculate difficulty (progress-based or adaptive)
   ├─ Build conversation context:
   │  ├─ Full answer text for most recent turn (deep probing)
   │  └─ Answer summaries for earlier turns (context awareness)
   ├─ Construct LLM prompt with:
   │  ├─ Candidate background
   │  ├─ Role requirements
   │  ├─ Company context
   │  ├─ Industry-specific tone/style
   │  ├─ Previous conversation
   │  └─ Context-aware probing instructions
   ├─ Call OpenAI GPT-4 with structured JSON response format
   └─ Return Question object

2. Store Question in turns table
   ├─ question (JSONB)
   ├─ Generate TTS audio (if voice mode)
   └─ tts_key (storage reference)

3. User answers (text or voice input)

4. submitAnswer()
   ├─ Store answer_text in turns table
   ├─ Store timing metadata (duration, replay_count, reveal_count)
   ├─ assessAnswerQuality() - Lightweight heuristic analysis
   │  └─ Returns: 'strong' | 'medium' | 'weak'
   ├─ generateQASummary() - Create 1-sentence summary (GPT-3.5)
   ├─ updateConversationSummary() - Append to rolling summary (< 1KB)
   ├─ Check stage advancement:
   │  ├─ Multi-stage: questionsInStage >= stageTarget?
   │  └─ If yes: increment current_stage
   ├─ getAdaptiveDifficulty() - Calculate next difficulty
   │  └─ Based on answer quality and interview progress
   └─ Call generateQuestion() for next question

5. Repeat until question cap reached

6. generateInterviewFeedback()
   ├─ Analyze all turns with GPT-4
   ├─ Generate dimensional scores
   ├─ Extract strengths and improvements
   └─ Store in reports table
```

### Conversation State Storage

**Database Schema (PostgreSQL/Supabase):**

```sql
-- Master session record
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('intake', 'research', 'ready', 'running', 'feedback', 'complete')),

  -- Interview configuration
  job_title TEXT,
  company TEXT,
  location TEXT,
  plan_tier TEXT DEFAULT 'free',
  mode TEXT DEFAULT 'text',

  -- Research and state
  research_snapshot JSONB,           -- Full CV/job/company analysis
  conversation_summary TEXT,         -- Rolling Q&A summaries (< 1KB)

  -- Multi-stage tracking
  stages_planned INTEGER DEFAULT 1,
  current_stage INTEGER DEFAULT 1,
  stage_targets JSONB,               -- [5, 7, 6, 8] questions per stage

  -- Metadata
  limits JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Individual Q&A pairs
CREATE TABLE turns (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES auth.users(id),

  -- Question
  question JSONB NOT NULL,           -- Full Question object
  tts_key TEXT,                      -- Audio file reference

  -- Answer
  answer_text TEXT,
  answer_audio_key TEXT,
  answer_digest JSONB,               -- Summary for context

  -- Behavioral signals
  timing JSONB,                      -- duration_ms, replay_count, reveal_count

  created_at TIMESTAMPTZ
);

-- Final evaluation
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  session_id UUID UNIQUE REFERENCES sessions(id),
  user_id UUID REFERENCES auth.users(id),

  -- Scores
  overall INTEGER CHECK (overall >= 0 AND overall <= 100),
  dimensions JSONB,                  -- technical, communication, problem_solving, cultural_fit

  -- Feedback
  tips JSONB,                        -- Actionable recommendations
  exemplars JSONB,                   -- strengths[], improvements[]

  -- Export
  pdf_key TEXT,
  created_at TIMESTAMPTZ
);
```

### Context Management Strategy

**Problem**: Full conversation history would exceed token limits after ~10 questions.

**Solution**: Multi-tiered memory system

1. **Short-term memory** (1 turn):
   - Full `answer_text` for most recent turn
   - Enables deep, context-aware probing
   - Example: "You mentioned X, can you elaborate on Y?"

2. **Medium-term memory** (2-5 turns):
   - `answer_digest` summaries for earlier turns
   - Maintains conversation continuity
   - Prevents repetitive questions

3. **Long-term memory** (all turns):
   - `conversation_summary` field in sessions table
   - Rolling 1-sentence summaries of each Q&A
   - Automatically condensed when exceeds 1KB
   - Keeps only last 5 summaries if space constrained

**Example conversation_summary:**

```
1. Discussed 5-year experience in React/Node.js with focus on scalability
2. Described migration project from monolith to microservices, reduced latency by 40%
3. Explained leadership approach when managing team of 3 junior developers
4. Detailed conflict resolution with product manager over feature priorities
5. Outlined approach to technical debt prioritization using ROI framework
```

---

## 3. ADAPTIVE DIFFICULTY MECHANISM

### Real-Time Answer Assessment

**Module**: `lib/adaptive-difficulty.ts`

**Design Philosophy**: Lightweight heuristic analysis (NO additional LLM call) for sub-second response time.

```typescript
assessAnswerQuality(question, answer, snapshot): 'strong' | 'medium' | 'weak'
```

**Heuristic Indicators:**

1. **Length-based baseline**:
   - `< 15 words or < 80 chars` → Weak (too brief)
   - `15-150 words` → Evaluated by indicators
   - `> 150 words` → Bonus (substantive)

2. **Quality indicators** (pattern matching):

   ```typescript
   hasSpecificExamples =
     /\b(for example|specifically|when I|in my experience|at [A-Z][\w\s]*,|project)\b/i;
   hasNumbers = /\b\d+\b/;
   hasMethodology =
     /\b(approach|method|process|strategy|steps|first|then|finally)\b/i;
   hasReflection =
     /\b(learned|realized|discovered|challenge|difficult|improved)\b/i;
   ```

3. **Category-specific signals**:
   - **Technical questions**: Check for technical terms (algorithm, database, API, framework)
   - **Behavioral questions**: Check for STAR method (Situation, Action, Result keywords)

4. **Scoring logic**:

   ```typescript
   indicatorCount = qualityIndicators.filter(Boolean).length;

   if (wordCount > 150 && indicatorCount >= 3) return 'strong';
   if (indicatorCount >= 3) return 'strong';
   if (indicatorCount >= 2) return 'medium';
   if (indicatorCount >= 1) return 'medium';
   return 'weak';
   ```

### Adaptive Difficulty Adjustment

**Function**: `getAdaptiveDifficulty(currentDifficulty, answerQuality, progress)`

**Returns**:

```typescript
{
  difficulty: 'easy' | 'medium' | 'hard';
  adjustment: 'increase' | 'decrease' | 'maintain';
  reason: string;
}
```

**Adjustment Rules:**

#### Early Interview (Progress < 30%)

_Goal: Build confidence, identify baseline_

| Current | Answer Quality | Next Difficulty | Reason                                           |
| ------- | -------------- | --------------- | ------------------------------------------------ |
| Easy    | Strong         | Medium          | "Strong early performance - building confidence" |
| Medium  | Strong         | Medium          | "Steady early progress" (maintain)               |
| Any     | Weak           | Easy            | "Weak early performance - building foundation"   |

#### Mid-Interview (30% < Progress < 70%)

_Goal: Adaptive challenge_

| Current | Answer Quality | Next Difficulty | Reason                                      |
| ------- | -------------- | --------------- | ------------------------------------------- |
| Easy    | Strong         | Medium          | "Strong performance - increasing challenge" |
| Medium  | Strong         | Hard            | "Strong performance - increasing challenge" |
| Hard    | Weak           | Medium          | "Weak performance - reducing difficulty"    |
| Medium  | Weak           | Easy            | "Weak performance - reducing difficulty"    |

#### Late Interview (Progress > 70%)

_Goal: Final assessment_

| Current  | Answer Quality | Next Difficulty | Reason                                   |
| -------- | -------------- | --------------- | ---------------------------------------- |
| Not Hard | Strong         | Hard            | "Final challenge for strong performer"   |
| Not Easy | Weak           | Medium          | "Final support for struggling candidate" |
| Any      | Medium         | Maintain        | "Maintaining final interview pace"       |

### Integration with Question Generation

```typescript
// After user submits answer
const answerQuality = await assessAnswerQuality(question, answer, snapshot);
const difficultyAdjustment = getAdaptiveDifficulty(
  currentDifficulty,
  answerQuality,
  questionNumber,
  totalQuestions
);

// Pass to next question generation
const nextQuestion = await generateQuestion({
  ...params,
  targetDifficulty: difficultyAdjustment.difficulty,
});
```

**Performance**: < 10ms for assessment (no LLM call), enables real-time adaptation.

---

## 4. QUESTION MEMORY & STATE MANAGEMENT

### Persistence Layer

**Technology**: PostgreSQL via Supabase  
**Benefits**: ACID compliance, RLS (Row Level Security), JSONB for flexible schemas

### Anti-Repetition Mechanisms

1. **Full Conversation Context in Prompts**:

   ```typescript
   const conversationContext = previousTurns
     .map(
       (turn, idx) =>
         `Q${idx + 1}: ${turn.question.text}\nA${idx + 1}: ${turn.answer_text}`
     )
     .join('\n\n');
   ```

   - LLM sees all previous questions
   - Explicit instruction: "Avoid repeating topics already covered"

2. **Stage-Based Topic Partitioning**:
   - Multi-stage interviews naturally separate topics
   - "Behavioral Round" focuses on soft skills
   - "Technical Round" focuses on hard skills
   - Stage boundaries prevent topic overlap

3. **Follow-Up Tracking**:

   ```typescript
   question.follow_up = previousTurns.length > 0;
   ```

   - Distinguishes between probing same topic vs. new topic
   - Follow-up questions explicitly reference previous answers

4. **Context-Aware Instructions**:
   ```
   "If they mentioned a specific project, ask about technical decisions or tradeoffs"
   "If they mentioned stakeholders, ask about conflict resolution"
   ```

   - Encourages deep dives rather than breadth-first coverage

### Conversation Summary Management (Feature T95)

**Problem**: Full answer texts consume excessive tokens (GPT-4 context limits).

**Solution**: Rolling compression system

```typescript
async function updateConversationSummary(
  sessionId: string,
  newQASummary: string,
  existingSummary: string | null
): Promise<void>;
```

**Process**:

1. After each answer, generate 1-sentence summary via GPT-3.5

   ```typescript
   generateQASummary(question, answer);
   // Returns: "Discussed migration from monolith to microservices, reduced latency by 40%"
   ```

2. Append to `conversation_summary` in sessions table:

   ```
   1. First Q&A summary
   2. Second Q&A summary
   3. Third Q&A summary
   ...
   ```

3. If summary exceeds 1KB, condense:
   ```typescript
   if (updatedSummary.length > 1024) {
     const recentLines = summaryLines.slice(-4); // Keep last 4
     updatedSummary =
       recentLines.join('\n') + `\n${nextNumber}. ${newQASummary}`;
   }
   ```

**Benefits**:

- Token usage: ~200 tokens (summary) vs. ~2000+ tokens (full answers)
- Enables interviews with 20+ questions without context overflow
- Fast retrieval: Single DB field vs. joining all turn records

### State Resumption (Feature T111)

**Capability**: Users can leave and return to interviews mid-session.

```typescript
async function getInterviewState(sessionId: string) {
  // Fetch session
  const session = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  // Fetch all turns
  const turns = await supabase
    .from('turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  // Reconstruct state
  return {
    research_snapshot: session.research_snapshot,
    conversation_summary: session.conversation_summary,
    currentQuestion: turns[turns.length - 1],
    questionNumber: turns.length,
    currentStage: session.current_stage,
    // ... etc
  };
}
```

**Use Cases**:

- Network interruption recovery
- Multi-day interviews (save and resume)
- Browser refresh without data loss

### Research Snapshot Caching

**Module**: `lib/cache.ts`

```typescript
const cachedSnapshot = researchCache.get<ResearchSnapshot>(jobTitle, company);
if (cachedSnapshot) return cachedSnapshot;
```

**Strategy**:

- In-memory cache (Map-based)
- Key: `${jobTitle}_${company}`
- TTL: 15 minutes
- Reduces duplicate research for common roles (e.g., "Software Engineer" at "Google")

**Performance Impact**:

- Cached: ~50ms (DB lookup only)
- Uncached: ~5-8 seconds (GPT-4 analysis)

---

## 5. OUTPUTS

### Per-Question Outputs

```typescript
interface Question {
  text: string; // The interview question
  category: string; // 'technical' | 'behavioral' | 'situational'
  difficulty: string; // 'easy' | 'medium' | 'hard'
  time_limit: number; // Seconds (default 90)
  follow_up: boolean; // Is this probing a previous answer?
}
```

**Example Questions by Difficulty:**

**Easy (Early Interview)**:

```json
{
  "text": "Tell me about your most recent role and what you worked on day-to-day.",
  "category": "behavioral",
  "difficulty": "easy",
  "time_limit": 90,
  "follow_up": false
}
```

**Medium (Mid Interview)**:

```json
{
  "text": "You mentioned migrating to microservices - what technical challenges did you face, and how did you address them?",
  "category": "technical",
  "difficulty": "medium",
  "time_limit": 90,
  "follow_up": true
}
```

**Hard (Late Interview)**:

```json
{
  "text": "Describe a situation where you had to make a technical decision with incomplete information and tight deadlines. How did you balance risk and delivery?",
  "category": "situational",
  "difficulty": "hard",
  "time_limit": 90,
  "follow_up": false
}
```

### Per-Answer Outputs (Stored in Database)

```typescript
// Stored in turns table
interface Turn {
  id: string;
  session_id: string;
  user_id: string;

  // Question
  question: Question;
  tts_key?: string; // Audio file reference (voice mode)

  // Answer
  answer_text: string; // Full response text
  answer_audio_key?: string; // Audio file reference (voice mode)
  answer_digest: {
    // Lightweight summary for future context
    summary: string;
    key_points: string[];
  };

  // Behavioral signals (composure indicators)
  timing: {
    duration_ms: number; // Time taken to answer
    replay_count: number; // Times user replayed question (composure signal)
    reveal_count: number; // Times user re-revealed question text (comprehension signal)
  };

  created_at: string;
}
```

**Quality Assessment** (not stored, used for adaptive logic):

```typescript
answerQuality: 'strong' | 'medium' | 'weak';
```

### Final Session Outputs

#### Interview Feedback Report

```typescript
interface InterviewFeedback {
  overall: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string; // 2-3 sentence overall assessment
  };

  dimensions: {
    technical_competency: {
      score: number; // 0-100
      feedback: string; // Detailed assessment
    };
    communication: {
      score: number; // Factors in replay_count (composure signal)
      feedback: string;
    };
    problem_solving: {
      score: number;
      feedback: string;
    };
    cultural_fit: {
      score: number;
      feedback: string;
    };
  };

  tips: string[]; // 3-5 actionable recommendations

  exemplars: {
    strengths: string[]; // 2-3 specific strong answers with references
    improvements: string[]; // 2-3 specific areas to improve with examples
  };

  generated_at: string; // ISO timestamp
}
```

**Example Feedback**:

```json
{
  "overall": {
    "score": 82,
    "grade": "B",
    "summary": "Strong technical knowledge and clear communication style. Shows good problem-solving approach with specific examples. Could improve on quantifying impact and outcomes more consistently."
  },
  "dimensions": {
    "technical_competency": {
      "score": 85,
      "feedback": "Demonstrated solid understanding of microservices architecture and database optimization. The migration example showed good technical depth, particularly regarding the Redis caching strategy. Could have elaborated more on scaling considerations."
    },
    "communication": {
      "score": 78,
      "feedback": "Clear and structured responses. Used specific examples effectively. Replay count was slightly elevated (2-3 per question), suggesting some hesitation. Practice answering under pressure to improve composure."
    },
    "problem_solving": {
      "score": 84,
      "feedback": "Strong analytical approach. The stakeholder conflict resolution showed good judgment and systematic thinking. Demonstrated ability to break down complex problems into manageable steps."
    },
    "cultural_fit": {
      "score": 80,
      "feedback": "Values align well with collaborative team environments. Showed initiative and ownership in project examples. Could have mentioned more about long-term career goals and company mission alignment."
    }
  },
  "tips": [
    "Quantify your impact more: Instead of 'improved performance,' say 'reduced latency by 40%'",
    "Practice answering behavioral questions using the STAR method (Situation, Task, Action, Result)",
    "Prepare 2-3 go-to examples that showcase different competencies to reference confidently",
    "When discussing technical decisions, mention alternatives you considered and why you chose your approach"
  ],
  "exemplars": {
    "strengths": [
      "Question 3: Excellent use of specific metrics when describing the microservices migration (40% latency reduction, 3-month timeline)",
      "Question 5: Strong demonstration of leadership during the team conflict - showed empathy, clear communication, and follow-through"
    ],
    "improvements": [
      "Question 2: Answer was generic about 'working with stakeholders' - could have provided a specific example with names, context, and outcome",
      "Question 7: Mentioned 'learning from failure' but didn't articulate what specifically was learned or how it changed future approach"
    ]
  }
}
```

#### Report Storage

```sql
-- Stored in reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  session_id UUID UNIQUE REFERENCES sessions(id),
  user_id UUID REFERENCES auth.users(id),

  overall INTEGER,           -- 0-100 score
  dimensions JSONB,          -- Full dimensional breakdown
  tips JSONB,               -- Actionable advice array
  exemplars JSONB,          -- Strengths and improvements

  pdf_key TEXT,             -- Reference to generated PDF report
  created_at TIMESTAMPTZ
);
```

---

## 6. DEPENDENCIES

### External Services

#### OpenAI API

**Models Used:**

1. **GPT-4 Turbo** (`gpt-4-turbo-preview`) - Primary intelligence
   - **Research snapshot generation**: CV/job analysis (~5-8s, ~3000 tokens)
   - **Question generation**: Context-aware questions (~1-2s, ~1500 tokens)
   - **Feedback analysis**: Comprehensive scoring (~3-5s, ~2500 tokens)

2. **GPT-3.5 Turbo** (`gpt-3.5-turbo`) - Lightweight tasks
   - **Q&A summaries**: 1-sentence compression (~0.5s, ~100 tokens)
   - **Cost optimization**: 10x cheaper than GPT-4 for simple tasks

3. **Whisper** (`whisper-1`) - Speech-to-Text
   - **Voice mode transcription**: Convert audio answers to text
   - **Accuracy**: ~95% for clear English speech
   - **Latency**: ~2-4 seconds for 60-second audio

4. **TTS** (Text-to-Speech)
   - **Question narration**: Voice mode question playback
   - **Provider**: OpenAI TTS or ElevenLabs (configurable)
   - **Latency**: ~1-3 seconds for typical question length

**API Configuration** (`lib/openai.ts`):

```typescript
export const MODELS = {
  ANALYSIS: 'gpt-4-turbo-preview', // Deep analysis tasks
  CONVERSATIONAL: 'gpt-3.5-turbo', // Fast, lightweight tasks
  VISION: 'gpt-4-vision-preview', // Future: CV parsing from images
  TTS: 'tts-1', // Text-to-speech
  STT: 'whisper-1', // Speech-to-text
};
```

#### Supabase

**Services Used:**

1. **PostgreSQL Database**
   - **Tables**: sessions, turns, reports, profiles, documents
   - **Row Level Security (RLS)**: User data isolation
   - **JSONB columns**: Flexible schema for research snapshots, question objects
   - **Indexes**: Optimized for user_id, session_id lookups

2. **Authentication**
   - **Email/password**: Traditional signup
   - **OAuth**: Google, GitHub integration
   - **JWT tokens**: Session management
   - **RLS policies**: Automatic data access control

3. **Storage**
   - **Buckets**: audio (voice answers), documents (CVs, PDFs), tts (question audio)
   - **Presigned URLs**: Secure, temporary file access
   - **Auto-expiration**: Cleanup of temporary files

### Internal Modules

```
lib/
├─ openai.ts                  # OpenAI API wrappers, model configuration
├─ interview.ts               # Core question generation engine
├─ adaptive-difficulty.ts     # Heuristic answer quality assessment
├─ scoring.ts                 # LLM-based comprehensive feedback generation
├─ research.ts                # Pre-interview CV/job analysis
├─ session.ts                 # State persistence and resumption
├─ industryMap.ts             # Industry-specific interview configurations
├─ cache.ts                   # In-memory caching (research snapshots)
├─ supabase-client.ts         # Browser Supabase client
├─ supabase-server.ts         # Server Supabase client (with service role)
└─ schema.ts                  # TypeScript interfaces for all data structures
```

**Module Dependencies:**

```
interview.ts
  ├─ depends on: openai.ts, supabase-server.ts, adaptive-difficulty.ts, schema.ts
  └─ used by: app/interview/[id]/actions.ts (server actions)

adaptive-difficulty.ts
  ├─ depends on: schema.ts (interfaces only)
  └─ used by: interview.ts, app/interview/[id]/actions.ts

scoring.ts
  ├─ depends on: openai.ts, schema.ts
  └─ used by: app/report/[id]/page.tsx (final feedback generation)

research.ts
  ├─ depends on: openai.ts, schema.ts, cache.ts, industryMap.ts
  └─ used by: app/setup/actions.ts (session creation)
```

### Key Design Patterns

1. **Server Actions** (`'use server'`)
   - All AI calls happen server-side (API keys never exposed to client)
   - Type-safe RPC from client components
   - Automatic error handling and serialization

2. **Row Level Security (RLS)**
   - Database access controlled at Postgres level
   - Policies enforce user_id matching on all queries
   - Prevents unauthorized data access even if API bypassed

3. **Optimistic Updates**
   - UI updates immediately before DB confirmation
   - Improves perceived responsiveness
   - Reverts on error

4. **Pre-fetching** (Feature T113)
   - Next question generation starts while user is answering
   - Reduces perceived latency from ~2s to <500ms
   - Background async process

---

## 7. MODULARITY & EXTENSIBILITY

### Architectural Strengths

#### ✅ Highly Modular Components

**Input Layer (Research Pipeline)**

- `research.ts` is **fully decoupled** from interview engine
- Can swap CV/job analysis with different prompts, models, or external APIs
- Industry configurations stored as **data** (`industryMap.ts`), not hardcoded logic
- Research snapshot caching prevents redundant analysis

**Question Generation (Core Engine)**

- **Prompt-driven architecture**: All logic encoded in structured prompts
- Easy to add new question types, stages, or difficulty levels without code changes
- Mode parameter (`'text' | 'voice'`) demonstrates extensibility for new modalities (video, AR, etc.)
- Stage-based system naturally extends to arbitrary interview structures

**Answer Processing**

- `adaptive-difficulty.ts`: Pure functions with no side effects
- Heuristic assessment is **pluggable** - can swap with ML model
- Clear separation: lightweight assessment vs. comprehensive scoring

**Feedback Generation**

- `scoring.ts`: Separate module with well-defined interface
- Feedback dimensions are configurable via prompt
- Can add custom rubrics for specific industries/roles

#### ✅ Clean Separation of Concerns

```
Research (pre-interview)
   ↓
Question Generation (real-time)
   ↓
Answer Processing (real-time)
   ↓
Adaptive Adjustment (real-time)
   ↓
Feedback Generation (post-interview)
```

Each stage has:

- Clear inputs and outputs
- Independent testing surface
- Swappable implementations

#### ✅ Database-First State Management

- All state persists in PostgreSQL (sessions, turns, reports)
- Fully auditable and resumable
- No in-memory state that could be lost
- Enables distributed processing (multiple servers)

#### ✅ Performance-Conscious Design

- Research snapshot caching (15min TTL)
- Lightweight heuristics for real-time assessment (no LLM call)
- Pre-fetching next question during user answer time
- Conversation summary compression (prevents token overflow)

---

### Areas for B2B Enhancement

#### ⚠️ 1. Tight OpenAI Coupling

**Current State**: All generation uses OpenAI exclusively.

**B2B Needs**:

- **Multi-model support**: Enterprise customers may require on-premise or specific providers
- **Cost optimization**: Mix expensive (GPT-4) and cheap (GPT-3.5) models strategically
- **Redundancy**: Fallback providers if OpenAI is unavailable

**Recommended Architecture**:

```typescript
// Abstract LLM interface
interface LLMProvider {
  generateCompletion(prompt: string, options: CompletionOptions): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
}

// Implementations
class OpenAIProvider implements LLMProvider { ... }
class AnthropicProvider implements LLMProvider { ... }
class AzureOpenAIProvider implements LLMProvider { ... }
class LocalLLMProvider implements LLMProvider { ... }

// Factory
const llm = getLLMProvider(config.provider);
const question = await llm.generateCompletion(prompt, options);
```

#### ⚠️ 2. Limited Analytics & Observability

**Current State**: Console logging only.

**B2B Needs**:

- **Token usage tracking**: Cost attribution per session, per client
- **Quality metrics**: Question relevance, answer coherence, feedback accuracy
- **Performance monitoring**: Latency percentiles, error rates
- **A/B testing framework**: Compare prompt variations, model versions

**Recommended Additions**:

```typescript
// Telemetry layer
interface Telemetry {
  trackQuestionGeneration(sessionId, latency, tokenUsage, modelVersion);
  trackAnswerQuality(sessionId, questionId, quality, indicators);
  trackFeedbackScore(sessionId, overallScore, dimensions);
  trackError(operation, error, context);
}

// Usage
telemetry.trackQuestionGeneration(sessionId, 1234, 1500, 'gpt-4-turbo-2024-01');
```

#### ⚠️ 3. No Question Bank

**Current State**: Pure generative approach (every question is LLM-generated).

**B2B Needs**:

- **Compliance requirements**: Some industries need pre-approved questions
- **Quality control**: Curated questions for sensitive roles
- **Cost optimization**: Reuse common questions instead of regenerating
- **Consistency**: Benchmark candidates with identical questions

**Recommended Hybrid Approach**:

```typescript
interface QuestionSource {
  type: 'generated' | 'curated' | 'templated';
  generate(context: InterviewContext): Promise<Question>;
}

class HybridQuestionEngine {
  async getNextQuestion(context: InterviewContext): Promise<Question> {
    // Decide: curated, templated, or generated
    if (context.requiresCompliance) {
      return this.curatedBank.getQuestion(context);
    } else if (context.stage === 'screening') {
      return this.templateEngine.instantiate(context);
    } else {
      return this.llmGenerator.generate(context);
    }
  }
}
```

#### ⚠️ 4. Single-Threaded Processing

**Current State**: One question at a time, sequential flow.

**B2B Needs**:

- **Batch processing**: Pre-generate questions for known interview structures
- **Parallel scoring**: Evaluate multiple answers simultaneously
- **Background tasks**: Generate reports asynchronously

**Recommended Architecture**:

```typescript
// Job queue for async processing
interface Job {
  type: 'generate_questions' | 'score_answer' | 'generate_report';
  payload: any;
  priority: number;
}

// Worker processes
class InterviewWorker {
  async processJob(job: Job) {
    switch (job.type) {
      case 'generate_questions':
        await this.batchGenerateQuestions(job.payload);
      case 'score_answer':
        await this.scoreAnswerAsync(job.payload);
      case 'generate_report':
        await this.generateReportAsync(job.payload);
    }
  }
}
```

#### ⚠️ 5. Static Research Snapshot

**Current State**: Generated once at session start, never updated.

**B2B Needs**:

- **Dynamic adaptation**: Update candidate profile as interview progresses
- **Skill graphing**: Build competency map in real-time
- **Gap analysis**: Identify missing skills mid-interview, adjust focus
- **Learning path generation**: Recommend areas to probe based on answers

**Recommended Enhancement**:

```typescript
interface DynamicProfile {
  baseline: ResearchSnapshot;           // Initial analysis
  observedSkills: Map<string, number>;  // Skill → confidence (0-1)
  missingCompetencies: string[];        // Gaps identified
  interestAreas: string[];              // Topics candidate is passionate about

  update(answer: string, question: Question): void;
  getNextFocus(): string[];  // Return high-priority areas to probe
}

class AdaptiveInterviewEngine {
  profile: DynamicProfile;

  async generateQuestion(...): Promise<Question> {
    // Factor in real-time profile
    const focusAreas = this.profile.getNextFocus();
    const question = await this.llm.generate({
      ...context,
      priorityCompetencies: focusAreas
    });
    return question;
  }

  async processAnswer(answer: string, question: Question) {
    this.profile.update(answer, question);  // Update in real-time
    await this.saveProfile();               // Persist to DB
  }
}
```

---

### Extensibility Assessment

#### 🟢 Easy to Extend (Good Architecture)

1. **Add new question types**: Just update prompt instructions
2. **Add new interview stages**: Configure via `interview_config.stages`
3. **Add new scoring dimensions**: Update `scoring.ts` prompt
4. **Add new answer quality indicators**: Extend heuristics in `adaptive-difficulty.ts`
5. **Add new plan tiers**: Database-driven feature flags

#### 🟡 Moderate Effort (Requires Refactoring)

1. **Support multiple LLM providers**: Need abstraction layer
2. **Add question bank**: Need hybrid generation system
3. **Enable real-time collaboration**: Need WebSocket infrastructure
4. **Add video interviews**: Need new modality handlers

#### 🔴 Significant Effort (Architectural Changes)

1. **Multi-interviewer sessions**: Need state synchronization
2. **Live human-AI hybrid interviews**: Need real-time LLM streaming
3. **Custom fine-tuned models per client**: Need training pipeline
4. **Real-time candidate profiling**: Need dynamic state management

---

## B2B Upgrade Roadmap

### Phase 1: Foundation (Weeks 1-4)

- [ ] Abstract LLM provider interface
- [ ] Implement structured telemetry
- [ ] Add comprehensive logging and monitoring
- [ ] Create admin dashboard for session analytics

### Phase 2: Enterprise Features (Weeks 5-8)

- [ ] Curated question bank with tagging system
- [ ] Compliance-friendly question approval workflow
- [ ] Multi-tenant support with organization hierarchy
- [ ] SSO integration (SAML, OAuth)

### Phase 3: Advanced Intelligence (Weeks 9-12)

- [ ] Dynamic candidate profiling system
- [ ] Real-time skill gap analysis
- [ ] Batch question pre-generation
- [ ] Parallel answer scoring

### Phase 4: Customization (Weeks 13-16)

- [ ] Custom rubric builder for clients
- [ ] Industry-specific question templates
- [ ] White-label branding support
- [ ] API for third-party integrations

---

## Conclusion

The current AI interview question engine demonstrates **strong architectural foundations** for B2B expansion:

**Strengths:**

- Clean separation of concerns (research → questions → answers → feedback)
- Database-first state management (fully auditable, resumable)
- Performance-conscious design (caching, lightweight heuristics, pre-fetching)
- Multi-stage support (structured interview processes)
- Context preservation (rolling summaries prevent token overflow)

**Key Upgrade Paths for B2B:**

1. **LLM abstraction layer** → Multi-provider support, cost optimization
2. **Telemetry infrastructure** → Analytics, A/B testing, monitoring
3. **Question bank hybrid** → Compliance, consistency, quality control
4. **Async processing pipeline** → Scalability, batch operations
5. **Dynamic profiling** → Real-time adaptation, skill graphing

The existing architecture is **highly extensible** with minimal technical debt. Most B2B features can be added as **new modules** rather than core refactoring, preserving the stable foundation while enabling enterprise capabilities.
