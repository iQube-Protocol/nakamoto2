
import { useState, useCallback, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { loadDocumentsFromContext } from './utils/documentOperations';
import { useDocumentEvents, useDocumentUpdates } from './hooks/useDocumentEvents';
import { useDocumentActions } from './hooks/useDocumentActions';
import { toast } from 'sonner';

interface UseDocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
}

/**
 * Custom hook for managing document context
 */
export default function useDocumentContext({ conversationId, onDocumentAdded }: UseDocumentContextProps) {
  const { client, fetchDocument, isLoading } = useMCP();
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [contentLoadAttempts, setContentLoadAttempts] = useState<Map<string, number>>(new Map());
  
  // Load document context when conversation ID or client changes
  const loadDocumentContext = useCallback(async () => {
    if (!conversationId) {
      console.log('No conversation ID provided, skipping document context load');
      return;
    }
    
    try {
      console.log(`Loading document context for conversation ${conversationId}`);
      const documents = await loadDocumentsFromContext(client, conversationId);
      
      // Check for documents with missing content
      const docsWithIssues = documents.filter(doc => !doc.content || doc.content.length === 0);
      if (docsWithIssues.length > 0) {
        console.warn(`Found ${docsWithIssues.length} documents with missing content:`, docsWithIssues.map(d => d.name));
        
        // Try to reload content for documents with issues
        const updatedDocs = [...documents];
        for (const doc of docsWithIssues) {
          const attempts = contentLoadAttempts.get(doc.id) || 0;
          
          // Limit recovery attempts
          if (attempts < 2) {
            try {
              console.log(`Attempting to recover content for ${doc.name} (attempt ${attempts + 1})`);
              const content = await fetchDocument(doc.id);
              
              if (content && content.length > 0) {
                console.log(`Successfully recovered content for ${doc.name}`);
                
                // Update the document with recovered content
                const docIndex = updatedDocs.findIndex(d => d.id === doc.id);
                if (docIndex >= 0) {
                  updatedDocs[docIndex] = { ...doc, content };
                }
                
                // If using MCP client, also update there
                if (client) {
                  try {
                    client.addDocumentToContext(
                      doc.id,
                      doc.name,
                      doc.mimeType.split('/').pop() || 'text',
                      content
                    );
                  } catch (e) {
                    console.error(`Error updating document in MCP:`, e);
                  }
                }
              } else {
                console.error(`Failed to recover content for ${doc.name}: Empty content`);
              }
            } catch (error) {
              console.error(`Error recovering content for ${doc.name}:`, error);
            }
            
            // Update attempt count
            setContentLoadAttempts(prev => {
              const newMap = new Map(prev);
              newMap.set(doc.id, (prev.get(doc.id) || 0) + 1);
              return newMap;
            });
          } else {
            console.warn(`Maximum recovery attempts reached for document ${doc.name}`);
          }
        }
        
        // Use the potentially updated documents
        setSelectedDocuments(updatedDocs);
      } else {
        setSelectedDocuments(documents);
      }
      
      console.log(`Loaded ${documents.length} documents for conversation ${conversationId}`);
    } catch (error) {
      console.error('Error loading document context:', error);
      toast.error('Failed to load document context', {
        description: 'There was a problem loading your document context'
      });
    }
  }, [client, conversationId, fetchDocument, contentLoadAttempts]);
  
  // Set up event listeners for context changes
  useDocumentEvents(loadDocumentContext);
  
  // Handle document updates from parent components
  useDocumentUpdates(0, loadDocumentContext);
  
  // Initial load
  useEffect(() => {
    loadDocumentContext();
  }, [loadDocumentContext]);
  
  // Document actions (select, remove, view)
  const {
    viewingDocument,
    setViewingDocument,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    documentErrors,
    recoverDocumentContent
  } = useDocumentActions({
    client,
    conversationId, 
    fetchDocument,
    onDocumentAdded,
    selectedDocuments,
    setSelectedDocuments
  });

  return {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    documentErrors,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    recoverDocumentContent,
    loadDocumentContext
  };
}
