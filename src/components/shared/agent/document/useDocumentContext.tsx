
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
  
  // Load documents for the current conversation when component mounts or conversation changes
  const loadDocumentsForConversation = useCallback(async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      console.log(`Loading documents for conversation: ${conversationId}`);
      const documents = await mcpContext.getDocumentsInContext(conversationId);
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
  }, [conversationId, mcpContext]);
  
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
      // Ensure we pass all required arguments - the expected signature has 4 parameters
      // Using null for optional parameters that may not be needed
      const success = await mcpContext.addDocumentToContext(
        conversationId,
        document,
        null,  // Add third parameter (likely documentContent)
        null   // Add fourth parameter (likely options)
      );
      
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
      const success = await mcpContext.removeDocumentFromContext(conversationId, documentId);
      
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
