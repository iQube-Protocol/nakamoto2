
import { toast } from 'sonner';
import { BaseService } from '../baseService';
import { GoogleApiLoader } from '../../googleApiLoader';
import { OAuthFlowManager } from './oauth/oauthFlowManager';
import { CachedTokenHandler } from './token/cachedTokenHandler';
import { ApiClientInitializer } from './api/apiClientInitializer';
import { tokenUtils } from './utils/tokenUtils';

/**
 * Service for Google Drive authentication
 */
export class DriveAuthService extends BaseService {
  private googleApiLoader: GoogleApiLoader;
  private isAuthenticated: boolean = false;
  private authTimeoutId: NodeJS.Timeout | null = null;
  private lastAuthAttempt: number = 0;
  private authCooldownPeriod: number = 5000; // 5 seconds
  private authAttempts: number = 0;
  private maxAuthAttempts: number = 2;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    super();
    this.googleApiLoader = googleApiLoader;
    
    // Check if we're already authenticated based on localStorage
    if (localStorage.getItem('gdrive-connected') === 'true' && tokenUtils.getCachedToken()) {
      this.isAuthenticated = true;
    }
  }
  
  /**
   * Completes Drive connection after ensuring API is initialized
   */
  public async authenticateWithDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    // Implement cooldown to prevent rapid reconnection attempts
    const now = Date.now();
    if (now - this.lastAuthAttempt < this.authCooldownPeriod) {
      console.log('Authentication attempt too soon after previous attempt, enforcing cooldown');
      toast.info('Please wait before trying to connect again');
      return false;
    }
    
    this.lastAuthAttempt = now;
    
    // Reset auth attempts if it's been a while since the last attempt
    if (now - this.lastAuthAttempt > 60000) { // 1 minute
      this.authAttempts = 0;
    }
    
    // Check if we've tried too many times
    if (this.authAttempts >= this.maxAuthAttempts) {
      toast.error('Too many authentication attempts', {
        description: 'Please wait a few minutes before trying again'
      });
      
      // Reset the attempts counter after a longer cooldown
      setTimeout(() => {
        this.authAttempts = 0;
      }, 2 * 60 * 1000); // 2 minutes
      
      return false;
    }
    
    this.authAttempts++;
    
    // Clear any stale connection state before starting
    tokenUtils.clearCachedToken();
    localStorage.removeItem('gdrive-connected');
    
    // Clear any existing timeouts
    if (this.authTimeoutId) {
      clearTimeout(this.authTimeoutId);
      this.authTimeoutId = null;
    }
    
    // Set a global timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((resolve) => {
      this.authTimeoutId = setTimeout(() => {
        console.error('MCP: Authentication process timed out');
        toast.error('Authentication timed out', { 
          description: 'Please check your internet connection and try again' 
        });
        resolve(false);
      }, 30000); // 30 second timeout
    });
    
    // The actual authentication process
    const authPromise = this.executeAuthentication(clientId, apiKey, cachedToken);
    
    // Race the authentication against the timeout
    const result = await Promise.race([authPromise, timeoutPromise]);
    
    // Clear the timeout if authentication completed
    if (this.authTimeoutId) {
      clearTimeout(this.authTimeoutId);
      this.authTimeoutId = null;
    }
    
    // If successful, reset the attempts counter
    if (result) {
      this.authAttempts = 0;
    }
    
    return result;
  }
  
  /**
   * Execute the actual authentication process
   */
  private async executeAuthentication(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    console.log('MCP: Executing authentication with credentials', { clientId: clientId?.substring(0, 10) + '...', apiKeyProvided: !!apiKey });
    
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi) {
      console.error('Google API client not available, attempting to initialize...');
      
      // Wait for API to load with a timeout
      const apiLoaded = await Promise.race([
        this.googleApiLoader.ensureGoogleApiLoaded(),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 15000))
      ]);
      
      if (!apiLoaded) {
        toast.error('Google API failed to load', {
          description: 'Please refresh the page and try again'
        });
        return false;
      }
    }
    
    // Check if gapi exists but client is not initialized
    if (gapi && !gapi.client) {
      console.log('GAPI exists but client not initialized, initializing now');
      return new Promise<boolean>((resolve) => {
        const timeoutId = setTimeout(() => {
          console.error('Client initialization timed out');
          resolve(false);
        }, 10000); // Increased timeout for slow connections
        
        try {
          gapi.load('client', {
            callback: async () => {
              clearTimeout(timeoutId);
              console.log('Google client API initialized in authenticateWithDrive');
              // Continue with authentication after client is loaded
              const result = await this.completeAuthentication(clientId, apiKey, cachedToken);
              resolve(result);
            },
            onerror: (error: any) => {
              clearTimeout(timeoutId);
              console.error('Failed to load Google client API:', error);
              toast.error('Google API initialization failed', {
                description: 'Please refresh the page and try again'
              });
              resolve(false);
            },
            timeout: 10000, // 10 seconds timeout for loading client
            ontimeout: () => {
              clearTimeout(timeoutId);
              console.error('Google client API initialization timed out');
              toast.error('Google API initialization timed out', {
                description: 'Please check your internet connection and try again'
              });
              resolve(false);
            }
          });
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Error in gapi.load:', error);
          toast.error('Failed to initialize Google API', {
            description: error instanceof Error ? error.message : 'Unknown error'
          });
          resolve(false);
        }
      });
    }
    
    return this.completeAuthentication(clientId, apiKey, cachedToken);
  }
  
  /**
   * Completes the authentication process after ensuring client is initialized
   */
  private async completeAuthentication(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi || !gapi.client) {
      console.error('Google API client still not available');
      toast.error('Google API client not available', {
        description: 'Please refresh the page and try again'
      });
      return false;
    }
    
    try {
      // Initialize the Google API client with provided credentials
      console.log('Initializing API client with credentials');
      const initialized = await ApiClientInitializer.initializeApiClient(gapi, apiKey);
      if (!initialized) {
        console.error('Failed to initialize API client');
        toast.error('Failed to initialize Google API client');
        return false;
      }
      
      // Force a completely fresh OAuth flow - ignore cached token
      // This helps when the token might be invalid or expired
      console.log('Initiating fresh OAuth flow');
      return this.initiateAuthentication(clientId);
    } catch (error) {
      console.error('MCP: Error connecting to Google Drive:', error);
      toast.error('Google Drive connection failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }
  
  /**
   * Initiates the authentication process using OAuth
   */
  private async initiateAuthentication(clientId: string): Promise<boolean> {
    console.log('Starting OAuth flow with client ID:', clientId?.substring(0, 10) + '...');
    const success = await OAuthFlowManager.initiateOAuthFlow(clientId, this.googleApiLoader);
    if (success) {
      this.isAuthenticated = true;
      localStorage.setItem('gdrive-connected', 'true');
      console.log('OAuth flow completed successfully');
    } else {
      console.error('OAuth flow failed');
    }
    return success;
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
