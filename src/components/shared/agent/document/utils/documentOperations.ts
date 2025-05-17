
import { toast } from 'sonner';

/**
 * Handles document addition to context
 */
export async function addDocumentToContext(
  client: any,
  conversationId: string | null,
  document: any,
  fetchDocument: (id: string) => Promise<string | null>
) {
  if (!client) {
    throw new Error('MCP client not initialized');
  }
  
  if (!conversationId) {
    throw new Error('No active conversation');
  }
  
  // Check if document is already in context (this will be handled by the hook)
  
  console.log(`Adding document to context: ${document.name} (${document.id})`);
  
  try {
    // Initialize the context with the conversation ID
    await client.initializeContext(conversationId);
    
    // Fetch document content
    console.log(`Fetching content for document ${document.name}...`);
    const content = await fetchDocument(document.id);
    if (!content) {
      throw new Error('Failed to fetch document content');
    }
    
    console.log(`Document content fetched, length: ${content.length}`);
    
    // Extract document type from mimeType
    const documentType = document.mimeType.split('/').pop() || 'unknown';
    
    // Add to model context
    console.log(`Adding document to MCP context: ${document.name}, type: ${documentType}`);
    client.addDocumentToContext(
      document.id,
      document.name,
      documentType,
      content
    );
    
    // Verify the document was added to context
    const updatedContext = client.getModelContext();
    const docInContext = updatedContext?.documentContext?.find(d => d.documentId === document.id);
    
    if (docInContext) {
      console.log(`Document successfully added to context. Content length: ${docInContext.content.length}`);
      
      // Double-check content
      if (docInContext.content.length === 0) {
        console.error("Document added but content is empty!");
        throw new Error("Document content is empty after adding to context");
      }
    } else {
      console.error("Document not found in context after adding!");
      throw new Error("Failed to add document to context");
    }
    
    // Document with content for local tracking
    return {
      id: document.id,
      name: document.name,
      mimeType: document.mimeType,
      content: content,
      added: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error adding document ${document.name} to context:`, error);
    
    // Check if it's a storage quota error
    if (error instanceof Error && error.message.includes('storage')) {
      toast.error('Storage limit exceeded', {
        description: 'The document is too large to store in the browser. Try splitting it into smaller documents.'
      });
    } else {
      toast.error('Failed to add document', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    throw error;
  }
}

/**
 * Handles document removal from context
 */
export function removeDocumentFromContext(
  client: any,
  conversationId: string | null,
  documentId: string,
  documentName: string
): boolean {
  try {
    console.log(`Removing document from context: ${documentId}`);
    
    // Remove from the client context
    if (client && conversationId) {
      // Remove from MCP context first
      const removed = client.removeDocumentFromContext(documentId);
      console.log(`Document ${documentId} removal from MCP context: ${removed ? 'successful' : 'failed'}`);
      
      // Verify document was removed
      const updatedContext = client.getModelContext();
      const stillInContext = updatedContext?.documentContext?.some(d => d.documentId === documentId);
      
      if (stillInContext) {
        console.warn(`Document ${documentName} still in context after removal attempt!`);
      } else {
        console.log(`Document ${documentName} successfully removed from context`);
      }
      
      if (removed) {
        toast.success(`Document "${documentName}" removed from context`);
      }
      
      return removed;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing document:', error);
    toast.error('Failed to remove document');
    return false;
  }
}

/**
 * Loads document context from the MCP client
 */
export async function loadDocumentsFromContext(client: any, conversationId: string | null): Promise<any[]> {
  if (!client) {
    console.log("Cannot load document context: MCP client not available");
    return [];
  }
  
  if (!conversationId) {
    console.log("Cannot load document context: Conversation ID not available");
    return [];
  }
  
  try {
    // Always initialize context first to ensure we have the latest
    await client.initializeContext(conversationId);
    console.log(`Context initialized for conversation ${conversationId}`);
    
    // Get context and verify it exists
    const context = client.getModelContext();
    console.log("Loading document context. Context available:", !!context);
    
    if (!context) {
      console.warn('No context available after initialization');
      return [];
    }
    
    if (context.documentContext) {
      const docs = context.documentContext.map(doc => ({
        id: doc.documentId,
        name: doc.documentName,
        mimeType: `application/${doc.documentType}`,
        content: doc.content,
        metadata: doc.metadata || {}
      }));
      
      if (docs.length === 0) {
        console.log("Document context is empty");
        return [];
      }
      
      console.log(`Documents loaded: ${docs.length}`, docs.map(d => d.name));
      
      // Verify document content is loaded
      let contentMissing = false;
      docs.forEach((doc, index) => {
        console.log(`Document ${index + 1}: ${doc.name}, Content length: ${doc.content?.length || 0}`);
        if (!doc.content || doc.content.length === 0) {
          console.warn(`⚠️ Document ${doc.name} has no content!`);
          contentMissing = true;
        }
      });
      
      if (contentMissing) {
        console.error("Some documents have missing content!");
      }
      
      return docs;
    }
    
    console.log("No document context available");
    return [];
  } catch (error) {
    console.error("Error loading document context:", error);
    toast.error("Failed to load document context", {
      description: error instanceof Error ? error.message : "Unknown error"
    });
    return [];
  }
}

/**
 * Dispatches a document context updated event
 */
export function dispatchDocumentContextUpdated(documentId: string, action: string, details?: any): void {
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent('documentContextUpdated', { 
    detail: { 
      documentId, 
      action,
      timestamp: Date.now(),
      ...details
    } 
  });
  
  window.dispatchEvent(event);
  console.log(`Dispatched documentContextUpdated event for ${action} action on document ${documentId}`);
}

/**
 * Trigger document content recovery
 */
export function triggerDocumentRecovery(documentId: string, documentName: string, reason: string): void {
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent('documentContentRecoveryNeeded', { 
    detail: { 
      documentId,
      documentName,
      reason,
      timestamp: Date.now()
    } 
  });
  
  window.dispatchEvent(event);
  console.log(`Triggered recovery for document ${documentName}: ${reason}`);
}

/**
 * Get estimated storage usage
 */
export function getStorageUsage(): { used: number, available: number, percentUsed: number } {
  try {
    let totalBytes = 0;
    
    // Calculate localStorage usage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalBytes += (key.length + value.length) * 2; // Unicode characters ~2 bytes each
      }
    }
    
    // Estimate available space (5MB is common limit)
    const estimatedLimit = 5 * 1024 * 1024;
    const remainingBytes = Math.max(0, estimatedLimit - totalBytes);
    const percentUsed = (totalBytes / estimatedLimit) * 100;
    
    return {
      used: totalBytes,
      available: remainingBytes,
      percentUsed
    };
  } catch (e) {
    console.error('Error calculating storage usage:', e);
    return { used: 0, available: 0, percentUsed: 0 };
  }
}
