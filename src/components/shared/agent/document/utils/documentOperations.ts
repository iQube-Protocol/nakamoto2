
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
    console.error('MCP client not initialized');
    toast.error('Cannot add document', { description: 'MCP client not initialized' });
    throw new Error('MCP client not initialized');
  }
  
  if (!conversationId) {
    console.error('No active conversation ID');
    toast.error('Cannot add document', { description: 'No active conversation' });
    throw new Error('No active conversation');
  }
  
  console.log(`Adding document to context: ${document.name} (${document.id})`);
  
  try {
    // Initialize the context with the conversation ID
    console.log(`Initializing context for conversation ${conversationId}`);
    await client.initializeContext(conversationId);
    
    // Fetch document content
    console.log(`Fetching content for ${document.name}`);
    const content = await fetchDocument(document.id);
    
    if (!content) {
      console.error(`No content retrieved for ${document.name}`);
      throw new Error('Failed to fetch document content');
    }
    
    // Verify content is not empty
    if (content.trim().length === 0) {
      console.error(`Empty content retrieved for ${document.name}`);
      throw new Error('Document content is empty');
    }
    
    console.log(`Document content fetched successfully for ${document.name}, length: ${content.length}`);
    
    // Extract document type from mimeType
    const documentType = document.mimeType.split('/').pop() || 'unknown';
    
    // Add to model context
    console.log(`Adding document to MCP context: ${document.name}, type: ${documentType}`);
    
    try {
      client.addDocumentToContext(
        document.id,
        document.name,
        documentType,
        content
      );
      
      console.log(`Document ${document.name} added to MCP context`);
    } catch (contextError) {
      console.error(`Error adding document to context:`, contextError);
      throw new Error(`Failed to add to context: ${contextError.message || 'Unknown error'}`);
    }
    
    // Verify the document was added to context
    const updatedContext = client.getModelContext();
    console.log('Retrieved context after document addition');
    
    if (!updatedContext || !updatedContext.documentContext) {
      console.error("Document context is null or undefined after adding!");
      throw new Error("Failed to add document: context not available");
    }
    
    const docInContext = updatedContext.documentContext.find(d => d.documentId === document.id);
    
    if (!docInContext) {
      console.error("Document not found in context after adding!");
      throw new Error("Failed to add document to context");
    }
    
    if (!docInContext.content || docInContext.content.length === 0) {
      console.error("Document added but content is empty!");
      throw new Error("Document content is empty after adding to context");
    }
    
    console.log(`Document successfully added to context. Content length: ${docInContext.content.length}`);
    
    // Dispatch a document update event
    dispatchDocumentContextUpdated(document.id, 'add');
    
    // Document with content for local tracking
    return {
      id: document.id,
      name: document.name,
      mimeType: document.mimeType,
      content: content
    };
  } catch (error) {
    console.error('Error adding document to context:', error);
    
    // Enhanced error handling with specific messages
    if (error.toString().includes('NetworkError') || error.toString().includes('network error')) {
      toast.error('Network error adding document', {
        description: 'Please check your internet connection and try again'
      });
    } else if (error.toString().includes('content is empty')) {
      toast.error('Document content is empty', {
        description: 'The document has no text content that can be processed'
      });
    } else {
      toast.error('Failed to add document to context', {
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
) {
  try {
    console.log(`Removing document from context: ${documentId} (${documentName})`);
    
    // Remove from the client context
    if (!client) {
      console.error('MCP client not available for document removal');
      toast.error('Failed to remove document', {
        description: 'MCP client not available'
      });
      return false;
    }
    
    if (!conversationId) {
      console.error('No conversation ID available for document removal');
      toast.error('Failed to remove document', {
        description: 'No active conversation'
      });
      return false;
    }
    
    // Make sure context is initialized
    client.initializeContext(conversationId)
      .then(() => console.log("Context initialized for document removal"))
      .catch(error => console.error("Error initializing context for document removal:", error));
    
    // Remove from MCP context
    const removed = client.removeDocumentFromContext(documentId);
    console.log(`Document ${documentId} removal from MCP context: ${removed ? 'successful' : 'failed'}`);
    
    // Verify document was removed
    const updatedContext = client.getModelContext();
    const stillInContext = updatedContext?.documentContext?.some(d => d.documentId === documentId);
    
    if (stillInContext) {
      console.warn(`Document ${documentName} still in context after removal attempt!`);
      toast.error('Failed to remove document from context');
      return false;
    } else {
      console.log(`Document ${documentName} successfully removed from context`);
      toast.success(`Document "${documentName}" removed from context`);
      return true;
    }
  } catch (error) {
    console.error('Error removing document:', error);
    toast.error('Failed to remove document');
    return false;
  }
}

/**
 * Loads document context from the MCP client
 */
export async function loadDocumentsFromContext(client: any, conversationId: string | null) {
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
    console.log(`Initializing context for conversation ${conversationId}`);
    await client.initializeContext(conversationId);
    console.log(`Context initialized for conversation ${conversationId}`);
    
    // Force refresh from storage
    client.getModelContext();
    
    // Get context again after refresh
    const context = client.getModelContext();
    console.log("Loading document context. Context available:", !!context);
    
    if (!context) {
      console.error("Failed to get model context");
      return [];
    }
    
    if (!context.documentContext) {
      console.log("Document context is not available");
      return [];
    }
    
    if (!Array.isArray(context.documentContext)) {
      console.error("Document context is not an array!");
      return [];
    }
    
    console.log(`Found ${context.documentContext.length} documents in context`);
    
    const docs = context.documentContext.map(doc => ({
      id: doc.documentId,
      name: doc.documentName,
      mimeType: `application/${doc.documentType}`,
      content: doc.content
    }));
    
    if (docs.length === 0) {
      console.log("Document context is empty");
    } else {
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
        console.error("Some documents have missing content! Attempting recovery...");
        toast.warning("Some documents have incomplete content", {
          description: "This may affect AI responses"
        });
        // We'll return what we have anyway and let the UI handle display
      }
    }
    
    return docs;
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
export function dispatchDocumentContextUpdated(documentId: string, action: string) {
  console.log(`Dispatching document context updated event: ${action} ${documentId}`);
  const event = new CustomEvent('documentContextUpdated', { 
    detail: { documentId, action } 
  });
  window.dispatchEvent(event);
}
