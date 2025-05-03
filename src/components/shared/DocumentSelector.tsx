
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
import { DocumentSelectorProvider, useDocumentSelectorContext } from './document/DocumentSelectorContext';
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
  try {
    const contextValue = useDocumentSelectorContext();
    
    if (!contextValue) {
      console.error("Document selector context is undefined");
      return (
        <DialogContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p>Unable to load document selector - context is missing</p>
          </div>
        </DialogContent>
      );
    }
    
    const { 
      isOpen, 
      handleDialogChange, 
      apiLoadingState = 'loading', 
      driveConnected = false, 
      handleFileSelection 
    } = contextValue;

    // Wrap the document selection handler to pass the document to the parent component
    const handleDocSelect = (doc: any) => {
      if (!doc) return;
      
      try {
        if (!handleFileSelection) {
          console.error("handleFileSelection function is not available");
          return doc;
        }
        
        const result = handleFileSelection(doc);
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
            {driveConnected 
              ? "Choose a document to analyze with your agent" 
              : "Connect to Google Drive to access your documents"}
          </DialogDescription>
        </DialogHeader>
        
        {apiLoadingState === 'loading' && <ApiLoadingAlert />}
        
        {apiLoadingState === 'error' && <ApiErrorAlert />}
        
        <ConnectionErrorAlert />
        
        {!driveConnected ? (
          <ConnectionInstructions />
        ) : (
          <DocumentBrowser />
        )}
        
        <DocumentDialogFooter />
      </DialogContent>
    );
  } catch (error) {
    console.error("Error in DocumentSelectorContent:", error);
    return (
      <DialogContent>
        <div className="flex flex-col items-center gap-4 py-8">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p>An error occurred while loading the document selector</p>
        </div>
      </DialogContent>
    );
  }
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
