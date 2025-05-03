
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
import { FileText } from 'lucide-react';
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
  const { 
    isOpen, 
    handleDialogChange, 
    apiLoadingState, 
    driveConnected, 
    handleFileSelection
  } = useDocumentSelectorContext();

  // Wrap the document selection handler to pass the document to the parent component
  const handleDocSelect = (doc: any) => {
    const result = handleFileSelection(doc);
    // Only pass non-folder documents to the parent
    if (!doc.mimeType.includes('folder')) {
      onDocumentSelect(result);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
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
    </Dialog>
  );
};

// Main component with context provider
const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onDocumentSelect,
  triggerButton 
}) => {
  return (
    <DocumentSelectorProvider>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="flex gap-2">
            <FileText className="h-4 w-4" />
            Select Document
          </Button>
        )}
      </DialogTrigger>
      <DocumentSelectorContent onDocumentSelect={onDocumentSelect} />
    </DocumentSelectorProvider>
  );
};

export default DocumentSelector;
