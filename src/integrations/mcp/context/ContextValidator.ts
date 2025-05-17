
import { MCPContext } from '../types';

/**
 * Validates context integrity
 */
export class ContextValidator {
  /**
   * Validate document context integrity
   */
  validateDocumentContext(context: MCPContext): {
    valid: boolean;
    invalidDocuments: Array<{documentId: string, documentName: string, reason: string}>
  } {
    const result = {
      valid: true,
      invalidDocuments: [] as Array<{documentId: string, documentName: string, reason: string}>
    };
    
    if (!context.documentContext || context.documentContext.length === 0) {
      console.log(`No documents found in context`);
      return result;
    }
    
    console.log(`Validating ${context.documentContext.length} documents in context:`, 
      context.documentContext.map(doc => doc.documentName));
      
    // Check each document for content validity
    context.documentContext.forEach((doc, i) => {
      console.log(`Document ${i+1}: ${doc.documentName}, Content length: ${doc.content?.length || 0}`);
      
      // Check for required document properties
      if (!doc.documentId) {
        result.valid = false;
        result.invalidDocuments.push({
          documentId: 'unknown',
          documentName: doc.documentName || 'Unknown document',
          reason: 'Missing document ID'
        });
      }
      
      if (!doc.documentName) {
        result.valid = false;
        result.invalidDocuments.push({
          documentId: doc.documentId || 'unknown',
          documentName: 'Unknown document',
          reason: 'Missing document name'
        });
      }
      
      // Check content integrity
      if (!doc.content || doc.content.length === 0) {
        console.warn(`⚠️ Document ${doc.documentName} has no content! This will affect agent functionality.`);
        result.valid = false;
        result.invalidDocuments.push({
          documentId: doc.documentId || 'unknown',
          documentName: doc.documentName || 'Unknown document',
          reason: 'Missing or empty content'
        });
      }
      
      // Check for placeholder content (indicating incomplete storage)
      if (doc.content && doc.content.startsWith('[Content removed due to storage limitations')) {
        result.valid = false;
        result.invalidDocuments.push({
          documentId: doc.documentId,
          documentName: doc.documentName,
          reason: 'Content truncated due to storage limitations'
        });
      }
    });
    
    if (!result.valid) {
      console.warn(`⚠️ Found ${result.invalidDocuments.length} documents with issues:`, 
        result.invalidDocuments.map(d => `${d.documentName} (${d.reason})`));
    }
    
    return result;
  }
  
  /**
   * Validate context before saving
   */
  validateBeforeSave(context: MCPContext): {
    valid: boolean;
    totalSize: number;
    largeDocuments: Array<{documentId: string, documentName: string, size: number}>
  } {
    const result = {
      valid: true,
      totalSize: 0,
      largeDocuments: [] as Array<{documentId: string, documentName: string, size: number}>
    };
    
    // Check overall context size to predict storage issues
    const contextString = JSON.stringify(context);
    result.totalSize = contextString.length;
    
    const maxLocalStorageSize = 5 * 1024 * 1024; // ~5MB common limit
    if (result.totalSize > maxLocalStorageSize * 0.8) {
      result.valid = false;
      console.warn(`⚠️ Context size (${result.totalSize} bytes) may exceed localStorage limits`);
    }
    
    // Verify document content integrity
    if (context.documentContext && context.documentContext.length > 0) {
      const invalidDocs = context.documentContext.filter(doc => !doc.content || doc.content.length === 0);
      if (invalidDocs.length > 0) {
        result.valid = false;
        console.warn(`⚠️ Attempting to save context with ${invalidDocs.length} invalid documents:`, 
          invalidDocs.map(d => d.documentName));
      }
      
      // Identify large documents that might cause storage issues
      const largeDocThreshold = 500000; // ~500KB
      context.documentContext.forEach(doc => {
        const contentSize = doc.content ? doc.content.length : 0;
        if (contentSize > largeDocThreshold) {
          result.largeDocuments.push({
            documentId: doc.documentId,
            documentName: doc.documentName,
            size: contentSize
          });
        }
      });
      
      if (result.largeDocuments.length > 0) {
        console.log(`Found ${result.largeDocuments.length} large documents that will be chunked:`, 
          result.largeDocuments.map(d => `${d.documentName} (${Math.round(d.size/1024)}KB)`));
      }
      
      // Log document sizes for debugging
      const docSizes = context.documentContext.map(doc => ({
        name: doc.documentName,
        size: doc.content ? doc.content.length : 0
      }));
      console.log('Document sizes before storage:', docSizes);
    }
    
    return result;
  }
}
