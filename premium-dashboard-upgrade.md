# Premium Dashboard Upgrade - Implementation Guide

## Overview

Transform the current premium landing page into a personalized, action-oriented dashboard that matches the UI/UX quality of the free landing page. This dashboard serves active premium users who need quick access to interviews, progress tracking, and subscription management.

## End Goal

Create a **personalized dashboard** that:

- Gives instant access to premium interview practice
- Shows user progress and statistics
- Displays subscription status with countdown/renewal info
- Motivates continued practice with achievements and insights
- Matches the polished UI/UX of the free landing page

---

## Design System Requirements

### Visual Consistency

Match the free landing page design tokens:

**Colors:**

- Primary gradient: `#00BCD4` (cyan) → `#2196F3` (blue)
- Success: `#4CAF50` (green)
- Warning: `#FF9800` (orange)
- Background: `#F5F9FA` (light blue-gray)
- Card background: `#FFFFFF`
- Text primary: `#1E293B`
- Text secondary: `#64748B`

**Typography:**

- Heading 1: 32-36px, font-weight: 700
- Heading 2: 24-28px, font-weight: 600
- Heading 3: 18-20px, font-weight: 600
- Body: 16px, font-weight: 400
- Small: 14px, font-weight: 400

**Spacing:**

- Base unit: 16px
- Card padding: 24-32px
- Section spacing: 48-64px
- Card gap: 16-24px

**Components:**

- Card border-radius: 12-16px
- Button border-radius: 8px
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.1)`
- Touch targets: minimum 44px

---

## Implementation Phases

### Phase 1: Core Dashboard (Priority 1)

#### 1.1 Header Section

**Component:** `DashboardHeader`

**Requirements:**

- Show personalized greeting with time-of-day awareness:
  - Morning (5am-12pm): "Good morning, [Name]!"
  - Afternoon (12pm-5pm): "Good afternoon, [Name]!"
  - Evening (5pm-5am): "Good evening, [Name]!"
- Display subscription status badge prominently
- Include user email and sign-out button (keep existing)

**Layout:**

```jsx
<header>
  <div className="greeting">
    <h1>Good morning, Alex! 🎯</h1>
    <Badge variant="success">
      <Icon name="zap" /> Lifetime Access Active
    </Badge>
  </div>
  <div className="user-info">
    <span>{email}</span>
    <Button variant="outline">Sign Out</Button>
  </div>
</header>
```

**Data Requirements:**

- User first name
- Current time
- Subscription type (lifetime/monthly/annual)
- Subscription status (active/expiring/expired)

---

#### 1.2 Quick Stats Cards

**Component:** `QuickStatsGrid`

**Requirements:**

- Display 4 key metrics in card format
- Each card should have:
  - Icon with colored background circle
  - Large number value
  - Descriptive label
- Make responsive: 4 columns on desktop, 2x2 grid on mobile

**Stats to Display:**

1. **Total Interviews**
   - Icon: 📊 or bar chart icon
   - Value: Total completed interviews
   - Label: "Interviews Completed"

2. **Average Score**
   - Icon: ⭐ or star icon
   - Value: Average score across all categories (X.X/10)
   - Label: "Average Score"

3. **Practice Streak**
   - Icon: 🔥 or flame icon
   - Value: Consecutive days practiced
   - Label: "Day Streak"

4. **Total Practice Time**
   - Icon: ⏱️ or clock icon
   - Value: Hours practiced (X.X hrs)
   - Label: "Practice Time"

**Layout:**

```jsx
<div className="stats-grid">
  <StatCard
    icon="bar-chart"
    iconColor="#00BCD4"
    value={totalInterviews}
    label="Interviews Completed"
  />
  <StatCard
    icon="star"
    iconColor="#4CAF50"
    value={`${avgScore}/10`}
    label="Average Score"
  />
  <StatCard
    icon="flame"
    iconColor="#FF9800"
    value={streak}
    label="Day Streak"
  />
  <StatCard
    icon="clock"
    iconColor="#2196F3"
    value={`${hours} hrs`}
    label="Practice Time"
  />
