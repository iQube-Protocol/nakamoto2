import axios, { AxiosInstance } from 'axios';
import { MCPContext, MCPClientOptions } from './types';
import { GoogleApiLoader } from './api/google-api-loader';
import { ContextManager } from './context-manager';
import { DriveOperations, createDriveOperations } from './drive/index';

/**
 * Main class for interacting with the MCP (Meta-Contextual Processor) server
 */
export class MCPClient {
  private serverUrl: string;
  private authToken: string | null;
  private axiosInstance: AxiosInstance;
  private apiLoader: GoogleApiLoader;
  private contextManager: ContextManager;
  private driveOperations: DriveOperations | null = null;
  private metisActive: boolean;
  private options: MCPClientOptions;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:8000';
    this.authToken = options.authToken || process.env.NEXT_PUBLIC_MCP_AUTH_TOKEN || null;
    this.metisActive = options.metisActive !== undefined ? options.metisActive : localStorage.getItem('metisActive') === 'true';
    this.options = options;
    
    // Initialize Axios instance
    this.axiosInstance = axios.create({
      baseURL: this.serverUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
      },
    });
    
    // Initialize Google API loader
    this.apiLoader = new GoogleApiLoader({
      onLoadStart: options.onApiLoadStart,
      onLoadComplete: options.onApiLoadComplete
    });
    
    // Initialize context manager
    this.contextManager = new ContextManager();
    
    // Initialize Drive operations (conditionally after API is loaded)
    this.initializeDriveOperations();
  }
  
  /**
   * Initialize Google Drive operations
   */
  private initializeDriveOperations(): void {
    // Ensure Google API is loaded before initializing DriveOperations
    this.apiLoader.ensureGoogleApiLoaded().then(() => {
      this.driveOperations = createDriveOperations({
        apiLoader: this.apiLoader,
        contextManager: this.contextManager
      });
    }).catch(error => {
      console.error('Failed to load Google API, Drive operations not available', error);
    });
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensure API is loaded');
      return false;
    }
    
    return this.driveOperations.connectToDrive(clientId, apiKey, cachedToken);
  }
  
  /**
   * List documents from Google Drive
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensure API is loaded');
      return [];
    }
    
    return this.driveOperations.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensure API is loaded');
      return null;
    }
    
    return this.driveOperations.fetchDocumentContent(documentId);
  }
  
  /**
   * Check if connected to Google Drive
   */
  isConnectedToDrive(): boolean {
    return this.driveOperations?.isConnectedToDrive() || false;
  }
  
  /**
   * Get the current connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.driveOperations?.getConnectionStatus() || 'disconnected';
  }
  
  /**
   * Reset the Google Drive connection
   */
  resetDriveConnection(): void {
    this.driveOperations?.setAuthenticationState(false);
  }
  
  /**
   * Check if the Google API is loaded
   */
  isApiLoaded(): boolean {
    return this.apiLoader.isApiLoaded();
  }
  
  /**
   * Get the GAPI client
   */
  getGapiClient(): any {
    return this.apiLoader.getGapiClient();
  }
  
  /**
   * Add document to the current context
   */
  addDocumentToContext(documentId: string, documentName: string, documentType: string, content: string): void {
    this.contextManager.addDocument(documentId, documentName, documentType, content);
  }
  
  /**
   * Remove document from the current context
   */
  removeDocumentFromContext(documentId: string): void {
    this.contextManager.removeDocument(documentId);
  }
  
  /**
   * Clear all documents from the current context
   */
  clearDocumentsFromContext(): void {
    this.contextManager.clearDocuments();
  }
  
  /**
   * Set the conversation ID for the current context
   */
  setConversationId(conversationId: string): void {
    this.contextManager.setConversationId(conversationId);
  }
  
  /**
   * Add a message to the current context
   */
  addMessageToContext(role: string, content: string): void {
    this.contextManager.addMessage(role, content);
  }
  
  /**
   * Clear all messages from the current context
   */
  clearMessagesFromContext(): void {
    this.contextManager.clearMessages();
  }
  
  /**
   * Set user profile data in the current context
   */
  setUserProfile(userProfile: Record<string, any>): void {
    this.contextManager.setUserProfile(userProfile);
  }
  
  /**
   * Set metadata in the current context
   */
  setMetadata(metadata: Record<string, any>): void {
    this.contextManager.setMetadata(metadata);
  }
  
  /**
   * Get the current context
   */
  getContext(): MCPContext {
    return this.contextManager.getContext();
  }
  
  /**
   * Submit the current context to the MCP server
   */
  async submitContext(context?: MCPContext): Promise<any> {
    try {
      const contextToSubmit = context || this.getContext();
      console.log('Submitting context to MCP server:', contextToSubmit);
      
      const response = await this.axiosInstance.post('/context', contextToSubmit);
      console.log('Context submission successful', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit context to MCP server:', error.message, error.response?.data);
      throw error;
    }
  }
  
  /**
   * Submit a query to the MCP server
   */
  async submitQuery(query: string, context?: MCPContext): Promise<any> {
    try {
      const contextToSubmit = context || this.getContext();
      console.log('Submitting query to MCP server:', query, contextToSubmit);
      
      const response = await this.axiosInstance.post('/query', {
        query: query,
        context: contextToSubmit
      });
      
      console.log('Query submission successful', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit query to MCP server:', error.message, error.response?.data);
      throw error;
    }
  }
  
  /**
   * Enable or disable metisActive mode
   */
  setMetisActive(value: boolean): void {
    this.metisActive = value;
    localStorage.setItem('metisActive', value.toString());
    this.contextManager.setMetadata({ metisActive: value });
  }
  
  /**
   * Get the current metisActive status
   */
  getMetisActive(): boolean {
    return this.metisActive;
  }
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    this.driveOperations?.cleanup();
  }
}

// Function to create a new MCP client
export function getMCPClient(options: MCPClientOptions = {}): MCPClient {
  return new MCPClient(options);
}
