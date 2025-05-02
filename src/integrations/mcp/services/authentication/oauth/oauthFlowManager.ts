
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
            newScript.onload = () => {
              console.log('GSI script loaded successfully via direct injection');
              if ((window as any).google?.accounts) {
                OAuthFlowManager.completeOAuthFlow(clientId, authTimeout, resolve, googleApiLoader);
              } else {
                clearTimeout(authTimeout);
                console.error('Google accounts API still not available after script load');
                toast.error('Google Sign-In API not available', {
                  description: 'Please try using a different browser or check your internet connection'
                });
                resolve(false);
              }
            };
            newScript.onerror = () => {
              clearTimeout(authTimeout);
              console.error('Failed to load GSI script via direct injection');
              toast.error('Failed to load authentication components', {
                description: 'Please check your internet connection and try again'
              });
              resolve(false);
            };
            document.body.appendChild(newScript);
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
      console.log('Initializing OAuth token client with client ID:', clientId?.substring(0, 10) + '...');
      
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
              description: 'Your Google Drive documents are now available'
            });
            console.log('Successfully authenticated with Google Drive');
            resolve(true);
          } else {
            console.error('Token response missing access token', tokenResponse);
            toast.error('Authentication failed', {
              description: 'Failed to get access token'
            });
            resolve(false);
          }
        },
        error_callback: (error: any) => {
          clearTimeout(authTimeout);
          console.error('OAuth error:', error);
          
          let description = 'Failed to authenticate with Google';
          
          // Check for specific OAuth errors
          if (error.type === 'popup_closed') {
            description = 'The authentication popup was closed before completion';
          } else if (error.type === 'access_denied') {
            description = 'You denied access to your Google Drive';
          } else if (error.type === 'immediate_failed') {
            description = 'Automatic sign-in failed. Please try again';
          } else if (error.message) {
            description = error.message;
          }
          
          toast.error('Google authentication failed', {
            description: description
          });
          resolve(false);
        }
      });
      
      googleApiLoader.setTokenClient(tokenClient);
      
      // Request access token - force consent every time to ensure we get a fresh token
      console.log('MCP: Requesting access token with consent prompt...');
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
