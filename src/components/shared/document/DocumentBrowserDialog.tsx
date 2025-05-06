
import React from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import FolderBreadcrumb from './FolderBreadcrumb';
import FileGrid from './FileGrid';

interface DocumentBrowserDialogProps {
  documents: any[];
  currentFolder: string;
  folderHistory: Array<{ id: string; name: string }>;
  documentsLoading: boolean;
  fetchError: string | null;
  isRefreshing: boolean;
  isProcessing: boolean;
  navigateToFolder: (folderId: string, historyIndex?: number) => void;
  navigateToRoot: () => void;
  refreshCurrentFolder: () => void;
  handleRefresh: () => void;
  handleFileSelection: (doc: any) => void;
  handleBack: () => void;
  handleRetryConnection: () => void;
  setIsOpen: (open: boolean) => void;
  resetConnection: () => void;
}

const DocumentBrowserDialog: React.FC<DocumentBrowserDialogProps> = ({
  documents,
  currentFolder,
  folderHistory,
  documentsLoading,
  fetchError,
  isRefreshing,
  isProcessing,
  navigateToFolder,
  navigateToRoot,
  refreshCurrentFolder,
  handleRefresh,
  handleFileSelection,
  handleBack,
  handleRetryConnection,
  setIsOpen,
  resetConnection
}) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Select a document from Google Drive</DialogTitle>
        <DialogDescription>
          Choose a document to analyze with your agent
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 h-[300px] overflow-y-auto">
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
        
        <FileGrid
          documents={documents}
          isLoading={documentsLoading || isRefreshing}
          currentFolder={currentFolder}
          handleDocumentClick={handleFileSelection}
          handleBack={handleBack}
          onRefresh={handleRefresh}
        />
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button variant="outline" onClick={resetConnection}>Reset Connection</Button>
        <Button onClick={handleRefresh} disabled={isProcessing} className="gap-1">
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
          )}
          Refresh
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default DocumentBrowserDialog;
