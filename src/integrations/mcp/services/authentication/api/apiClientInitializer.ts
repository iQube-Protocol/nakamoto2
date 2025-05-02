
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
      // Initialize the Google API client with provided credentials
      await gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      
      return true;
    } catch (error) {
      console.error('MCP: Error initializing Google API client:', error);
      toast.error('Google Drive initialization failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }
}
