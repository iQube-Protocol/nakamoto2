
import { toast } from 'sonner';
import { GoogleApiLoader } from '../../googleApiLoader';

/**
 * Service for listing Google Drive documents
 */
export class DocumentLister {
  private googleApiLoader: GoogleApiLoader;
  private requestInProgress: boolean = false;
  private requestTimeout: NodeJS.Timeout | null = null;
  private driveApiInitAttempted: boolean = false;
  private lastRequestTime: number = 0;
  private requestCooldown: number = 2000; // 2 seconds between requests
  
  constructor(googleApiLoader: GoogleApiLoader) {
    this.googleApiLoader = googleApiLoader;
  }
  
  /**
   * Load document metadata from Google Drive
   */
  public async listDocuments(folderId?: string): Promise<any[]> {
    console.log(`MCP: Listing documents${folderId ? ' in folder ' + folderId : ''}`);
    
    // Enforce cooldown between requests
    const now = Date.now();
    if (now - this.lastRequestTime < this.requestCooldown) {
      console.log('Request attempted too soon, enforcing cooldown');
      await new Promise(resolve => setTimeout(resolve, this.requestCooldown));
    }
    
    // Prevent concurrent requests
    if (this.requestInProgress) {
      console.log('Request already in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.listDocuments(folderId);
    }
    
    // Clear any existing timeouts
    if (this.requestTimeout) {
      clearTimeout(this.requestTimeout);
      this.requestTimeout = null;
    }
    
    this.requestInProgress = true;
    this.lastRequestTime = Date.now();
    
    // Set a timeout for the entire operation
    const operationPromise = this.executeListOperation(folderId);
    const timeoutPromise = new Promise<any[]>((resolve) => {
      this.requestTimeout = setTimeout(() => {
        console.error('Document listing operation timed out');
        toast.error('Document listing timed out', {
          description: 'Please try again'
        });
        this.requestInProgress = false;
        resolve([]);
      }, 15000); // 15 second timeout
    });
    
    // Race the operation against the timeout
    const result = await Promise.race([operationPromise, timeoutPromise]);
    
    // Clean up
    this.requestInProgress = false;
    if (this.requestTimeout) {
      clearTimeout(this.requestTimeout);
      this.requestTimeout = null;
    }
    
    return result;
  }
  
  /**
   * Execute the document listing operation
   */
  private async executeListOperation(folderId?: string): Promise<any[]> {
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi) {
      console.log('Google API not available for document listing');
      return [];
    }
    
    // Check if client is initialized and available
    if (!gapi.client) {
      // If we've already attempted to initialize the client and failed, don't keep trying
      if (this.driveApiInitAttempted) {
        console.log('Already attempted to initialize Google client API, skipping retry');
        return [];
      }
      
      console.log('Google client not initialized, attempting to initialize once');
      this.driveApiInitAttempted = true;
      
      return new Promise<any[]>((resolve) => {
        const timeoutId = setTimeout(() => {
          console.log('Client initialization in listDocuments timed out');
          resolve([]);
        }, 8000);
        
        try {
          gapi.load('client', {
            callback: async () => {
              clearTimeout(timeoutId);
              console.log('Client API loaded in listDocuments, attempting to list documents');
              try {
                const docs = await this.executeListDocuments(folderId);
                resolve(docs);
              } catch (err) {
                console.error('Error listing documents after client initialization:', err);
                resolve([]);
              }
            },
            onerror: () => {
              clearTimeout(timeoutId);
              console.error('Failed to load client API in listDocuments');
              toast.error('Failed to initialize Google API client');
              resolve([]);
            }
          });
        } catch (err) {
          clearTimeout(timeoutId);
          console.error('Error calling gapi.load:', err);
          resolve([]);
        }
      });
    }
    
    return this.executeListDocuments(folderId);
  }
  
  /**
   * Execute document listing once client is initialized
   */
  private async executeListDocuments(folderId?: string): Promise<any[]> {
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi || !gapi.client) {
      console.log('Google API client not available for document listing');
      return [];
    }
    
    // Check if Drive API is available
    if (!gapi.client.drive) {
      // If we've already attempted to initialize the API and failed, don't keep trying
      if (this.driveApiInitAttempted) {
        console.log('Already attempted to initialize Drive API, skipping retry');
        return [];
      }
      
      console.log('Google Drive API not available, attempting to initialize once');
      this.driveApiInitAttempted = true;
      
      // Try to initialize Drive API
      try {
        await gapi.client.load('drive', 'v3');
        console.log('Drive API loaded successfully');
      } catch (e) {
        console.error('Failed to load Drive API:', e);
        toast.error('Google Drive API not available', {
          description: 'Please check if the Drive API is enabled in your Google Cloud Console'
        });
        return [];
      }
    }
    
    try {
      const query = folderId ? 
        `'${folderId}' in parents and trashed = false` : 
        `'root' in parents and trashed = false`;
      
      console.log(`MCP: Executing Drive query: ${query}`);
      
      // Use a timeout for the API call
      const apiCallPromise = gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 30, // Reduced page size for faster response
        supportsAllDrives: false
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API call timed out')), 10000);
      });
      
      // Race the API call against a timeout
      const response = await Promise.race([apiCallPromise, timeoutPromise]);
      
      const files = response.result.files;
      console.log(`MCP: Found ${files?.length || 0} files in Google Drive`, files || []);
      
      // If no files were returned, check if it's due to permission issues
      if (!files || files.length === 0) {
        console.log('MCP: No files found, checking if it\'s a permission issue');
        try {
          // Try to get Drive user info to check if connection is working
          await gapi.client.drive.about.get({
            fields: 'user'
          });
          // If we got here, the connection works but folder might be empty
          console.log('MCP: Drive connection is working, folder may be empty');
        } catch (error) {
          console.error('MCP: Error checking Drive connection:', error);
          // Token might be expired, clear connection state
          if ((error as any).status === 401) {
            localStorage.removeItem('gdrive-auth-token');
            localStorage.setItem('gdrive-connected', 'false');
            toast.error('Google Drive session expired', {
              description: 'Please reconnect to Google Drive'
            });
          }
        }
      }
      
      return files || [];
    } catch (error) {
      console.error('MCP: Error listing documents from Google Drive:', error);
      
      // Check if it's an authentication error
      if ((error as any).status === 401) {
        localStorage.removeItem('gdrive-auth-token');
        localStorage.setItem('gdrive-connected', 'false');
        toast.error('Google Drive session expired', {
          description: 'Please reconnect to Google Drive'
        });
      } else if (error.message === 'API call timed out') {
        toast.error('Google Drive request timed out', {
          description: 'Please try again'
        });
      } else {
        toast.error('Failed to list documents', { 
          description: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
      return [];
    }
  }
  
  /**
   * Reset state for a new session
   */
  public reset(): void {
    this.driveApiInitAttempted = false;
    this.requestInProgress = false;
    if (this.requestTimeout) {
      clearTimeout(this.requestTimeout);
      this.requestTimeout = null;
    }
  }
}
