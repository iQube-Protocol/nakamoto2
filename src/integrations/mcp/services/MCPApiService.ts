
import { toast } from 'sonner';

/**
 * Service for handling API communication in the MCP client
 */
export class MCPApiService {
  private serverUrl: string;
  private authToken: string | null;
  private lastErrorTime = 0;
  private errorCooldown = 5000; // 5 seconds between error notifications

  constructor(serverUrl: string = 'https://mcp-gdrive-server.example.com', authToken: string | null = null) {
    this.serverUrl = serverUrl;
    this.authToken = authToken;
  }

  /**
   * Set the server URL
   */
  setServerUrl(url: string): void {
    this.serverUrl = url;
  }

  /**
   * Set the authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Generic API request method with improved error handling
   */
  async makeRequest<T>(endpoint: string, method: string = 'GET', data?: any): Promise<T | null> {
    try {
      // Implement API communication logic
      console.log(`Making ${method} request to ${this.serverUrl}${endpoint}`);
      
      // Add better CORS handling for future API implementation
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      };
      
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      // This is a placeholder for future API communication
      return null;
    } catch (error) {
      console.error(`API error (${endpoint}):`, error);
      
      // Rate limit error notifications
      const now = Date.now();
      if (now - this.lastErrorTime > this.errorCooldown) {
        this.lastErrorTime = now;
        toast.error('API request failed', { 
          description: error instanceof Error ? error.message : 'Unknown error',
          id: `api-error-${endpoint}` // Prevent duplicate toasts
        });
      }
      
      return null;
    }
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Implement health check logic
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  /**
   * Get the current server URL
   */
  getServerUrl(): string {
    return this.serverUrl;
  }

  /**
   * Get the current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }
}
