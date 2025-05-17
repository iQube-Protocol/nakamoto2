
import { toast } from 'sonner';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Load documents from the MCP context
 */
export const loadDocumentsFromContext = async (
  client: MCPClient,
  conversationId: string
): Promise<any[]> => {
  try {
    if (!client || !conversationId) {
      console.warn('Missing client or conversation ID for document loading');
      return [];
    }
    
    // Initialize context with conversation ID to ensure we have the latest context
    await client.initializeContext(conversationId);
    
    // Get context
    const context = client.getModelContext();
    if (!context || !context.documentContext) {
      console.log('No document context available');
      return [];
    }
    
    // Map documents from context to UI documents
    const documents = context.documentContext.map(doc => ({
      id: doc.documentId,
      name: doc.documentName,
      mimeType: doc.documentType,
      inContext: true,
      content: doc.content
    }));
    
    // Log document details
    console.log(`Loaded ${documents.length} documents from context for conversation ${conversationId}`);
    documents.forEach((doc, i) => {
      console.log(`Document ${i+1}: ${doc.name} (${doc.mimeType})`);
      console.log(`  Content length: ${doc.content?.length || 0} chars`);
      if (!doc.content || doc.content.length === 0) {
        console.warn(`  ⚠️ Document ${doc.name} has NO CONTENT!`);
      }
    });
    
    return documents;
  } catch (error) {
    console.error('Error loading documents from context:', error);
    toast.error('Failed to load documents from context', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
};

/**
 * Add a document to the context
 */
export const addDocumentToContext = async (
  client: MCPClient,
  conversationId: string,
  document: any
): Promise<boolean> => {
  try {
    if (!client || !conversationId) {
      console.warn('Missing client or conversation ID for document loading');
      return false;
    }
    
    console.log(`Adding document ${document.name} to context ${conversationId}`);
    
    // Initialize context with conversation ID
    await client.initializeContext(conversationId);
    
    // Check if document is already in context
    const context = client.getModelContext();
    if (context?.documentContext?.some(doc => doc.documentId === document.id)) {
      console.warn(`Document ${document.name} already in context`);
      toast.info('Document already in context');
      return false;
    }
    
    // Fetch document content if not already available
    let content = document.content;
    if (!content) {
      console.log(`Fetching content for document ${document.name} (${document.id})`);
      if (typeof document.getContent === 'function') {
        content = await document.getContent();
        console.log(`Retrieved content using getContent() method, length: ${content?.length || 0}`);
      } else {
        throw new Error('Document has no content or getContent method');
      }
    }
    
    if (!content) {
      throw new Error(`Could not get content for document ${document.name}`);
    }
    
    // Validate content
    if (content.length < 10) {
      console.warn(`Document ${document.name} has suspiciously short content: "${content}"`);
      toast.warning('Document content may be incomplete', {
        description: 'The document content is very short and may not be complete'
      });
    }
    
    // Add document to context
    client.addDocumentToContext(
      document.id, 
      document.name,
      document.mimeType,
      content
    );
    
    console.log(`Added document ${document.name} to context, content length: ${content.length}`);
    
    // Verify document was added
    const updatedContext = client.getModelContext();
    const docInContext = updatedContext?.documentContext?.find(doc => doc.documentId === document.id);
    
    if (!docInContext) {
      console.error(`Failed to verify document ${document.name} in context`);
      return false;
    }
    
    console.log(`Successfully verified document ${document.name} in context`);
    return true;
  } catch (error) {
    console.error('Error adding document to context:', error);
    toast.error('Failed to add document to context', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Remove a document from the context
 */
export const removeDocumentFromContext = (
  client: MCPClient,
  documentId: string
): boolean => {
  try {
    if (!client) {
      console.warn('Missing client for document removal');
      return false;
    }
    
    const result = client.removeDocumentFromContext(documentId);
    console.log(`Document ${documentId} removal result: ${result}`);
    return result;
  } catch (error) {
    console.error('Error removing document from context:', error);
    toast.error('Failed to remove document from context', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};
