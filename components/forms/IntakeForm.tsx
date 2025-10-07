'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileDrop } from './FileDrop';
import { uploadFile } from '@/lib/upload-client';
import { toast } from 'sonner';

interface IntakeFormData {
  jobTitle: string;
  company: string;
  location: string;
  cv: File | null;
  jobDescription: string;
}

interface FormErrors {
  jobTitle?: string;
  company?: string;
  location?: string;
  cv?: string;
  jobDescription?: string;
}

export function IntakeForm() {
  const [formData, setFormData] = useState<IntakeFormData>({
    jobTitle: '',
    company: '',
    location: '',
    cv: null,
    jobDescription: '',
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

      // All successful
      toast.success('Setup complete!', {
        description: 'Your interview session is being created...',
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

      // TODO: Next task will create session and redirect
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
