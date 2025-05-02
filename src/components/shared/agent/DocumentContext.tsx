
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';
import DocumentSelector from '../DocumentSelector';
import { FileText, Trash2, Loader2 } from 'lucide-react';

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
  
  // Get documents from context
  React.useEffect(() => {
    if (client && conversationId) {
      const context = client.getModelContext();
      if (context?.documentContext) {
        const docs = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`
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
      setSelectedDocuments(prev => [...prev, document]);
      toast.success('Document added to context');
      if (onDocumentAdded) onDocumentAdded();
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    // Note: In a complete implementation, this would also remove from the MCP context
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast.success('Document removed from context');
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
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-sm">{doc.name}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">
                  {doc.mimeType.split('/')[1]}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => handleRemoveDocument(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default DocumentContext;
