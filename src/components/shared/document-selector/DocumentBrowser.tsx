
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, File, FileText, Image, Video, Headphones, FileSpreadsheet, Presentation } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface DocumentBrowserProps {
  isLoading: boolean;
  documents: any[];
  currentFolder: string;
  folderHistory: {id: string, name: string}[];
  setCurrentFolder: (folderId: string) => void;
  setFolderHistory: (history: {id: string, name: string}[]) => void;
  handleDocumentClick: (doc: any) => void;
  handleBack: () => void;
}

const DocumentBrowser: React.FC<DocumentBrowserProps> = ({
  isLoading,
  documents,
  currentFolder,
  folderHistory,
  setCurrentFolder,
  setFolderHistory,
  handleDocumentClick,
  handleBack
}) => {
  // Get icon based on file mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) {
      return <FolderOpen className="h-5 w-5 text-muted-foreground" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (mimeType.includes('video')) {
      return <Video className="h-5 w-5 text-purple-500" />;
    } else if (mimeType.includes('audio')) {
      return <Headphones className="h-5 w-5 text-green-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <Presentation className="h-5 w-5 text-orange-500" />;
    } else {
      return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb navigation */}
      <div className="mb-4 flex items-center text-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setCurrentFolder('');
            setFolderHistory([]);
          }}
          disabled={!currentFolder}
          className="flex gap-1 items-center"
        >
          <FolderOpen className="h-4 w-4" />
          Root
        </Button>
        
        {folderHistory.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <span className="mx-1">/</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Navigate to this folder and update history
                setCurrentFolder(folder.id);
                setFolderHistory(folderHistory.slice(0, index));
              }}
            >
              {folder.name}
            </Button>
          </React.Fragment>
        ))}
        
        {currentFolder && !folderHistory.length && (
          <>
            <span className="mx-1">/</span>
            <span className="text-muted-foreground">Current Folder</span>
          </>
        )}
      </div>
    
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
        
        {documents.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            {currentFolder ? 'This folder is empty' : 'No documents found in root folder'}
          </div>
        )}
        
        {documents.map((doc) => (
          <Card 
            key={doc.id} 
            className="p-4 cursor-pointer hover:bg-accent"
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="flex items-center gap-2">
              {getFileIcon(doc.mimeType)}
              <span className="truncate text-sm">{doc.name}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};

export default DocumentBrowser;
