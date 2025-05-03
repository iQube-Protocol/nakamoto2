
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

interface UseDocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
}

const useDocumentContext = ({ conversationId, onDocumentAdded }: UseDocumentContextProps) => {
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [viewingDocument, setViewingDocument] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mcpContext = useMCP();
  
  // Create safe method wrappers that handle missing MCP methods
  const addDocumentToContext = async (conversationId: string, document: any): Promise<boolean> => {
    if (mcpContext.client && typeof mcpContext.client.addDocumentToContext === 'function') {
      try {
        // The MCP client expects 4 parameters: documentId, documentName, documentType, content
        const documentType = document.mimeType?.split('/')[1] || 'plain';
        mcpContext.client.addDocumentToContext(
          document.id, 
          document.name, 
          documentType, 
          document.content || ''
        );
        return true;
      } catch (error) {
        console.error('Error in addDocumentToContext:', error);
        return false;
      }
    } else {
      console.log('addDocumentToContext not available, using localStorage fallback');
      // Fallback to localStorage if MCP method is not available
      const updatedDocs = [...selectedDocuments, document];
      setSelectedDocuments(updatedDocs);
      if (conversationId) {
        localStorage.setItem(`docs-${conversationId}`, JSON.stringify(updatedDocs));
      }
      return true;
    }
  };
  
  const getDocumentsInContext = async (conversationId: string): Promise<any[]> => {
    if (mcpContext.client && typeof mcpContext.client.getDocumentContext === 'function') {
      try {
        // Using the correct method name: getDocumentContext instead of getDocumentsInContext
        return mcpContext.client.getDocumentContext(conversationId) || [];
      } catch (error) {
        console.error('Error in getDocumentsInContext:', error);
        return [];
      }
    } else {
      console.log('getDocumentContext not available, using localStorage fallback');
      // Fallback to localStorage if MCP method is not available
      if (conversationId) {
        const storedDocs = localStorage.getItem(`docs-${conversationId}`);
        if (storedDocs) {
          try {
            return JSON.parse(storedDocs);
          } catch (e) {
            console.error('Error parsing stored documents:', e);
          }
        }
      }
      return [];
    }
  };
  
  const removeDocumentFromContext = async (conversationId: string, documentId: string): Promise<boolean> => {
    if (mcpContext.client && typeof mcpContext.client.removeDocumentFromContext === 'function') {
      try {
        // The removeDocumentFromContext method only expects one argument: documentId
        return mcpContext.client.removeDocumentFromContext(documentId) || false;
      } catch (error) {
        console.error('Error in removeDocumentFromContext:', error);
        return false;
      }
    } else {
      console.log('removeDocumentFromContext not available, using localStorage fallback');
      // Fallback to localStorage if MCP method is not available
      const updatedDocs = selectedDocuments.filter(doc => doc.id !== documentId);
      setSelectedDocuments(updatedDocs);
      if (conversationId) {
        localStorage.setItem(`docs-${conversationId}`, JSON.stringify(updatedDocs));
      }
      return true;
    }
  };
  
  // Load documents for the current conversation when component mounts or conversation changes
  const loadDocumentsForConversation = useCallback(async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      console.log(`Loading documents for conversation: ${conversationId}`);
      const documents = await getDocumentsInContext(conversationId);
      if (documents && Array.isArray(documents)) {
        console.log(`Found ${documents.length} documents in context`);
        setSelectedDocuments(documents);
      } else {
        console.log('No documents found or invalid response');
        setSelectedDocuments([]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);
  
  // Initial load and reload when conversation changes
  useEffect(() => {
    loadDocumentsForConversation();
    
    // Set up localStorage backup for this conversation's documents
    if (conversationId) {
      const storedDocs = localStorage.getItem(`docs-${conversationId}`);
      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
            console.log(`Loaded ${parsedDocs.length} documents from localStorage backup`);
            setSelectedDocuments(prevDocs => {
              // Only use localStorage if we don't have docs already
              return prevDocs.length > 0 ? prevDocs : parsedDocs;
            });
          }
        } catch (e) {
          console.error('Error parsing stored documents:', e);
        }
      }
    }
  }, [conversationId, loadDocumentsForConversation]);
  
  // Store documents in localStorage when they change
  useEffect(() => {
    if (conversationId && selectedDocuments.length > 0) {
      localStorage.setItem(`docs-${conversationId}`, JSON.stringify(selectedDocuments));
      console.log(`Saved ${selectedDocuments.length} documents to localStorage for conversation ${conversationId}`);
    }
  }, [conversationId, selectedDocuments]);
  
  const handleDocumentSelect = async (document: any) => {
    if (!conversationId) {
      toast.error('No active conversation');
      return;
    }
    
    // Check if document is already in the context
    const isAlreadySelected = selectedDocuments.some(doc => doc.id === document.id);
    if (isAlreadySelected) {
      toast.info('Document already in context');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await addDocumentToContext(conversationId, document);
      
      if (success) {
        // Update local state
        setSelectedDocuments(prev => [...prev, document]);
        
        // Notify parent component
        if (onDocumentAdded) {
          onDocumentAdded();
        }
        
        toast.success('Document added to context');
      } else {
        toast.error('Failed to add document');
      }
    } catch (error) {
      console.error('Error adding document to context:', error);
      toast.error('Failed to add document');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveDocument = async (documentId: string) => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      const success = await removeDocumentFromContext(conversationId, documentId);
      
      if (success) {
        // Update local state
        setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document removed from context');
      } else {
        toast.error('Failed to remove document');
      }
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewDocument = (document: any) => {
    setViewingDocument(document);
  };
  
  // Force refresh documents
  const refreshDocuments = () => {
    loadDocumentsForConversation();
  };
  
  return {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading: isLoading || mcpContext.isLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    refreshDocuments
  };
};

export default useDocumentContext;
