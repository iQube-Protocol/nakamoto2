
import React, { useEffect, useState } from 'react';
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
}

const DocumentContext: React.FC<DocumentContextProps> = ({ 
  conversationId,
  onDocumentAdded
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    forceRefreshDocuments
  } = useDocumentContext({ 
    conversationId, 
    onDocumentAdded,
    refreshTrigger
  });
  
  // Debug log for document visibility
  useEffect(() => {
    console.log('Documents in context component:', selectedDocuments.length, 
      selectedDocuments.map(d => d.name).join(', '));
  }, [selectedDocuments]);
  
  // Force refresh the document list
  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    forceRefreshDocuments();
    setRefreshTrigger(prev => prev + 1);
  };

  // Initial load when conversationId changes
  useEffect(() => {
    if (conversationId) {
      console.log(`Conversation ID changed to ${conversationId}, refreshing documents`);
      handleRefresh();
    }
  }, [conversationId]);
  
  // Use the refresh trigger to force re-render
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log(`Manually refreshing document context display (trigger: ${refreshTrigger})`);
    }
  }, [refreshTrigger]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Documents in Context</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="h-8 w-8"
            title="Refresh document list"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DocumentSelector 
            onDocumentSelect={(doc) => {
              handleDocumentSelect(doc);
              // Force a refresh after adding document
              setTimeout(handleRefresh, 500);
            }}
            triggerButton={
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-3.5 w-3.5" />
                Add Document
              </Button>
            }
          />
        </div>
      </div>
      
      <Separator />
      
      <DocumentList
        documents={selectedDocuments}
        isLoading={isLoading}
        onViewDocument={handleViewDocument}
        onRemoveDocument={(id) => {
          handleRemoveDocument(id);
          // Force a refresh after removing document
          setTimeout(handleRefresh, 500);
        }}
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
