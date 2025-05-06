
import { MCPContextData } from '../types';

/**
 * Manager for document operations in the context
 */
export class DocumentManager {
  /**
   * Add document to the context
   */
  static addDocument(
    context: MCPContextData,
    documentId: string,
    documentName: string,
    documentType: string,
    content: string
  ): void {
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
  }
  
  /**
   * Remove document from context
   */
  static removeDocument(context: MCPContextData, documentId: string): boolean {
    if (!context.documentContext) return false;
    
    const initialLength = context.documentContext.length;
    context.documentContext = context.documentContext.filter(doc => doc.documentId !== documentId);
    
    return context.documentContext.length < initialLength;
  }
  
  /**
   * Clear all documents from context
   */
  static clearDocuments(context: MCPContextData): boolean {
    if (!context.documentContext || context.documentContext.length === 0) {
      return false;
    }
    
    context.documentContext = [];
    return true;
  }
  
  /**
   * Get the document context
   */
  static getDocumentContext(context: MCPContextData): Array<{
    documentId: string;
    documentName: string;
    documentType: string;
    content: string;
    lastModified?: string;
  }> | undefined {
    return context.documentContext;
  }
}
