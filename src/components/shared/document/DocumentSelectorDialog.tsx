
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
import ConnectionForm from './ConnectionForm';
import FolderBreadcrumb from './FolderBreadcrumb';
import FileGrid from './FileGrid';
import { DocumentFolder } from '@/hooks/document-browser/types';

interface DocumentSelectorDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerButton?: React.ReactNode;
  processingDoc: string | null;
  driveConnected: boolean;
  connectionLoading: boolean;
  clientId: string;
  setClientId: (clientId: string) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  handleConnect: () => Promise<boolean>;
  handleResetConnection: () => void;
  documentsLoading: boolean;
  documents: any[];
  currentFolder: DocumentFolder;
  folderHistory: any[];
  handleFileSelection: (doc: any) => void;
  handleBack: () => void;
  navigateToFolder: (folder: DocumentFolder) => void;
  navigateToRoot: () => void;
  refreshCurrentFolder: () => void;
}

const DocumentSelectorDialog: React.FC<DocumentSelectorDialogProps> = ({
  isOpen,
  setIsOpen,
  triggerButton,
  processingDoc,
  driveConnected,
  connectionLoading,
  clientId,
  setClientId,
  apiKey,
  setApiKey,
  handleConnect,
  handleResetConnection,
  documentsLoading,
  documents,
  currentFolder,
  folderHistory,
  handleFileSelection,
  handleBack,
  navigateToFolder,
  navigateToRoot,
  refreshCurrentFolder,
}) => {
  const handleDialogChange = (open: boolean) => {
    // Only allow closing if we're not currently processing a document
    if (!open && !processingDoc) {
      setIsOpen(open);
    } else if (!open && processingDoc) {
      // If trying to close while processing, show a message
      // Note: toast is now handled in the parent component
    } else {
      setIsOpen(open);
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
          <ConnectionForm 
            clientId={clientId}
            setClientId={setClientId}
            apiKey={apiKey}
            setApiKey={setApiKey}
            handleConnect={handleConnect}
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

export default DocumentSelectorDialog;
