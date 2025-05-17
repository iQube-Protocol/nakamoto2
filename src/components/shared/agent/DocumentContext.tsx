
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import DocumentSelector from '../DocumentSelector';
import DocumentList from './document/DocumentList';
import DocumentViewer from './document/DocumentViewer';
import useDocumentContext from './document/useDocumentContext';
import { toast } from 'sonner';

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
    documentErrors,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    recoverDocumentContent,
    loadDocumentContext // Function to reload document context
  } = useDocumentContext({ conversationId, onDocumentAdded });
  
  const [contentVerification, setContentVerification] = useState<{
    lastChecked: number;
    hasIssues: boolean;
    isChecking: boolean;
  }>({ lastChecked: 0, hasIssues: false, isChecking: false });
  
  // Reload document context when documentUpdates changes
  useEffect(() => {
    if (documentUpdates > 0) {
      console.log(`DocumentContext received update signal (${documentUpdates}), reloading documents`);
      loadDocumentContext();
    }
  }, [documentUpdates, loadDocumentContext]);
  
  // Verify document content on initial load
  useEffect(() => {
    const verifyDocumentContent = async () => {
      if (selectedDocuments.length === 0 || contentVerification.isChecking) return;
      
      setContentVerification(prev => ({ ...prev, isChecking: true }));
      
      try {
        // Check for documents with missing or empty content
        const invalidDocs = selectedDocuments.filter(doc => !doc.content || doc.content.length === 0);
        
        if (invalidDocs.length > 0) {
          console.warn(`Found ${invalidDocs.length} documents with content issues:`, 
            invalidDocs.map(d => d.name));
          
          setContentVerification({
            lastChecked: Date.now(),
            hasIssues: true,
            isChecking: false
          });
          
          // Attempt recovery for first invalid document
          if (invalidDocs.length > 0) {
            const firstDoc = invalidDocs[0];
            toast.warning(`Document content issue detected: "${firstDoc.name}"`, {
              description: 'Attempting to recover content...',
              action: {
                label: 'Recover',
                onClick: () => recoverDocumentContent(firstDoc.id)
              }
            });
            
            // Auto-attempt recovery
            await recoverDocumentContent(firstDoc.id);
          }
        } else {
          setContentVerification({
            lastChecked: Date.now(),
            hasIssues: false,
            isChecking: false
          });
        }
      } catch (error) {
        console.error('Error verifying document content:', error);
        setContentVerification(prev => ({ ...prev, isChecking: false }));
      }
    };
    
    verifyDocumentContent();
  }, [selectedDocuments, recoverDocumentContent]);
  
  // Show content issues badge if any documents have errors
  const hasDocumentIssues = documentErrors.size > 0 || contentVerification.hasIssues;
  
  return (
    <div className="flex flex-col h-[400px] overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-medium">Documents in Context</h3>
        <div className="flex gap-2">
          {hasDocumentIssues && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1 items-center text-amber-500"
              onClick={() => {
                // Find document with issue and attempt recovery
                const docId = documentErrors.keys().next().value;
                if (docId) {
                  recoverDocumentContent(docId);
                } else {
                  // Trigger full reload if no specific document is identified
                  loadDocumentContext();
                }
              }}
              title="Document content issues detected"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Content Issues</span>
            </Button>
          )}
          
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
        <ScrollArea className="h-full">
          <div className="p-2">
            <DocumentList
              documents={selectedDocuments}
              isLoading={isLoading}
              onViewDocument={handleViewDocument}
              onRemoveDocument={handleRemoveDocument}
              documentErrors={documentErrors}
              onRecoverDocument={recoverDocumentContent}
            />
          </div>
        </ScrollArea>
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
