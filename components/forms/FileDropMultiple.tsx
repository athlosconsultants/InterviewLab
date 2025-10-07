'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FileDropMultipleProps {
  onFilesChange: (files: File[]) => void;
  acceptedTypes?: string[];
  acceptedExtensions?: string[];
  maxSizeMB?: number;
  maxFiles?: number;
  label?: string;
  currentFiles?: File[];
}

export function FileDropMultiple({
  onFilesChange,
  acceptedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ],
  acceptedExtensions = [
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.docx',
    '.doc',
    '.txt',
  ],
  maxSizeMB = 10,
  maxFiles = 3,
  label = 'Drop your files here',
  currentFiles = [],
}: FileDropMultipleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType =
      acceptedTypes.includes(file.type) ||
      acceptedExtensions.includes(fileExtension);

    if (!isValidType) {
      toast.error('Invalid file type', {
        description: `Please upload one of: ${acceptedExtensions.join(', ')}`,
      });
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error('File too large', {
        description: `Maximum file size is ${maxSizeMB}MB. Your file is ${fileSizeMB.toFixed(1)}MB.`,
      });
      return false;
    }

    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(Array.from(selectedFiles));
    }
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const processFiles = (newFiles: File[]) => {
    // Check if we'd exceed the max file count
    const remainingSlots = maxFiles - currentFiles.length;

    if (remainingSlots === 0) {
      toast.error('Maximum files reached', {
        description: `You can only upload up to ${maxFiles} files.`,
      });
      return;
    }

    // Limit to remaining slots
    const filesToAdd = newFiles.slice(0, remainingSlots);

    if (newFiles.length > remainingSlots) {
      toast.warning('Some files not added', {
        description: `Only ${remainingSlots} file(s) can be added. Maximum is ${maxFiles} files.`,
      });
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of filesToAdd) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...currentFiles, ...validFiles];
      onFilesChange(updatedFiles);

      if (validFiles.length === 1) {
        toast.success('File uploaded', {
          description: `${validFiles[0].name} (${(validFiles[0].size / 1024).toFixed(1)} KB)`,
        });
      } else {
        toast.success('Files uploaded', {
          description: `${validFiles.length} file(s) added successfully`,
        });
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const canAddMore = currentFiles.length < maxFiles;

  return (
    <div className="space-y-2">
      {/* Existing files */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          {currentFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
        >
          <input
            type="file"
            accept={acceptedExtensions.join(',')}
            onChange={handleFileInput}
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground">
              {acceptedExtensions.join(', ').toUpperCase()} (max {maxSizeMB}MB
              each)
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {currentFiles.length}/{maxFiles} files
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
