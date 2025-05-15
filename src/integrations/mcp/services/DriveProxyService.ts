
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for proxying Google Drive API requests through Supabase Edge Functions
 * to avoid CORS issues
 */
export class DriveProxyService {
  private lastError: Error | null = null;
  private errorTimestamp: number = 0;
  private cooldownPeriod: number = 10000; // Reduced from 60 seconds to 10 seconds
  private retryCount: number = 0;
  
  /**
   * Send a proxied request to Google Drive API
   */
  async sendRequest(
    method: string, 
    endpoint: string, 
    accessToken: string, 
    options?: {
      body?: any;
      alt?: string;
      fields?: string;
      query?: string;
    }
  ): Promise<any> {
    // Check if we're in cooldown period after an error
    if (this.lastError && Date.now() - this.errorTimestamp < this.cooldownPeriod) {
      console.warn('DriveProxyService: In cooldown period after previous error:', this.lastError.message);
      throw this.lastError;
    }
    
    try {
      console.log(`Sending ${method} request to Google Drive API via proxy: ${endpoint}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('gdrive-proxy', {
          body: {
            method,
            endpoint,
            accessToken,
            ...options
          }
        });
        
        if (error) {
          console.error('Drive proxy error:', error);
          throw new Error(`Drive proxy error: ${error.message || 'Unknown error'}`);
        }
        
        // Clear any previous errors on success
        this.lastError = null;
        this.errorTimestamp = 0;
        this.retryCount = 0;
        
        return data;
      } catch (proxyError) {
        console.error('Drive proxy request failed:', proxyError);
        
        if (this.retryCount >= 2) {
          this.setError(proxyError instanceof Error ? proxyError : new Error(String(proxyError)));
          this.retryCount = 0;
          throw proxyError;
        }
        
        this.retryCount++;
        console.log(`Retrying Edge Function request (attempt ${this.retryCount})`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const response = await fetch(`${window.location.origin}/api/drive-proxy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              method,
              endpoint,
              accessToken,
              ...options
            }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          
          const data = await response.json();
          this.retryCount = 0;
          return data;
        } catch (fallbackError) {
          console.error('Drive proxy fallback error:', fallbackError);
          this.setError(fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)));
          this.retryCount = 0;
          throw fallbackError;
        }
      }
    } catch (error) {
      this.setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  
  /**
   * Set error state with timestamp
   */
  private setError(error: Error): void {
    this.lastError = error;
    this.errorTimestamp = Date.now();
  }
  
  /**
   * List files and folders
   */
  async listFiles(accessToken: string, folderId?: string): Promise<any> {
    const query = folderId ? 
      `'${folderId}' in parents and trashed = false` : 
      `'root' in parents and trashed = false`;
      
    return this.sendRequest('GET', 'files', accessToken, {
      fields: 'files(id, name, mimeType, modifiedTime)',
      query: query
    });
  }
  
  /**
   * Get a file's metadata
   */
  async getFileMetadata(accessToken: string, fileId: string): Promise<any> {
    return this.sendRequest('GET', `files/${fileId}`, accessToken, {
      fields: 'name,mimeType'
    });
  }
  
  /**
   * Download a file's content
   */
  async downloadFile(accessToken: string, fileId: string): Promise<string> {
    return this.sendRequest('GET', `files/${fileId}`, accessToken, {
      alt: 'media'
    });
  }
  
  /**
   * Export Google Workspace files
   */
  async exportFile(accessToken: string, fileId: string, mimeType: string): Promise<string> {
    return this.sendRequest('GET', `files/${fileId}/export`, accessToken, {
      alt: 'media',
      body: { mimeType }
    });
  }
  
  /**
   * Test connection to Google Drive
   */
  async testConnection(accessToken: string): Promise<boolean> {
    try {
      await this.sendRequest('GET', 'about', accessToken, {
        fields: 'user'
      });
      return true;
    } catch (error) {
      console.error('Drive connection test failed:', error);
      return false;
    }
  }
  
  /**
   * Reset error state to allow retrying after cooldown period
   */
  resetErrorState(): void {
    this.lastError = null;
    this.errorTimestamp = 0;
    this.retryCount = 0;
    console.log('Drive proxy error state reset');
  }
}

// Create singleton instance
export const driveProxyService = new DriveProxyService();
