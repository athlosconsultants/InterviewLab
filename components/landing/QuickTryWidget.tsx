'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { previewQuestions } from '@/lib/previewQuestions';
import { analyzeAnswer, type FeedbackPoint } from '@/lib/preview-feedback';
import { track } from '@/lib/analytics';

// T65: Updated roles to match API
const ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'Designer',
  'Marketing Manager',
  'Consultant',
];

export function QuickTryWidget() {
  const [selectedRole, setSelectedRole] = React.useState<string>('');
  const [answer, setAnswer] = React.useState<string>('');
  const [feedback, setFeedback] = React.useState<FeedbackPoint[] | null>(null);
  const [question, setQuestion] = React.useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = React.useState(false);
  const charCount = answer.length;
  const minChars = 200;
  const isAnswerValid = charCount >= minChars;

  // T40: Track widget load
  React.useEffect(() => {
    track({ name: 'preview_widget_load' });
  }, []);

  // T65: Fetch question from API when role changes
  React.useEffect(() => {
    if (!selectedRole) {
      setQuestion(null);
      return;
    }

    // Reset answer and feedback when role changes
    setAnswer('');
    setFeedback(null);

    // Fetch question from API
    setIsLoadingQuestion(true);
    fetch(`/api/preview-question?role=${encodeURIComponent(selectedRole)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.question) {
          setQuestion(data.question);
          // T67: Track question served
          track({
            name: 'preview_question_served',
            payload: { role: selectedRole, source: data.source },
          });
        } else {
          // Fallback to static question
          setQuestion(previewQuestions[selectedRole] || null);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch question:', error);
        // Fallback to static question
        setQuestion(previewQuestions[selectedRole] || null);
      })
      .finally(() => {
        setIsLoadingQuestion(false);
      });
  }, [selectedRole]);

  // T40: Track role selection
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    if (role) {
      track({ name: 'preview_role_selected', payload: { role } });
    }
  };

  // T40: Track answer typed (>200 chars)
  React.useEffect(() => {
    if (charCount >= minChars && !feedback) {
      track({ name: 'preview_answer_typed', payload: { charCount } });
    }
  }, [charCount, minChars, feedback]);

  const handleSubmit = () => {
    // T40: Track submit clicked
    track({ name: 'preview_submit_clicked', payload: { role: selectedRole } });

    const result = analyzeAnswer(answer);
    setFeedback(result);

    // T40: Track feedback shown
    track({
      name: 'preview_feedback_shown',
      payload: { role: selectedRole, feedbackCount: result.length },
    });

    // Store to sessionStorage for carryover to assessment
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'quicktry',
        JSON.stringify({
          role: selectedRole,
          answer: answer,
        })
      );
    }
  };

  const getIcon = (type: FeedbackPoint['type']) => {
    switch (type) {
      case 'positive':
        return '✅';
      case 'negative':
        return '❌';
      case 'suggestion':
        return '💡';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-4 sm:p-6">
      {/* Role Dropdown */}
      <div className="mb-4">
        <label
          htmlFor="role-select"
          className="block text-sm font-semibold text-slate-900 mb-2"
        >
          Select Your Role
        </label>
        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 sm:py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 min-h-[44px] transition-all duration-200"
        >
          <option value="">Choose a role...</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Question Display */}
      {isLoadingQuestion && (
        <div className="mb-6 p-5 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 animate-pulse">
          <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-300 rounded w-1/2"></div>
        </div>
      )}
      {!isLoadingQuestion && question && (
        <div className="mb-6 p-5 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
            {question}
          </p>
        </div>
      )}

      {/* Answer Input */}
      {question && (
        <div className="mb-4">
          <label
            htmlFor="answer-input"
            className="block text-sm font-semibold text-slate-900 mb-2"
          >
            Your Answer
          </label>
          <textarea
            id="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="flex min-h-[120px] w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={
                isAnswerValid ? 'text-cyan-600 font-semibold' : 'text-slate-500'
              }
            >
              {charCount} / {minChars} characters
            </span>
            {!isAnswerValid && charCount > 0 && (
              <span className="text-blue-600 font-medium">
                {minChars - charCount} more characters needed
              </span>
            )}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {feedback && (
        <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-bold text-slate-900">Your Feedback</h3>
          <ul className="space-y-2">
            {feedback.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-50/50 to-blue-50/50 border-2 border-cyan-200 animate-in fade-in slide-in-from-left-2 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-lg flex-shrink-0">
                  {getIcon(point.type)}
                </span>
                <span className="text-sm text-slate-700 leading-relaxed font-medium">
                  {point.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button or CTA */}
      {!feedback ? (
        <Button
          disabled={!isAnswerValid}
          onClick={handleSubmit}
          size="default"
          className="w-full"
        >
          Get Instant Feedback
        </Button>
      ) : (
        <Link
          href="/assessment/setup?source=quicktry"
          className="block animate-in fade-in zoom-in-95 duration-300"
          style={{ animationDelay: `${feedback.length * 100 + 200}ms` }}
          onClick={() => {
            // T40: Track CTA clicked
            track({
              name: 'preview_cta_clicked',
              payload: { role: selectedRole },
            });
          }}
        >
          <Button size="default" className="w-full">
            Get Your Full 3-Question Assessment →
          </Button>
        </Link>
      )}
    </div>
  );
}
