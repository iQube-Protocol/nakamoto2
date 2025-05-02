
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
  private connectionTimeout: NodeJS.Timeout | null = null;
  
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
    
    // Clear any existing timeouts
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // Set a global timeout for the entire connection process
    const timeoutPromise = new Promise<boolean>((resolve) => {
      this.connectionTimeout = setTimeout(() => {
        console.error('MCP: Connection process timed out');
        toast.error('Connection timed out', {
          description: 'Please try again'
        });
        resolve(false);
      }, 25000); // 25 second timeout
    });
    
    // The actual connection process
    const connectionPromise = this.executeConnection(clientId, apiKey, cachedToken);
    
    // Race the connection against the timeout
    const result = await Promise.race([connectionPromise, timeoutPromise]);
    
    // Clear the timeout if connection completed
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    return result;
  }
  
  /**
   * Execute the actual connection process
   */
  private async executeConnection(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    // Ensure API is loaded or try loading it
    const apiLoadPromise = this.googleApiLoader.ensureGoogleApiLoaded();
    
    // Add a timeout for API loading
    const apiLoadTimeoutPromise = new Promise<boolean>(resolve => {
      setTimeout(() => {
        console.warn('Google API load timed out, continuing...');
        resolve(false);
      }, 10000);
    });
    
    // Race API loading against a timeout
    const apiLoaded = await Promise.race([apiLoadPromise, apiLoadTimeoutPromise]);
    
    if (!apiLoaded) {
      console.error('Google API failed to load, attempting to reload...');
      
      // Show toast to indicate loading process
      toast.loading('Loading Google API...', { id: 'loading-google-api', duration: 3000 });
      
      // Try reloading the API
      this.googleApiLoader.loadGoogleApi();
      
      // Wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // One more attempt with timeout
      const reloaded = await Promise.race([
        this.googleApiLoader.ensureGoogleApiLoaded(),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 5000))
      ]);
      
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
        // Initialize gapi client with a timeout
        const initPromise = ApiInitializer.initializeGapiClient(gapi);
        const timeoutPromise = new Promise<boolean>(resolve => {
          setTimeout(() => {
            console.warn('Client initialization timed out');
            resolve(false);
          }, 5000);
        });
        
        const initialized = await Promise.race([initPromise, timeoutPromise]);
        
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
