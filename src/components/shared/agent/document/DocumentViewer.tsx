
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Image, Video, Headphones, FileSpreadsheet, Presentation, File } from 'lucide-react';

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    content: string;
    mimeType: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, open, onOpenChange }) => {
  // Get icon based on file mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (mimeType.includes('video')) {
      return <Video className="h-4 w-4 text-purple-500" />;
    } else if (mimeType.includes('audio')) {
      return <Headphones className="h-4 w-4 text-green-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <Presentation className="h-4 w-4 text-orange-500" />;
    } else {
      return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {document && getFileIcon(document.mimeType)}
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
