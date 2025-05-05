
/**
 * Get the appropriate icon based on file mime type
 */
export const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('folder')) {
    return 'folder';
  } else if (mimeType.includes('pdf')) {
    return 'pdf';
  } else if (mimeType.includes('image')) {
    return 'image';
  } else if (mimeType.includes('video')) {
    return 'video';
  } else if (mimeType.includes('audio')) {
    return 'audio';
  } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
    return 'spreadsheet';
  } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return 'presentation';
  } else {
    return 'file';
  }
};

/**
 * Get file extension from MIME type
 */
export const getFileExtension = (mimeType: string) => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('doc')) return 'doc';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xls';
  if (mimeType.includes('csv')) return 'csv';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
  if (mimeType.includes('text/plain')) return 'txt';
  if (mimeType.includes('json')) return 'json';
  if (mimeType.includes('html')) return 'html';
  
  // Extract from MIME type
  const parts = mimeType.split('/');
  return parts.length > 1 ? parts[1] : 'file';
};