</div>
```

**Data Requirements:**

- Total interviews completed (integer)
- Average score across all categories (float, 1 decimal)
- Current practice streak in days (integer)
- Total practice time in hours (float, 1 decimal)

---

#### 1.3 Primary CTA: Start Interview Section

**Component:** `StartInterviewCard`

**Requirements:**

- Prominent card with gradient button (keep existing style)
- Add quick launch options above main button
- Show context-aware suggestions
- Display time estimates

**Features:**

1. **Continue Last Interview** (if applicable)
   - Show role and company
   - Display completion percentage
   - Show estimated time remaining
   - Only show if there's an incomplete interview

2. **Quick Options**
   - "Quick 3-question warmup"
   - "Full interview session"
   - Time estimates for each

3. **Main CTA Button**
   - Keep gradient style: cyan → blue
   - Add arrow icon
   - Show "Start Premium Interview"

**Layout:**

```jsx
<Card className="start-interview-card">
  {hasIncompleteInterview && (
    <div className="continue-section">
      <h3>Continue where you left off?</h3>
      <div className="incomplete-interview">
        <span>
          {role} at {company}
        </span>
        <ProgressBar value={completionPercent} />
        <span>
          {completionPercent}% complete • ~{remainingMinutes} min remaining
        </span>
      </div>
      <div className="button-group">
        <Button variant="secondary">Continue →</Button>
        <Button variant="ghost">Start Fresh</Button>
      </div>
    </div>
  )}

  <div className="new-interview-section">
    <h3>Ready to Practice?</h3>
    <p>
      Start a personalized interview session tailored to your experience and
      target role.
    </p>

    <div className="quick-options">
      <button className="quick-option">
        <Icon name="zap" />
        <span>Quick 3-question warmup</span>
        <span className="time-estimate">~5 min</span>
      </button>
      <button className="quick-option">
        <Icon name="target" />
        <span>Full interview session</span>
        <span className="time-estimate">~15-20 min</span>
      </button>
    </div>

    <Button variant="gradient" size="large">
      <Icon name="play-circle" />
      Start Premium Interview →
    </Button>

    <p className="feature-text">
      Unlimited questions • Voice mode • Detailed feedback
    </p>
  </div>
</Card>
```

**Data Requirements:**

- Incomplete interview data (if exists):
  - Role name
  - Company name
  - Completion percentage
  - Estimated remaining time
- User's target role (for personalization)

---

#### 1.4 Recent Interview Sessions

**Component:** `RecentInterviewsList`

**Requirements:**

- Show last 3-5 completed interviews
- Each item displays:
  - Role and company
  - Date completed
  - Overall score
  - Quick link to view detailed feedback
- Link to "View All" for full history

**Layout:**

```jsx
<Card className="recent-sessions">
  <div className="card-header">
    <h3>Recent Practice Sessions</h3>
    <Button variant="ghost">View All →</Button>
  </div>

  <div className="sessions-list">
    {recentInterviews.map((interview) => (
      <div className="session-item" key={interview.id}>
        <div className="session-info">
          <h4>
            {interview.role} @ {interview.company}
          </h4>
          <div className="session-meta">
            <span className="date">{formatDate(interview.completedAt)}</span>
            <span className="score">
              <Icon name="star" />
              {interview.overallScore}/10
            </span>
          </div>
        </div>
        <Button variant="ghost" size="small">
          View Details →
        </Button>
      </div>
    ))}
  </div>
</Card>
```

**Data Requirements:**

- Recent interviews array (last 3-5):
  - Interview ID
  - Role name
  - Company name
  - Completion date
  - Overall score (float)
  - Link to detailed feedback

---

### Phase 2: Engagement Features (Priority 2)

#### 2.1 Performance Breakdown

**Component:** `PerformanceCard`

**Requirements:**

- Visual representation of scores across categories
- Highlight strongest and weakest areas
- Show improvement suggestions
- Use charts (radar, bar, or horizontal bars)

**Categories:**

1. Communication
2. Problem-Solving
3. Leadership

**Layout:**

```jsx
<Card className="performance-card">
  <h3>Your Performance Breakdown</h3>

  <div className="chart-container">
    <PerformanceChart data={categoryScores} type="horizontal-bar" />
  </div>

  <div className="insights">
    <div className="insight-item strong">
      <Icon name="trending-up" color="success" />
      <span>
        Strongest: {strongestCategory} ({strongestScore}/10)
      </span>
    </div>
    <div className="insight-item improving">
      <Icon name="activity" color="primary" />
      <span>
        Improving: {improvingCategory} ({improvingScore}/10)
      </span>
    </div>
    {weakestCategory && (
      <div className="insight-item weak">
        <Icon name="alert-circle" color="warning" />
        <span>
          Focus on: {weakestCategory} ({weakestScore}/10)
        </span>
      </div>
    )}
  </div>

  <Button variant="outline">Practice {weakestCategory} →</Button>
