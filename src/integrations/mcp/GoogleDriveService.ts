
import { toast } from 'sonner';
import { DocumentMetadata } from './types';
import { RetryService } from '@/services/RetryService';

/**
 * Service for Google Drive integration and document management
 */
export class GoogleDriveService {
  public gapi: any = null;
  private tokenClient: any = null;
  private isApiLoaded: boolean = false;
  private isAuthenticated: boolean = false;
  private retryService: RetryService;
  
  constructor() {
    console.log('Google Drive Service initialized');
    this.retryService = new RetryService({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000,
      retryCondition: (error) => {
        // Only retry network/CORS/auth errors, not user errors
        return error && (
          error.toString().includes('Network Error') || 
          error.toString().includes('CORS') ||
          (error.status && (error.status === 401 || error.status === 403))
        );
      }
    });
    this.loadGoogleApi();
  }
  
  /**
   * Load Google API script dynamically
   */
  private loadGoogleApi(): void {
    if (typeof window !== 'undefined' && !this.isApiLoaded) {
      this.loadGapiScript();
      this.loadGsiScript();
    }
  }
  
  /**
   * Load the GAPI script
   */
  private loadGapiScript(): void {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => this.onGapiLoaded();
    document.body.appendChild(script);
  }
  
  /**
   * Load the GSI script
   */
  private loadGsiScript(): void {
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    document.body.appendChild(gsiScript);
  }
  
  /**
   * Callback when Google API script is loaded
   */
  private onGapiLoaded(): void {
    this.gapi = (window as any).gapi;
    this.gapi.load('client', () => {
      this.isApiLoaded = true;
      console.log('Google API client loaded');
    });
  }
  
  /**
   * Check if API is loaded with timeout and retries
   */
  private async waitForApiLoad(maxRetries: number = 5, retryDelay: number = 500): Promise<boolean> {
    let retries = 0;
    
    while (!this.isApiLoaded && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retries++;
    }
    
    return this.isApiLoaded;
  }

