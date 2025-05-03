
/**
 * Save Google Drive credentials to localStorage
 */
export function saveCredentials(clientId: string, apiKey: string): void {
  try {
    if (clientId) {
      localStorage.setItem('gdrive-client-id', clientId);
    }
    
    if (apiKey) {
      localStorage.setItem('gdrive-api-key', apiKey);
    }
    
    console.log('Connection credentials saved to localStorage');
  } catch (e) {
    console.error('Failed to save credentials to localStorage:', e);
  }
}

/**
 * Load Google Drive credentials from localStorage
 */
export function loadCredentials(): { clientId: string; apiKey: string } {
  try {
    const clientId = localStorage.getItem('gdrive-client-id') || '';
    const apiKey = localStorage.getItem('gdrive-api-key') || '';
    
    return { clientId, apiKey };
  } catch (e) {
    console.error('Failed to load credentials from localStorage:', e);
    return { clientId: '', apiKey: '' };
  }
}

/**
 * Dismiss all connection-related toast notifications
 */
export function dismissConnectionToasts(): void {
  // Dismiss any existing toasts to prevent duplicate errors
  const toastIdsToRemove = [
    'drive-connect', 
    'drive-connect-error', 
    'drive-connect-success',
    'drive-connect-inprogress', 
    'drive-connect-validation',
    'drive-connection',
    'drive-connection-timeout',
    'api-error',
    'connection-error',
    'missing-credentials'
  ];
  
  try {
    // Toast library might expose a function to get all active toasts
    if (typeof window !== 'undefined') {
      const { toast } = require('sonner');
      
      // If sonner has a dismiss method, use it
      if (toast && typeof toast.dismiss === 'function') {
        toastIdsToRemove.forEach(id => toast.dismiss(id));
      }
    }
  } catch (e) {
    console.error('Failed to dismiss toasts:', e);
  }
}