</Card>
```

**Data Requirements:**

- Category scores (array of 3):
  - Category name
  - Score (float)
  - Trend (improving/declining/stable)
- Calculated insights:
  - Strongest category
  - Weakest category (if applicable)
  - Improving category

---

#### 2.2 Recommended Practice Section

**Component:** `RecommendedPracticeCard`

**Requirements:**

- Intelligent suggestions based on user data
- Multiple recommendation types
- Contextual messaging

**Recommendation Types:**

1. **Continue incomplete interview** (highest priority)
2. **Practice weak category**
3. **New challenge** (different role/level)
4. **Maintain streak** (if haven't practiced today)

**Layout:**

```jsx
<Card className="recommended-practice">
  <h3>Recommended for You</h3>

  <div className="recommendation-grid">
    {recommendations.map((rec) => (
      <div className="recommendation-item" key={rec.id}>
        <Icon name={rec.icon} />
        <div className="rec-content">
          <h4>{rec.title}</h4>
          <p>{rec.description}</p>
          {rec.metadata && <span className="metadata">{rec.metadata}</span>}
        </div>
        <Button variant="outline" size="small">
          {rec.ctaText} →
        </Button>
      </div>
    ))}
  </div>
</Card>
```

**Example Recommendations:**

```javascript
[
  {
    id: 1,
    icon: 'rotate-cw',
    title: 'Continue Your Journey',
    description: 'Finish your Product Manager interview',
    metadata: '40% complete • ~8 minutes remaining',
    ctaText: 'Continue',
  },
  {
    id: 2,
    icon: 'target',
    title: 'Sharpen Your Skills',
    description:
      'Your communication scores improved! Practice leadership next.',
    ctaText: 'Start Leadership Focus',
  },
  {
    id: 3,
    icon: 'trending-up',
    title: 'Maintain Your Streak',
    description: "You're on a 5-day streak! Practice today to keep it going.",
    metadata: 'Quick 3-question session',
    ctaText: 'Quick Practice',
  },
];
```

---

#### 2.3 Achievement & Streak Tracking

**Component:** `AchievementSection`

**Requirements:**

- Display current streak prominently
- Show earned achievement badges
- Celebrate milestones
- Motivational messaging

**Layout:**

```jsx
<Card className="achievement-section">
  <div className="streak-highlight">
    <Icon name="flame" size="large" />
    <div className="streak-content">
      <h3>{streak} Day Streak! 🔥</h3>
      <p>You've practiced {streak} days in a row. Keep it going!</p>
      <ProgressBar
        value={todayPracticed ? 100 : 0}
        label={
          todayPracticed
            ? "Today's goal complete"
            : 'Practice today to maintain streak'
        }
      />
    </div>
  </div>

  <div className="achievements-grid">
    <h4>Your Achievements</h4>
    <div className="badges">
      {achievements.map((achievement) => (
        <div
          className={`badge ${achievement.earned ? 'earned' : 'locked'}`}
          key={achievement.id}
        >
          <Icon name={achievement.icon} />
          <span>{achievement.name}</span>
        </div>
      ))}
    </div>
  </div>

  {hasNewAchievement && (
    <div className="new-achievement-toast">
      <Icon name="award" />
      <span>New achievement unlocked: {newAchievement.name}!</span>
    </div>
  )}
</Card>
```

**Achievement Examples:**

- "First Interview" - Complete your first interview
- "Perfect Score" - Score 10/10 in any category
- "5 Day Streak" - Practice 5 days in a row
- "10 Interviews" - Complete 10 interviews
- "Speed Demon" - Complete interview in under 10 minutes
- "Improvement Master" - Improve score by 2+ points

---

#### 2.4 Subscription Management Widget

**Component:** `SubscriptionCard`

**Requirements:**

- Display subscription type clearly
- Show renewal/expiration date
- Usage statistics
- Manage subscription link

**Variations:**

**For Lifetime Users (A$199.99 - "Best Value"):**

```jsx
<Card className="subscription-card lifetime">
  <div className="subscription-header">
    <Icon name="award" size="large" />
    <div>
      <h3>🏆 Lifetime Access</h3>
      <Badge variant="success">Best Value</Badge>
    </div>
  </div>

  <div className="subscription-details">
    <p>Never pay for interview prep again</p>
    <p className="savings">You saved A$460+ vs buying 30-day passes twice</p>
  </div>

  <div className="subscription-stats">
    <div className="stat">
      <span className="label">Member since</span>
      <span className="value">{memberSince}</span>
    </div>
    <div className="stat">
      <span className="label">Interviews completed</span>
      <span className="value">{totalInterviews}</span>
    </div>
    <div className="stat">
      <span className="label">Total saved</span>
      <span className="value">A${calculateSavings()}</span>
    </div>
  </div>

  <div className="lifetime-perks">
    <p className="perk">✓ Unlimited interviews forever</p>
    <p className="perk">✓ Every promotion, job change, career pivot</p>
    <p className="perk">✓ Used by professionals across 50+ industries</p>
  </div>
