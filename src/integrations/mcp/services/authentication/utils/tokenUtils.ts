
/**
 * Utilities for token handling in Google Drive authentication
 */
export const tokenUtils = {
  /**
   * Store token in local storage
   */
  storeToken: (gapi: any): void => {
    try {
      if (gapi && gapi.client) {
        localStorage.setItem('gdrive-auth-token', JSON.stringify(gapi.client.getToken()));
      }
    } catch (e) {
      console.error('Failed to cache token:', e);
    }
  },

  /**
   * Check if we have a cached token
   */
  getCachedToken: (): string | null => {
    try {
      return localStorage.getItem('gdrive-auth-token');
    } catch (e) {
      console.error('Error accessing cached token:', e);
      return null;
    }
  },

  /**
   * Clear cached token
   */
  clearCachedToken: (): void => {
    try {
      localStorage.removeItem('gdrive-auth-token');
    } catch (e) {
      console.error('Error clearing cached token:', e);
    }
  }
};
