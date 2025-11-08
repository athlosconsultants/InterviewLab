'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDrop } from '@/components/forms/FileDrop';
import { uploadFile } from '@/lib/upload-client';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { invalidateCacheOnCvUpload } from '@/lib/cache-manager';

interface CvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasCv: boolean;
}

export function CvUploadModal({ isOpen, onClose, hasCv }: CvUploadModalProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!cvFile) {
      toast.error('Please select a CV file');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadFile(cvFile, 'cv');
      
      if (!result.success) {
        toast.error('CV upload failed', {
          description: result.error,
        });
        return;
      }

      toast.success(hasCv ? 'CV updated successfully' : 'CV uploaded successfully');
      
      // Invalidate cache since user data changed
      invalidateCacheOnCvUpload();
      
      // Refresh the page to show new CV status
      window.location.reload();
    } catch (error) {
      toast.error('Failed to upload CV');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          disabled={isUploading}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-light text-slate-800 mb-2">
          {hasCv ? 'Update Your CV' : 'Upload Your CV'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {hasCv 
            ? 'Replace your existing CV with a new version' 
            : 'Upload your CV to get personalized interview practice'}
        </p>

        {/* File Drop */}
        <div className="mb-6">
          <FileDrop
            onFileSelect={(file) => setCvFile(file)}
            currentFile={cvFile}
            acceptedTypes={[
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/msword',
            ]}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!cvFile || isUploading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {isUploading ? 'Uploading...' : hasCv ? 'Update CV' : 'Upload CV'}
          </Button>
        </div>
      </div>
    </div>
  );
}