</Card>
```

**For 30-Day Users (A$99.99 - "The Career Investment"):**

```jsx
<Card className="subscription-card monthly-30">
  <div className="subscription-header">
    <h3>The Career Investment</h3>
    <Badge variant="success">Active</Badge>
  </div>

  <div className="subscription-info">
    <p>
      <strong>30 Days Unlimited</strong> • Expires {expirationDate}
    </p>
    <div className="countdown">
      <Icon name="clock" />
      <span>{daysRemaining} days remaining</span>
    </div>

    <ProgressBar
      value={(daysElapsed / 30) * 100}
      label={`Day ${daysElapsed} of 30`}
    />
  </div>

  <div className="subscription-stats">
    <div className="stat">
      <span className="label">Interviews this period</span>
      <span className="value">{periodInterviews} / unlimited</span>
    </div>
    <div className="stat">
      <span className="label">Daily rate</span>
      <span className="value">Just A$3.33/day</span>
    </div>
  </div>

  <div className="plan-benefits">
    <p>✓ Transform from nervous to natural</p>
    <p>✓ Practice every question type, industry, scenario</p>
  </div>

  {daysRemaining <= 7 && (
    <div className="renewal-prompt">
      <p>Your access expires soon. Upgrade to Lifetime and never pay again!</p>
      <Button variant="gradient">Upgrade to Lifetime →</Button>
    </div>
  )}
</Card>
```

**For 7-Day Users (A$59.99 - "The Standard Prep" - Most Popular):**

```jsx
<Card className="subscription-card weekly">
  <div className="subscription-header">
    <h3>The Standard Prep</h3>
    <Badge variant="primary">Most Popular</Badge>
  </div>

  <div className="subscription-info">
    <p>
      <strong>7 Days Unlimited</strong> • Expires {expirationDate}
    </p>
    <div className="countdown">
      <Icon name="clock" />
      <span>{daysRemaining} days remaining</span>
    </div>

    <ProgressBar
      value={(daysElapsed / 7) * 100}
      label={`Day ${daysElapsed} of 7`}
    />
  </div>

  <div className="subscription-stats">
    <div className="stat">
      <span className="label">Interviews completed</span>
      <span className="value">{periodInterviews} / unlimited</span>
    </div>
    <div className="stat">
      <span className="label">Daily rate</span>
      <span className="value">A$8.57/day (less than two coffees)</span>
    </div>
    <div className="stat">
      <span className="label">Average completion</span>
      <span className="value">8 practice interviews</span>
    </div>
  </div>

  <div className="plan-benefits">
    <p>✓ The proven path to interview confidence</p>
    <p>✓ Master your answers, eliminate 'ums'</p>
  </div>

  {daysRemaining <= 3 && (
    <div className="renewal-prompt">
      <p>
        Only {daysRemaining} days left! Extend your prep or upgrade to Lifetime.
      </p>
      <div className="button-group">
        <Button variant="outline">Add 7 More Days</Button>
        <Button variant="gradient">Go Lifetime →</Button>
      </div>
    </div>
  )}
</Card>
```

**For 2-Day Users (A$29.99 - "The Weekend Warrior"):**

```jsx
<Card className="subscription-card weekend">
  <div className="subscription-header">
    <h3>The Weekend Warrior</h3>
    <Badge variant="warning">48 Hours</Badge>
  </div>

  <div className="subscription-info">
    <p>
      <strong>2 Days Unlimited</strong> • Expires {expirationDate}
    </p>
    <div className="countdown urgent">
      <Icon name="alert-circle" />
      <span>{hoursRemaining} hours remaining</span>
    </div>

    <ProgressBar
      value={(hoursElapsed / 48) * 100}
      label={`${hoursElapsed} of 48 hours used`}
      variant="warning"
    />
  </div>

  <div className="subscription-stats">
    <div className="stat">
      <span className="label">Interviews completed</span>
      <span className="value">{periodInterviews} / unlimited</span>
    </div>
    <div className="stat">
      <span className="label">Recommended sessions</span>
      <span className="value">4-6 interviews</span>
    </div>
  </div>

  <div className="urgency-message">
    <Icon name="zap" />
    <p>
      <strong>Make every hour count!</strong> Most users practice 4-6 times and
      feel ready.
    </p>
  </div>

  {hoursRemaining <= 24 && (
    <div className="renewal-prompt urgent">
      <p>
        <strong>Time is running out!</strong> Upgrade now to keep practicing.
      </p>
      <Button variant="gradient">Upgrade to 7 Days →</Button>
    </div>
  )}
