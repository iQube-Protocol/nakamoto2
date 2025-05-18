
import { MCPContext } from '../types';
import { DocumentContentManager, DocumentOperationsManager } from './document';
import { toast } from 'sonner';

/**
 * Manages document operations within the MCP context
 */
export class DocumentManager {
  private contentManager: DocumentContentManager;
  private operationsManager: DocumentOperationsManager;
  
  constructor() {
    this.contentManager = new DocumentContentManager();
    this.operationsManager = new DocumentOperationsManager();
  }
  
  /**
   * Add document to context
   */
  addDocumentToContext(
    context: MCPContext,
    documentId: string,
    documentName: string,
    documentType: string,
    content: string
  ): MCPContext {
    return this.operationsManager.addDocumentToContext(
      context,
      documentId,
      documentName,
      documentType,
      content
    );
  }
  
  /**
   * Remove document from context
   */
  removeDocumentFromContext(context: MCPContext, documentId: string): { context: MCPContext, removed: boolean, documentName: string } {
    return this.operationsManager.removeDocumentFromContext(context, documentId);
  }
  
  /**
   * Get all documents in context
   */
  getDocuments(context: MCPContext | null) {
    return this.operationsManager.getDocuments(context);
  }
  
  /**
   * Verify document context integrity
   * Returns array of documents with issues
   */
  verifyDocumentIntegrity(context: MCPContext | null): Array<{documentId: string, documentName: string, issue: string}> {
    return this.contentManager.verifyDocumentIntegrity(context);
  }
  
  /**
   * Fix document content based on reported issues
   * This can be called to attempt recovery of documents with issues
   */
  async fixDocumentContent(
    context: MCPContext,
    documentId: string,
    fetchContentFn?: (id: string) => Promise<string | null>
  ): Promise<MCPContext> {
    return this.contentManager.fixDocumentContent(context, documentId, fetchContentFn);
  }
}
