
import { MCPContext, MCPDocumentContext } from '../../types';
import { DocumentEventHelper } from './DocumentEventHelper';

/**
 * Manages document operations within the MCP context
 */
export class DocumentOperationsManager {
  private eventHelper: DocumentEventHelper;
  
  constructor() {
    this.eventHelper = new DocumentEventHelper();
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
    // Validate inputs
    if (!documentId) throw new Error('Document ID is required');
    if (!documentName) throw new Error('Document name is required');
    if (!documentType) throw new Error('Document type is required');
    if (!content) throw new Error('Document content is required');
    
    // Ensure the document context array exists
    if (!context.documentContext) {
      console.log('Creating new document context array');
      context.documentContext = [];
    }
    
    // Check if document already exists in context
    const existingDocIndex = context.documentContext.findIndex(doc => doc.documentId === documentId);
    
    // Store an attribute with original content length for integrity checking
    const contentMetadata = {
      originalLength: content.length,
      addedTimestamp: new Date().toISOString()
    };
    
    if (existingDocIndex >= 0) {
      // Update existing document
      console.log(`Updating existing document in context: ${documentName}`);
      context.documentContext[existingDocIndex] = {
        documentId,
        documentName,
        documentType,
        content,
        lastModified: new Date().toISOString(),
        metadata: contentMetadata
      };
    } else {
      // Add new document
      console.log(`Adding new document to context: ${documentName}`);
      context.documentContext.push({
        documentId,
        documentName,
        documentType,
        content,
        lastModified: new Date().toISOString(),
        metadata: contentMetadata
      });
    }
    
    // Verify content was properly added
    const addedDoc = context.documentContext.find(doc => doc.documentId === documentId);
    if (!addedDoc) {
      throw new Error(`Failed to add document ${documentName} to context`);
    }
    
    if (!addedDoc.content || addedDoc.content.length === 0) {
      throw new Error(`Document ${documentName} was added but content is empty`);
    }
    
    console.log(`Added/updated document ${documentName} to context. Content length: ${addedDoc.content.length}`);
    
    // Set a custom event to notify other components
    this.eventHelper.dispatchDocumentUpdatedEvent(documentId, 'added', {
      contentLength: content.length,
      documentName
    });
    
    return context;
  }
  
  /**
   * Remove document from context
   */
  removeDocumentFromContext(context: MCPContext, documentId: string): { context: MCPContext, removed: boolean, documentName: string } {
    if (!context.documentContext) {
      console.log('No document context exists to remove from');
      return { context, removed: false, documentName: '' };
    }
    
    // Find the document to log its name before removal
    const documentToRemove = context.documentContext.find(doc => doc.documentId === documentId);
    const documentName = documentToRemove ? documentToRemove.documentName : documentId;
    
    const initialLength = context.documentContext.length;
    context.documentContext = context.documentContext.filter(
      doc => doc.documentId !== documentId
    );
    
    const removed = initialLength > context.documentContext.length;
    
    if (removed) {
      console.log(`Removed document ${documentName} from context`);
      
      // Trigger document removed event
      this.eventHelper.dispatchDocumentUpdatedEvent(documentId, 'removed', { documentName });
    } else {
      console.log(`Document ${documentName} not found in context`);
    }
    
    return { context, removed, documentName };
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
