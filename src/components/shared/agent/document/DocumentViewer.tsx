
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FileIcon from './FileIcon';

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    content: string;
    mimeType: string;
  } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for viewing document content
 */
const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  isOpen, 
  onOpenChange 
}) => {
  // Format document content based on MIME type
  const getFormattedContent = () => {
    if (!document) return null;
    
    if (document.mimeType.includes('image')) {
      return <div className="text-center">Image preview not available</div>;
    } else if (document.mimeType.includes('pdf')) {
      return <div className="whitespace-pre-wrap">{document.content}</div>;
    } else {
      return <div className="whitespace-pre-wrap">{document.content}</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {document && <FileIcon mimeType={document.mimeType} />}
            {document?.name}
          </DialogTitle>
          <DialogDescription>
            Document ID: {document?.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="border rounded-md p-4 bg-muted/30">
          {getFormattedContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
