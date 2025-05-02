
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
      
      // Show toast to indicate loading process
      toast.loading('Loading Google API...', { id: 'loading-google-api', duration: 3000 });
      
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
    if (!gapi) {
      console.error('Google API not available after loading');
      toast.error('Google API not available', {
        description: 'Please refresh the page and try again'
      });
      return false;
    }
    
    // If gapi is available but client is not initialized
    if (gapi && !gapi.client) {
      console.log('Gapi available but client not initialized, initializing now');
      
      try {
        // Initialize gapi client
        const initialized = await ApiInitializer.initializeGapiClient(gapi);
        if (!initialized) {
          console.error('Failed to initialize Google API client');
          toast.error('Failed to initialize Google API');
          return false;
        }
      } catch (error) {
        console.error('Error initializing Google API client:', error);
        toast.error('Failed to initialize Google API');
        return false;
      }
    }
    
    // Proceed with authentication
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
