
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
import { Info, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { useDriveConnection } from '@/hooks/useDriveConnection';
import { useDocumentBrowser } from '@/hooks/useDocumentBrowser';
import ConnectionForm from './document/ConnectionForm';
import FolderBreadcrumb from './document/FolderBreadcrumb';
import FileGrid from './document/FileGrid';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMCP } from '@/hooks/use-mcp';

interface DocumentSelectorProps {
  onDocumentSelect: (document: any) => void;
  triggerButton?: React.ReactNode;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onDocumentSelect,
  triggerButton 
}) => {
  const { isApiLoading, checkApiStatus } = useMCP();
  const [connecting, setConnecting] = useState(false);
  const [apiLoadingState, setApiLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [apiCheckAttempts, setApiCheckAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const maxApiCheckAttempts = 30; // Maximum attempts to check API loading
  
  const {
    driveConnected,
    isLoading: connectionLoading,
    connectionInProgress,
    connectionAttempts,
    connectionStatus,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    resetConnection,
    isApiLoading: hookApiLoading
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
  
  useEffect(() => {
    // Check if Google API is available
    const checkGapiLoaded = () => {
      if ((window as any).gapi && (window as any).google?.accounts) {
        console.log('DocumentSelector: Google API detected as loaded');
        setApiLoadingState('loaded');
        return true;
      }
      
      // If we have access to the MCP API status check, use that too
      if (checkApiStatus && checkApiStatus()) {
        console.log('DocumentSelector: Google API detected as loaded via MCP');
        setApiLoadingState('loaded');
        return true;
      }
      
      return false;
    };

    // Initial check
    if (checkGapiLoaded()) {
      return; // Already loaded
    }

    // Set up an interval to check if API is loaded with a maximum number of attempts
    const interval = setInterval(() => {
      setApiCheckAttempts(prev => {
        const newCount = prev + 1;
        console.log(`API load check attempt: ${newCount}/${maxApiCheckAttempts}`);
        
        if (newCount >= maxApiCheckAttempts) {
          clearInterval(interval);
          setApiLoadingState('error');
          return newCount;
        }
        
        if (checkGapiLoaded()) {
          clearInterval(interval);
        }
        return newCount;
      });
    }, 1000);

    // Clean up interval
    return () => clearInterval(interval);
  }, [maxApiCheckAttempts, checkApiStatus]);
  
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    
    // Reset API loading state when reopening the dialog
    if (open && apiLoadingState === 'error') {
      setApiLoadingState('loading');
      setApiCheckAttempts(0);
    }
    
    // Auto-refresh document list when opening the dialog if connected
    if (open && driveConnected && !documentsLoading) {
      refreshCurrentFolder().catch(err => {
        console.error('Failed to refresh folder on dialog open:', err);
        setConnectionError(true);
      });
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

  // Handle connection with better Promise handling
  const handleConnectClick = async (): Promise<boolean> => {
    setConnecting(true);
    setConnectionError(false);
    try {
      console.log('DocumentSelector: Initiating connection process');
      const result = await handleConnect();
      if (!result) {
        setConnectionError(true);
      }
      return result;
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(true);
      return false;
    } finally {
      setConnecting(false);
    }
  };
  
  // Handle reset connection with consistent UI feedback
  const handleResetConnection = () => {
    // First reset API loading state
    setApiLoadingState('loading');
    setApiCheckAttempts(0);
    setConnectionError(false);
    
    // Then reset the connection
    resetConnection();
  };
  
  // Handle refresh with retry count and error handling
  const handleRefreshDocuments = async () => {
    try {
      setRefreshAttempts(prev => prev + 1);
      await refreshCurrentFolder();
      setConnectionError(false);
    } catch (error) {
      console.error('Error refreshing documents:', error);
      setConnectionError(true);
    }
  };
  
  // If we have credentials stored but haven't fetched documents yet
  useEffect(() => {
    if (driveConnected && isOpen && documents.length === 0 && !documentsLoading) {
      console.log('DocumentSelector: Auto-refreshing documents');
      handleRefreshDocuments();
    }
  }, [driveConnected, isOpen, documents.length, documentsLoading]);
  
  // Reset connection error if connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setConnectionError(false);
    } else if (connectionStatus === 'error') {
      setConnectionError(true);
    }
  }, [connectionStatus]);
  
  // Determine overall API loading state
  useEffect(() => {
    if (hookApiLoading || isApiLoading) {
      setApiLoadingState('loading');
    }
  }, [hookApiLoading, isApiLoading]);
  
  // Loading states
  const isProcessing = connectionLoading || documentsLoading || isApiLoading || connecting || connectionInProgress;
  
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
        
        {apiLoadingState === 'loading' && (
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="mt-2">
              Loading Google API... Please wait.
              {apiCheckAttempts > 10 && (
                <p className="text-sm mt-1">
                  This is taking longer than expected. You may need to refresh the page if it doesn't complete soon.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {apiLoadingState === 'error' && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="mt-2">
              Failed to load Google API after several attempts. Please try:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Refreshing the page</li>
                <li>Checking your internet connection</li>
                <li>Disabling any ad blockers or privacy extensions</li>
                <li>Using a different browser</li>
              </ul>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetConnection}
                  className="flex items-center gap-2 mt-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Connection Error Alert */}
        {connectionError && driveConnected && (
          <Alert className="bg-amber-500/10 border-amber-500/30 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="mt-2">
              There seems to be an issue with your Google Drive connection. This might happen if:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Your authentication token has expired</li>
                <li>You revoked access for this application</li>
                <li>There's a network connectivity issue</li>
              </ul>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetConnection}
                  className="flex items-center gap-2 mt-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
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
                  <li>Create an API Key</li>
                  <li>Enter these credentials below</li>
                </ol>
              </AlertDescription>
            </Alert>
            <Separator className="my-2" />
            <ConnectionForm 
              clientId={clientId}
              setClientId={setClientId}
              apiKey={apiKey}
              setApiKey={setApiKey}
              handleConnect={handleConnectClick}
              isLoading={isProcessing}
              disabled={apiLoadingState !== 'loaded'}
              isApiLoading={apiLoadingState === 'loading'}
            />
            
            {connectionAttempts > 0 && apiLoadingState !== 'loaded' && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30 mt-2">
                <Info className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="mt-2">
                  If you're having trouble connecting, try refreshing the page and trying again.
                  Make sure to allow pop-ups for this site, as Google's authentication may appear in a popup window.
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleResetConnection}
                      className="flex items-center gap-2 mt-2 text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reset Connection
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
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
        
        <DialogFooter>
          {driveConnected && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetConnection} 
                className="flex items-center gap-2 text-purple-500 hover:text-purple-600 hover:bg-purple-50" 
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Connection
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleRefreshDocuments} 
                  disabled={isProcessing} 
                  className="gap-1 bg-purple-500 hover:bg-purple-600"
                >
                  {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {!isProcessing && <RefreshCw className="h-4 w-4" />}
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
