
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import DocumentSelector from '../DocumentSelector';
import DocumentList from './document/DocumentList';
import DocumentViewer from './document/DocumentViewer';
import { useDocumentContext } from './document/useDocumentContext';
import { DocumentSelectorProvider } from '../document/DocumentSelectorContext';

interface DocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
  setActiveTab?: (tab: 'chat' | 'knowledge' | 'documents') => void;
}

const DocumentContext: React.FC<DocumentContextProps> = ({ 
  conversationId,
  onDocumentAdded,
  setActiveTab
}) => {
  const {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument
  } = useDocumentContext({ 
    conversationId, 
    onDocumentAdded: () => {
      if (onDocumentAdded) onDocumentAdded();
      // Switch to the documents tab when a document is added
      if (setActiveTab) setActiveTab('documents');
    }
  });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Documents in Context</h3>
        <DocumentSelectorProvider>
          <DocumentSelector 
            onDocumentSelect={handleDocumentSelect}
            triggerButton={
              <Button variant="outline" size="sm" className="gap-1 bg-purple-500 hover:bg-purple-600 text-white">
                <FileText className="h-3.5 w-3.5" />
                Add Document
              </Button>
            }
          />
        </DocumentSelectorProvider>
      </div>
      
      <Separator />
      
      <DocumentList
        documents={selectedDocuments}
        isLoading={isLoading}
        onViewDocument={handleViewDocument}
        onRemoveDocument={handleRemoveDocument}
      />
      
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
