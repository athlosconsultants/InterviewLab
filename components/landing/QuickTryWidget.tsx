'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { previewQuestions } from '@/lib/previewQuestions';
import { analyzeAnswer, type FeedbackPoint } from '@/lib/preview-feedback';

const ROLES = [
  'Software Engineer',
  'Product Manager',
  'Marketing Manager',
  'Data Analyst',
  'Sales Representative',
  'UX Designer',
];

export function QuickTryWidget() {
  const [selectedRole, setSelectedRole] = React.useState<string>('');
  const [answer, setAnswer] = React.useState<string>('');
  const [feedback, setFeedback] = React.useState<FeedbackPoint[] | null>(null);

  const question = selectedRole ? previewQuestions[selectedRole] : null;
  const charCount = answer.length;
  const minChars = 200;
  const isAnswerValid = charCount >= minChars;

  const handleSubmit = () => {
    const result = analyzeAnswer(answer);
    setFeedback(result);

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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      {/* Role Dropdown */}
      <div className="mb-4">
        <label
          htmlFor="role-select"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Select Your Role
        </label>
        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
      {question && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-900 leading-relaxed">
            {question}
          </p>
        </div>
      )}

      {/* Answer Input */}
      {question && (
        <div className="mb-4">
          <label
            htmlFor="answer-input"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Your Answer
          </label>
          <textarea
            id="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={
                isAnswerValid ? 'text-green-600 font-medium' : 'text-slate-500'
              }
            >
              {charCount} / {minChars} characters
            </span>
            {!isAnswerValid && charCount > 0 && (
              <span className="text-amber-600">
                {minChars - charCount} more characters needed
              </span>
            )}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {feedback && (
        <div className="mb-6 space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Your Feedback
          </h3>
          <ul className="space-y-2">
            {feedback.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <span className="text-lg flex-shrink-0">
                  {getIcon(point.type)}
                </span>
                <span className="text-sm text-slate-700 leading-relaxed">
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
          className="w-full"
        >
          Get Instant Feedback
        </Button>
      ) : (
        <Button className="w-full" size="lg">
          Get Your Full 3-Question Assessment →
        </Button>
      )}
    </div>
  );
}
