
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, FolderOpen, AlertCircle } from 'lucide-react';
import FileIcon from '@/components/shared/agent/document/FileIcon';

interface FileGridProps {
  handleDocumentClick: (doc: any) => void;
  handleBack: () => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  handleDocumentClick,
  handleBack
}) => {
  // Create default values for when context isn't available
  const defaultValues = {
    documents: [],
    isLoading: false,
    currentFolder: '',
  };
  
  // Use state to avoid re-renders when context check fails
  const [fileState, setFileState] = React.useState<{
    documents: any[];
    isLoading: boolean;
    currentFolder: string;
  }>(defaultValues);
  
  // Try to access context just once to avoid re-renders
  React.useEffect(() => {
    try {
      // Import at runtime to avoid circular dependencies
      const { useDocumentSelectorContext } = require('./DocumentSelectorContext');
      const contextValue = useDocumentSelectorContext();
      
      if (contextValue) {
        setFileState({
          documents: Array.isArray(contextValue.documents) ? contextValue.documents : defaultValues.documents,
          isLoading: contextValue.documentsLoading || defaultValues.isLoading,
          currentFolder: contextValue.currentFolder || defaultValues.currentFolder
        });
      }
    } catch (error) {
      console.warn("FileGrid: DocumentSelectorContext not available, using defaults");
    }
  }, []);
  
  if (fileState.isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const { documents, currentFolder } = fileState;
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {currentFolder && (
        <Card 
          className="p-4 cursor-pointer hover:bg-accent"
          onClick={handleBack}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-amber-500" />
            <span>Back</span>
          </div>
        </Card>
      )}
      
      {(!documents || documents.length === 0) && (
        <div className="col-span-2 text-center py-8 text-muted-foreground">
          {currentFolder ? 'This folder is empty' : 'No documents found in root folder'}
        </div>
      )}
      
      {documents && Array.isArray(documents) && documents.map((doc) => {
        if (!doc || !doc.id) return null;
        
        return (
          <Card 
            key={doc.id} 
            className="p-4 cursor-pointer hover:bg-accent"
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="flex items-center gap-2">
              <FileIcon mimeType={doc.mimeType || 'unknown'} />
              <span className="truncate text-sm">{doc.name || 'Unnamed document'}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default FileGrid;