</Card>
```

**Data Requirements:**

- Subscription type: '2-day' | '7-day' | '30-day' | 'lifetime'
- Status: 'active' | 'expiring' (last 3 days) | 'expired'
- Purchase date
- Expiration date (for time-limited plans)
- Member since date (for lifetime)
- Days/hours remaining (calculated from expiration)
- Days/hours elapsed (calculated from purchase)
- Usage statistics (interviews completed during this period)
- Total savings calculation (for lifetime users)

---

## Plan-Specific Dashboard Adaptations

### 2-Day Plan ("The Weekend Warrior") - A$29.99

**User Persona:** Urgent interview prep, interview in 48 hours
**Dashboard Focus:** Speed and efficiency

**Key Adaptations:**

- Show countdown in **HOURS** instead of days
- Add urgency messaging: "Make every hour count!"
- Recommend 4-6 practice sessions
- Show "Quick Warmup" option prominently
- Upsell to 7-day plan when < 24 hours remain
- Track sessions per hour (should aim for 2-3 per day)

**Motivational Messages:**

- "Interview in 48 hours? We've got you. Most users practice 4-6 times and feel ready."
- "Time is ticking! Practice now to build muscle memory."
- "Quick tip: Focus on your weakest category first."

---

### 7-Day Plan ("The Standard Prep") - A$59.99 [MOST POPULAR]

**User Persona:** Standard interview prep, 1 week to prepare
**Dashboard Focus:** Consistency and mastery

**Key Adaptations:**

- Show daily practice goal (1-2 sessions per day)
- Highlight "Most Popular" badge
- Track daily streak within the 7 days
- Show "Average user completes 8 practice interviews"
- Suggest spacing: Practice Mon/Tue, rest Wed, practice Thu/Fri, rest Sat, final practice Sun
- Upsell to Lifetime when < 3 days remain

**Motivational Messages:**

- "One week to transform from nervous to natural. You've got this!"
- "Day {X} of 7: You're {ahead/on track/behind} compared to average users"
- "This is the proven path - master your answers, eliminate your 'ums', nail the tough questions"

---

### 30-Day Plan ("The Career Investment") - A$99.99

**User Persona:** Career changer, senior roles, thorough prep
**Dashboard Focus:** Depth and progress tracking

**Key Adaptations:**

- Show weekly goals (2-3 sessions per week)
- Track improvement trends over time
- Display "Transform from nervous to natural" messaging
- Show category scores improving week-over-week
- Recommend practicing different roles/industries
- Best for multi-round interview prep
- Upsell to Lifetime when < 7 days remain

**Motivational Messages:**

- "A full month to practice every question type, every industry, every scenario"
- "You're investing in your career transformation"
- "Track your progress week by week - watch yourself improve"
- "Perfect for career changers and senior roles"

---

### Lifetime Plan - A$199.99 [BEST VALUE]

**User Persona:** Career-focused professional, multiple future interviews
**Dashboard Focus:** Long-term growth and ROI

**Key Adaptations:**

- Remove all countdown/urgency elements
- Show "total saved" calculation
- Emphasize "unlimited forever"
- Track career milestones: promotions, job changes
- Show usage across multiple roles/companies
- Display "Member since [date]" prominently
- Highlight "Used by professionals across 50+ industries"

**Motivational Messages:**

- "One payment for your entire career - smart investment!"
- "You've saved A${savings} compared to buying multiple passes"
- "Unlimited practice for every promotion, job change, career pivot"
- "Interview prep sorted for life ✓"

**ROI Display:**
Calculate and show:

```
Total interviews: 47
Equivalent in 7-day passes: A$419.93
Your savings: A$219.94
```

---

## Plan-Specific Urgency Thresholds

### When to Show Renewal/Upgrade Prompts:

**2-Day Plan:**

- At 24 hours remaining: "Less than 1 day left! Upgrade to keep practicing"
- At 12 hours remaining: "URGENT: Only 12 hours left"
- At 6 hours remaining: Show banner at top of dashboard

**7-Day Plan:**

- At 3 days remaining: Soft prompt to extend or upgrade
- At 1 day remaining: Prominent prompt with CTA
- At 12 hours remaining: Banner notification

**30-Day Plan:**

- At 7 days remaining: Show Lifetime upgrade option
- At 3 days remaining: Prominent renewal prompt
- At 1 day remaining: Urgent banner

**Visual Hierarchy for Urgency:**

```css
/* Normal state */
.countdown {
  color: #64748b;
}