  /**
   * Verify and possibly refresh Google auth token
   */
  private async verifyAuthToken(): Promise<boolean> {
    if (!this.isAuthenticated || !this.gapi?.auth?.getToken()) {
      console.warn('Not authenticated or missing token');
      return false;
    }

    try {
      // Test if the token is valid with a simple API call
      await this.gapi.client.drive.about.get({
        fields: 'user'
      });
      return true;
    } catch (error) {
      console.warn('Token validation failed, attempting refresh', error);
      
      // If we have the token client, request a new token
      if (this.tokenClient) {
        try {
          await new Promise<void>(resolve => {
            this.tokenClient.requestAccessToken({
              callback: () => {
                console.log('Token refreshed successfully');
                resolve();
              }
            });
          });
          return true;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          return false;
        }
      }
      return false;
    }
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string): Promise<boolean> {
    console.log('Connecting to Google Drive with credentials:', { clientId, apiKeyLength: apiKey?.length });
    
    try {
      // Wait for API to load
      const apiLoaded = await this.waitForApiLoad();
      if (!apiLoaded) {
        throw new Error('Google API failed to load after multiple retries');
      }
      
      // Initialize the Google API client with provided credentials
      await this.gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      
      // Create token client for OAuth 2.0 flow
      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            this.isAuthenticated = true;
            localStorage.setItem('gdrive-connected', 'true');
            toast.success('Connected to Google Drive', {
              description: 'Your Google Drive documents are now available to the AI agents'
            });
            console.log('Successfully authenticated with Google Drive');
          }
        },
      });
      
      // Request access token
      this.tokenClient.requestAccessToken({prompt: ''});
      
      return true;
    } catch (error) {
      console.error('Error connecting to Google Drive:', error);
      toast.error('Google Drive connection failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }
  
  /**
   * Reset Google Drive connection
   */
  async resetDriveConnection(): Promise<boolean> {
    console.log('Resetting Google Drive connection');
    
    try {
      // Clear any cached tokens from Google Auth
      if (this.gapi && this.gapi.auth) {
        try {
          // Try to clear the token
          const token = this.gapi.auth.getToken();
          if (token) {
            this.gapi.auth.setToken(null);
            console.log('Successfully cleared auth token');
          }
        } catch (e) {
          console.log('No token to clear or error clearing token', e);
        }
      }

      // Reset authentication state
      this.isAuthenticated = false;
      
      // Reset stored credentials in localStorage
      localStorage.removeItem('gdrive-connected');
      
      // Create new token client for future authentication
      if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.oauth2) {
        this.tokenClient = null;
      }
      
      console.log('Google Drive connection has been reset');
      return true;
    } catch (error) {
      console.error('Error resetting Drive connection:', error);
      throw error;
    }
  }
  
  /**
   * Load document metadata from Google Drive
   */
  async listDocuments(folderId?: string): Promise<DocumentMetadata[]> {
    console.log(`Listing documents${folderId ? ' in folder ' + folderId : ''}`);
    
    if (!this.isAuthenticated) {
      console.error('Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first' 
      });
      return [];
    }
    
    try {
      // Verify authentication token before proceeding
      await this.verifyAuthToken();
      
      const query = folderId ? 
        `'${folderId}' in parents and trashed = false` : 
        `'root' in parents and trashed = false`;
      
      const response = await this.gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 50
      });
      
      const files = response.result.files;
      console.log(`Found ${files.length} files in Google Drive`, files);
      return files;
    } catch (error) {
      console.error('Error listing documents from Google Drive:', error);
      toast.error('Failed to list documents', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return [];
    }
  }
  
  /**
   * Fetch a specific document's content with retry
   */
  async fetchDocumentContent(document: DocumentMetadata): Promise<string | null> {
    const documentId = document.id;
    const fileName = document.name;
    const mimeType = document.mimeType;
    
    console.log(`Fetching document content for ${documentId} (${fileName})`);
    
    if (!this.isAuthenticated) {
      console.error('Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first' 
      });
      return null;
    }
    
    try {
      // First verify token validity
      const validToken = await this.verifyAuthToken();
      if (!validToken) {
        throw new Error('Authentication token is invalid or expired');
      }
      
      return await this.retryService.execute(async () => {
        let documentContent = '';
        
        // For Google Docs, Sheets, and Slides, use GAPI's export method
        if (mimeType.includes('google-apps')) {
          console.log(`Exporting Google document: ${fileName}`);
          const exportMimeType = this.getExportMimeType(mimeType);
          const exportResponse = await this.gapi.client.drive.files.export({
            fileId: documentId,
            mimeType: exportMimeType
          });
          
          if (!exportResponse || !exportResponse.body) {
            throw new Error(`No content received for Google document ${fileName}`);
          }
          
          documentContent = exportResponse.body;
          console.log(`Successfully exported Google document: ${fileName}, content length: ${documentContent.length}`);
        } else {
          // For other file types, use GAPI's get method with alt=media
          console.log(`Fetching non-Google document: ${fileName}`);
          
          // Try using GAPI first for better error handling
          try {
            const response = await this.gapi.client.drive.files.get({
              fileId: documentId,
              alt: 'media'
            });
            
            if (response && response.body !== undefined) {
              documentContent = response.body;
            } else {
              throw new Error('Empty response from GAPI');
            }
          } catch (gapiError) {
            console.warn('GAPI fetch failed, falling back to fetch API:', gapiError);
            
            // Fallback to fetch API
            const response = await fetch(
              `https://www.googleapis.com/drive/v3/files/${documentId}?alt=media`,
              {
                headers: {
                  'Authorization': `Bearer ${this.gapi.auth.getToken().access_token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (!response.ok) {
              throw new Error(`Failed to fetch file content: ${response.statusText}`);
            }
            
            // For text-based files
            if (mimeType.includes('text') || mimeType.includes('json') || 
                mimeType.includes('javascript') || mimeType.includes('xml') ||
                mimeType.includes('html') || mimeType.includes('css')) {
              documentContent = await response.text();
            } else {
              // For binary files, provide basic info
              documentContent = `This file (${fileName}) is a binary file of type ${mimeType} and cannot be displayed as text.`;
            }
          }
        }
        
        // Validate content
        if (!documentContent || documentContent.trim().length === 0) {
          throw new Error(`Retrieved empty content for ${fileName}`);
        }
        
        console.log(`Successfully fetched document content for ${fileName}, length: ${documentContent.length}`);
        return documentContent;
      });
    } catch (error) {
      console.error(`Error fetching document ${documentId} (${fileName}):`, error);
      toast.error('Failed to fetch document content', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }
  
  /**
   * Get the appropriate export MIME type for Google Workspace files
   */
  private getExportMimeType(originalMimeType: string): string {
    switch (originalMimeType) {
      case 'application/vnd.google-apps.document':
        return 'text/plain';
      case 'application/vnd.google-apps.spreadsheet':
        return 'text/csv';
      case 'application/vnd.google-apps.presentation':
        return 'text/plain';
      default:
        return 'text/plain';
    }
  }
  
  /**
   * Get simplified document type from MIME type
   */
  getDocumentType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'sheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slide';
    if (mimeType.includes('text') || mimeType.includes('txt')) return 'txt';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType.includes('video')) return 'video';
    return 'file';
  }
  
  /**
   * Check if API is loaded and authenticated
   */
  isReady(): boolean {
    return this.isApiLoaded && this.isAuthenticated;
  }
  
  /**
   * Get authentication status
   */
  isConnected(): boolean {
    return this.isAuthenticated;
  }
}
