
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, FolderOpen, AlertCircle } from 'lucide-react';
import FileIcon from '@/components/shared/agent/document/FileIcon';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

interface FileGridProps {
  handleDocumentClick: (doc: any) => void;
  handleBack: () => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  handleDocumentClick,
  handleBack
}) => {
  try {
    const { documents = [], documentsLoading: isLoading, currentFolder } = useDocumentSelectorContext();
    
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
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
        
        {documents && Array.isArray(documents) && documents.map((doc) => (
          doc && doc.id ? (
            <Card 
              key={doc.id} 
              className="p-4 cursor-pointer hover:bg-accent"
              onClick={() => handleDocumentClick(doc)}
            >
              <div className="flex items-center gap-2">
                <FileIcon mimeType={doc.mimeType} />
                <span className="truncate text-sm">{doc.name}</span>
              </div>
            </Card>
          ) : null
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error rendering FileGrid:", error);
    return (
      <div className="flex h-full items-center justify-center flex-col gap-2">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p>Error loading files</p>
      </div>
    );
  }
};

export default FileGrid;
