
import { toast } from 'sonner';
import { tokenUtils } from '../utils/tokenUtils';

/**
 * Manages the OAuth flow for Google Drive authentication
 */
export class OAuthFlowManager {
  /**
   * Initialize the OAuth flow with Google Drive
   */
  public static initiateOAuthFlow(clientId: string, googleApiLoader: any): Promise<boolean> {
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
            setTimeout(() => {
              if (!(window as any).google?.accounts) {
                clearTimeout(authTimeout);
                toast.error('Google Sign-In API not available', {
                  description: 'Please check your internet connection and try again'
                });
                resolve(false);
              } else {
                OAuthFlowManager.completeOAuthFlow(clientId, authTimeout, resolve, googleApiLoader);
              }
            }, 3000); // Wait 3 seconds for the script to load
            return;
          } else {
            clearTimeout(authTimeout);
            toast.error('Google Sign-In API not available', {
              description: 'Please check your internet connection and try again'
            });
            resolve(false);
            return;
          }
        }
        
        OAuthFlowManager.completeOAuthFlow(clientId, authTimeout, resolve, googleApiLoader);
      } catch (error) {
        clearTimeout(authTimeout);
        console.error('Error initializing token client:', error);
        toast.error('Authentication initialization failed', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
        resolve(false);
      }
    });
  }
  
  /**
   * Completes the OAuth flow by initializing and requesting the token
   */
  private static completeOAuthFlow(
    clientId: string, 
    authTimeout: NodeJS.Timeout, 
    resolve: (value: boolean) => void,
    googleApiLoader: any
  ): void {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse: any) => {
          clearTimeout(authTimeout);
          
          if (tokenResponse && tokenResponse.access_token) {
            // Store connection state
            localStorage.setItem('gdrive-connected', 'true');
            
            // Cache the token
            const gapi = googleApiLoader.getGapi();
            tokenUtils.storeToken(gapi);
            
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
      
      googleApiLoader.setTokenClient(tokenClient);
      
      // Request access token
      console.log('MCP: Requesting access token...');
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      clearTimeout(authTimeout);
      console.error('Error in OAuth flow:', error);
      toast.error('Authentication process failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      resolve(false);
    }
  }
}
