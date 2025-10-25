import { createClient } from '@/lib/supabase-server';

export type FileType = 'cv' | 'jobspec' | 'extra' | 'audio' | 'report';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param type - The type of file (determines which bucket to use)
 * @param userId - The user ID (for organizing files)
 * @returns The storage key/path of the uploaded file
 */
export async function uploadFile(
  file: File,
  type: FileType,
  userId: string
): Promise<{ storageKey: string; error?: string }> {
  const supabase = await createClient();

  // Determine bucket based on type
  const bucket =
    type === 'audio' ? 'audio' : type === 'report' ? 'reports' : 'uploads';

  // Generate unique file name with timestamp
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${type}_${timestamp}.${fileExt}`;

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return { storageKey: '', error: error.message };
  }

  return { storageKey: data.path };
}

/**
 * Delete a file from Supabase Storage
 * @param storageKey - The storage path of the file
 * @param bucket - The bucket name
 */
export async function deleteFile(
  storageKey: string,
  bucket: 'uploads' | 'audio' | 'reports'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([storageKey]);

  if (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get a public URL for a file (for downloads)
 * @param storageKey - The storage path of the file
 * @param bucket - The bucket name
 */
export async function getFileUrl(
  storageKey: string,
  bucket: 'uploads' | 'audio' | 'reports'
): Promise<string> {
  const supabase = await createClient();

  const { data } = supabase.storage.from(bucket).getPublicUrl(storageKey);

  return data.publicUrl;
}

/**
 * T72: Get a signed (presigned) URL for a private file
 * @param storageKey - The storage path of the file
 * @param bucket - The bucket name
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL that expires after the specified time
 */
export async function getSignedUrl(
  storageKey: string,
  bucket: 'uploads' | 'audio' | 'reports',
  expiresIn: number = 3600
): Promise<{ signedUrl: string | null; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storageKey, expiresIn);

  if (error) {
    console.error('Error creating signed URL:', error);
    return { signedUrl: null, error: error.message };
  }

  return { signedUrl: data.signedUrl };
}
