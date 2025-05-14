import React from 'react';
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
  
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  const handleFileSelection = async (doc: any) => {
    try {
      // Only process the document if it's not a folder
      if (!doc.mimeType.includes('folder')) {
        console.log('Selecting document for context:', doc.name);
        
        // Handle document click (this returns the document or a Promise)
        const result = handleDocumentClick(doc);
        
        // Process document selection
        await onDocumentSelect(result);
        
        // Only close dialog after successful document addition
        setIsOpen(false);
        toast.success('Document added to context');
      } else {
        // If it's a folder, let the normal folder navigation happen
        handleDocumentClick(doc);
      }
    } catch (error) {
      console.error('Error selecting document:', error);
      
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
              navigateToFolder={navigateToFolder}
              navigateToRoot={navigateToRoot}
            />
          
            {/* File grid */}
            <FileGrid
              documents={documents}
              isLoading={documentsLoading}
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
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={refreshCurrentFolder}>
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
