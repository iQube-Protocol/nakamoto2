
import React from 'react';
import { Loader2 } from 'lucide-react';
import DocumentCard from './DocumentCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentListProps {
  documents: any[];
  isLoading: boolean;
  onViewDocument: (document: any) => void;
  onRemoveDocument: (documentId: string) => void;
}

/**
 * Component for displaying the list of documents in context
 */
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

  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No documents in context. Add documents to enhance your agent's responses.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={onViewDocument}
                onRemove={onRemoveDocument}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default DocumentList;
