
import React from 'react';
import { Eye, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DocumentListProps {
  documents: any[];
  isLoading: boolean;
  onViewDocument: (doc: any) => void;
  onRemoveDocument: (id: string) => void;
  documentErrors?: Map<string, string>;
  onRecoverDocument?: (id: string) => Promise<boolean>;
}

const DocumentList = ({
  documents,
  isLoading,
  onViewDocument,
  onRemoveDocument,
  documentErrors = new Map(),
  onRecoverDocument
}: DocumentListProps) => {
  const [recoveringDocs, setRecoveringDocs] = React.useState<Set<string>>(new Set());
  
  // Handle recovery attempt
  const handleRecovery = async (docId: string) => {
    if (!onRecoverDocument) return;
    
    try {
      setRecoveringDocs(prev => new Set(prev).add(docId));
      await onRecoverDocument(docId);
    } finally {
      setRecoveringDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No documents available in context.
          <br />
          <span className="text-xs">
            Add documents to enhance your conversation with context-aware responses.
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const hasError = documentErrors.has(doc.id);
            const errorMessage = documentErrors.get(doc.id);
            const isRecovering = recoveringDocs.has(doc.id);
            const hasContentIssue = !doc.content || doc.content.length === 0;
            const showAlert = hasError || hasContentIssue;
            
            return (
              <div 
                key={doc.id} 
                className={`p-3 border rounded-md ${showAlert ? 'border-amber-300 bg-amber-50/30 dark:bg-amber-950/10' : 'hover:bg-accent/50'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{doc.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {hasError ? (
                        <span className="text-amber-600">{errorMessage || 'Error with document content'}</span>
                      ) : hasContentIssue ? (
                        <span className="text-amber-600">Missing document content</span>
                      ) : doc.content ? (
                        `${doc.content.length.toLocaleString()} characters`
                      ) : (
                        'No content'
                      )}
                    </p>
                  </div>
                  
                  <div className="flex space-x-1">
                    {showAlert && onRecoverDocument && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={isRecovering}
                        onClick={() => handleRecovery(doc.id)}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-100/50"
                        title="Attempt to recover document content"
                      >
                        {isRecovering ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDocument(doc)}
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRemoveDocument(doc.id)}
                      title="Remove from context"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Show small preview for documents without issues */}
                {!showAlert && doc.content && (
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {doc.content.length > 150 ? `${doc.content.substring(0, 150)}...` : doc.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
