
import { toast } from 'sonner';
import { tokenUtils } from '../utils/tokenUtils';

/**
 * Manages cached token operations
 */
export class CachedTokenHandler {
  /**
   * Try to authenticate using a cached token
   */
  public static async tryAuthenticateWithCachedToken(
    gapi: any, 
    cachedToken: string | null
  ): Promise<boolean> {
    if (!cachedToken) {
      return false;
    }
    
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
          tokenUtils.clearCachedToken();
        } else if (error.status === 403) {
          console.log('Permission denied, check API Key and scopes');
          toast.error('Google API access denied', {
            description: 'Please check your API key and permissions'
          });
        }
        return false;
      }
    } catch (e) {
      console.error('Error parsing or using cached token:', e);
      // Clear invalid token
      tokenUtils.clearCachedToken();
      return false;
    }
  }
}
