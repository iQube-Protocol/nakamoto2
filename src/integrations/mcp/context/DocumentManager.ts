
import { MCPContext } from '../types';
import { toast } from 'sonner';

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
    this.dispatchDocumentUpdatedEvent(documentId, 'added', {
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
      this.dispatchDocumentUpdatedEvent(documentId, 'removed', { documentName });
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
  
  /**
   * Verify document context integrity
   * Returns array of documents with issues
   */
  verifyDocumentIntegrity(context: MCPContext | null): Array<{documentId: string, documentName: string, issue: string}> {
    const issues: Array<{documentId: string, documentName: string, issue: string}> = [];
    
    if (!context || !context.documentContext) {
      return issues;
    }
    
    context.documentContext.forEach(doc => {
      if (!doc.documentId) {
        issues.push({
          documentId: 'unknown',
          documentName: doc.documentName || 'unknown',
          issue: 'Missing document ID'
        });
      }
      
      if (!doc.documentName) {
        issues.push({
          documentId: doc.documentId,
          documentName: 'unknown',
          issue: 'Missing document name'
        });
      }
      
      if (!doc.content) {
        issues.push({
          documentId: doc.documentId,
          documentName: doc.documentName,
          issue: 'Missing document content'
        });
      } else if (doc.content.length === 0) {
        issues.push({
          documentId: doc.documentId,
          documentName: doc.documentName,
          issue: 'Empty document content'
        });
      }
      
      // Check for content integrity if metadata is available
      if (doc.metadata && doc.metadata.originalLength) {
        if (doc.content.length !== doc.metadata.originalLength) {
          issues.push({
            documentId: doc.documentId,
            documentName: doc.documentName,
            issue: `Content length mismatch: current ${doc.content.length}, original ${doc.metadata.originalLength}`
          });
        }
      }
    });
    
    return issues;
  }
  
  /**
   * Dispatch custom event when document is updated
   */
  private dispatchDocumentUpdatedEvent(documentId: string, action: 'added' | 'removed' | 'updated', details: any): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('documentContextUpdated', { 
        detail: { 
          documentId, 
          action,
          timestamp: Date.now(),
          ...details
        } 
      });
      window.dispatchEvent(event);
      console.log(`Dispatched documentContextUpdated event for ${action} action on document ${details.documentName || documentId}`);
    }
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
    // Find the document in context
    if (!context.documentContext) {
      return context;
    }
    
    const docIndex = context.documentContext.findIndex(doc => doc.documentId === documentId);
    if (docIndex === -1) {
      console.warn(`Cannot fix document ${documentId}: not found in context`);
      return context;
    }
    
    const doc = context.documentContext[docIndex];
    console.log(`Attempting to fix document content for ${doc.documentName}`);
    
    // If we have a fetch function, try to re-fetch the content
    if (fetchContentFn) {
      try {
        console.log(`Re-fetching content for document ${doc.documentName}`);
        const freshContent = await fetchContentFn(documentId);
        
        if (freshContent && freshContent.length > 0) {
          // Update the document with fresh content
          context.documentContext[docIndex].content = freshContent;
          context.documentContext[docIndex].lastModified = new Date().toISOString();
          context.documentContext[docIndex].metadata = {
            ...doc.metadata,
            originalLength: freshContent.length,
            recoveryTimestamp: new Date().toISOString()
          };
          
          console.log(`Successfully recovered content for document ${doc.documentName}, new length: ${freshContent.length}`);
          
          // Notify about successful recovery
          this.dispatchDocumentUpdatedEvent(documentId, 'updated', {
            documentName: doc.documentName,
            contentLength: freshContent.length,
            recovered: true
          });
          
          toast.success(`Document recovered: "${doc.documentName}"`);
        } else {
          console.error(`Failed to recover content for document ${doc.documentName}: empty content returned`);
        }
      } catch (error) {
        console.error(`Error recovering document content:`, error);
        toast.error(`Failed to recover document "${doc.documentName}"`, {
          description: 'Unable to retrieve document content. Please try re-adding the document.'
        });
      }
    } else {
      console.warn(`No content fetch function provided for document recovery`);
    }
    
    return context;
  }
}
