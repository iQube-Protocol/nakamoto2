
import React, { useState, useEffect, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';
import { FileText } from 'lucide-react';
import DocumentSelector from '../document-selector';
import { DocumentList, DocumentViewer } from './document';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
  isInTabView?: boolean;
  isActiveTab?: boolean;
}

const DocumentContext: React.FC<DocumentContextProps> = ({ 
  conversationId,
  onDocumentAdded,
  isInTabView = false,
  isActiveTab = false
}) => {
  const { client, fetchDocument, isLoading } = useMCP();
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, name: string, mimeType: string} | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // Load documents from context when component mounts, conversation changes, or tab becomes active
  const loadDocumentsFromContext = useCallback(() => {
    if (client && conversationId) {
      const context = client.getModelContext();
      if (context?.documentContext) {
        const docs = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`,
          content: doc.content
        }));
        setSelectedDocuments(docs);
        console.log('Loaded documents from context:', docs.length);
      }
    }
  }, [client, conversationId]);
  
  // Initial load and load when dependencies change
  useEffect(() => {
    if (client && conversationId) {
      loadDocumentsFromContext();
    }
  }, [client, conversationId, loadDocumentsFromContext, lastUpdate]);
  
  // Set up polling with proper cleanup - only if tab is active
  useEffect(() => {
    // Only poll if tab is active or not in tab view
    if ((!isInTabView || isActiveTab) && client && conversationId) {
      console.log('Starting document polling');
      
      const intervalId = window.setInterval(() => {
        loadDocumentsFromContext();
      }, 15000); // Reduced frequency to 15s
      
      return () => {
        console.log('Stopping document polling');
        window.clearInterval(intervalId);
      };
    }
  }, [isInTabView, isActiveTab, client, conversationId, loadDocumentsFromContext]);
  
  const handleDocumentSelect = async (document: any) => {
    if (!client) {
      toast.error('MCP client not initialized');
      return;
    }
    
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.info('Document already in context');
      return;
    }
    
    try {
      // Fetch document content
      const content = await fetchDocument(document.id);
      if (content) {
        // Add content to the document object for local tracking
        document.content = content;
        setSelectedDocuments(prev => [...prev, document]);
        toast.success('Document added to context');
        setLastUpdate(Date.now());
        
        // Call the callback to update the parent component
        if (onDocumentAdded) onDocumentAdded();
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to fetch document content');
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    // Remove from the client context
    if (client && conversationId) {
      const context = client.getModelContext();
      if (context?.documentContext) {
        context.documentContext = context.documentContext.filter(
          doc => doc.documentId !== documentId
        );
        
        // Make sure to persist the context after modification
        client.persistContext();
      }
    }
    
    // Update local state
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast.success('Document removed from context');
    setLastUpdate(Date.now());
    
    // Call the callback to update the parent component
    if (onDocumentAdded) onDocumentAdded();
  };
  
  const handleViewDocument = (document: any) => {
    setViewingDocument({
      id: document.id,
      name: document.name,
      content: document.content || "Content not available",
      mimeType: document.mimeType
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-medium">Documents in Context</h3>
        <DocumentSelector 
          onDocumentSelect={handleDocumentSelect}
          triggerButton={
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-3.5 w-3.5" />
              Add Document
            </Button>
          }
          onSelectionComplete={() => {/* Stay in documents tab */}}
        />
      </div>
      
      <Separator className="my-2" />
      
      <ScrollArea className="px-4 flex-grow">
        <DocumentList 
          documents={selectedDocuments}
          isLoading={isLoading}
          onViewDocument={handleViewDocument}
          onRemoveDocument={handleRemoveDocument}
        />
      </ScrollArea>
      
      <DocumentViewer 
        document={viewingDocument}
        open={!!viewingDocument}
        onOpenChange={(open) => !open && setViewingDocument(null)}
      />
    </div>
  );
};

export default DocumentContext;
