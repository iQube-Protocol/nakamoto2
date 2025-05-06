
import { MCPClientOptions } from './types';
import { DriveClientExtension } from './client/drive-client-extension';
import { ApiOperations } from './client/api-operations';

/**
 * Main class for interacting with the MCP (Meta-Contextual Processor) server
 * Combines API, Context, and Drive operations
 */
export class MCPClient extends DriveClientExtension {
  constructor(options: MCPClientOptions = {}) {
    super(options);
    
    // Initialize Drive operations (conditionally after API is loaded)
    this.initializeDriveOperations();
  }

  // Context operations
  async initializeContext(existingConversationId?: string): Promise<string> {
    return this.contextManager.initializeContext(existingConversationId);
  }
  
  async getDocumentsInContext(conversationId?: string): Promise<any[]> {
    if (conversationId) {
      // If a conversation ID is provided, set it first
      this.contextManager.setConversationId(conversationId);
    }
    
    const documents = this.contextManager.getDocumentContext() || [];
    return Promise.resolve(documents);
  }
  
  async addDocumentToContext(conversationId: string, document: any, documentType?: string, content?: string): Promise<boolean> {
    // First set the conversation ID to ensure we're in the right context
    this.contextManager.setConversationId(conversationId);
    
    // Then add the document
    this.contextManager.addDocument(
      document.id, 
      document.name || document.title, 
      document.mimeType || documentType || 'unknown',
      content || ''
    );
    
    return Promise.resolve(true);
  }
  
  async removeDocumentFromContext(conversationId: string, documentId: string): Promise<boolean> {
    // First set the conversation ID to ensure we're in the right context
    this.contextManager.setConversationId(conversationId);
    
    // Then remove the document
    this.contextManager.removeDocument(documentId);
    
    return Promise.resolve(true);
  }

  // Additional context methods
  async addUserMessage(message: string): Promise<void> {
    await this.contextManager.addUserMessage(message);
  }
  
  async addAgentResponse(response: string): Promise<void> {
    await this.contextManager.addAgentResponse(response);
  }
}

/**
 * Create a new MCP client
 */
export function getMCPClient(options: MCPClientOptions = {}): MCPClient {
  try {
    // Use a singleton pattern to prevent multiple instances
    if (typeof window !== 'undefined') {
      if (!(window as any).__mcpClient) {
        (window as any).__mcpClient = new MCPClient(options);
      }
      return (window as any).__mcpClient;
    }
    
    // Fallback to creating a new instance if window is not available
    return new MCPClient(options);
  } catch (error) {
    console.error('Error creating MCP client:', error);
    throw error;
  }
}

// Export types
export type { MCPClientOptions } from './types';
