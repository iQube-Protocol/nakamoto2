
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import DocumentItem from './DocumentItem';

interface DocumentListProps {
  documents: any[];
  isLoading: boolean;
  onViewDocument: (document: any) => void;
  onRemoveDocument: (documentId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  isLoading, 
  onViewDocument, 
  onRemoveDocument 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="text-center p-8 text-sm text-muted-foreground">
        No documents in context. Add documents to enhance your agent's responses.
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full w-full px-4">
      <div className="space-y-2 pb-4">
        {documents.map(doc => (
          <DocumentItem
            key={doc.id}
            document={doc}
            onView={onViewDocument}
            onRemove={onRemoveDocument}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default DocumentList;