/* Warning state (< 3 days for 7-day, < 7 days for 30-day) */
.countdown.warning {
  color: #ff9800;
  font-weight: 600;
}

/* Urgent state (< 1 day) */
.countdown.urgent {
  color: #f44336;
  font-weight: 700;
  animation: pulse 2s infinite;
}
```

---

### Phase 3: Polish & Personalization (Priority 3)

#### 3.1 Empty States

**Component:** `EmptyStateDashboard`

**Requirements:**

- Show for users with no completed interviews
- Include onboarding guidance
- Prominent first interview CTA
- Optional: feature tour or tutorial

**Layout:**

```jsx
<div className="empty-state-dashboard">
  <Card className="welcome-card">
    <Icon name="sparkles" size="xlarge" />
    <h2>Welcome to InterviewLab Premium! 🎉</h2>
    <p>You're all set to start practicing. Let's get you interview-ready!</p>
  </Card>

  <Card className="onboarding-steps">
    <h3>Get Started in 3 Easy Steps</h3>
    <div className="steps">
      <div className="step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h4>Set Your Goal</h4>
          <p>Tell us what role you're targeting</p>
          <Button variant="outline" size="small">
            Set Goal →
          </Button>
        </div>
      </div>
      <div className="step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h4>Start Your First Interview</h4>
          <p>Practice with AI-powered questions</p>
          <Button variant="gradient">Start Now →</Button>
        </div>
      </div>
      <div className="step">
        <div className="step-number">3</div>
        <div className="step-content">
          <h4>Get Detailed Feedback</h4>
          <p>Learn exactly what to improve</p>
        </div>
      </div>
    </div>
  </Card>

  <Card className="features-preview">
    <h3>What You Get with Premium</h3>
    <ul>
      <li>
        <Icon name="check" /> Unlimited interview questions
      </li>
      <li>
        <Icon name="check" /> Realistic voice mode (like Zoom)
      </li>
      <li>
        <Icon name="check" /> Full AI feedback across 3 categories
      </li>
      <li>
        <Icon name="check" /> Multi-stage interviews (up to 3 rounds)
      </li>
      <li>
        <Icon name="check" /> Adaptive difficulty that grows with you
      </li>
    </ul>
  </Card>
</div>
```

---

#### 3.2 Loading States & Skeletons

**Component:** `SkeletonLoader`

**Requirements:**

- Show skeleton loaders while data is fetching
- Smooth transitions when content loads
- Maintain layout stability

**Implementation:**

```jsx
// Skeleton for Stats Cards
<div className="stats-grid">
  {[1,2,3,4].map(i => (
    <div className="stat-card skeleton" key={i}>
      <div className="skeleton-icon" />
      <div className="skeleton-text large" />
      <div className="skeleton-text small" />
    </div>
  ))}
</div>

// Skeleton for Recent Interviews
<Card className="recent-sessions">
  <div className="skeleton-text large" style={{width: '40%'}} />
  {[1,2,3].map(i => (
    <div className="session-item skeleton" key={i}>
      <div className="skeleton-text" />
      <div className="skeleton-text small" />
    </div>
  ))}
