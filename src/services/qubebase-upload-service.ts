import { supabase } from '@/integrations/supabase/client';

/**
 * QubeBase Upload Service
 * Handles uploads to the nakamoto-kb storage bucket with size limits
 */

const SOFT_LIMIT_MB = 500;
const HARD_LIMIT_MB = 1024; // 1 GiB
const SOFT_LIMIT_BYTES = SOFT_LIMIT_MB * 1024 * 1024;
const HARD_LIMIT_BYTES = HARD_LIMIT_MB * 1024 * 1024;

export interface UploadOptions {
  file: File;
  path: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
  warning?: string;
}

/**
 * Upload a file to the nakamoto-kb bucket
 */
export async function uploadToKB(options: UploadOptions): Promise<UploadResult> {
  const { file, path, onProgress } = options;

  try {
    // Check file size limits
    if (file.size > HARD_LIMIT_BYTES) {
      return {
        success: false,
        error: `File size (${formatBytes(file.size)}) exceeds hard limit of ${HARD_LIMIT_MB} MB`
      };
    }

    const warning = file.size >= SOFT_LIMIT_BYTES
      ? `Warning: File size (${formatBytes(file.size)}) exceeds recommended limit of ${SOFT_LIMIT_MB} MB`
      : undefined;

    console.log(`Uploading file to nakamoto-kb: ${path} (${formatBytes(file.size)})`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('nakamoto-kb')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL (will be signed for private bucket)
    const { data: urlData } = supabase.storage
      .from('nakamoto-kb')
      .getPublicUrl(data.path);

    console.log(`Upload successful: ${data.path}`);

    return {
      success: true,
      path: data.path,
      publicUrl: urlData.publicUrl,
      warning
    };
  } catch (error: any) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error.message || 'Unknown upload error'
    };
  }
}

/**
 * Upload multiple files in parallel
 */
export async function uploadMultipleToKB(
  files: Array<{ file: File; path: string }>,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  let completed = 0;

  for (const { file, path } of files) {
    const result = await uploadToKB({ file, path });
    results.push(result);
    completed++;
    onProgress?.(completed, files.length);
  }

  return results;
}

/**
 * Delete a file from nakamoto-kb bucket
 */
export async function deleteFromKB(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Deleting file from nakamoto-kb: ${path}`);

    const { error } = await supabase.storage
      .from('nakamoto-kb')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Delete successful: ${path}`);
    return { success: true };
  } catch (error: any) {
    console.error('Delete exception:', error);
    return { success: false, error: error.message || 'Unknown delete error' };
  }
}

/**
 * Get a signed URL for a private file (valid for 1 hour)
 */
export async function getSignedUrl(path: string): Promise<{ url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('nakamoto-kb')
      .createSignedUrl(path, 3600); // 1 hour

    if (error) {
      console.error('Signed URL error:', error);
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error: any) {
    console.error('Signed URL exception:', error);
    return { error: error.message || 'Unknown error' };
  }
}

/**
 * List files in the KB bucket
 */
export async function listKBFiles(path = '') {
  try {
    const { data, error } = await supabase.storage
      .from('nakamoto-kb')
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('List files error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('List files exception:', error);
    return { data: null, error };
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file size is within limits
 */
export function validateFileSize(file: File): { valid: boolean; error?: string; warning?: string } {
  if (file.size > HARD_LIMIT_BYTES) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds hard limit of ${HARD_LIMIT_MB} MB`
    };
  }

  if (file.size >= SOFT_LIMIT_BYTES) {
    return {
      valid: true,
      warning: `File size (${formatBytes(file.size)}) exceeds recommended limit of ${SOFT_LIMIT_MB} MB`
    };
  }

  return { valid: true };
}
