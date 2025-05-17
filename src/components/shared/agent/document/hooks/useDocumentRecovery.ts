
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { dispatchDocumentContextUpdated } from '../utils/documentOperations';

/**
 * Hook to handle document content recovery functionality
 */
export function useDocumentRecovery({
  client,
  conversationId,
  fetchDocument,
  selectedDocuments,
  setSelectedDocuments
}: {
  client: any;
  conversationId: string | null;
  fetchDocument: (id: string) => Promise<string | null>;
  selectedDocuments: any[];
  setSelectedDocuments: (docs: any[] | ((prevDocs: any[]) => any[])) => void;
}) {
  const [documentErrors, setDocumentErrors] = useState<Map<string, string>>(new Map());
  
  // Listen for document content recovery events
  useEffect(() => {
    const handleDocumentRecovery = async (event: CustomEvent) => {
      const { documentId, documentName } = event.detail;
      
      if (!selectedDocuments.some(doc => doc.id === documentId)) return;
      
      console.log(`Attempting to recover document: ${documentName}`);
      try {
        // Re-fetch the document content
        const content = await fetchDocument(documentId);
        
        if (content) {
          // Update local state
          setSelectedDocuments((prevDocs) => prevDocs.map(doc => {
            if (doc.id === documentId) {
              return { ...doc, content };
            }
            return doc;
          }));
          
          // Clear any error for this document
          const newErrors = new Map(documentErrors);
          newErrors.delete(documentId);
          setDocumentErrors(newErrors);
          
          console.log(`Successfully recovered content for document ${documentName}`);
          
          // Notify that document content was updated
          dispatchDocumentContextUpdated(documentId, 'updated');
        }
      } catch (error) {
        console.error(`Error recovering document ${documentName}:`, error);
        // Track the error
        const newErrors = new Map(documentErrors);
        newErrors.set(documentId, 'Failed to recover content');
        setDocumentErrors(newErrors);
      }
    };
    
    window.addEventListener('documentContentRecoveryNeeded', handleDocumentRecovery as EventListener);
    
    return () => {
      window.removeEventListener('documentContentRecoveryNeeded', handleDocumentRecovery as EventListener);
    };
  }, [selectedDocuments, setSelectedDocuments, fetchDocument, documentErrors]);
  
  // Attempt to recover a document's content
  const recoverDocumentContent = useCallback(async (documentId: string) => {
    const doc = selectedDocuments.find(d => d.id === documentId);
    if (!doc) return false;
    
    try {
      console.log(`Attempting to recover content for ${doc.name}`);
      const content = await fetchDocument(documentId);
      
      if (content && content.length > 0) {
        // Update local state
        setSelectedDocuments((prevDocs) => prevDocs.map(d => {
          if (d.id === documentId) {
            return { ...d, content };
          }
          return d;
        }));
        
        // Clear any error for this document
        const newErrors = new Map(documentErrors);
        newErrors.delete(documentId);
        setDocumentErrors(newErrors);
        
        // Add back to MCP context
        if (client && conversationId) {
          try {
            client.addDocumentToContext(
              documentId,
              doc.name,
              doc.mimeType.split('/').pop() || 'text',
              content
            );
          } catch (e) {
            console.error(`Error re-adding document to MCP context:`, e);
          }
        }
        
        // Notify that document was recovered
        dispatchDocumentContextUpdated(documentId, 'updated');
        toast.success(`Recovered document: "${doc.name}"`);
        return true;
      } else {
        throw new Error('Retrieved empty content');
      }
    } catch (error) {
      console.error(`Error recovering document ${doc.name}:`, error);
      toast.error(`Failed to recover document: "${doc.name}"`, {
        description: 'Unable to retrieve document content'
      });
      return false;
    }
  }, [selectedDocuments, fetchDocument, client, conversationId, documentErrors]);

  return {
    documentErrors,
    setDocumentErrors,
    recoverDocumentContent
  };
}
