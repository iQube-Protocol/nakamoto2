
import { MCPContext } from '../types';

/**
 * Manages document operations within the MCP context
 */
export class DocumentManager {
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
    if (!context.documentContext) {
      context.documentContext = [];
    }
    
    // Check if document already exists in context
    const existingDocIndex = context.documentContext.findIndex(doc => doc.documentId === documentId);
    
    if (existingDocIndex >= 0) {
      // Update existing document
      context.documentContext[existingDocIndex] = {
        documentId,
        documentName,
        documentType,
        content,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add new document
      context.documentContext.push({
        documentId,
        documentName,
        documentType,
        content,
        lastModified: new Date().toISOString()
      });
    }
    
    console.log(`Added/updated document ${documentName} to context`);
    return context;
  }
  
  /**
   * Remove document from context
   */
  removeDocumentFromContext(context: MCPContext, documentId: string): { context: MCPContext, removed: boolean } {
    if (!context.documentContext) {
      return { context, removed: false };
    }
    
    const initialLength = context.documentContext.length;
    context.documentContext = context.documentContext.filter(
      doc => doc.documentId !== documentId
    );
    
    const removed = initialLength > context.documentContext.length;
    
    if (removed) {
      console.log(`Removed document ${documentId} from context`);
    }
    
    return { context, removed };
  }
  
  /**
   * Get all documents in context
   */
  getDocuments(context: MCPContext | null) {
    if (!context || !context.documentContext) {
      return [];
    }
    
    return context.documentContext;
  }
}
