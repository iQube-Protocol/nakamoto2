
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
