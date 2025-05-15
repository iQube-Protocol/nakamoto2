
import { MCPContext } from '../types';

/**
 * Validates context integrity
 */
export class ContextValidator {
  /**
   * Validate document context integrity
   */
  validateDocumentContext(context: MCPContext): void {
    if (context.documentContext && context.documentContext.length > 0) {
      console.log(`Validating ${context.documentContext.length} documents in context:`, 
        context.documentContext.map(doc => doc.documentName));
        
      // Verify document content integrity
      const invalidDocs = context.documentContext.filter(doc => !doc.content || doc.content.length === 0);
      
      if (invalidDocs.length > 0) {
        console.warn(`⚠️ Found ${invalidDocs.length} documents with invalid content:`, 
          invalidDocs.map(d => d.documentName));
      }
      
      context.documentContext.forEach((doc, i) => {
        console.log(`Document ${i+1}: ${doc.documentName}, Content length: ${doc.content?.length || 0}`);
        if (!doc.content || doc.content.length === 0) {
          console.warn(`⚠️ Document ${doc.documentName} has no content! This will affect agent functionality.`);
        }
      });
    } else {
      console.log(`No documents found in context`);
    }
  }
  
  /**
   * Validate context before saving
   */
  validateBeforeSave(context: MCPContext): void {
    // Verify document content integrity before saving
    if (context.documentContext && context.documentContext.length > 0) {
      const invalidDocs = context.documentContext.filter(doc => !doc.content || doc.content.length === 0);
      if (invalidDocs.length > 0) {
        console.warn(`⚠️ Attempting to save context with ${invalidDocs.length} invalid documents:`, 
          invalidDocs.map(d => d.documentName));
      }
      
      // Log document sizes for debugging
      const docSizes = context.documentContext.map(doc => ({
        name: doc.documentName,
        size: doc.content ? doc.content.length : 0
      }));
      console.log('Document sizes before storage:', docSizes);
    }
  }
  
  /**
   * Complete context validation including messages and documents
   */
  validateFullContext(context: MCPContext): boolean {
    let isValid = true;
    
    // Validate document context
    if (context.documentContext) {
      const invalidDocs = context.documentContext.filter(doc => !doc.content || doc.content.length === 0);
      
      if (invalidDocs.length > 0) {
        console.warn(`⚠️ Invalid document context detected: ${invalidDocs.length} documents with missing content`);
        isValid = false;
      }
      
      // Check for suspiciously short content
      const shortDocs = context.documentContext.filter(doc => 
        doc.content && doc.content.length > 0 && doc.content.length < 20
      );
      
      if (shortDocs.length > 0) {
        console.warn(`⚠️ Suspiciously short document content detected for:`, 
          shortDocs.map(d => d.documentName));
        isValid = false;
      }
    }
    
    // Validate conversation context
    if (context.conversationContext && context.conversationContext.length === 0) {
      console.warn("⚠️ Empty conversation context");
    }
    
    // Validate conversation ID
    if (!context.conversationId) {
      console.warn("⚠️ Missing conversation ID in context");
      isValid = false;
    }
    
    return isValid;
  }
}
