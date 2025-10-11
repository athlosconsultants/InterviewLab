'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileDrop } from './FileDrop';
import { uploadFile } from '@/lib/upload-client';
import { toast } from 'sonner';
import { createSession } from '@/app/setup/actions';
import { Mic, Type } from 'lucide-react';
import type { InterviewMode, PlanTier } from '@/lib/schema';

interface IntakeFormData {
  jobTitle: string;
  company: string;
  location: string;
  cv: File | null;
  jobDescription: string;
  mode: InterviewMode;
  stagesPlanned: number;
  questionsPerStage: number; // T128: Max questions per stage (1-10)
  planTier: PlanTier;
}

interface IntakeFormProps {
  onSuccess?: (data: {
    sessionId: string;
    jobTitle: string;
    company: string;
    location: string;
  }) => void;
}

interface FormErrors {
  jobTitle?: string;
  company?: string;
  location?: string;
  cv?: string;
  jobDescription?: string;
}

export function IntakeForm({ onSuccess }: IntakeFormProps = {}) {
  const [formData, setFormData] = useState<IntakeFormData>({
    jobTitle: '',
    company: '',
    location: '',
    cv: null,
    jobDescription: '',
    mode: 'text', // Default to text mode (T84)
    stagesPlanned: 1, // Default to 1 stage for free tier (T84)
    questionsPerStage: 3, // T128: Default to 3 questions for free tier
    planTier: 'free', // Default to free tier (T84)
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // T139: Check for active entitlements on component mount
  useEffect(() => {
    const checkEntitlements = async () => {
      try {
        const response = await fetch('/api/user/entitlements');
        const data = await response.json();

        if (data.remaining_interviews > 0) {
          // User has remaining interviews, enable paid features
          setFormData((prev) => ({
            ...prev,
            planTier: 'paid',
            mode: 'voice', // Default to voice mode for paid users
            stagesPlanned: 2, // Default to 2 stages for paid users
            questionsPerStage: 7, // T128: Default to 7 questions for paid users
          }));
        }
      } catch (error) {
        console.error('[T139] Failed to check entitlements:', error);
        // Keep default free tier if check fails
      }
    };

    checkEntitlements();
  }, []);

  const validateField = (
    field: keyof IntakeFormData,
    value: string | File | null
  ): string | undefined => {
    switch (field) {
      case 'jobTitle':
        if (typeof value === 'string') {
          if (!value.trim()) {
            return 'Job title is required';
          } else if (value.trim().length < 2) {
            return 'Job title must be at least 2 characters';
          }
        }
        break;
      case 'company':
        if (typeof value === 'string') {
          if (!value.trim()) {
            return 'Company name is required';
          } else if (value.trim().length < 2) {
            return 'Company name must be at least 2 characters';
          }
        }
        break;
      case 'location':
        if (typeof value === 'string' && !value.trim()) {
          return 'Location is required';
        }
        break;
      case 'cv':
        if (!value) {
          return 'CV/Resume is required';
        }
        break;
      case 'jobDescription':
        if (typeof value === 'string') {
          if (!value.trim()) {
            return 'Job description is required';
          } else if (value.trim().length < 50) {
            return 'Job description must be at least 50 characters';
          }
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      jobTitle: validateField('jobTitle', formData.jobTitle),
      company: validateField('company', formData.company),
      location: validateField('location', formData.location),
      cv: validateField('cv', formData.cv),
      jobDescription: validateField('jobDescription', formData.jobDescription),
    };

    // Remove undefined errors
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key as keyof FormErrors] === undefined) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload CV
      if (!formData.cv) {
        toast.error('CV is required');
        setIsSubmitting(false);
        return;
      }

      const cvResult = await uploadFile(formData.cv, 'cv');
      if (!cvResult.success) {
        toast.error('CV upload failed', {
          description: cvResult.error,
        });
        setIsSubmitting(false);
        return;
      }

      // Save job description text
      if (!formData.jobDescription.trim()) {
        toast.error('Job description is required');
        setIsSubmitting(false);
        return;
      }

      const jobDescResponse = await fetch('/api/upload-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.jobDescription,
          type: 'jobspec',
        }),
      });

      const jobDescResult = await jobDescResponse.json();
      if (!jobDescResult.success) {
        toast.error('Job description save failed', {
          description: jobDescResult.error,
        });
        setIsSubmitting(false);
        return;
      }

      // All uploads successful, now create the session
      toast.success('Files uploaded!', {
        description: 'Analyzing your materials...',
      });

      console.log('Upload results:', {
        cv: cvResult,
        jobDescription: jobDescResult,
        formData: {
          jobTitle: formData.jobTitle,
          company: formData.company,
          location: formData.location,
        },
      });

      // Create interview session with research snapshot (T84)
      const { sessionId, error: sessionError } = await createSession({
        jobTitle: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        mode: formData.mode,
        stagesPlanned: formData.stagesPlanned,
        questionsPerStage: formData.questionsPerStage, // T128: Pass question limit
        planTier: formData.planTier,
      });

      if (sessionError || !sessionId) {
        toast.error('Session creation failed', {
          description: sessionError || 'Please try again',
        });
        setIsSubmitting(false);
        return;
      }

      // Session created successfully
      toast.success('Interview ready!', {
        description: 'Preparing your interview...',
      });

      // Call onSuccess callback or handle locally
      if (onSuccess) {
        onSuccess({
          sessionId,
          jobTitle: formData.jobTitle,
          company: formData.company,
          location: formData.location,
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred', {
        description: 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, cv: file }));
    // Clear error when file is selected
    if (file && errors.cv) {
      setErrors((prev) => ({ ...prev, cv: undefined }));
    }
  };

  const isFormValid = () => {
    return (
      formData.jobTitle.trim() &&
      formData.company.trim() &&
      formData.location.trim() &&
      formData.cv &&
      formData.jobDescription.trim().length >= 50
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Title */}
      <div className="space-y-2">
        <Label htmlFor="jobTitle">
          Job Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="jobTitle"
          type="text"
          placeholder="e.g., Senior Software Engineer"
          value={formData.jobTitle}
          onChange={(e) => {
            setFormData({ ...formData, jobTitle: e.target.value });
            if (errors.jobTitle) {
              setErrors({ ...errors, jobTitle: undefined });
            }
          }}
          onBlur={() => {
            const error = validateField('jobTitle', formData.jobTitle);
            setErrors({ ...errors, jobTitle: error });
          }}
          className={errors.jobTitle ? 'border-destructive' : ''}
        />
        {errors.jobTitle && (
          <p className="text-sm text-destructive">{errors.jobTitle}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company">
          Company <span className="text-destructive">*</span>
        </Label>
        <Input
          id="company"
          type="text"
          placeholder="e.g., Google"
          value={formData.company}
          onChange={(e) => {
            setFormData({ ...formData, company: e.target.value });
            if (errors.company) {
              setErrors({ ...errors, company: undefined });
            }
          }}
          onBlur={() => {
            const error = validateField('company', formData.company);
            setErrors({ ...errors, company: error });
          }}
          className={errors.company ? 'border-destructive' : ''}
        />
        {errors.company && (
          <p className="text-sm text-destructive">{errors.company}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">
          Location <span className="text-destructive">*</span>
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="e.g., San Francisco, CA"
          value={formData.location}
          onChange={(e) => {
            setFormData({ ...formData, location: e.target.value });
            if (errors.location) {
              setErrors({ ...errors, location: undefined });
            }
          }}
          onBlur={() => {
            const error = validateField('location', formData.location);
            setErrors({ ...errors, location: error });
          }}
          className={errors.location ? 'border-destructive' : ''}
        />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location}</p>
        )}
      </div>

      {/* CV Upload */}
      <div className="space-y-2">
        <Label>
          Your CV/Resume <span className="text-destructive">*</span>
        </Label>
        <FileDrop
          onFileSelect={handleFileChange}
          acceptedExtensions={['.pdf', '.doc', '.docx']}
          acceptedTypes={[
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ]}
          label="Drop your CV/Resume here"
          currentFile={formData.cv}
        />
        {errors.cv && <p className="text-sm text-destructive">{errors.cv}</p>}
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="jobDescription">
          Job Description <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Paste the full job description here (minimum 50 characters)
        </p>
        <Textarea
          id="jobDescription"
          placeholder="e.g., Are you a dedicated Software Engineer in pursuit of a remarkable chance to invent innovative solutions..."
          value={formData.jobDescription}
          onChange={(e) => {
            setFormData({ ...formData, jobDescription: e.target.value });
            if (errors.jobDescription) {
              setErrors({ ...errors, jobDescription: undefined });
            }
          }}
          onBlur={() => {
            const error = validateField(
              'jobDescription',
              formData.jobDescription
            );
            setErrors({ ...errors, jobDescription: error });
          }}
          className={errors.jobDescription ? 'border-destructive' : ''}
          rows={10}
        />
        {errors.jobDescription && (
          <p className="text-sm text-destructive">{errors.jobDescription}</p>
        )}
      </div>

      {/* Interview Mode Toggle (T84) */}
      <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Interview Mode</Label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: 'text' })}
              disabled={formData.planTier === 'free'}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                formData.mode === 'text'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              } ${formData.planTier === 'free' && formData.mode !== 'text' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Type className="h-5 w-5" />
              <span className="font-medium">Text</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: 'voice' })}
              disabled={formData.planTier === 'free'}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                formData.mode === 'voice'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              } ${formData.planTier === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Mic className="h-5 w-5" />
              <span className="font-medium">Voice</span>
              {formData.planTier === 'free' && (
                <span className="ml-1 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                  Pro
                </span>
              )}
            </button>
          </div>
          {formData.planTier === 'free' && (
            <p className="text-xs text-muted-foreground">
              Voice mode is available with Pro tier
            </p>
          )}
        </div>

        {/* Interview Stages Selector (T84) */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Interview Stages</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, stagesPlanned: stage })
                }
                disabled={formData.planTier === 'free' && stage > 1}
                className={`flex-1 rounded-lg border-2 p-3 transition-colors ${
                  formData.stagesPlanned === stage
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                } ${formData.planTier === 'free' && stage > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="font-semibold">{stage}</span>
                {formData.planTier === 'free' && stage > 1 && (
                  <span className="ml-1 text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded">
                    Pro
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {formData.planTier === 'free'
              ? 'Free tier includes 1 stage with 3 questions'
              : `${formData.stagesPlanned} stage${formData.stagesPlanned > 1 ? 's' : ''} selected`}
          </p>
        </div>

        {/* T128: Questions Per Stage Selector (Paid Only) */}
        {formData.planTier === 'paid' && (
          <div className="space-y-3">
            <Label>Questions Per Stage</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.questionsPerStage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    questionsPerStage: parseInt(e.target.value),
                  })
                }
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-sm font-semibold text-primary min-w-[3ch] text-center">
                {formData.questionsPerStage}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Total interview length: ~
              {formData.questionsPerStage * formData.stagesPlanned} questions
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!isFormValid() || isSubmitting}
      >
        {isSubmitting ? 'Creating Session...' : 'Start Interview Setup'}
      </Button>
    </form>
  );
}
