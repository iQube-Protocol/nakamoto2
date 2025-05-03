
import { toast } from 'sonner';

/**
 * Utility functions for drive connection management
 */

/**
 * Clear any lingering toasts related to drive connection
 */
export const dismissConnectionToasts = (): void => {
  toast.dismiss('drive-connection');
  toast.dismiss('drive-connection-timeout');
  toast.dismiss('drive-connect-error');
  toast.dismiss('reset-connection');
  toast.dismiss('api-error');
  toast.dismiss('connection-error');
  toast.dismiss('google-api-loading');
};

/**
 * Clear connection-related items from storage
 */
export const clearConnectionStorage = (): void => {
  // Clear API-related cached data
  for (const key in localStorage) {
    if (key.startsWith('gdrive-') || key.includes('token')) {
      localStorage.removeItem(key);
    }
  }
  
  // Clear folder cache
  for (const key in sessionStorage) {
    if (key.startsWith('gdrive-folder-')) {
      sessionStorage.removeItem(key);
    }
  }
};

/**
 * Save credentials to local storage
 */
export const saveCredentials = (clientId: string, apiKey: string): void => {
  localStorage.setItem('gdrive-client-id', clientId);
  localStorage.setItem('gdrive-api-key', apiKey);
};

/**
 * Load credentials from local storage
 */
export const loadCredentials = (): { clientId: string; apiKey: string } => {
  const savedClientId = localStorage.getItem('gdrive-client-id') || '';
  const savedApiKey = localStorage.getItem('gdrive-api-key') || '';
  
  return { clientId: savedClientId, apiKey: savedApiKey };
};
