'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  BarChart3,
  Pencil,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Mic,
  Type,
  Download,
  Home,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

// Dashboard Mockup - Exact copy of PremiumLandingView
function DashboardMockup() {
  return (
    <main className="premium-dashboard min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white">
      {/* Desktop Two-Column Layout */}
      <div className="flex mx-auto max-w-7xl px-12 py-8 pb-12 min-h-screen">
        <div className="flex gap-8 w-full">
          {/* LEFT COLUMN: Primary Actions */}
          <div className="flex-1 max-w-[680px] flex flex-col justify-between">
            {/* STATUS & WELCOME */}
            <div className="space-y-2 py-2">
              <h1 className="text-4xl font-light text-slate-800 tracking-tight">
                Good afternoon
              </h1>
              <p className="text-base text-slate-500 font-light tracking-wide">
                30-Day Pass<span className="mx-2">•</span>
                <span>28 days remaining</span>
              </p>
            </div>

            {/* PRIMARY CTA */}
            <div className="flex-1 flex flex-col justify-center space-y-6 my-8">
              <Button className="w-full h-32 text-2xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98] rounded-2xl">
                Start New Interview
                <span className="ml-3 text-3xl">→</span>
              </Button>
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <Button
                  variant="outline"
                  className="h-auto py-6 text-base font-semibold border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors rounded-xl"
                >
                  <BarChart3 className="h-5 w-5 mr-2 text-slate-500" />
                  Quick Session
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col justify-center text-base font-semibold border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors rounded-xl"
                >
                  <div className="flex items-center w-full justify-between">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-slate-500" />
                      View Reports
                    </div>
                    <span className="ml-auto text-xs text-slate-500">
                      Latest: 8.5/10
                    </span>
                  </div>
                </Button>
              </div>
            </div>

            {/* UTILITY FOOTER */}
            <div className="space-y-5 pt-6 mt-6 border-t border-slate-200/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-light">CV on file</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-2 px-3 text-sm text-slate-500 hover:text-slate-700"
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                <Link
                  href="#"
                  className="hover:text-slate-600 transition-colors"
                >
                  Settings
                </Link>
                <span>•</span>
                <Link
                  href="#"
                  className="hover:text-slate-600 transition-colors"
                >
                  Help
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Info & Stats */}
          <div className="w-[460px] flex flex-col space-y-5 py-2">
            {/* MOTIVATIONAL INSIGHT */}
            <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 p-6 border border-cyan-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white">
                  <Target className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-1">
                    Keep Building Momentum
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    You&apos;re on track! Consistent practice is the key to
                    interview success. Your recent sessions show steady
                    improvement.
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK STATS CARD */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 uppercase tracking-wide mb-5">
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-50">
                      <BarChart3 className="h-5 w-5 text-cyan-600" />
                    </div>
                    <span className="text-sm text-slate-600">
                      Total Interviews
                    </span>
                  </div>
                  <span className="text-2xl font-semibold text-slate-900">
                    12
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm text-slate-600">This Week</span>
                  </div>
                  <span className="text-2xl font-semibold text-green-600">
                    3
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-slate-600">
                      Average Score
                    </span>
                  </div>
                  <span className="text-2xl font-semibold text-slate-900">
                    8.5/10
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="text-sm text-slate-600">
                      Practice Time
                    </span>
                  </div>
                  <span className="text-2xl font-semibold text-slate-900">
                    6h
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Last session: 2 days ago
                  </span>
                </div>
              </div>
            </div>

            {/* NEXT MILESTONE */}
            <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 p-5 border border-cyan-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-cyan-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Next Milestone
                </h3>
              </div>
              <p className="text-xs text-slate-700 mb-3">
                8 more interviews to unlock advanced insights
              </p>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                  style={{ width: '20%' }}
                />
              </div>
              <div className="mt-2 text-xs text-cyan-700 font-medium">
                2/10 interviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Setup Mockup - Exact copy of IntakeForm structure
function SetupMockup() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            Configure Your Interview
          </h1>
          <p className="text-lg text-slate-600">
            Tell us about the role and we&apos;ll create a personalized
            interview session
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
          {/* Role Context Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Role Context
            </h2>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-sm font-medium">
                Job Title
              </Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Product Manager"
                value="Senior Product Manager"
                className="h-12"
                readOnly
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Company
              </Label>
              <Input
                id="company"
                placeholder="e.g. Google, Microsoft, or leave blank"
                value="Google"
                className="h-12"
                readOnly
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA or Remote"
                value="San Francisco, CA"
                className="h-12"
                readOnly
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-sm font-medium">
                Job Description (Optional)
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here for more accurate questions..."
                rows={6}
                className="resize-none"
                value="Leading product strategy and execution for our core platform. Working with cross-functional teams to deliver innovative solutions that delight our users. Must have 5+ years of product management experience."
                readOnly
              />
            </div>
          </div>

          {/* Interview Mode */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">
              Interview Mode
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Voice Mode - Selected */}
              <button className="relative flex flex-col items-center gap-4 rounded-xl border-2 border-cyan-600 bg-cyan-50/50 p-6 text-center transition-all hover:bg-cyan-50">
                <div className="absolute right-3 top-3">
                  <div className="h-5 w-5 rounded-full border-2 border-cyan-600 bg-cyan-600 flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                </div>
                <Mic className="h-10 w-10 text-cyan-600" />
                <div>
                  <div className="font-semibold text-slate-900">
                    Voice Interview
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Speak naturally, like a real conversation
                  </div>
                </div>
              </button>

              {/* Text Mode */}
              <button className="relative flex flex-col items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 text-center transition-all hover:border-slate-300">
                <div className="absolute right-3 top-3">
                  <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                </div>
                <Type className="h-10 w-10 text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-900">
                    Text Interview
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Type your responses at your own pace
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Interview Configuration */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">
              Configuration
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Interview Rounds</Label>
                <div className="text-2xl font-semibold text-slate-900">2</div>
                <p className="text-xs text-slate-500">
                  Multiple rounds for comprehensive practice
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Questions Per Round
                </Label>
                <div className="text-2xl font-semibold text-slate-900">7</div>
                <p className="text-xs text-slate-500">
                  ~30-45 minutes total duration
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12">
              Cancel
            </Button>
            <Button className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              Start Interview
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

// Interview Mockup - Exact copy of VoiceUI structure
function InterviewMockup() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="InterviewLab"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Senior Product Manager
              </h1>
              <p className="text-sm text-slate-500">Google • Round 1 of 2</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          {/* Question Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
                <span className="text-lg font-semibold text-white">Q3</span>
              </div>
              <div>
                <div className="text-sm font-medium text-cyan-600">
                  BEHAVIORAL • QUESTION 3 OF 14
                </div>
              </div>
            </div>
            <p className="text-2xl font-medium leading-relaxed text-slate-900">
              Tell me about a time when you had to make a difficult product
              decision that affected multiple stakeholders. How did you approach
              the situation, and what was the outcome?
            </p>
          </div>

          {/* Voice Interface */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center space-y-8">
              {/* Waveform */}
              <div className="flex h-24 items-center gap-1">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-cyan-500"
                    style={{
                      height: `${20 + Math.random() * 60}%`,
                      opacity: 0.3 + Math.random() * 0.7,
                    }}
                  />
                ))}
              </div>

              {/* Status */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-red-200 bg-red-50 px-4 py-2 mb-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-red-600">
                    Recording
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Speak clearly and naturally
                </p>
              </div>

              {/* Mic Button */}
              <button className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg hover:from-red-600 hover:to-red-700 transition-all">
                <Mic className="h-8 w-8 text-white" />
              </button>
              <p className="text-xs text-slate-500">Click to stop recording</p>
            </div>
          </div>

          {/* Timer & Progress */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              <span className="font-medium">Time remaining:</span> 85 seconds
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-medium">Progress:</span> 21% complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Report Mockup - Exact copy of ReportViewRedesigned
function ReportMockup() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-10">
        {/* Report Header */}
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold text-[#1F2937] leading-tight">
            Interview Report
          </h1>
          <p className="text-[18px] text-[#6B7280]">
            Senior Product Manager at Google
          </p>
          <p className="text-sm text-[#9CA3AF]">
            Completed 14 questions • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Overall Assessment Card */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center space-y-6">
            {/* Score Dial */}
            <div className="relative">
              <svg className="h-48 w-48 -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={`${(85 / 100) * 553} 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-[#1F2937]">85</div>
                <div className="text-lg text-[#6B7280]">Strong</div>
              </div>
            </div>

            <div className="text-center max-w-2xl">
              <h2 className="text-[22px] font-semibold text-[#1F2937] mb-3">
                Overall Assessment
              </h2>
              <p className="text-base text-[#4B5563] leading-relaxed">
                Strong performance demonstrating excellent product thinking and
                stakeholder management. Your responses showed clear structure
                and depth of experience, particularly in strategic
                decision-making scenarios.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <h2 className="text-[22px] font-semibold text-[#1F2937] mb-6">
            Performance Breakdown
          </h2>
          <div className="space-y-5">
            {[
              { label: 'Technical Competency', score: 82 },
              { label: 'Communication', score: 88 },
              { label: 'Problem Solving', score: 85 },
              { label: 'Cultural Fit', score: 83 },
            ].map((dim) => (
              <div key={dim.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1F2937]">
                    {dim.label}
                  </span>
                  <span className="text-sm font-semibold text-[#1F2937]">
                    {dim.score}/100
                  </span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full transition-all duration-500 ease-out rounded-full bg-[#3B82F6]"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <p className="text-sm text-[#4B5563] leading-relaxed pt-1">
                  {dim.label === 'Communication' &&
                    'Excellent clarity and structure in responses. Strong use of examples and metrics.'}
                  {dim.label === 'Technical Competency' &&
                    'Solid technical understanding with room for more depth in implementation details.'}
                  {dim.label === 'Problem Solving' &&
                    'Strong analytical approach with clear methodology. Good use of frameworks.'}
                  {dim.label === 'Cultural Fit' &&
                    'Well-aligned values and demonstrated collaborative mindset.'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="text-[18px] font-semibold text-[#10B981] mb-4">
              Key Strengths
            </h3>
            <ul className="space-y-3">
              {[
                'Clear and structured communication style',
                'Strong use of concrete examples and metrics',
                'Excellent stakeholder management approach',
                'Demonstrated strategic thinking',
              ].map((strength, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-[#10B981] mt-1">•</span>
                  <span className="text-sm text-[#4B5563] leading-relaxed">
                    {strength}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="text-[18px] font-semibold text-[#F59E0B] mb-4">
              Areas for Growth
            </h3>
            <ul className="space-y-3">
              {[
                'Consider adding more quantitative outcomes',
                'Elaborate on technical implementation details',
                'Discuss lessons learned more explicitly',
                'Include more cross-functional collaboration examples',
              ].map((improvement, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-[#F59E0B] mt-1">•</span>
                  <span className="text-sm text-[#4B5563] leading-relaxed">
                    {improvement}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-[#E5E7EB]">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
