import { FileType } from './storage';

interface UploadResponse {
  success: boolean;
  storageKey?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
}

/**
 * Upload a file to the server
 * @param file - The file to upload
 * @param type - The type of file (cv, jobspec, etc.)
 * @returns Upload result with storage key
 */
export async function uploadFile(
  file: File,
  type: FileType
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Upload failed',
      };
    }

    return data;
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Network error during upload',
    };
  }
}

/**
 * Upload multiple files
 * @param files - Array of files to upload
 * @param type - The type of files
 * @returns Array of upload results
 */
export async function uploadFiles(
  files: File[],
  type: FileType
): Promise<UploadResponse[]> {
  const uploadPromises = files.map((file) => uploadFile(file, type));
  return Promise.all(uploadPromises);
}
