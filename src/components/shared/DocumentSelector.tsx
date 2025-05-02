
import React, { useEffect, useState } from 'react';
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
import { Info, FileText, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useDriveConnection } from '@/hooks/useDriveConnection';
import { useDocumentBrowser } from '@/hooks/useDocumentBrowser';
import ConnectionForm from './document/ConnectionForm';
import FolderBreadcrumb from './document/FolderBreadcrumb';
import FileGrid from './document/FileGrid';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

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
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="mt-2">
                To connect to your Google Drive, you'll need to create Google API credentials:
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
                  <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Cloud Console</a></li>
                  <li>Create a project and enable the Google Drive API</li>
                  <li>Create an OAuth client ID (Web application type)</li>
                  <li>Add authorized redirect URIs: {window.location.origin}</li>
                  <li>Create an API Key</li>
                  <li>Enter these credentials below</li>
                </ol>
              </AlertDescription>
            </Alert>
            
            {connectionError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="mt-2">
                  {connectionError}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full" 
                    onClick={handleRetryConnection}
                  >
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <Separator className="my-2" />
            <ConnectionForm 
              clientId={clientId}
              setClientId={setClientId}
              apiKey={apiKey}
              setApiKey={setApiKey}
              handleConnect={handleConnectClick}
              isLoading={isProcessing}
            />
          </>
        ) : (
          <div className="py-4 h-[300px] overflow-y-auto">
            {/* Breadcrumb navigation */}
            <FolderBreadcrumb
              currentFolder={currentFolder}
              folderHistory={folderHistory}
              navigateToFolder={navigateToFolder}
              navigateToRoot={navigateToRoot}
            />
            
            {fetchError && (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="mt-2">
                  {fetchError}
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={refreshCurrentFolder}
                    >
                      Try again
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={handleRetryConnection}
                    >
                      Reset connection
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* File grid */}
            <FileGrid
              documents={documents}
              isLoading={documentsLoading || isRefreshing}
              currentFolder={currentFolder}
              handleDocumentClick={handleFileSelection}
              handleBack={handleBack}
              onRefresh={handleRefresh}
            />
          </div>
        )}
        
        <DialogFooter>
          {driveConnected && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button variant="outline" onClick={handleRetryConnection}>Reset Connection</Button>
              <Button onClick={handleRefresh} disabled={isProcessing} className="gap-1">
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                )}
                Refresh
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSelector;
