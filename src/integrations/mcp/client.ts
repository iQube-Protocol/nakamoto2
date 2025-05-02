import { toast } from 'sonner';
import type { MCPClientOptions, MCPContext } from './types';
import { GoogleApiLoader } from './api/google-api-loader';
import { ContextManager } from './context-manager';
import { DriveOperations } from './drive-operations';

/**
 * Model Context Protocol Client for managing conversation context
 * and document interactions with Google Drive
 */
export class MCPClient {
  private conversationId: string | null = null;
  public serverUrl: string;
  private authToken: string | null;
  private apiLoader: GoogleApiLoader;
  private contextManager: ContextManager;
  private driveOperations: DriveOperations;
  private documentCacheEnabled: boolean = true;
  private documentContextCache: Record<string, any[]> = {};
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://mcp-gdrive-server.example.com';
    this.authToken = options.authToken || null;
    
    // Initialize sub-modules
    this.apiLoader = new GoogleApiLoader({
      onApiLoadStart: options.onApiLoadStart || null,
      onApiLoadComplete: options.onApiLoadComplete || null
    });
    
    this.contextManager = new ContextManager(options.metisActive || false);
    this.driveOperations = new DriveOperations(this.apiLoader, this.contextManager);
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.serverUrl,
      hasAuthToken: !!this.authToken,
      metisActive: options.metisActive || false
    });
    
    // Try to restore any cached document context from localStorage
    this.loadDocumentContextCache();
    
    // Set up connection monitoring
    this.setupConnectionMonitoring();
  }
  
  /**
   * Load document context cache from localStorage if available
   */
  private loadDocumentContextCache(): void {
    try {
      const cachedData = localStorage.getItem('document-context-cache');
      if (cachedData) {
        this.documentContextCache = JSON.parse(cachedData);
        console.log('MCP: Loaded document context cache with', Object.keys(this.documentContextCache).length, 'entries');
      }
    } catch (error) {
      console.error("Error loading document context cache:", error);
    }
  }
  
  /**
   * Save document context cache to localStorage
   */
  private saveDocumentContextCache(): void {
    if (!this.documentCacheEnabled) return;
    
    try {
      localStorage.setItem('document-context-cache', JSON.stringify(this.documentContextCache));
      console.log('MCP: Saved document context cache with', Object.keys(this.documentContextCache).length, 'entries');
    } catch (error) {
      console.error("Error saving document context cache:", error);
    }
  }
  
  /**
   * Setup periodic connection monitoring
   */
  private setupConnectionMonitoring(): void {
    // Clear any existing interval
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    // Check connection every minute
    this.connectionCheckInterval = setInterval(() => {
      if (this.isConnectedToDrive()) {
        // If we're connected, verify the API is still loaded
        if (!this.apiLoader.isLoaded()) {
          console.log('MCP: API no longer loaded but connection state is true. Resetting connection state.');
          localStorage.setItem('gdrive-connected', 'false');
        }
      }
    }, 60000); // Check every minute
  }
  
  /**
   * Initialize or retrieve the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    try {
      const conversationId = await this.contextManager.initializeContext(existingConversationId);
      this.conversationId = conversationId;
      
      // If we have cached document context for this conversation, restore it
      if (this.documentCacheEnabled && conversationId && this.documentContextCache[conversationId]) {
        const cachedDocs = this.documentContextCache[conversationId];
        console.log(`MCP: Restoring ${cachedDocs.length} cached documents for conversation ${conversationId}`);
        
        // Apply cached docs to the context
        cachedDocs.forEach(doc => {
          this.contextManager.addDocumentToContext(
            doc.id,
            doc.name,
            doc.documentType || doc.mimeType.split('/')[1] || 'plain',
            doc.content
          );
        });
      }
      
      return conversationId;
    } catch (error) {
      console.error("Error initializing context:", error);
      // Generate a fallback conversation ID if context initialization fails
      const fallbackId = `fallback-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.conversationId = fallbackId;
      return fallbackId;
    }
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
   * Add document content to context and cache it
   */
  addDocumentToContext(documentId: string, documentName: string, documentType: string, content: string): void {
    this.contextManager.addDocumentToContext(documentId, documentName, documentType, content);
    
    // Cache the document for this conversation
    if (this.documentCacheEnabled && this.conversationId) {
      if (!this.documentContextCache[this.conversationId]) {
        this.documentContextCache[this.conversationId] = [];
      }
      
      // Check if it's already in the cache
      const existingIndex = this.documentContextCache[this.conversationId].findIndex(doc => doc.id === documentId);
      
      if (existingIndex === -1) {
        // Add to cache if not already present
        this.documentContextCache[this.conversationId].push({
          id: documentId,
          name: documentName,
          documentType: documentType,
          mimeType: `application/${documentType}`,
          content: content
        });
        
        // Save to localStorage
        this.saveDocumentContextCache();
        console.log(`MCP: Added document ${documentId} to context cache for conversation ${this.conversationId}`);
      }
    }
  }
  
  /**
   * Remove a document from context and cache
   */
  removeDocumentFromContext(documentId: string): boolean {
    const context = this.contextManager.getModelContext();
    let removed = false;
    
    if (context?.documentContext) {
      // Filter out the document to remove
      const originalLength = context.documentContext.length;
      context.documentContext = context.documentContext.filter(doc => doc.documentId !== documentId);
      removed = originalLength !== context.documentContext.length;
      
      // Update cache if document was removed
      if (removed && this.documentCacheEnabled && this.conversationId) {
        if (this.documentContextCache[this.conversationId]) {
          this.documentContextCache[this.conversationId] = 
            this.documentContextCache[this.conversationId].filter(doc => doc.id !== documentId);
          
          // Save updated cache
          this.saveDocumentContextCache();
          console.log(`MCP: Removed document ${documentId} from context cache for conversation ${this.conversationId}`);
        }
      }
    }
    
    return removed;
  }
  
  /**
   * Get document context for current conversation
   */
  getDocumentContext(conversationId?: string): any[] {
    const targetId = conversationId || this.conversationId;
    
    if (!targetId) return [];
    
    // First check if we have cached context
    if (this.documentCacheEnabled && this.documentContextCache[targetId]) {
      return this.documentContextCache[targetId];
    }
    
    // Otherwise try to get from active context
    const context = this.contextManager.getModelContext();
    if (context?.documentContext) {
      return context.documentContext.map(doc => ({
        id: doc.documentId,
        name: doc.documentName,
        documentType: doc.documentType,
        mimeType: `application/${doc.documentType}`,
        content: doc.content
      }));
    }
    
    return [];
  }
  
  /**
   * Force persist the current context
   */
  persistContext(): void {
    try {
      this.contextManager.persistContext();
      
      // Also save document cache
      if (this.documentCacheEnabled) {
        this.saveDocumentContextCache();
      }
    } catch (error) {
      console.error("Error persisting context:", error);
    }
  }
  
  /**
   * Connect to Google Drive
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    // Dismiss any existing toasts to prevent stacking
    toast.dismiss(); 
    
    // Show a short-lived loading toast
    toast.loading('Connecting to Google Drive...', {
      id: 'drive-connection',
      duration: 15000, // Auto-dismiss after 15 seconds if connection hangs
    });
    
    try {
      const result = await this.driveOperations.connectToDrive(clientId, apiKey, cachedToken);
      
      // Dismiss the loading toast
      toast.dismiss('drive-connection');
      
      if (result) {
        // Connection successful, clear existing document cache
        localStorage.setItem('gdrive-connected', 'true');
        toast.success('Connected to Google Drive', {
          duration: 3000,
          id: 'drive-connected',
        });
      } else {
        // Connection failed
        localStorage.setItem('gdrive-connected', 'false');
        toast.error('Failed to connect to Google Drive', {
          duration: 5000,
          id: 'drive-connect-failed',
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error connecting to Drive:", error);
      
      // Dismiss the loading toast
      toast.dismiss('drive-connection');
      
      // Show error toast
      toast.error('Connection error', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000,
        id: 'drive-connect-error',
      });
      
      // Ensure connection state is false
      localStorage.setItem('gdrive-connected', 'false');
      
      return false;
    }
  }
  
  /**
   * List documents from Google Drive
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    // Dismiss any existing list-documents toasts to prevent stacking
    toast.dismiss('list-documents'); 
    
    try {
      return await this.driveOperations.listDocuments(folderId);
    } catch (error) {
      console.error("Error listing documents:", error);
      
      toast.error('Could not retrieve documents', { 
        duration: 3000,
        description: 'Please try reconnecting to Google Drive',
        id: 'list-documents-error',
      });
      
      return [];
    }
  }
  
  /**
   * Fetch document content
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    // Dismiss any document-specific toasts
    toast.dismiss(`doc-content-${documentId}`);
    
    try {
      const content = await this.driveOperations.fetchDocumentContent(documentId);
      return content;
    } catch (error) {
      console.error("Error fetching document content:", error);
      
      toast.error('Could not fetch document content', { 
        duration: 3000,
        description: 'Please try again or check file permissions',
        id: 'fetch-document-error',
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
    this.contextManager.setMetisActive(active);
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
   * Enable or disable document context caching
   */
  setDocumentCacheEnabled(enabled: boolean): void {
    this.documentCacheEnabled = enabled;
    
    if (!enabled) {
      // Clear cache if disabling
      this.documentContextCache = {};
      localStorage.removeItem('document-context-cache');
    }
  }
  
  /**
   * Check if connected to Google Drive
   */
  isConnectedToDrive(): boolean {
    return this.driveOperations.isConnectedToDrive();
  }
  
  /**
   * Get the current connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.driveOperations.getConnectionStatus();
  }
  
  /**
   * Reset the drive connection state
   */
  resetDriveConnection(): void {
    console.log('MCP: Resetting Drive connection');
    
    // Clear any existing toasts to prevent persistence
    toast.dismiss();
    
    this.driveOperations.setAuthenticationState(false);
    
    // Force reload Google API to ensure clean state
    this.apiLoader.reloadGoogleApi();
    
    // Clean up any timers or intervals
    if (typeof this.driveOperations.cleanup === 'function') {
      this.driveOperations.cleanup();
    }
    
    // Show a non-persistent toast
    toast.info('Google Drive connection has been reset', {
      description: 'You will need to reconnect to access your documents',
      duration: 5000, // Auto-dismiss after 5 seconds
      id: 'connection-reset',
    });
  }
  
  /**
   * Check if API is loaded
   */
  isApiLoaded(): boolean {
    return this.apiLoader.isLoaded();
  }
  
  /**
   * Get current API load attempt count
   */
  getApiLoadAttempts(): number {
    return this.apiLoader.getLoadAttempts();
  }
  
  /**
   * Reset API load attempts counter
   */
  resetApiLoadAttempts(): void {
    this.apiLoader.resetLoadAttempts();
  }
  
  /**
   * Add a listener for API loaded event
   */
  addApiLoadListener(callback: () => void): void {
    if (typeof this.apiLoader.addLoadListener === 'function') {
      this.apiLoader.addLoadListener(callback);
    } else {
      console.warn('MCP: addLoadListener not available in this version');
      // Still try to call the callback if the API is already loaded
      if (this.isApiLoaded()) {
        setTimeout(callback, 0);
      }
    }
  }
  
  /**
   * Clear document context cache for all conversations
   */
  clearDocumentContextCache(): void {
    this.documentContextCache = {};
    localStorage.removeItem('document-context-cache');
    console.log('MCP: Cleared document context cache');
  }
  
  /**
   * Cleanup resources when no longer needed
   */
  cleanup(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
    
    if (typeof this.driveOperations.cleanup === 'function') {
      this.driveOperations.cleanup();
    }
  }
  
  // Public getter for api loader's callbacks to support existing code
  public get onApiLoadStart(): (() => void) | null {
    return this.apiLoader.onApiLoadStart;
  }
  
  public set onApiLoadStart(callback: (() => void) | null) {
    this.apiLoader.onApiLoadStart = callback;
  }
  
  public get onApiLoadComplete(): (() => void) | null {
    return this.apiLoader.onApiLoadComplete;
  }
  
  public set onApiLoadComplete(callback: (() => void) | null) {
    this.apiLoader.onApiLoadComplete = callback;
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
    
    // Handle API loading callbacks
    if (options.onApiLoadStart) {
      mcpClientInstance.onApiLoadStart = options.onApiLoadStart;
    }
    if (options.onApiLoadComplete) {
      mcpClientInstance.onApiLoadComplete = options.onApiLoadComplete;
    }
  }
  
  return mcpClientInstance;
};

// Re-export the types as type-only exports
export type { MCPContext, MCPClientOptions } from './types';
