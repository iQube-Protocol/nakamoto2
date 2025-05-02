
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText } from 'lucide-react';
import { useDriveConnection } from '@/hooks/useDriveConnection';
import { useDocumentBrowser } from '@/hooks/useDocumentBrowser';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';
import ConnectionDialog from './document/ConnectionDialog';
import DocumentBrowserDialog from './document/DocumentBrowserDialog';

interface DocumentSelectorProps {
  onDocumentSelect: (document: any) => void;
  triggerButton?: React.ReactNode;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onDocumentSelect,
  triggerButton 
}) => {
  const { isApiLoading, resetConnection: resetMcpConnection } = useMCP();
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const {
    driveConnected,
    isLoading: connectionLoading,
    connectionInProgress,
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
    refreshCurrentFolder,
    forceRefreshCurrentFolder,
    fetchError
  } = useDocumentBrowser();
  
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    // Reset any connection errors when closing the dialog
    if (!open) {
      setConnectionError(null);
    }
  };
  
  const handleFileSelection = (doc: any) => {
    const result = handleDocumentClick(doc);
    // If not a folder, pass the document to the parent component
    if (!doc.mimeType.includes('folder')) {
      onDocumentSelect(result);
      setIsOpen(false);
    }
  };

  const handleConnectClick = async (): Promise<boolean> => {
    setConnecting(true);
    setConnectionError(null);
    setConnectionAttempts(prev => prev + 1);
    
    try {
      const result = await handleConnect();
      if (!result) {
        const errorMsg = connectionAttempts > 1 
          ? "Connection failed multiple times. Please verify your credentials and check if the Google Drive API is enabled in your Google Cloud Console."
          : "Failed to connect to Google Drive. Please check your credentials.";
        
        setConnectionError(errorMsg);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setConnectionError(errorMessage);
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing documents...", { id: "refreshing-docs", duration: 2000 });
    try {
      await forceRefreshCurrentFolder();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleRetryConnection = () => {
    resetConnection();
    resetMcpConnection();
    setConnectionError(null);
    setConnectionAttempts(0);
  };
  
  // If we have credentials stored but haven't fetched documents yet
  useEffect(() => {
    if (driveConnected && isOpen && documents.length === 0 && !documentsLoading) {
      refreshCurrentFolder();
    }
  }, [driveConnected, isOpen, documents.length, documentsLoading, refreshCurrentFolder]);
  
  // Loading states
  const isProcessing = connectionLoading || documentsLoading || isApiLoading || connecting || connectionInProgress || isRefreshing;
  
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
      
      {!driveConnected ? (
        <ConnectionDialog 
          isOpen={isOpen}
          onOpenChange={handleDialogChange}
          clientId={clientId}
          setClientId={setClientId}
          apiKey={apiKey}
          setApiKey={setApiKey}
          handleConnect={handleConnectClick}
          isProcessing={isProcessing}
          connectionError={connectionError}
          handleRetryConnection={handleRetryConnection}
        />
      ) : (
        <DocumentBrowserDialog
          documents={documents}
          currentFolder={currentFolder}
          folderHistory={folderHistory}
          documentsLoading={documentsLoading}
          fetchError={fetchError}
          isRefreshing={isRefreshing}
          isProcessing={isProcessing}
          navigateToFolder={navigateToFolder}
          navigateToRoot={navigateToRoot}
          refreshCurrentFolder={refreshCurrentFolder}
          handleRefresh={handleRefresh}
          handleFileSelection={handleFileSelection}
          handleBack={handleBack}
          handleRetryConnection={handleRetryConnection}
          setIsOpen={setIsOpen}
          resetConnection={handleRetryConnection}
        />
      )}
    </Dialog>
  );
};

export default DocumentSelector;
