
import React, { useState, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
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
import { FileText, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DriveConnectionForm from './DriveConnectionForm';
import DocumentBrowser from './DocumentBrowser';

interface DocumentSelectorProps {
  onDocumentSelect: (document: any) => void;
  triggerButton?: React.ReactNode;
  onSelectionComplete?: () => void;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onDocumentSelect,
  triggerButton,
  onSelectionComplete
}) => {
  const { 
    driveConnected, 
    connectToDrive, 
    listDocuments, 
    documents, 
    isLoading,
    resetDriveConnection
  } = useMCP();
  
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderHistory, setFolderHistory] = useState<{id: string, name: string}[]>([]);
  const [reconnecting, setReconnecting] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  
  // Fetch documents when dialog opens, folder changes, or after successful connection
  useEffect(() => {
    if (isOpen && driveConnected) {
      listDocuments(currentFolder);
      
      // Clear the "just connected" flag after refreshing
      if (justConnected) {
        setJustConnected(false);
      }
    }
  }, [isOpen, driveConnected, currentFolder, justConnected, listDocuments]);
  
  // Handle successful connection
  const handleConnect = async () => {
    const success = await connectToDrive(clientId, apiKey);
    if (success) {
      // Mark as just connected to trigger an automatic refresh
      setJustConnected(true);
      toast.success('Connected to Google Drive successfully');
    }
  };

  // Handle reconnection to Google Drive without page reload
  const handleReconnect = async () => {
    try {
      setReconnecting(true);
      // Use the resetDriveConnection method from MCP hook
      await resetDriveConnection();
      
      // Reset connection state in local component
      setClientId('');
      setApiKey('');
      
      toast.info('Google Drive connection reset', {
        description: 'Please re-enter your credentials to reconnect'
      });
    } catch (error) {
      console.error('Error during reconnection:', error);
      toast.error('Failed to reset connection', {
        description: 'Please try again'
      });
    } finally {
      setReconnecting(false);
    }
  };
  
  // Handle document selection
  const handleDocumentClick = (doc: any) => {
    if (doc.mimeType.includes('folder')) {
      // Save current folder to history before navigating
      if (currentFolder) {
        // Find the current folder name from documents
        const currentFolderDoc = documents.find(d => d.id === currentFolder);
        if (currentFolderDoc) {
          setFolderHistory([...folderHistory, {
            id: currentFolder,
            name: currentFolderDoc.name
          }]);
        }
      }
      setCurrentFolder(doc.id);
    } else {
      onDocumentSelect(doc);
      
      if (onSelectionComplete) {
        onSelectionComplete();
      } else {
        setIsOpen(false);
      }
    }
  };
  
  const handleBack = () => {
    if (folderHistory.length > 0) {
      // Go back to the previous folder
      const newHistory = [...folderHistory];
      const lastFolder = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolder(lastFolder?.id || '');
    } else {
      // Go back to root
      setCurrentFolder('');
    }
  };
  
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (open && driveConnected) {
      listDocuments(currentFolder);
    }
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
          <DriveConnectionForm
            clientId={clientId}
            setClientId={setClientId}
            apiKey={apiKey}
            setApiKey={setApiKey}
            handleConnect={handleConnect}
            isLoading={isLoading}
          />
        ) : (
          <div className="py-4 h-[300px] overflow-y-auto">
            <DocumentBrowser
              isLoading={isLoading}
              documents={documents}
              currentFolder={currentFolder}
              folderHistory={folderHistory}
              setCurrentFolder={setCurrentFolder}
              setFolderHistory={setFolderHistory}
              handleDocumentClick={handleDocumentClick}
              handleBack={handleBack}
            />
          </div>
        )}
        
        <DialogFooter>
          {!driveConnected ? (
            <div /> // Empty div to maintain layout when connection form is shown
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleReconnect} 
                className="gap-2"
                disabled={reconnecting}
              >
                {reconnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Reset Connection
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                // Refresh the current folder
                listDocuments(currentFolder);
              }}>
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
