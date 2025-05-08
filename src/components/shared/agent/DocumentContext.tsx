
import React, { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw } from 'lucide-react';
import DocumentSelector from '../DocumentSelector';
import DocumentList from './document/DocumentList';
import DocumentViewer from './document/DocumentViewer';
import useDocumentContext from './document/useDocumentContext';

interface DocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
  documentUpdates?: number; // New prop to track document updates
}

const DocumentContext: React.FC<DocumentContextProps> = ({ 
  conversationId,
  onDocumentAdded,
  documentUpdates = 0
}) => {
  const {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    loadDocumentContext // Function to reload document context
  } = useDocumentContext({ conversationId, onDocumentAdded });
  
  // Reload document context when documentUpdates changes
  useEffect(() => {
    if (documentUpdates > 0) {
      console.log(`DocumentContext received update signal (${documentUpdates}), reloading documents`);
      loadDocumentContext();
    }
  }, [documentUpdates, loadDocumentContext]);
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-medium">Documents in Context</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex gap-1 items-center"
            onClick={loadDocumentContext}
            title="Refresh document list"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <DocumentSelector 
            onDocumentSelect={handleDocumentSelect}
            triggerButton={
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-3.5 w-3.5" />
                Add Document
              </Button>
            }
          />
        </div>
      </div>
      
      <Separator className="mb-4" />
      
      <div className="flex-1 overflow-hidden">
        <DocumentList
          documents={selectedDocuments}
          isLoading={isLoading}
          onViewDocument={handleViewDocument}
          onRemoveDocument={handleRemoveDocument}
        />
      </div>
      
      {/* Document content viewer dialog */}
      <DocumentViewer 
        document={viewingDocument}
        isOpen={!!viewingDocument}
        onOpenChange={(open) => !open && setViewingDocument(null)}
      />
    </div>
  );
};

export default DocumentContext;
