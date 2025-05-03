
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/mcp/use-mcp';

export function useDocumentContext(conversationId?: string) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  
  const { 
    client, 
    driveConnected,
    addDocumentToContext, 
    removeDocumentFromContext, 
    getDocumentsInContext 
  } = useMCP();
  
  // Fetch documents in context when component mounts or conversationId changes
  useEffect(() => {
    if (!client || !conversationId) return;
    
    const fetchDocumentsInContext = async () => {
      try {
        setIsLoading(true);
        // Call getDocumentsInContext with the conversationId parameter
        const contextDocuments = await getDocumentsInContext(conversationId);
        setDocuments(contextDocuments || []);
      } catch (error) {
        console.error("Error fetching documents in context:", error);
        toast.error("Could not fetch document context");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocumentsInContext();
  }, [client, conversationId, getDocumentsInContext]);
  
  // Add document to context
  const addDocument = useCallback(async (doc: any) => {
    if (!client || !conversationId || !driveConnected) {
      toast.error("Cannot add document: Client not initialized or Drive not connected");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log("Fetching content for document:", doc.id);
      
      // Fetch the content of the document
      const content = await client.fetchDocumentContent(doc.id);
      
      if (!content) {
        toast.error("Could not fetch document content");
        return false;
      }
      
      console.log("Adding document to context:", doc.name);
      
      // Add the document to the context
      await addDocumentToContext(conversationId, doc, doc.mimeType, content);
      
      // Refresh the documents list
      const updatedDocs = await getDocumentsInContext(conversationId);
      setDocuments(updatedDocs || []);
      
      toast.success(`Added ${doc.name} to context`);
      return true;
    } catch (error) {
      console.error("Error adding document to context:", error);
      toast.error("Could not add document to context");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client, conversationId, driveConnected, addDocumentToContext, getDocumentsInContext]);
  
  // Remove document from context
  const removeDocument = useCallback(async (docId: string) => {
    if (!client || !conversationId) {
      toast.error("Cannot remove document: Client not initialized");
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // If the selected document is being removed, clear it
      if (selectedDocument && selectedDocument.id === docId) {
        setSelectedDocument(null);
        setDocumentContent(null);
      }
      
      // Remove the document from the context
      await removeDocumentFromContext(conversationId, docId);
      
      // Refresh the documents list
      const updatedDocs = await getDocumentsInContext(conversationId);
      setDocuments(updatedDocs || []);
      
      toast.success("Document removed from context");
      return true;
    } catch (error) {
      console.error("Error removing document from context:", error);
      toast.error("Could not remove document from context");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client, conversationId, selectedDocument, removeDocumentFromContext, getDocumentsInContext]);
  
  // Function to view a document's content
  const viewDocument = useCallback(async (doc: any) => {
    if (!client || !doc?.id) {
      toast.error("Cannot view document: Client not initialized or invalid document");
      return;
    }
    
    try {
      setIsLoading(true);
      setSelectedDocument(doc);
      
      // Check if we already have the document content
      if (doc.content) {
        setDocumentContent(doc.content);
      } else {
        // Fetch the content
        const content = await client.fetchDocumentContent(doc.id);
        setDocumentContent(content);
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error("Could not fetch document content");
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Close document viewer
  const closeDocumentViewer = useCallback(() => {
    setSelectedDocument(null);
    setDocumentContent(null);
  }, []);
  
  return {
    documents,
    isLoading,
    selectedDocument,
    documentContent,
    addDocument,
    removeDocument,
    viewDocument,
    closeDocumentViewer
  };
}
