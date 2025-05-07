
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
          description: 'Please try again' 
        });
        resolve(false);
      }, 20000); // 20 second timeout
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
    
    return result;
  }
  
  /**
   * Execute the actual authentication process
   */
  private async executeAuthentication(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi) {
      console.error('Google API client not available, attempting to initialize...');
      
      // Wait for API to load with a timeout
      const apiLoaded = await Promise.race([
        this.googleApiLoader.ensureGoogleApiLoaded(),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 10000))
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
        }, 8000);
        
        gapi.load('client', {
          callback: async () => {
            clearTimeout(timeoutId);
            console.log('Google client API initialized in authenticateWithDrive');
            // Continue with authentication after client is loaded
            const result = await this.completeAuthentication(clientId, apiKey, cachedToken);
            resolve(result);
          },
          onerror: () => {
            clearTimeout(timeoutId);
            console.error('Failed to load Google client API');
            toast.error('Google API initialization failed', {
              description: 'Please refresh the page and try again'
            });
            resolve(false);
          }
        });
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
      return false;
    }
    
    try {
      // Initialize the Google API client with provided credentials
      const initialized = await ApiClientInitializer.initializeApiClient(gapi, apiKey);
      if (!initialized) {
        return false;
      }
      
      // Always try OAuth flow first for a fresh token - skip cached token
      // This helps when the token might be invalid or expired
      console.log('Initiating OAuth flow for a fresh token');
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
    const success = await OAuthFlowManager.initiateOAuthFlow(clientId, this.googleApiLoader);
    if (success) {
      this.isAuthenticated = true;
      localStorage.setItem('gdrive-connected', 'true');
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
