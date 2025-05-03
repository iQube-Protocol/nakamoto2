
import { MCPClientBase } from './client-base';

/**
 * Operations for managing context data
 */
export class ContextOperations extends MCPClientBase {
  /**
   * Initialize or retrieve the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    return this.contextManager.initializeContext(existingConversationId);
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
   * Get the document context
   */
  getDocumentContext(): Array<{
    documentId: string;
    documentName: string;
    documentType: string;
    content: string;
    lastModified?: string;
  }> | undefined {
    return this.contextManager.getDocumentContext();
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
  addMessage(role: string, content: string): void {
    this.contextManager.addMessage(role, content);
  }
  
  /**
   * Add a user message to the context
   */
  async addUserMessage(message: string): Promise<void> {
    await this.contextManager.addUserMessage(message);
  }
  
  /**
   * Add an agent response to the context
   */
  async addAgentResponse(response: string): Promise<void> {
    await this.contextManager.addAgentResponse(response);
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
  getContext(): any {
    return this.contextManager.getContext();
  }
}
