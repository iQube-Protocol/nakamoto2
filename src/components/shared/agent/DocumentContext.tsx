
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';
import { FileText } from 'lucide-react';
import DocumentSelector from '../document-selector';
import { DocumentList, DocumentViewer } from './document';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';

interface DocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
  isInTabView?: boolean;
  isActiveTab?: boolean;
}

const POLLING_INTERVAL = 30000; // 30 seconds instead of 5 seconds
const ITEMS_PER_PAGE = 5;
const MAX_CONTENT_LENGTH = 10000; // Limit content length to prevent localStorage issues

const DocumentContext: React.FC<DocumentContextProps> = ({ 
  conversationId,
  onDocumentAdded,
  isInTabView = false,
  isActiveTab = false
}) => {
  const { client, fetchDocument, isLoading } = useMCP();
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, name: string, mimeType: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pollingIntervalRef = useRef<number | null>(null);
  const isComponentMounted = useRef(true);
  
  // Calculate pagination
  const totalPages = Math.ceil(selectedDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageDocuments = selectedDocuments.slice(startIndex, endIndex);
  
  // Truncate content to prevent localStorage quota issues
  const truncateContent = (content: string) => {
    if (content && content.length > MAX_CONTENT_LENGTH) {
      return content.substring(0, MAX_CONTENT_LENGTH) + 
        `\n\n[Content truncated to ${MAX_CONTENT_LENGTH} characters to preserve performance]`;
    }
    return content;
  };
  
  // Load documents from context
  const loadDocumentsFromContext = useCallback(() => {
    if (!client || !conversationId || !isActiveTab) return;
    
    try {
      const context = client.getModelContext();
      if (context?.documentContext) {
        const docs = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`,
          content: doc.content
        }));
        
        // Only update if there are differences to avoid unnecessary re-renders
        if (JSON.stringify(docs) !== JSON.stringify(selectedDocuments)) {
          setSelectedDocuments(docs);
          console.log('Loaded documents from context:', docs.length);
        }
      }
    } catch (error) {
      console.error('Error loading documents from context:', error);
    }
  }, [client, conversationId, isActiveTab, selectedDocuments]);
  
  // Set up polling only when tab is active
  useEffect(() => {
    isComponentMounted.current = true;
    
    // Initial load
    if (isActiveTab) {
      loadDocumentsFromContext();
    }
    
    // Set up polling only when tab is active
    if (isActiveTab && conversationId) {
      // Clear any existing interval first
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Set up new polling interval
      pollingIntervalRef.current = window.setInterval(() => {
        if (isComponentMounted.current) {
          loadDocumentsFromContext();
        }
      }, POLLING_INTERVAL);
      
      console.log(`Set up document polling with ${POLLING_INTERVAL}ms interval`);
    }
    
    // Clean up on unmount or when tab becomes inactive
    return () => {
      isComponentMounted.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('Cleaned up document polling interval');
      }
    };
  }, [isActiveTab, conversationId, loadDocumentsFromContext]);
  
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
    
    // Prevent exceeding document limit
    if (selectedDocuments.length >= 10) {
      toast.warning('Maximum document limit reached (10). Please remove some documents first.');
      return;
    }
    
    // Fetch document content
    try {
      const content = await fetchDocument(document.id);
      if (content) {
        // Truncate content to prevent localStorage issues
        const truncatedContent = truncateContent(content);
        
        // Add content to the document object for local tracking
        document.content = truncatedContent;
        setSelectedDocuments(prev => [...prev, document]);
        
        // Go to the page containing the new document
        const newDocIndex = selectedDocuments.length;
        const newPage = Math.ceil((newDocIndex + 1) / ITEMS_PER_PAGE);
        setCurrentPage(newPage);
        
        toast.success('Document added to context');
        
        // Call the callback to update the parent component
        if (onDocumentAdded) onDocumentAdded();
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to fetch document');
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    // Remove from the client context
    if (client && conversationId) {
      try {
        const context = client.getModelContext();
        if (context?.documentContext) {
          context.documentContext = context.documentContext.filter(
            doc => doc.documentId !== documentId
          );
          
          // Make sure to persist the context after modification
          client.persistContext();
        }
        
        // Update local state
        setSelectedDocuments(prev => {
          const newDocs = prev.filter(doc => doc.id !== documentId);
          // Adjust current page if needed
          if (newDocs.length > 0 && currentPage > Math.ceil(newDocs.length / ITEMS_PER_PAGE)) {
            setCurrentPage(Math.ceil(newDocs.length / ITEMS_PER_PAGE));
          }
          return newDocs;
        });
        
        toast.success('Document removed from context');
      } catch (error) {
        console.error('Error removing document:', error);
        toast.error('Failed to remove document');
      }
    }
  };
  
  const handleViewDocument = (document: any) => {
    setViewingDocument({
      id: document.id,
      name: document.name,
      content: document.content || "Content not available",
      mimeType: document.mimeType
    });
  };
  
  // Page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
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
      
      <ScrollArea className="h-[350px] px-4">
        <DocumentList 
          documents={currentPageDocuments}
          isLoading={isLoading}
          onViewDocument={handleViewDocument}
          onRemoveDocument={handleRemoveDocument}
        />
        
        {selectedDocuments.length > ITEMS_PER_PAGE && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => goToPage(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
