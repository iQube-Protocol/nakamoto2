
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, AlertCircle } from 'lucide-react';
import { DocumentSelectorProvider } from './document/DocumentSelectorContext';
import ApiLoadingAlert from './document/ApiLoadingAlert';
import ApiErrorAlert from './document/ApiErrorAlert';
import ConnectionErrorAlert from './document/ConnectionErrorAlert';
import ConnectionInstructions from './document/ConnectionInstructions';
import DocumentBrowser from './document/DocumentBrowser';
import DocumentDialogFooter from './document/DialogFooter';

interface DocumentSelectorProps {
  onDocumentSelect: (document: any) => void;
  triggerButton?: React.ReactNode;
}

// Inner component that uses the context
const DocumentSelectorContent: React.FC<{ onDocumentSelect: (document: any) => void }> = ({ 
  onDocumentSelect 
}) => {
  // Move context access to a try/catch to prevent errors from bubbling up
  const [contextState, setContextState] = React.useState<{
    isOpen?: boolean;
    handleDialogChange?: (isOpen: boolean) => void;
    apiLoadingState?: 'loading' | 'ready' | 'error';
    driveConnected?: boolean;
    handleFileSelection?: (doc: any) => any;
    error: boolean;
  }>({
    error: false
  });

  // Try to access context just once to avoid re-renders
  React.useEffect(() => {
    try {
      const contextValue = useDocumentSelectorContext();
      
      if (!contextValue) {
        throw new Error("Document selector context is undefined");
      }
      
      setContextState({
        isOpen: contextValue.isOpen, 
        handleDialogChange: contextValue.handleDialogChange, 
        apiLoadingState: contextValue.apiLoadingState || 'loading', 
        driveConnected: contextValue.driveConnected || false, 
        handleFileSelection: contextValue.handleFileSelection,
        error: false
      });
    } catch (error) {
      console.error("Error accessing DocumentSelectorContext:", error);
      setContextState({ error: true });
    }
  }, []);

  // If there was an error accessing context, show error message
  if (contextState.error) {
    return (
      <DialogContent>
        <div className="flex flex-col items-center gap-4 py-8">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p>Unable to load document selector - context is missing</p>
        </div>
      </DialogContent>
    );
  }

  // Wrap the document selection handler to pass the document to the parent component
  const handleDocSelect = (doc: any) => {
    if (!doc) return;
    
    try {
      if (!contextState.handleFileSelection) {
        console.error("handleFileSelection function is not available");
        return doc;
      }
      
      const result = contextState.handleFileSelection(doc);
      // Only pass non-folder documents to the parent
      if (doc.mimeType && !doc.mimeType.includes('folder')) {
        onDocumentSelect(result);
      }
      return result;
    } catch (error) {
      console.error("Error in handleDocSelect:", error);
      return doc;
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Select a document from Google Drive</DialogTitle>
        <DialogDescription>
          {contextState.driveConnected 
            ? "Choose a document to analyze with your agent" 
            : "Connect to Google Drive to access your documents"}
        </DialogDescription>
      </DialogHeader>
      
      {contextState.apiLoadingState === 'loading' && <ApiLoadingAlert />}
      
      {contextState.apiLoadingState === 'error' && <ApiErrorAlert />}
      
      <ConnectionErrorAlert />
      
      {!contextState.driveConnected ? (
        <ConnectionInstructions />
      ) : (
        <DocumentSelectorProvider>
          <DocumentBrowser />
        </DocumentSelectorProvider>
      )}
      
      <DocumentDialogFooter />
    </DialogContent>
  );
};

// Main component with context provider
const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onDocumentSelect,
  triggerButton 
}) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <DocumentSelectorProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerButton || (
            <Button className="flex gap-2">
              <FileText className="h-4 w-4" />
              Select Document
            </Button>
          )}
        </DialogTrigger>
        <DocumentSelectorContent onDocumentSelect={onDocumentSelect} />
      </Dialog>
    </DocumentSelectorProvider>
  );
};

export default DocumentSelector;