</Card>
```

**CSS for Skeletons:**

```css
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-text,
.skeleton-icon {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

#### 3.3 Motivational Messaging System

**Component:** `MotivationalMessage`

**Requirements:**

- Rotate through personalized messages
- Context-aware based on user behavior
- Encouraging tone

**Message Types & Triggers:**

1. **Streak Maintenance**
   - Trigger: User hasn't practiced today
   - Message: "Keep your {streak}-day streak alive! Practice today 🔥"

2. **Improvement Recognition**
   - Trigger: Score improved in recent interview
   - Message: "Your {category} score improved by {amount} points! 📈"

3. **Milestone Celebration**
   - Trigger: Reached interview count milestone
   - Message: "Amazing! You've completed {count} interviews! 🎉"

4. **Comeback Encouragement**
   - Trigger: Haven't practiced in 3+ days
   - Message: "Welcome back! Ready to shake off the rust?"

5. **Consistency Praise**
   - Trigger: Practiced 3+ times this week
   - Message: "You're crushing it! {count} sessions this week 💪"

6. **Performance Praise**
   - Trigger: Recent high score (9+)
   - Message: "That {score}/10 score was incredible! Keep it up! ⭐"

**Layout:**

```jsx
<div className="motivational-banner">
  <Icon name={message.icon} />
  <p>{message.text}</p>
</div>
```

---

#### 3.4 Personalized Insights

**Component:** `InsightsWidget`

**Requirements:**

- Weekly/monthly performance summary
- Comparative stats ("You practiced 3x more this week!")
- Trend indicators

**Layout:**

```jsx
<Card className="insights-widget">
  <h3>Your Weekly Insights</h3>

  <div className="insight-item">
    <Icon name="trending-up" color="success" />
    <div>
      <h4>Great Progress!</h4>
      <p>You practiced 3x more than last week</p>
    </div>
  </div>

  <div className="insight-item">
    <Icon name="award" color="primary" />
    <div>
      <h4>Top 20% of Users</h4>
      <p>Your practice consistency puts you in the top tier</p>
    </div>
  </div>

  <div className="stats-comparison">
    <div className="stat">
      <span className="label">This week</span>
      <span className="value">{thisWeek} interviews</span>
    </div>
    <div className="stat">
      <span className="label">Last week</span>
      <span className="value">{lastWeek} interviews</span>
    </div>
  </div>
</Card>
```

---

## Mobile-First Layout Structure

### Recommended DOM Structure:

```html
<div className="premium-dashboard">
  <!-- Header -->
  <header className="dashboard-header">
    <!-- Logo, subscription badge, user menu -->
  </header>

  <!-- Main Content -->
  <main className="dashboard-content">
    <!-- Hero Section -->
    <section className="hero-section">
      <h1 className="greeting">Good morning, Alex! 🎯</h1>
      <Badge>Lifetime Access Active</Badge>
    </section>

    <!-- Quick Stats -->
    <section className="quick-stats">
      <div className="stats-grid">
        <!-- 4 stat cards -->
      </div>
    </section>

    <!-- Primary CTA -->
    <section className="primary-action">
      <StartInterviewCard />
    </section>

    <!-- Recent Sessions -->
    <section className="recent-sessions">
      <RecentInterviewsList />
    </section>

    <!-- Performance -->
    <section className="performance-section">
      <PerformanceCard />
    </section>

    <!-- Recommendations -->
    <section className="recommendations">
      <RecommendedPracticeCard />
    </section>

    <!-- Achievements -->
    <section className="achievements">
      <AchievementSection />
    </section>

    <!-- Subscription Info -->
    <section className="subscription">
      <SubscriptionCard />
    </section>

    <!-- Motivational -->
    <section className="motivational">
      <MotivationalMessage />
    </section>
  </main>
</div>
```

---

## Responsive Breakpoints

```css
/* Mobile First - Default styles for mobile */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .dashboard-content {
    padding: 32px 48px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .dashboard-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 64px;
  }

  /* Two column layout for certain sections */
  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
}
```

---

## API/Data Requirements

### Required Endpoints:

1. **GET /api/user/dashboard**
   - Returns all dashboard data in one call
   - Includes: user info, stats, recent interviews, recommendations

2. **GET /api/user/subscription**
   - Subscription details
   - Renewal date, status

3. **GET /api/interviews/recent**
   - Last 5 completed interviews
   - With scores and metadata

4. **GET /api/interviews/incomplete**
   - Any in-progress interviews

5. **GET /api/user/achievements**
   - Earned and available achievements
   - Streak data

### Expected Data Structures:

```typescript
interface DashboardData {
  user: {
    id: string;
    firstName: string;
    email: string;
    memberSince: Date;
  };

  subscription: {
    type: '2-day' | '7-day' | '30-day' | 'lifetime';
    status: 'active' | 'expiring' | 'expired';
    purchaseDate: Date;
    expirationDate?: Date; // For time-limited plans
    memberSince?: Date; // For lifetime
    daysRemaining?: number; // For 7-day and 30-day
    hoursRemaining?: number; // For 2-day
    daysElapsed?: number;
    hoursElapsed?: number;
    totalInterviews?: number; // Total ever for lifetime
    periodInterviews?: number; // During this period for time-limited
    price: number; // 29.99, 59.99, 99.99, 199.99
    currency: 'AUD';
    savings?: number; // For lifetime users
  };

  stats: {
    totalInterviews: number;
    averageScore: number;
    practiceStreak: number;
    totalHours: number;
    categoryScores: {
      communication: number;
      problemSolving: number;
      leadership: number;
    };
  };

  recentInterviews: Array<{
    id: string;
    role: string;
    company: string;
    completedAt: Date;
    overallScore: number;
  }>;

  incompleteInterview?: {
    id: string;
    role: string;
    company: string;
    completionPercent: number;
    estimatedMinutesRemaining: number;
  };

  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: Date;
  }>;

  recommendations: Array<{
    id: string;
    type: 'continue' | 'practice_weak' | 'new_challenge' | 'streak';
    title: string;
    description: string;
    metadata?: string;
    ctaText: string;
    ctaLink: string;
  }>;
}
```

---

## Accessibility Requirements

1. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Logical tab order
   - Visible focus indicators

2. **Screen Readers**
   - Proper heading hierarchy (h1 → h2 → h3)
   - Alt text for icons (use aria-label)
   - Descriptive button text

3. **Color Contrast**
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text
   - Don't rely on color alone

4. **Mobile Accessibility**
   - Touch targets minimum 44x44px
   - Adequate spacing between interactive elements

---

## Performance Considerations

1. **Initial Load**
   - Show skeleton loaders immediately
   - Fetch dashboard data in parallel
   - Render above-the-fold content first

2. **Images & Icons**
   - Use SVG icons (lighter weight)
   - Lazy load any images below fold

3. **Animations**
   - Use CSS transforms and opacity only
   - Respect prefers-reduced-motion
   - Keep animations subtle and purposeful

4. **Data Fetching**
   - Cache dashboard data (5 minute TTL)
   - Optimistic updates where possible
   - Handle offline gracefully

---

## Testing Checklist

### Functionality

- [ ] Dashboard loads successfully with all data
- [ ] Empty state shows for new users
- [ ] Skeleton loaders appear during data fetch
- [ ] All CTAs navigate correctly
- [ ] Stats calculate accurately
- [ ] Subscription status displays correctly
- [ ] Recommendations are relevant
- [ ] Achievements unlock properly

### Responsive Design

- [ ] Mobile (375px): Layout works, all text readable
- [ ] Tablet (768px): Stats show in 4-column grid
- [ ] Desktop (1024px+): Content centered, proper spacing
- [ ] Touch targets minimum 44px on mobile

### Visual Design

- [ ] Colors match design system
- [ ] Typography hierarchy clear
- [ ] Spacing consistent throughout
- [ ] Cards have proper shadows
- [ ] Icons are consistent style
- [ ] Gradients render correctly

### Performance

- [ ] Dashboard loads in <2 seconds
- [ ] No layout shift during load
- [ ] Smooth scrolling on mobile
- [ ] Animations are smooth (60fps)

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible

---

## Implementation Notes

### State Management

Use context or state management of your choice. Suggested structure:

```javascript
const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/user/dashboard');
      setDashboardData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContext.Provider
      value={{ dashboardData, loading, error, refetch: fetchDashboardData }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
```

### Error Handling

- Show friendly error messages
- Provide retry button
- Log errors for debugging
- Graceful degradation if some data missing

### Analytics Events to Track

- Dashboard viewed
- Start interview clicked
- Continue interview clicked
- Quick warmup clicked
- View details clicked (recent interviews)
- Achievement unlocked
- Streak milestone reached

---

## Success Metrics

Track these to measure dashboard effectiveness:

1. **Engagement Rate**: % of users who start interview from dashboard
2. **Time to Action**: How quickly users click "Start Interview"
3. **Return Rate**: % of users who return within 24 hours
4. **Completion Rate**: % of started interviews that are completed
5. **Feature Usage**: Which recommendations/CTAs get most clicks

---

## Future Enhancements (Post-Launch)

1. **Customizable Dashboard**
   - Let users rearrange sections
   - Show/hide certain widgets

2. **Goal Setting**
   - Set target interview date
   - Track progress toward goals
   - Interview countdown

3. **Social Features**
   - Compare progress with friends
   - Leaderboard (optional)

4. **Advanced Analytics**
   - Deeper performance insights
   - Trend analysis over time
   - Category-specific recommendations

5. **Calendar Integration**
   - Schedule practice sessions
   - Reminders

6. **Mobile App Optimization**
   - Push notifications for streaks
   - Offline mode
   - Quick launch widget

---

## Questions for Product Team

Before implementation, clarify:

1. What should happen if user has lifetime access? Show different messaging?
2. Should we limit how many stat cards show on mobile to reduce scroll?
3. For incomplete interviews, max how old before we stop showing "continue"?
4. Achievement system: Are these defined or should we suggest list?
5. Subscription countdown: How many days before renewal should we highlight it?
6. Empty state: Should we show onboarding tutorial or just simplified dashboard?
7. Error states: What should we show if API fails? Retry? Cached data?

---

## Final Notes

This dashboard should feel like a **personal training companion** - celebrating wins, encouraging consistency, and making it effortless to jump back into practice. Every element should either:

1. Help users start practicing faster
2. Show them their progress
3. Motivate them to continue

Avoid cluttering with unnecessary info. Keep the focus on action and progress.
