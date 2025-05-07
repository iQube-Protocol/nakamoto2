
import { toast } from 'sonner';

/**
 * Save Google Drive credentials to localStorage
 */
export function saveCredentials(clientId: string, apiKey: string): void {
  try {
    if (!clientId || !apiKey) {
      console.warn('Attempted to save empty credentials');
      return;
    }
    
    localStorage.setItem('gdrive-client-id', clientId);
    localStorage.setItem('gdrive-api-key', apiKey);
    console.log('Google Drive credentials saved to localStorage');
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
}

/**
 * Load Google Drive credentials from localStorage
 */
export function loadCredentials(): { clientId: string, apiKey: string } {
  const clientId = localStorage.getItem('gdrive-client-id') || '';
  const apiKey = localStorage.getItem('gdrive-api-key') || '';
  
  return { clientId, apiKey };
}

/**
 * Clear connection storage (credentials, tokens, etc.)
 */
export function clearConnectionStorage(): void {
  try {
    // Clear Google Drive credentials and state
    localStorage.removeItem('gdrive-client-id');
    localStorage.removeItem('gdrive-api-key');
    localStorage.removeItem('gdrive-connected');
    localStorage.removeItem('gdrive-auth-token');
    
    // Clear any cached folder data
    for (const key in sessionStorage) {
      if (key.startsWith('gdrive-folder-')) {
        sessionStorage.removeItem(key);
      }
    }
    
    // Clear any cached document content
    for (const key in localStorage) {
      if (key.startsWith('gdrive-doc-')) {
        localStorage.removeItem(key);
      }
    }
    
    console.log('Google Drive connection storage cleared');
  } catch (error) {
    console.error('Error clearing connection storage:', error);
  }
}

/**
 * Dismiss any toasts related to Drive connection
 */
export function dismissConnectionToasts(): void {
  toast.dismiss('drive-connection');
  toast.dismiss('drive-connect-validation');
  toast.dismiss('drive-connect-inprogress');
  toast.dismiss('drive-connection-timeout');
  toast.dismiss('drive-connect-success');
  toast.dismiss('drive-connect-error');
  toast.dismiss('api-error');
  toast.dismiss('connection-error');
  toast.dismiss('reset-connection');
  toast.dismiss('reset-success');
  toast.dismiss('reset-info');
  toast.dismiss('reset-error');
  toast.dismiss('drive-connecting');
}
