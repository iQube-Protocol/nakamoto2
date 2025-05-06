
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, FolderOpen } from 'lucide-react';
import FileIcon from '@/components/shared/agent/document/FileIcon';

interface FileGridProps {
  handleDocumentClick: (doc: any) => void;
  handleBack: () => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  handleDocumentClick,
  handleBack
}) => {
  // Use state to safely store documents data
  const [fileData, setFileData] = React.useState({
    documents: [] as any[],
    isLoading: false,
    currentFolder: ''
  });
  
  // Safely access context using dynamic import
  React.useEffect(() => {
    const loadContext = async () => {
      try {
        const { useDocumentSelectorContext } = await import('./DocumentSelectorContext');
        const context = useDocumentSelectorContext();
        
        if (context) {
          setFileData({
            documents: Array.isArray(context.documents) ? context.documents : [],
            isLoading: context.documentsLoading || false,
            currentFolder: context.currentFolder || ''
          });
        }
      } catch (error) {
        console.warn("FileGrid: Failed to access DocumentSelectorContext", error);
      }
    };
    
    loadContext();
  }, []);
  
  // Extract values for easier access
  const { documents, isLoading, currentFolder } = fileData;
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
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
