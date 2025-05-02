
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
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi || !gapi.client) {
      console.error('Google API client not available, attempting to initialize...');
      
      // Check if gapi exists but client is not initialized
      if (gapi && !gapi.client) {
        console.log('GAPI exists but client not initialized, initializing now');
        return new Promise<boolean>((resolve) => {
          gapi.load('client', {
            callback: async () => {
              console.log('Google client API initialized in authenticateWithDrive');
              // Continue with authentication after client is loaded
              const result = await this.completeAuthentication(clientId, apiKey, cachedToken);
              resolve(result);
            },
            onerror: () => {
              console.error('Failed to load Google client API');
              toast.error('Google API initialization failed', {
                description: 'Please refresh the page and try again'
              });
              resolve(false);
            }
          });
        });
      }
      
      toast.error('Google API not available', {
        description: 'Please refresh the page and try again'
      });
      return false;
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
      
      // Try to use cached token if available
      const cachedAuthToken = cachedToken || tokenUtils.getCachedToken();
      if (cachedAuthToken) {
        const authenticated = await CachedTokenHandler.tryAuthenticateWithCachedToken(gapi, cachedAuthToken);
        if (authenticated) {
          this.isAuthenticated = true;
          return true;
        }
      }
      
      // If cached token didn't work, proceed with OAuth flow
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
