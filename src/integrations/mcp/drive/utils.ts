
import { toast } from 'sonner';

/**
 * Document type utility functions
 */

/**
 * Get the appropriate export MIME type for Google Workspace files
 */
export function getExportMimeType(originalMimeType: string): string {
  switch (originalMimeType) {
    case 'application/vnd.google-apps.document':
      return 'text/plain';
    case 'application/vnd.google-apps.spreadsheet':
      return 'text/csv';
    case 'application/vnd.google-apps.presentation':
      return 'text/plain';
    default:
      return 'text/plain';
  }
}

/**
 * Get simplified document type from MIME type
 */
export function getDocumentType(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'sheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slide';
  if (mimeType.includes('text') || mimeType.includes('txt')) return 'txt';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('audio')) return 'audio';
  if (mimeType.includes('video')) return 'video';
  return 'file';
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  
  // Check for common auth error patterns
  if (typeof error === 'object') {
    const errorStr = JSON.stringify(error).toLowerCase();
    return errorStr.includes('auth') && (
      errorStr.includes('unauthorized') ||
      errorStr.includes('unauthenticated') ||
      errorStr.includes('invalid') ||
      errorStr.includes('expired') ||
      errorStr.includes('revoked') ||
      errorStr.includes('permission')
    );
  }
  
  return false;
}

/**
 * Show toasts for different connection states
 */
export function showConnectionToast(
  state: 'loading' | 'connecting' | 'error' | 'success' | 'verifying', 
  message?: string
): void {
  const id = 'drive-connect';
  
  switch(state) {
    case 'loading':
      toast.loading(message || 'Setting up Google Drive connection...', {
        id,
        duration: 15000,
      });
      break;
    case 'connecting':
      toast.loading(message || 'Waiting for Google authentication...', {
        id,
        duration: 15000,
      });
      break;
    case 'verifying':
      toast.loading(message || 'Verifying connection...', {
        id,
        duration: 5000,
      });
      break;
    case 'error':
      toast.dismiss(id);
      toast.error(message || 'Google Drive connection failed', {
        description: message || 'Please try again',
        duration: 4000,
        id: 'drive-connect-error',
      });
      break;
    case 'success':
      toast.dismiss(id);
      toast.success(message || 'Connected to Google Drive', {
        description: 'Your Google Drive documents are now available',
        duration: 3000,
        id: 'drive-connect-success',
      });
      break;
    default:
      toast.dismiss(id);
  }
}
