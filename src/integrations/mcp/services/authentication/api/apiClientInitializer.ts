
import { toast } from 'sonner';

/**
 * Handles Google API client initialization
 */
export class ApiClientInitializer {
  /**
   * Initialize the Google API client with credentials
   */
  public static async initializeApiClient(
    gapi: any, 
    apiKey: string
  ): Promise<boolean> {
    if (!gapi || !gapi.client) {
      return false;
    }
    
    try {
      console.log('Initializing Google API client with provided credentials');
      
      // Setup a timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn('API client initialization timed out');
          resolve(false);
        }, 8000); // 8 second timeout
      });
      
      // The actual initialization
      const initPromise = (async () => {
        try {
          // Initialize the Google API client with provided credentials
          await gapi.client.init({
            apiKey: apiKey,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          return true;
        } catch (e) {
          console.error('Error in client.init():', e);
          return false;
        }
      })();
      
      // Race the initialization against the timeout
      const result = await Promise.race([initPromise, timeoutPromise]);
      
      if (!result) {
        toast.error('Google API client initialization timed out');
      }
      
      return result;
    } catch (error) {
      console.error('MCP: Error initializing Google API client:', error);
      toast.error('Google Drive initialization failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }
}
