
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';
import DocumentSelector from '../DocumentSelector';
import { FileText, Trash2, Loader2, Eye, FileSpreadsheet, Presentation, File, Image, Video, Headphones } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
}

const DocumentContext: React.FC<DocumentContextProps> = ({ 
  conversationId,
  onDocumentAdded
}) => {
  const { client, fetchDocument, isLoading } = useMCP();
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, name: string, mimeType: string} | null>(null);
  const [documentSelectorDialogOpen, setDocumentSelectorDialogOpen] = useState(false);
  
  // Get documents from context
  useEffect(() => {
    if (client && conversationId) {
      const context = client.getModelContext();
      if (context?.documentContext) {
        const docs = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`,
          content: doc.content
        }));
        setSelectedDocuments(docs);
      }
    }
  }, [client, conversationId]);
  
  const handleDocumentSelect = async (document: any) => {
    if (!client) {
      toast.error('MCP client not initialized');
      return;
    }
    
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.info('Document already in context');
      return;
    }
    
    // Fetch document content
    const content = await fetchDocument(document.id);
    if (content) {
      // Add content to the document object for local tracking
      document.content = content;
      setSelectedDocuments(prev => [...prev, document]);
      toast.success('Document added to context');
      
      // Ensure document context is visible after adding a document
      setDocumentSelectorDialogOpen(false);
      
      if (onDocumentAdded) onDocumentAdded();
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    // Remove from the client context
    if (client && conversationId) {
      const context = client.getModelContext();
      if (context?.documentContext) {
        context.documentContext = context.documentContext.filter(
          doc => doc.documentId !== documentId
        );
      }
    }
    
    // Update local state
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast.success('Document removed from context');
  };
  
  const handleViewDocument = (document: any) => {
    setViewingDocument({
      id: document.id,
      name: document.name,
      content: document.content || "Content not available",
      mimeType: document.mimeType
    });
  };
  
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
    if (!viewingDocument) return null;
    
    if (viewingDocument.mimeType.includes('image')) {
      return <div className="text-center">Image preview not available</div>;
    } else if (viewingDocument.mimeType.includes('pdf')) {
      return <div className="whitespace-pre-wrap">{viewingDocument.content}</div>;
    } else {
      return <div className="whitespace-pre-wrap">{viewingDocument.content}</div>;
    }
  };
  
  // Get file extension from MIME type
  const getFileExtension = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('doc')) return 'doc';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xls';
    if (mimeType.includes('csv')) return 'csv';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
    if (mimeType.includes('text/plain')) return 'txt';
    if (mimeType.includes('json')) return 'json';
    if (mimeType.includes('html')) return 'html';
    
    // Extract from MIME type
    const parts = mimeType.split('/');
    return parts.length > 1 ? parts[1] : 'file';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Documents in Context</h3>
        <DocumentSelector 
          onDocumentSelect={handleDocumentSelect}
          triggerButton={
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-3.5 w-3.5" />
              Add Document
            </Button>
          }
        />
      </div>
      
      <Separator />
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : selectedDocuments.length > 0 ? (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {selectedDocuments.map(doc => (
            <Card key={doc.id} className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(doc.mimeType)}
                <span className="truncate text-sm">{doc.name}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">
                  {getFileExtension(doc.mimeType)}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => handleViewDocument(doc)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => handleRemoveDocument(doc.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No documents in context. Add documents to enhance your agent's responses.
        </div>
      )}
      
      {/* Document content viewer */}
      <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingDocument && getFileIcon(viewingDocument.mimeType)}
              {viewingDocument?.name}
            </DialogTitle>
            <DialogDescription>
              Document ID: {viewingDocument?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 bg-muted/30">
            {getFormattedContent()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentContext;
