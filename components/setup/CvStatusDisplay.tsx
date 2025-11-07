'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDrop } from '@/components/forms/FileDrop';
import { uploadFile } from '@/lib/upload-client';
import { toast } from 'sonner';
import type { CvMetadata } from '@/lib/schema';

interface CvStatusDisplayProps {
  cvMetadata?: CvMetadata;
  onCvUpdate?: (newCvKey: string) => void;
  onFileSelect?: (file: File | null) => void;
  currentFile?: File | null;
  disabled?: boolean;
}

export function CvStatusDisplay({
  cvMetadata,
  onCvUpdate,
  onFileSelect,
  currentFile,
  disabled = false,
}: CvStatusDisplayProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(currentFile || null);
  const [isUploading, setIsUploading] = useState(false);

  const hasCvOnFile = !!cvMetadata;
  
  const handleFileSelect = (file: File | null) => {
    setCvFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const calculateTimeAgo = (dateString: string): string => {
    const uploadDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - uploadDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 90) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const isOldCv = (dateString: string): boolean => {
    const uploadDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - uploadDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 90; // 3+ months
  };

  const handleUpdateCv = async () => {
    if (!cvFile) {
      toast.error('Please select a CV file');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadFile(cvFile, 'cv');
      
      if (!result.success || !result.storageKey) {
        toast.error('CV upload failed', {
          description: result.error,
        });
        setIsUploading(false);
        return;
      }

      toast.success('CV updated successfully!');
      
      // Notify parent component
      if (onCvUpdate) {
        onCvUpdate(result.storageKey);
      }

      // Reset state
      setShowUpload(false);
      setCvFile(null);
      
      // Refresh the page to show new CV status
      window.location.reload();
    } catch (error) {
      console.error('CV update error:', error);
      toast.error('Failed to update CV');
      setIsUploading(false);
    }
  };

  // Show upload zone if no CV on file or user clicked Update
  if (!hasCvOnFile || showUpload) {
    return (
      <div className="space-y-3">
        <FileDrop
          onFileSelect={handleFileSelect}
          currentFile={cvFile}
          acceptedTypes={[
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
          ]}
          acceptedExtensions={['.pdf', '.doc', '.docx']}
          maxSizeMB={10}
        />
        {showUpload && (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUpdateCv}
              disabled={!cvFile || isUploading || disabled}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Upload New CV'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUpload(false);
                setCvFile(null);
              }}
              disabled={isUploading || disabled}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show CV status with Update button
  const timeAgo = calculateTimeAgo(cvMetadata.uploadDate);
  const isCvOld = isOldCv(cvMetadata.uploadDate);

  return (
    <div className="space-y-3">
      <div className={`p-4 rounded-lg border ${
        isCvOld 
          ? 'bg-amber-50 border-amber-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-slate-700 font-medium">
              Using CV on file (uploaded {timeAgo})
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {cvMetadata.filename}
            </p>
            {isCvOld && (
              <p className="text-xs text-amber-700 mt-2">
                Consider updating - this CV is over 3 months old
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUpload(true)}
            disabled={disabled}
            className="shrink-0"
          >
            Update CV
          </Button>
        </div>
      </div>
    </div>
  );
}

