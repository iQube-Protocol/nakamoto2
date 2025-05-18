
import { MCPContext, MCPDocumentContext } from '../../types';
import { toast } from 'sonner';

/**
 * Manages document content operations
 */
export class DocumentContentManager {
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
          
          // Notify about successful recovery using the eventHelper
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
}
