'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type MockupScreen = 'dashboard' | 'setup' | 'interview' | 'report';

export default function MockupsPage() {
  const [activeScreen, setActiveScreen] = useState<MockupScreen>('dashboard');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">
              Marketing Mockups
            </h1>
            <div className="flex gap-2">
              <Button
                variant={activeScreen === 'dashboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveScreen('dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant={activeScreen === 'setup' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveScreen('setup')}
              >
                Setup
              </Button>
              <Button
                variant={activeScreen === 'interview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveScreen('interview')}
              >
                Interview
              </Button>
              <Button
                variant={activeScreen === 'report' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveScreen('report')}
              >
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mockup Screens */}
      <div className="w-full">
        {activeScreen === 'dashboard' && <DashboardMockup />}
        {activeScreen === 'setup' && <SetupMockup />}
        {activeScreen === 'interview' && <InterviewMockup />}
        {activeScreen === 'report' && <ReportMockup />}
      </div>
    </div>
  );
}

// Dashboard Mockup
function DashboardMockup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="InterviewLab"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              InterviewLab
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              sarah.chen@email.com
            </div>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, Sarah 👋</h1>
          <p className="text-lg text-muted-foreground">
            Your premium interview preparation hub
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-cyan-600 text-3xl">📊</div>
              <div className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs px-3 py-1 rounded-full font-semibold">
                Active
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-sm text-muted-foreground">
              Interviews Completed
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-green-600 text-3xl">⭐</div>
              <div className="bg-green-500/20 text-green-700 dark:text-green-300 text-xs px-3 py-1 rounded-full font-semibold">
                Improving
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">8.2/10</div>
            <div className="text-sm text-muted-foreground">
              Average Performance
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-purple-600 text-3xl">🎯</div>
              <div className="bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs px-3 py-1 rounded-full font-semibold">
                Premium
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">45</div>
            <div className="text-sm text-muted-foreground">Days Remaining</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Interview Card */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
            <div className="relative z-10">
              <div className="text-4xl mb-4">🎤</div>
              <h2 className="text-2xl font-bold mb-2">Start New Interview</h2>
              <p className="text-cyan-100 mb-6">
                Practice with AI-powered interview simulations
              </p>
              <Button
                className="bg-white text-cyan-600 hover:bg-cyan-50"
                size="lg"
              >
                Begin Practice Session
              </Button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6">Recent Sessions</h2>
            <div className="space-y-4">
              {[
                {
                  role: 'Senior Product Manager',
                  company: 'Tech Corp',
                  score: 8.5,
                  date: '2 days ago',
                },
                {
                  role: 'Software Engineer',
                  company: 'StartupXYZ',
                  score: 7.8,
                  date: '5 days ago',
                },
                {
                  role: 'Data Analyst',
                  company: 'Analytics Inc',
                  score: 9.1,
                  date: '1 week ago',
                },
              ].map((session, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold">{session.role}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.company} • {session.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-600">
                      {session.score}
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📄',
                title: 'CV Analysis',
                desc: 'Upload and analyze your resume',
              },
              {
                icon: '🎯',
                title: 'Custom Questions',
                desc: 'Tailored to your role and industry',
              },
              {
                icon: '📊',
                title: 'Detailed Reports',
                desc: 'In-depth performance analysis',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Setup Mockup
function SetupMockup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="InterviewLab"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">Setup Interview</span>
          </div>
          <Button variant="ghost" size="sm">
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {[
              { label: 'Role', active: true, complete: true },
              { label: 'Documents', active: true, complete: true },
              { label: 'Configure', active: true, complete: false },
              { label: 'Ready', active: false, complete: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step.complete
                        ? 'bg-cyan-600 text-white'
                        : step.active
                          ? 'bg-cyan-600/20 text-cyan-600 border-2 border-cyan-600'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.complete ? '✓' : i + 1}
                  </div>
                  <div className="text-xs mt-2 font-medium">{step.label}</div>
                </div>
                {i < 3 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      step.complete ? 'bg-cyan-600' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Configure Your Interview</h2>

          <div className="space-y-6">
            {/* Role Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Job Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-600"
                value="Senior Product Manager"
                readOnly
              />
            </div>

            {/* Company Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-600"
                value="Google"
                readOnly
              />
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Interview Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-cyan-600 bg-cyan-600/10 rounded-lg p-4 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">🎤</div>
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-600 bg-cyan-600 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="font-semibold">Voice Interview</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Speak your answers naturally
                  </div>
                </div>
                <div className="border border-border rounded-lg p-4 cursor-pointer hover:border-cyan-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">⌨️</div>
                    <div className="w-5 h-5 rounded-full border-2 border-muted" />
                  </div>
                  <div className="font-semibold">Text Interview</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Type your responses
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map((level, i) => (
                  <div
                    key={i}
                    className={`border rounded-lg p-3 text-center cursor-pointer ${
                      i === 1
                        ? 'border-cyan-600 bg-cyan-600/10 font-semibold'
                        : 'border-border hover:border-cyan-600/50'
                    }`}
                  >
                    {level}
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Interview Duration
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="30"
                  value="15"
                  className="flex-1"
                  readOnly
                />
                <div className="text-lg font-bold text-cyan-600">
                  15 questions
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Estimated time: 30-45 minutes
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="flex-1">
            Back
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            Continue to Preview
          </Button>
        </div>
      </main>
    </div>
  );
}

// Interview Mockup
function InterviewMockup() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="InterviewLab"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <div>
                <div className="font-semibold">Senior Product Manager</div>
                <div className="text-xs text-muted-foreground">
                  Google • Voice Interview
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">
                Question <span className="text-cyan-600">3</span> of 15
              </div>
              <Button variant="outline" size="sm">
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-cyan-600 to-blue-600"
          style={{ width: '20%' }}
        />
      </div>

      {/* Main Interview Area */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full space-y-8">
          {/* Question Display */}
          <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-600/20 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                AI
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-semibold">
                  Question 3 • Product Strategy
                </div>
                <div className="text-xl font-medium leading-relaxed">
                  &ldquo;Tell me about a time when you had to make a difficult
                  product decision that affected multiple stakeholders. How did
                  you approach the situation, and what was the outcome?&rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* Voice Controls */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex flex-col items-center">
              {/* Waveform Visualization */}
              <div className="flex items-center justify-center gap-1 h-20 mb-6">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyan-600 rounded-full"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      opacity: 0.3 + Math.random() * 0.7,
                    }}
                  />
                ))}
              </div>

              {/* Recording Status */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-red-600">
                    Recording
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Speak clearly and take your time
                </div>
              </div>

              {/* Control Button */}
              <button className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 flex items-center justify-center text-white text-3xl shadow-lg hover:shadow-xl transition-all">
                ⏹
              </button>
              <div className="text-xs text-muted-foreground mt-3">
                Click to stop recording
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">💡</div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">Pro Tip</div>
                <div className="text-sm text-muted-foreground">
                  Structure your answer using the STAR method: Situation, Task,
                  Action, Result. This helps ensure you cover all important
                  aspects of your experience.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Report Mockup
function ReportMockup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="InterviewLab"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">Interview Report</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Download PDF
            </Button>
            <Button size="sm">New Interview</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Overall Score */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">Overall Performance</div>
              <div className="text-5xl font-bold mb-2">8.5/10</div>
              <div className="text-cyan-100">Strong performance overall!</div>
            </div>
            <div className="text-8xl">🎯</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Communication',
              score: 9.2,
              icon: '💬',
              color: 'cyan',
            },
            {
              label: 'Technical Skills',
              score: 8.8,
              icon: '⚙️',
              color: 'blue',
            },
            {
              label: 'Problem Solving',
              score: 8.0,
              icon: '🧠',
              color: 'purple',
            },
            { label: 'Confidence', score: 7.9, icon: '⭐', color: 'green' },
          ].map((metric, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="text-3xl mb-3">{metric.icon}</div>
              <div className="text-2xl font-bold mb-1">{metric.score}</div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${metric.color}-600`}
                  style={{ width: `${metric.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💪</span>
              Key Strengths
            </h3>
            <div className="space-y-4">
              {[
                'Clear and structured communication style',
                'Strong use of concrete examples and metrics',
                'Good understanding of stakeholder management',
                'Confident delivery and professional demeanor',
              ].map((strength, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 flex-shrink-0">
                    ✓
                  </div>
                  <div className="text-sm">{strength}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Growth Opportunities
            </h3>
            <div className="space-y-4">
              {[
                'Consider adding more quantitative outcomes',
                'Practice maintaining eye contact',
                'Reduce use of filler words (&ldquo;um&rdquo;, &ldquo;like&rdquo;)',
                'Elaborate more on leadership decisions',
              ].map((improvement, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-600 flex-shrink-0">
                    →
                  </div>
                  <div className="text-sm">{improvement}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6">
            Question-by-Question Analysis
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Tell me about yourself and your background',
                score: 9.0,
                category: 'Introduction',
              },
              {
                q: 'Describe a challenging project you led',
                score: 8.5,
                category: 'Leadership',
              },
              {
                q: 'How do you prioritize features in a product roadmap?',
                score: 8.8,
                category: 'Product Strategy',
              },
              {
                q: 'Tell me about a time you disagreed with stakeholders',
                score: 7.5,
                category: 'Conflict Resolution',
              },
              {
                q: 'How would you measure success for a new feature?',
                score: 9.2,
                category: 'Analytics',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium mb-1">{item.q}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.category}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div
                    className={`text-lg font-bold ${
                      item.score >= 9
                        ? 'text-green-600'
                        : item.score >= 8
                          ? 'text-cyan-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {item.score}
                  </div>
                  <div className="text-xs text-muted-foreground">/ 10</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-8 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-600/20 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Recommended Next Steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '📚',
                title: 'Study Resources',
                desc: 'Review stakeholder management frameworks',
              },
              {
                icon: '🎤',
                title: 'Practice More',
                desc: 'Focus on leadership scenarios',
              },
              {
                icon: '👥',
                title: 'Mock Interviews',
                desc: 'Schedule with industry peers',
              },
            ].map((action, i) => (
              <div key={i} className="bg-card rounded-xl p-4">
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="font-semibold mb-1">{action.title}</div>
                <div className="text-sm text-muted-foreground">
                  {action.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            Schedule Another Interview
          </Button>
        </div>
      </main>
    </div>
  );
}
