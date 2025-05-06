import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MCPContext, MCPClientOptions } from './types';
import { GoogleApiLoader } from './googleApiLoader';
import { ContextManager } from './contextManager';
import { DriveService } from './driveService';

export class MCPClient {
  private contextManager: ContextManager;
  private googleApiLoader: GoogleApiLoader;
  private driveService: DriveService;
  public serverUrl: string;
  private authToken: string | null;
  private metisActive: boolean;
  private connectionTimeouts: Record<string, NodeJS.Timeout> = {};
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://mcp-gdrive-server.example.com';
    this.authToken = options.authToken || null;
    this.metisActive = options.metisActive || false;
    
    // Initialize components with improved error handling
    this.googleApiLoader = new GoogleApiLoader({
      onApiLoadStart: options.onApiLoadStart,
      onApiLoadComplete: options.onApiLoadComplete
    });
    this.contextManager = new ContextManager();
    this.driveService = new DriveService(this.googleApiLoader);
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.serverUrl,
      hasAuthToken: !!this.authToken,
      metisActive: this.metisActive
    });
    
    // Load Google API script with timeout handling
    this.loadGoogleApiWithRetry();
    
    // Check for existing connection
    if (localStorage.getItem('gdrive-connected') === 'true') {
      this.driveService.setAuthenticated(true);
    }
  }
  
  /**
   * Load Google API with retry mechanism
   */
  private loadGoogleApiWithRetry(retryCount = 0): void {
    try {
      this.googleApiLoader.loadGoogleApi();
      
      // Clear any previous timeout
      if (this.connectionTimeouts['loadApi']) {
        clearTimeout(this.connectionTimeouts['loadApi']);
      }
      
      // Set timeout to check if API was loaded successfully
      this.connectionTimeouts['loadApi'] = setTimeout(() => {
        if (!this.googleApiLoader.isLoaded() && retryCount < 2) {
          console.log(`MCP: Google API failed to load, retrying (${retryCount + 1}/2)...`);
          this.loadGoogleApiWithRetry(retryCount + 1);
        } else if (!this.googleApiLoader.isLoaded()) {
          console.error('MCP: Google API failed to load after multiple attempts');
        }
      }, 5000); // Check after 5 seconds
    } catch (error) {
      console.error('MCP: Error loading Google API:', error);
    }
  }
  
  /**
   * Initializes or retrieves the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    return this.contextManager.initializeContext(existingConversationId);
  }
  
  /**
   * Add a user message to the context
   */
  async addUserMessage(message: string): Promise<void> {
    return this.contextManager.addUserMessage(message);
  }
  
  /**
   * Add an agent response to the context
   */
  async addAgentResponse(response: string): Promise<void> {
    return this.contextManager.addAgentResponse(response);
  }
  
  /**
   * Connect to Google Drive and authorize access with improved error handling
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    try {
      // Clear any connection timeout
      if (this.connectionTimeouts['connect']) {
        clearTimeout(this.connectionTimeouts['connect']);
      }
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((resolve) => {
        this.connectionTimeouts['connect'] = setTimeout(() => {
          console.error('MCP: Connection to Google Drive timed out');
          toast.error('Connection timed out', {
            description: 'Please check your network and try again'
          });
          resolve(false);
        }, 15000); // 15 seconds timeout
      });
      
      // Race between the actual connection and timeout
      const result = await Promise.race([
        this.driveService.connectToDrive(clientId, apiKey, cachedToken),
        timeoutPromise
      ]);
      
      // Clear the timeout if connection completed
      clearTimeout(this.connectionTimeouts['connect']);
      
      return result;
    } catch (error) {
      console.error('MCP: Error in connectToDrive:', error);
      toast.error('Connection failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return false;
    }
  }
  
  /**
   * Load document metadata from Google Drive with timeout and error handling
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    try {
      // Clear any listing timeout
      if (this.connectionTimeouts['listDocs']) {
        clearTimeout(this.connectionTimeouts['listDocs']);
      }
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<any[]>((resolve) => {
        this.connectionTimeouts['listDocs'] = setTimeout(() => {
          console.error('MCP: Listing documents timed out');
          toast.error('Document listing timed out', {
            description: 'Please check your network and try again'
          });
          resolve([]);
        }, 10000); // 10 seconds timeout
      });
      
      // Race between the actual listing and timeout
      const result = await Promise.race([
        this.driveService.listDocuments(folderId),
        timeoutPromise
      ]);
      
      // Clear the timeout if listing completed
      clearTimeout(this.connectionTimeouts['listDocs']);
      
      return result;
    } catch (error) {
      console.error('MCP: Error in listDocuments:', error);
      toast.error('Failed to list documents', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return [];
    }
  }
  
  /**
   * Fetch a specific document and add its content to the context with improved error handling
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    try {
      // Clear any fetch timeout
      if (this.connectionTimeouts['fetchDoc']) {
        clearTimeout(this.connectionTimeouts['fetchDoc']);
      }
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        this.connectionTimeouts['fetchDoc'] = setTimeout(() => {
          console.error('MCP: Document fetch timed out');
          toast.error('Document fetch timed out', {
            description: 'Please check your network and try again'
          });
          resolve(null);
        }, 12000); // 12 seconds timeout
      });
      
      // Race between the actual fetch and timeout
      const result = await Promise.race([
        this.driveService.fetchDocumentContent(documentId),
        timeoutPromise
      ]);
      
      // Clear the timeout if fetch completed
      clearTimeout(this.connectionTimeouts['fetchDoc']);
      
      if (!result) return null;
      
      // Add to context
      this.contextManager.addDocumentToContext({
        documentId,
        documentName: result.fileName,
        documentType: result.documentType,
        content: result.content
      });
      
      return result.content;
    } catch (error) {
      console.error(`MCP: Error fetching document ${documentId}:`, error);
      toast.error('Failed to fetch document', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return null;
    }
  }
  
  /**
   * Get the current context for use in AI models
   */
  getModelContext(): MCPContext | null {
    return this.contextManager.getModelContext();
  }
  
  /**
   * Update model preferences in the context
   */
  setModelPreference(model: string): void {
    this.contextManager.setModelPreference(model);
  }
  
  /**
   * Enable or disable Metis capabilities
   */
  setMetisActive(active: boolean): void {
    this.metisActive = active;
    this.contextManager.setMetisActive(active);
  }
  
  /**
   * Reset connection state
   */
  resetConnection(): void {
    // Clear all timeouts
    Object.values(this.connectionTimeouts).forEach(timeout => clearTimeout(timeout));
    this.connectionTimeouts = {};
    
    // Reset services
    this.driveService.setAuthenticated(false);
    localStorage.removeItem('gdrive-connected');
    localStorage.removeItem('gdrive-auth-token');
    
    // Reload the Google API
    this.loadGoogleApiWithRetry();
  }
  
  /**
   * Get the conversation ID
   */
  getConversationId(): string | null {
    return this.contextManager.getConversationId();
  }
  
  /**
   * Set the authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }
  
  /**
   * Set the server URL
   */
  setServerUrl(url: string): void {
    this.serverUrl = url;
  }
  
  /**
   * Check if connected to Google Drive
   */
  isConnectedToDrive(): boolean {
    return this.driveService.isConnectedToDrive() || localStorage.getItem('gdrive-connected') === 'true';
  }
}

// Singleton instance for global use
let mcpClientInstance: MCPClient | null = null;

/**
 * Get the global MCP client instance
 */
export const getMCPClient = (options?: MCPClientOptions): MCPClient => {
  if (!mcpClientInstance) {
    mcpClientInstance = new MCPClient(options);
  } else if (options) {
    // Update existing instance with new options if provided
    if (options.serverUrl) mcpClientInstance.setServerUrl(options.serverUrl);
    if (options.authToken) mcpClientInstance.setAuthToken(options.authToken);
    if (options.metisActive !== undefined) mcpClientInstance.setMetisActive(options.metisActive);
  }
  
  return mcpClientInstance;
};
