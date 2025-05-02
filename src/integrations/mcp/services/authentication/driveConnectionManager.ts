
import { toast } from 'sonner';
import { GoogleApiLoader } from '../../googleApiLoader';
import { ApiInitializer } from '../../api/apiInitializer';
import { DriveAuthService } from './driveAuthService';

/**
 * Manager for Google Drive connection operations
 */
export class DriveConnectionManager {
  private googleApiLoader: GoogleApiLoader;
  private authService: DriveAuthService;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    this.googleApiLoader = googleApiLoader;
    this.authService = new DriveAuthService(googleApiLoader);
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  public async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    console.log('MCP: Connecting to Google Drive with credentials:', { clientId, apiKeyLength: apiKey?.length });
    
    if (!clientId || !apiKey) {
      toast.error('Missing Google API credentials', {
        description: 'Both Client ID and API Key are required'
      });
      return false;
    }
    
    // Ensure API is loaded or try loading it
    const apiLoaded = await this.googleApiLoader.ensureGoogleApiLoaded();
    if (!apiLoaded) {
      console.error('Google API failed to load, attempting to reload...');
      // Try reloading the API
      this.googleApiLoader.loadGoogleApi();
      
      // Wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 2000));
      const reloaded = await this.googleApiLoader.ensureGoogleApiLoaded();
      
      if (!reloaded) {
        console.error('Google API failed to load after reload attempt');
        toast.error('Google API failed to load', {
          description: 'Please refresh the page and try again.'
        });
        return false;
      }
    }
    
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi || !gapi.client) {
      console.error('Google API client not available, initializing...');
      
      // Check if gapi exists but client is not initialized
      if (gapi && !gapi.client) {
        return new Promise<boolean>((resolve) => {
          gapi.load('client', {
            callback: async () => {
              console.log('Google client API initialized in connectToDrive');
              // Continue with authentication after client is loaded
              const result = await this.authService.authenticateWithDrive(clientId, apiKey, cachedToken);
              resolve(result);
            },
            onerror: () => {
              console.error('Failed to load Google client API');
              toast.error('Google API initialization failed', {
                description: 'Please refresh the page and try again'
              });
              resolve(false);
            },
            timeout: 10000 // 10 seconds
          });
        });
      }
      
      toast.error('Google API not available', {
        description: 'Please refresh the page and try again'
      });
      return false;
    }
    
    return this.authService.authenticateWithDrive(clientId, apiKey, cachedToken);
  }
  
  /**
   * Check if connected to Google Drive
   */
  public isConnectedToDrive(): boolean {
    return this.authService.isConnectedToDrive();
  }
  
  /**
   * Set authentication state
   */
  public setAuthenticated(authenticated: boolean): void {
    this.authService.setAuthenticated(authenticated);
  }
}
