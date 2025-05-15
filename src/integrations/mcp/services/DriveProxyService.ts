
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for proxying Google Drive API requests through Supabase Edge Functions
 * to avoid CORS issues
 */
export class DriveProxyService {
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
    try {
      console.log(`Sending ${method} request to Google Drive API via proxy: ${endpoint}`);
      
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
      
      return data;
    } catch (error) {
      console.error('Drive proxy request failed:', error);
      throw error;
    }
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
}

// Create singleton instance
export const driveProxyService = new DriveProxyService();
