
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
import { Info, FileText, RefreshCw } from 'lucide-react';
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
  const { isApiLoading } = useMCP();
  const [connecting, setConnecting] = useState(false);
  const [apiLoadingState, setApiLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [apiCheckAttempts, setApiCheckAttempts] = useState(0);
  const maxApiCheckAttempts = 20; // Maximum number of attempts to check if API is loaded
  
  const {
    driveConnected,
    isLoading: connectionLoading,
    connectionInProgress,
    connectionAttempts,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect
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
  }, []);
  
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    
    // Reset API loading state when reopening the dialog
    if (open && apiLoadingState === 'error') {
      setApiLoadingState('loading');
      setApiCheckAttempts(0);
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

  // Fixed: Make sure this function returns a Promise<boolean>
  const handleConnectClick = async (): Promise<boolean> => {
    setConnecting(true);
    try {
      const result = await handleConnect();
      return result; // This properly returns the boolean from handleConnect
    } finally {
      setConnecting(false);
    }
  };
  
  // If we have credentials stored but haven't fetched documents yet
  useEffect(() => {
    if (driveConnected && isOpen && documents.length === 0 && !documentsLoading) {
      refreshCurrentFolder();
    }
  }, [driveConnected, isOpen, documents.length, documentsLoading, refreshCurrentFolder]);
  
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
            <Info className="h-4 w-4 text-red-500" />
            <AlertDescription className="mt-2">
              Failed to load Google API after several attempts. Please try:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Refreshing the page</li>
                <li>Checking your internet connection</li>
                <li>Disabling any ad blockers or privacy extensions</li>
                <li>Using a different browser</li>
              </ul>
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
            />
            
            {connectionAttempts > 0 && apiLoadingState !== 'loaded' && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30 mt-2">
                <Info className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="mt-2">
                  If you're having trouble connecting, try refreshing the page and trying again.
                  Make sure to allow pop-ups for this site, as Google's authentication may appear in a popup window.
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
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={refreshCurrentFolder} disabled={isProcessing} className="gap-1">
                {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
                {!isProcessing && <RefreshCw className="h-4 w-4" />}
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
