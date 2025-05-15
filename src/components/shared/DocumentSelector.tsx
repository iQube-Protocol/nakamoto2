import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, RefreshCw } from 'lucide-react';
import { useDriveConnection } from '@/hooks/useDriveConnection';
import { useDocumentBrowser } from '@/hooks/useDocumentBrowser';
import ConnectionForm from './document/ConnectionForm';
import FolderBreadcrumb from './document/FolderBreadcrumb';
import FileGrid from './document/FileGrid';
import { toast } from 'sonner';
import { DocumentFolder } from '@/hooks/document-browser/types';

interface DocumentSelectorProps {
  onDocumentSelect: (document: any) => void;
  triggerButton?: React.ReactNode;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onDocumentSelect,
  triggerButton 
}) => {
  const {
    driveConnected,
    isLoading: connectionLoading,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    resetConnection
  } = useDriveConnection();
  
  const {
    documents,
    isLoading: documentsLoading,
    currentFolder,
    folderHistory,
    isOpen,
    setIsOpen,
    handleDocumentClick,
    handleBack,
    navigateToFolder,
    navigateToRoot,
    refreshCurrentFolder
  } = useDocumentBrowser();
  
  // Add local processing state
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);
  
  const handleDialogChange = (open: boolean) => {
    // Only allow closing if we're not currently processing a document
    if (!open && !processingDoc) {
      setIsOpen(open);
    } else if (!open && processingDoc) {
      // If trying to close while processing, show a message
      toast.info('Please wait until document processing completes');
    } else {
      setIsOpen(open);
    }
  };
  
  const handleFileSelection = async (doc: any) => {
    // If it's a folder, just navigate to it
    if (doc.mimeType.includes('folder')) {
      handleDocumentClick(doc);
      return;
    }
    
    try {
      // Mark this document as processing
      setProcessingDoc(doc.id);
      console.log('Processing document selection:', doc.name);
      
      // Handle document click (this returns the document or a Promise)
      const result = handleDocumentClick(doc);
      
      // Process document selection
      await onDocumentSelect(result);
      
      // Clear processing state
      setProcessingDoc(null);
      
      // Only close dialog after successful document addition
      setIsOpen(false);
      toast.success('Document added to context');
    } catch (error) {
      console.error('Error selecting document:', error);
      
      // Clear processing state
      setProcessingDoc(null);
      
      // Show appropriate error message but keep dialog open for retry
      if (error.message?.includes('already in context')) {
        toast.info('Document already in context');
      } else {
        toast.error('Failed to add document to context', { 
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };
  
  const handleResetConnection = async () => {
    await resetConnection();
    refreshCurrentFolder();
  };
  
  // Enhanced connect handler that refreshes documents after successful connection
  const handleEnhancedConnect = async () => {
    const success = await handleConnect();
    if (success) {
      // If connection was successful, refresh documents
      refreshCurrentFolder();
    }
    return success;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="flex gap-2">
            <FileText className="h-4 w-4" />
            Select Document
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select a document from Google Drive</DialogTitle>
          <DialogDescription>
            {driveConnected 
              ? "Choose a document to analyze with your agent" 
              : "Connect to Google Drive to access your documents"}
          </DialogDescription>
        </DialogHeader>
        
        {!driveConnected ? (
          <ConnectionForm 
            clientId={clientId}
            setClientId={setClientId}
            apiKey={apiKey}
            setApiKey={setApiKey}
            handleConnect={handleEnhancedConnect}
            isLoading={connectionLoading}
          />
        ) : (
          <div className="py-4 h-[300px] overflow-y-auto">
            {/* Breadcrumb navigation */}
            <FolderBreadcrumb
              currentFolder={currentFolder}
              folderHistory={folderHistory}
              navigateToFolder={(folder: DocumentFolder, historyIndex?: number) => 
                navigateToFolder(folder)}
              navigateToRoot={navigateToRoot}
            />
          
            {/* File grid */}
            <FileGrid
              documents={documents}
              isLoading={documentsLoading || !!processingDoc}
              processingDocId={processingDoc}
              currentFolder={currentFolder}
              handleDocumentClick={handleFileSelection}
              handleBack={handleBack}
            />
          </div>
        )}
        
        <DialogFooter className="flex justify-between items-center">
          {driveConnected && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleResetConnection}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Connection
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => !processingDoc && setIsOpen(false)}
                  disabled={!!processingDoc}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={refreshCurrentFolder}
                  disabled={!!processingDoc}
                >
                  Refresh
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSelector;
