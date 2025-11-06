'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Type, ArrowRight } from 'lucide-react';
import type { InterviewConfig } from '@/lib/schema';

interface InterviewConfigFormProps {
  onContinue: (config: InterviewConfig) => void;
  onBack: () => void;
  initialConfig?: Partial<InterviewConfig>;
  showHints?: boolean;
  isPremium?: boolean;
}

export function InterviewConfigForm({
  onContinue,
  onBack,
  initialConfig,
  showHints = false,
  isPremium = true,
}: InterviewConfigFormProps) {
  const [mode, setMode] = useState<'text' | 'voice'>(
    initialConfig?.mode || (isPremium ? 'voice' : 'text')
  );
  const [stages, setStages] = useState<1 | 2 | 3>(
    (initialConfig?.stages as 1 | 2 | 3) || 1
  );
  const [questionsPerStage, setQuestionsPerStage] = useState(
    initialConfig?.questionsPerStage || (isPremium ? 7 : 3)
  );

  // Calculate total questions and estimated time
  const totalQuestions = stages * questionsPerStage;
  const estimatedMinutes = Math.ceil(totalQuestions * 1.2); // ~1.2 min per question

  const handleContinue = () => {
    const config: InterviewConfig = {
      mode,
      stages,
      questionsPerStage,
    };
    onContinue(config);
  };

  return (
    <div className="space-y-8">
      {/* Interview Mode */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800">Interview Mode</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode('text')}
            disabled={!isPremium && mode !== 'text'}
            className={`flex-1 flex items-center justify-center gap-2 min-h-[56px] rounded-lg border-2 p-4 transition-all ${
              mode === 'text'
                ? 'border-blue-600 bg-blue-600/10'
                : 'border-slate-200 hover:border-blue-300'
            } ${!isPremium && mode !== 'text' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Type className="h-5 w-5" />
            <span className="font-medium">Text</span>
          </button>
          <button
            type="button"
            onClick={() => isPremium && setMode('voice')}
            disabled={!isPremium}
            className={`flex-1 flex items-center justify-center gap-2 min-h-[56px] rounded-lg border-2 p-4 transition-all ${
              mode === 'voice'
                ? 'border-blue-600 bg-blue-600/10'
                : 'border-slate-200 hover:border-blue-300'
            } ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Mic className="h-5 w-5" />
            <span className="font-medium">Voice</span>
            {!isPremium && (
              <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Premium
              </span>
            )}
          </button>
        </div>
        {showHints && initialConfig?.mode && (
          <p className="text-sm italic text-slate-600">
            (Last used: {initialConfig.mode === 'voice' ? 'Voice' : 'Text'})
          </p>
        )}
      </div>

      {/* Interview Depth */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800">Interview Depth</h2>
        <div className="flex gap-3">
          {([1, 2, 3] as const).map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => isPremium || stage === 1 ? setStages(stage) : null}
              disabled={!isPremium && stage > 1}
              className={`flex-1 flex items-center justify-center min-h-[56px] rounded-lg border-2 p-3 transition-all ${
                stages === stage
                  ? 'border-blue-600 bg-blue-600/10'
                  : 'border-slate-200 hover:border-blue-300'
              } ${!isPremium && stage > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-2xl font-semibold">{stage}</span>
              {!isPremium && stage > 1 && (
                <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  Premium
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-600">
          {isPremium
            ? `${stages} stage${stages > 1 ? 's' : ''} selected`
            : 'Free tier includes 1 stage with 3 questions'}
        </p>
        {showHints && initialConfig?.stages && (
          <p className="text-sm italic text-slate-600">
            (Last used: {initialConfig.stages})
          </p>
        )}
      </div>

      {/* Questions Per Stage */}
      {isPremium && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">
            Questions Per Stage
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="3"
              max="10"
              value={questionsPerStage}
              onChange={(e) => setQuestionsPerStage(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              style={{
                background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((questionsPerStage - 3) / 7) * 100}%, rgb(226, 232, 240) ${((questionsPerStage - 3) / 7) * 100}%, rgb(226, 232, 240) 100%)`,
              }}
            />
            <span className="text-lg font-semibold text-blue-600 min-w-[3ch] text-center">
              {questionsPerStage}
            </span>
          </div>
          {showHints && initialConfig?.questionsPerStage && (
            <p className="text-sm italic text-slate-600">
              (Last used: {initialConfig.questionsPerStage})
            </p>
          )}
        </div>
      )}

      {/* Total Display */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-slate-700">
          📊 Total: ~{totalQuestions} questions, ~{estimatedMinutes} min
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleContinue}
          className="w-full min-h-[56px] text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          Continue to Role Setup
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

