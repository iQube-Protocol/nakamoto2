
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, FolderOpen, AlertCircle, RefreshCw } from 'lucide-react';
import FileIcon from '@/components/shared/agent/document/FileIcon';
import { Button } from '@/components/ui/button';

interface FileGridProps {
  documents: any[];
  isLoading: boolean;
  currentFolder: string;
  handleDocumentClick: (doc: any) => void;
  handleBack: () => void;
  onRefresh?: () => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  documents,
  isLoading,
  currentFolder,
  handleDocumentClick,
  handleBack,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Loading documents...</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {currentFolder && (
        <Card 
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleBack}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-amber-500" />
            <span>Back</span>
          </div>
        </Card>
      )}
      
      {documents.length === 0 && (
        <div className="col-span-2 text-center py-8 text-muted-foreground flex flex-col items-center">
          <AlertCircle className="h-6 w-6 mb-2 text-muted-foreground" />
          {currentFolder ? (
            <>
              <p>This folder is empty or you don't have permission to view its contents.</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleBack}>
                  Go Back
                </Button>
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <p>No documents found in your Google Drive root folder.</p>
              <div className="max-w-xs mt-2 text-xs">
                <p>Possible reasons:</p>
                <ul className="list-disc pl-5 mt-1 text-left">
                  <li>Your root folder is empty</li>
                  <li>Permission issues with Google API</li>
                  <li>Google API quota exceeded</li>
                  <li>API not properly enabled in Google Cloud Console</li>
                </ul>
              </div>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} className="mt-4 flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh Folder
                </Button>
              )}
            </>
          )}
        </div>
      )}
      
      {documents.map((doc) => (
        <Card 
          key={doc.id} 
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => handleDocumentClick(doc)}
        >
          <div className="flex items-center gap-2">
            <FileIcon mimeType={doc.mimeType} />
            <span className="truncate text-sm">{doc.name}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FileGrid;
