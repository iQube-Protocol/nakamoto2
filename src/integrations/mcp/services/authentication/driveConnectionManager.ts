
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
  private connectionInProgress: boolean = false;
  private lastConnectionAttempt: number = 0;
  private cooldownPeriod: number = 5000; // 5 seconds
  
  constructor(googleApiLoader: GoogleApiLoader) {
    this.googleApiLoader = googleApiLoader;
    this.authService = new DriveAuthService(googleApiLoader);
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  public async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    console.log('MCP: Connecting to Google Drive with credentials:', { clientId: clientId?.substring(0, 10) + '...', apiKeyProvided: !!apiKey });
    
    if (!clientId || !apiKey) {
      toast.error('Missing Google API credentials', {
        description: 'Both Client ID and API Key are required'
      });
      return false;
    }
    
    // Prevent multiple concurrent connection attempts
    if (this.connectionInProgress) {
      console.log('Connection already in progress, ignoring duplicate request');
      toast.info('Connection already in progress', { 
        description: 'Please wait for the current connection attempt to complete'
      });
      return false;
    }
    
    // Implement cooldown between connection attempts
    const now = Date.now();
    if (now - this.lastConnectionAttempt < this.cooldownPeriod) {
      console.log('Connection attempt too soon, enforcing cooldown');
      toast.info('Please wait before trying to connect again', {
        description: `Try again in ${Math.ceil((this.cooldownPeriod - (now - this.lastConnectionAttempt)) / 1000)} seconds`
      });
      return false;
    }
    
    this.lastConnectionAttempt = now;
    this.connectionInProgress = true;
    
    try {
      // Clean up any stale connection state
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      
      // Reset connection state to ensure a fresh start
      localStorage.removeItem('gdrive-connected');
      localStorage.removeItem('gdrive-auth-token');
      
      // Set a global timeout for the entire connection process
      const timeoutPromise = new Promise<boolean>((resolve) => {
        this.connectionTimeout = setTimeout(() => {
          console.error('MCP: Connection process timed out');
          toast.error('Connection timed out', {
            description: 'Please try again later'
          });
          resolve(false);
        }, 30000); // 30 second timeout
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
    } finally {
      this.connectionInProgress = false;
    }
  }
  
  /**
   * Execute the actual connection process
   */
  private async executeConnection(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    toast.loading('Connecting to Google Drive...', {
      id: 'drive-connection',
      duration: Infinity
    });
    
    try {
      // Force reload the Google API scripts to ensure a fresh start
      this.googleApiLoader.reset();
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for cleanup
      
      // Ensure API is loaded or try loading it
      console.log('Ensuring Google API is loaded...');
      const apiLoaded = await Promise.race([
        this.googleApiLoader.ensureGoogleApiLoaded(),
        new Promise<boolean>(resolve => {
          setTimeout(() => {
            console.warn('Google API load timed out in executeConnection');
            resolve(false);
          }, 15000);
        })
      ]);
      
      if (!apiLoaded) {
        console.error('Google API failed to load, attempting direct script injection');
        
        // Try one more direct approach to loading scripts
        try {
          const gapi = await this.loadGapiDirectly();
          if (!gapi) {
            toast.error('Google API failed to load', {
              id: 'drive-connection',
              description: 'Please try refreshing your browser'
            });
            return false;
          }
        } catch (error) {
          toast.error('Google API failed to load', {
            id: 'drive-connection',
            description: 'Please try using a different browser or check your internet connection'
          });
          return false;
        }
      }
      
      // Proceed with authentication
      console.log('API loaded, proceeding with authentication');
      const success = await this.authService.authenticateWithDrive(clientId, apiKey, cachedToken);
      
      if (success) {
        toast.success('Connected to Google Drive', {
          id: 'drive-connection',
          description: 'Your documents are now available'
        });
      } else {
        toast.error('Failed to connect to Google Drive', {
          id: 'drive-connection',
          description: 'Please check your credentials and try again'
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error in executeConnection:', error);
      toast.error('Connection error', {
        id: 'drive-connection',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return false;
    }
  }
  
  /**
   * Last resort: attempt to load GAPI directly
   */
  private loadGapiDirectly(): Promise<any> {
    return new Promise((resolve) => {
      console.log('Attempting direct GAPI load...');
      
      // Set a timeout
      const timeoutId = setTimeout(() => {
        console.error('Direct GAPI load timed out');
        resolve(null);
      }, 10000);
      
      // Create and inject script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.onload = () => {
        clearTimeout(timeoutId);
        
        const gapi = (window as any).gapi;
        if (!gapi) {
          console.error('GAPI not found after script load');
          resolve(null);
          return;
        }
        
        console.log('GAPI loaded directly, initializing client...');
        gapi.load('client', {
          callback: () => {
            console.log('GAPI client initialized directly');
            this.googleApiLoader.getClient().setGapi(gapi);
            resolve(gapi);
          },
          onerror: () => {
            console.error('Failed to initialize GAPI client directly');
            resolve(null);
          },
          timeout: 5000,
          ontimeout: () => {
            console.error('GAPI client initialization timed out');
            resolve(null);
          }
        });
      };
      
      script.onerror = () => {
        clearTimeout(timeoutId);
        console.error('Failed to load GAPI script directly');
        resolve(null);
      };
      
      document.body.appendChild(script);
    });
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
