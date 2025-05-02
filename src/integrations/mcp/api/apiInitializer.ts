
/**
 * Helper for initializing Google API client
 */
export class ApiInitializer {
  /**
   * Initialize Google API client
   */
  public static initializeGapiClient(gapi: any): Promise<boolean> {
    if (!gapi) {
      return Promise.reject(new Error('Google API client not available'));
    }
    
    return new Promise<boolean>((resolve) => {
      gapi.load('client', {
        callback: () => {
          console.log('MCP: Google API client initialized successfully');
          resolve(true);
        },
        onerror: (e: any) => {
          console.error('MCP: Failed to initialize Google API client:', e);
          resolve(false);
        },
        timeout: 10000 // Set a reasonable timeout to prevent hanging
      });
    });
  }
  
  /**
   * Re-attempt API initialization
   */
  public static retryInitialization(gapi: any): Promise<boolean> {
    console.log('MCP: Retrying to load Google API client...');
    return ApiInitializer.initializeGapiClient(gapi);
  }
}
