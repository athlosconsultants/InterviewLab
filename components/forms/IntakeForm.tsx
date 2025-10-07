'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IntakeFormData {
  jobTitle: string;
  company: string;
  location: string;
  cv: File | null;
  jobSpec: File | null;
}

interface FormErrors {
  jobTitle?: string;
  company?: string;
  location?: string;
  cv?: string;
  jobSpec?: string;
}

export function IntakeForm() {
  const [formData, setFormData] = useState<IntakeFormData>({
    jobTitle: '',
    company: '',
    location: '',
    cv: null,
    jobSpec: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      case 'jobSpec':
        if (!value) {
          return 'Job specification is required';
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
      jobSpec: validateField('jobSpec', formData.jobSpec),
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

    // TODO: T32 will implement actual upload logic
    console.log('Form submitted:', formData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
  };

  const handleFileChange = (field: 'cv' | 'jobSpec', file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    // Clear error when file is selected
    if (file && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = () => {
    return (
      formData.jobTitle.trim() &&
      formData.company.trim() &&
      formData.location.trim() &&
      formData.cv &&
      formData.jobSpec
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
        <Label htmlFor="cv">
          Your CV/Resume <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cv"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            handleFileChange('cv', file);
          }}
          className={errors.cv ? 'border-destructive' : ''}
        />
        {formData.cv && (
          <p className="text-sm text-muted-foreground">
            Selected: {formData.cv.name} ({(formData.cv.size / 1024).toFixed(1)}{' '}
            KB)
          </p>
        )}
        {errors.cv && <p className="text-sm text-destructive">{errors.cv}</p>}
      </div>

      {/* Job Spec Upload */}
      <div className="space-y-2">
        <Label htmlFor="jobSpec">
          Job Description/Specification{' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="jobSpec"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            handleFileChange('jobSpec', file);
          }}
          className={errors.jobSpec ? 'border-destructive' : ''}
        />
        {formData.jobSpec && (
          <p className="text-sm text-muted-foreground">
            Selected: {formData.jobSpec.name} (
            {(formData.jobSpec.size / 1024).toFixed(1)} KB)
          </p>
        )}
        {errors.jobSpec && (
          <p className="text-sm text-destructive">{errors.jobSpec}</p>
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
