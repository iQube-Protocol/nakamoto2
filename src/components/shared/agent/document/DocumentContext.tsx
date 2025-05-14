
import React, { useEffect } from 'react';
import DocumentSelector from '@/components/shared/DocumentSelector';
import DocumentList from './DocumentList';
import DocumentViewer from './DocumentViewer';
import useDocumentContext from './useDocumentContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
  documentUpdates?: number;
}

/**
 * Component for managing document context in agent conversations
 */
const DocumentContext = ({
  conversationId,
  onDocumentAdded,
  documentUpdates = 0
}: DocumentContextProps) => {
  const {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    refreshDocuments
  } = useDocumentContext({
    conversationId,
    onDocumentAdded
  });
  
  // Listen for document updates from parent component
  useEffect(() => {
    if (documentUpdates > 0) {
      console.log(`Document updates detected (${documentUpdates}), refreshing documents`);
      refreshDocuments();
    }
  }, [documentUpdates, refreshDocuments]);
  
  // Document selection handler
  const handleDocumentSelection = async (doc: any) => {
    try {
      console.log(`Selected document for context: ${doc.name}`);
      await handleDocumentSelect(doc);
      return true;
    } catch (error) {
      console.error('Error handling document selection:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents in Context</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDocuments}
            disabled={isLoading} 
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DocumentSelector onDocumentSelect={handleDocumentSelection} />
        </div>
      </div>
      
      <DocumentList 
        documents={selectedDocuments}
        isLoading={isLoading}
        onViewDocument={handleViewDocument}
        onRemoveDocument={handleRemoveDocument}
      />
      
      <DocumentViewer 
        document={viewingDocument} 
        isOpen={!!viewingDocument} 
        onOpenChange={(open) => !open && setViewingDocument(null)} 
      />
    </div>
  );
};

export default DocumentContext;
