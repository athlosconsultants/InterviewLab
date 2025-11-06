'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileDrop } from '@/components/forms/FileDrop';
import { ArrowRight } from 'lucide-react';
import type { RoleContext, CvMetadata } from '@/lib/schema';

interface RoleContextFormProps {
  onSubmit: (context: RoleContext, cvFile: File | null) => Promise<void>;
  onBack: () => void;
  initialContext?: Partial<RoleContext>;
  cvMetadata?: CvMetadata;
  showHints?: boolean;
  isSubmitting?: boolean;
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
}: RoleContextFormProps) {
  const [jobTitle, setJobTitle] = useState(initialContext?.jobTitle || '');
  const [company, setCompany] = useState(initialContext?.company || '');
  const [location, setLocation] = useState(initialContext?.location || '');
  const [jobDescription, setJobDescription] = useState(initialContext?.jobDescription || '');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const hasCvOnFile = !!cvMetadata;

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
        <Label htmlFor="jobTitle" className="text-sm font-medium">
          What role? <span className="text-red-500">*</span>
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
        />
        {showHints && initialContext?.jobTitle && (
          <p className="text-sm italic text-slate-600">(From last interview)</p>
        )}
        {errors.jobTitle && (
          <p className="text-sm text-red-500">{errors.jobTitle}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company" className="text-sm font-medium">
          At which company? <span className="text-red-500">*</span>
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
        />
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
        <Label htmlFor="location" className="text-sm font-medium">
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
        <Label className="text-sm font-medium">
          📎 Your CV/Resume {!hasCvOnFile && <span className="text-red-500">*</span>}
        </Label>
        {hasCvOnFile ? (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-slate-700">
              ✓ Using CV on file (uploaded{' '}
              {calculateTimeAgo(cvMetadata.uploadDate)})
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {cvMetadata.filename}
            </p>
          </div>
        ) : (
          <FileDrop
            onFileSelect={(file) => {
              setCvFile(file);
              if (errors.cv) setErrors({ ...errors, cv: undefined });
            }}
            currentFile={cvFile}
            acceptedTypes={[
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/msword',
            ]}
            acceptedExtensions={['.pdf', '.doc', '.docx']}
            maxSizeMB={10}
          />
        )}
        {errors.cv && <p className="text-sm text-red-500">{errors.cv}</p>}
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="jobDescription" className="text-sm font-medium">
          📋 Job Description
        </Label>
        <Textarea
          id="jobDescription"
          placeholder="Paste key requirements or URL..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          className="text-base resize-vertical"
          disabled={isSubmitting}
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

// Helper function to calculate time ago
function calculateTimeAgo(dateString: string): string {
  const uploadDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - uploadDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 90) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

