'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CvStatusDisplay } from './CvStatusDisplay';
import { ArrowRight } from 'lucide-react';
import type { RoleContext, CvMetadata } from '@/lib/schema';

interface RoleContextFormProps {
  onSubmit: (context: RoleContext, cvFile: File | null) => Promise<void>;
  onBack: () => void;
  initialContext?: Partial<RoleContext>;
  cvMetadata?: CvMetadata;
  showHints?: boolean;
  isSubmitting?: boolean;
  suggestions?: {
    roles: string[];
    companies: string[];
  };
}

interface FormErrors {
  jobTitle?: string;
  company?: string;
  cv?: string;
}

export function RoleContextForm({
  onSubmit,
  onBack,
  initialContext,
  cvMetadata,
  showHints = false,
  isSubmitting = false,
  suggestions,
}: RoleContextFormProps) {
  const [jobTitle, setJobTitle] = useState(initialContext?.jobTitle || '');
  const [company, setCompany] = useState(initialContext?.company || '');
  const [location, setLocation] = useState(initialContext?.location || '');
  const [jobDescription, setJobDescription] = useState(initialContext?.jobDescription || '');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasCvOnFile = !!cvMetadata;
  
  // Auto-expand textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [jobDescription]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    } else if (jobTitle.trim().length < 2) {
      newErrors.jobTitle = 'Job title must be at least 2 characters';
    }

    if (!company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (company.trim().length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    }

    if (!hasCvOnFile && !cvFile) {
      newErrors.cv = 'CV/Resume is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const context: RoleContext = {
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      location: location.trim() || undefined,
      cvFileKey: cvMetadata?.s3Key,
      jobDescription: jobDescription.trim() || undefined,
    };

    await onSubmit(context, cvFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Title */}
      <div className="space-y-2">
        <Label htmlFor="jobTitle" className="text-sm font-semibold tracking-wide uppercase text-slate-800">
          Job Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="jobTitle"
          type="text"
          placeholder="e.g., Senior Software Engineer"
          value={jobTitle}
          onChange={(e) => {
            setJobTitle(e.target.value);
            if (errors.jobTitle) setErrors({ ...errors, jobTitle: undefined });
          }}
          className={`h-12 text-base ${errors.jobTitle ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
          autoComplete="organization-title"
          autoCapitalize="words"
          enterKeyHint="next"
          list={suggestions?.roles && suggestions.roles.length > 0 ? "role-suggestions" : undefined}
        />
        {suggestions?.roles && suggestions.roles.length > 0 && (
          <datalist id="role-suggestions">
            {suggestions.roles.map((role, index) => (
              <option key={index} value={role} />
            ))}
          </datalist>
        )}
        {showHints && initialContext?.jobTitle && (
          <p className="text-sm italic text-slate-600">(From last interview)</p>
        )}
        {errors.jobTitle && (
          <p className="text-sm text-red-500">{errors.jobTitle}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company" className="text-sm font-semibold tracking-wide uppercase text-slate-800">
          Company <span className="text-red-500">*</span>
        </Label>
        <Input
          id="company"
          type="text"
          placeholder="e.g., Google"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
            if (errors.company) setErrors({ ...errors, company: undefined });
          }}
          className={`h-12 text-base ${errors.company ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
          autoComplete="organization"
          autoCapitalize="words"
          enterKeyHint="next"
          list={suggestions?.companies && suggestions.companies.length > 0 ? "company-suggestions" : undefined}
        />
        {suggestions?.companies && suggestions.companies.length > 0 && (
          <datalist id="company-suggestions">
            {suggestions.companies.map((comp, index) => (
              <option key={index} value={comp} />
            ))}
          </datalist>
        )}
        {showHints && initialContext?.company && (
          <p className="text-sm italic text-slate-600">(From last interview)</p>
        )}
        {errors.company && (
          <p className="text-sm text-red-500">{errors.company}</p>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-slate-500">
            Optional (Better Questions)
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-semibold tracking-wide uppercase text-slate-800">
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="e.g., San Francisco, CA"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-12 text-base"
          disabled={isSubmitting}
          autoComplete="address-level2"
          autoCapitalize="words"
          enterKeyHint="done"
        />
        {showHints && initialContext?.location && (
          <p className="text-sm italic text-slate-600">(From last interview)</p>
        )}
      </div>

      {/* CV Upload or Status */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold tracking-wide uppercase text-slate-800">
          CV/Resume {!hasCvOnFile && <span className="text-red-500">*</span>}
        </Label>
        <CvStatusDisplay
          cvMetadata={cvMetadata}
          onFileSelect={(file) => {
            setCvFile(file);
            if (errors.cv) setErrors({ ...errors, cv: undefined });
          }}
          currentFile={cvFile}
          onCvUpdate={(newCvKey) => {
            // Update the cvFileKey in context for submission
            // The component will reload the page after update
          }}
          disabled={isSubmitting}
        />
        {errors.cv && <p className="text-sm text-red-500">{errors.cv}</p>}
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="jobDescription" className="text-sm font-semibold tracking-wide uppercase text-slate-800">
          Job Description
        </Label>
        <Textarea
          ref={textareaRef}
          id="jobDescription"
          placeholder="Paste key requirements or URL..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
          className="text-base resize-y min-h-[120px] max-h-[400px] overflow-y-auto"
          disabled={isSubmitting}
          enterKeyHint="done"
        />
        <p className="text-xs text-slate-500">
          Optional: Paste the job description or key requirements to get more
          tailored questions
        </p>
      </div>

      {/* Contextual Help Message */}
      {hasCvOnFile && showHints && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-slate-700">
            ℹ️ Interviewing for same role? Just tap Start below
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[56px] text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Starting Interview...
            </>
          ) : (
            <>
              Start Interview
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          ← Back
        </button>
      </div>
    </form>
  );
}

