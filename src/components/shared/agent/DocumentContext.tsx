
import React, { useState, useEffect } from 'react';
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
  
  // Get documents from context when component mounts, conversation changes, or tab becomes active
  useEffect(() => {
    const loadDocumentsFromContext = () => {
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
    };
    
    loadDocumentsFromContext();
    
    // Set up an interval to periodically check for context updates when tab is active
    const intervalId = setInterval(() => {
      if (isActiveTab) {
        loadDocumentsFromContext();
      }
    }, 5000); // Check every 5 seconds when tab is active
    
    return () => clearInterval(intervalId);
  }, [client, conversationId, isActiveTab]);
  
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
    
    // Fetch document content
    const content = await fetchDocument(document.id);
    if (content) {
      // Add content to the document object for local tracking
      document.content = content;
      setSelectedDocuments(prev => [...prev, document]);
      toast.success('Document added to context');
      
      // Call the callback to update the parent component
      if (onDocumentAdded) onDocumentAdded();
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
    <div className="flex flex-col">
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
      
      {/* Reduced height to account for header (approx 60px) */}
      <ScrollArea className="h-[340px] px-4">
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
