
import { toast } from 'sonner';
import { GoogleApiLoader } from '../googleApiLoader';
import { BaseService } from './baseService';

/**
 * Service for Google Drive connection and authentication
 */
export class DriveConnectionService extends BaseService {
  private googleApiLoader: GoogleApiLoader;
  private isAuthenticated: boolean = false;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    super();
    this.googleApiLoader = googleApiLoader;
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
              // Continue with initialization after client is loaded
              const result = await this.finishDriveConnection(clientId, apiKey, cachedToken);
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
    
    return this.finishDriveConnection(clientId, apiKey, cachedToken);
  }
  
  /**
   * Completes Drive connection after ensuring API is initialized
   */
  private async finishDriveConnection(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi || !gapi.client) {
      toast.error('Google API client still not available');
      return false;
    }
    
    try {
      // Initialize the Google API client with provided credentials
      await gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      
      // If we have a cached token, try to use it directly
      if (cachedToken) {
        try {
          console.log('MCP: Attempting to use cached token');
          gapi.client.setToken(JSON.parse(cachedToken));
          
          // Test if the token is still valid with a simple API call
          try {
            console.log('MCP: Testing cached token validity');
            await gapi.client.drive.files.list({
              pageSize: 1,
              fields: 'files(id)'
            });
            
            // If we got here, the token is valid
            this.isAuthenticated = true;
            localStorage.setItem('gdrive-connected', 'true');
            console.log('Successfully authenticated with Google Drive using cached token');
            return true;
          } catch (e) {
            // Token is invalid, proceed with normal flow
            console.log('Cached token is invalid, proceeding with regular auth flow');
            
            // Check for specific error types and show user-friendly messages
            const error = e as any;
            if (error.status === 401) {
              console.log('Token expired, need to re-authenticate');
            } else if (error.status === 403) {
              console.log('Permission denied, check API Key and scopes');
              toast.error('Google API access denied', {
                description: 'Please check your API key and permissions'
              });
              return false;
            }
          }
        } catch (e) {
          console.error('Error parsing or using cached token:', e);
          // Clear invalid token
          localStorage.removeItem('gdrive-auth-token');
        }
      }
      
      // Create token client for OAuth 2.0 flow (only if cached token didn't work)
      const googleAccounts = (window as any).google?.accounts;
      if (!googleAccounts) {
        console.error('Google Sign-In API not available, checking if script loaded');
        
        // Check if gsi script is in DOM but not initialized yet
        const gsiScript = document.querySelector('script[src*="gsi/client"]');
        if (!gsiScript) {
          console.log('GSI script not found in DOM, trying to reload it');
          // Try reloading the GSI script directly
          const newScript = document.createElement('script');
          newScript.src = 'https://accounts.google.com/gsi/client';
          newScript.async = true;
          document.body.appendChild(newScript);
          
          // Wait for the script to load
          await new Promise((resolve) => {
            newScript.onload = resolve;
            setTimeout(resolve, 3000); // Timeout after 3 seconds
          });
          
          // Check again after loading
          if (!(window as any).google?.accounts) {
            toast.error('Google Sign-In API not available', {
              description: 'Please check your internet connection and try again'
            });
            return false;
          }
        } else {
          toast.error('Google Sign-In API not available', {
            description: 'Please check your internet connection and try again'
          });
          return false;
        }
      }
      
      // Use a promise with timeout to track the OAuth flow
      return new Promise<boolean>((resolve) => {
        // Set a timeout for the whole auth process
        const authTimeout = setTimeout(() => {
          console.error('OAuth flow timed out');
          toast.error('Authentication timed out', {
            description: 'Please try again later'
          });
          resolve(false);
        }, 30000); // 30 seconds timeout
        
        try {
          const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (tokenResponse: any) => {
              clearTimeout(authTimeout);
              
              if (tokenResponse && tokenResponse.access_token) {
                this.isAuthenticated = true;
                localStorage.setItem('gdrive-connected', 'true');
                
                // Cache the token
                try {
                  localStorage.setItem('gdrive-auth-token', JSON.stringify(gapi.client.getToken()));
                } catch (e) {
                  console.error('Failed to cache token:', e);
                }
                
                toast.success('Connected to Google Drive', {
                  description: 'Your Google Drive documents are now available to the AI agents'
                });
                console.log('Successfully authenticated with Google Drive');
                resolve(true);
              } else {
                console.error('Token response missing access token');
                toast.error('Authentication failed', {
                  description: 'Failed to get access token'
                });
                resolve(false);
              }
            },
            error_callback: (error: any) => {
              clearTimeout(authTimeout);
              console.error('OAuth error:', error);
              toast.error('Google authentication failed', {
                description: error.message || 'Failed to authenticate with Google'
              });
              resolve(false);
            }
          });
          
          this.googleApiLoader.setTokenClient(tokenClient);
          
          // Request access token
          console.log('MCP: Requesting access token...');
          tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (error) {
          clearTimeout(authTimeout);
          console.error('Error initializing token client:', error);
          toast.error('Authentication initialization failed', {
            description: error instanceof Error ? error.message : 'Unknown error'
          });
          resolve(false);
        }
      });
    } catch (error) {
      console.error('MCP: Error connecting to Google Drive:', error);
      toast.error('Google Drive connection failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  /**
   * Check if connected to Google Drive
   */
  public isConnectedToDrive(): boolean {
    return this.isAuthenticated;
  }
  
  /**
   * Set authentication state
   */
  public setAuthenticated(authenticated: boolean): void {
    this.isAuthenticated = authenticated;
    if (!authenticated) {
      localStorage.setItem('gdrive-connected', 'false');
    }
  }
}
