
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentFolder, FolderHistory } from '@/hooks/document-browser/types';

interface FolderBreadcrumbProps {
  currentFolder: DocumentFolder;
  folderHistory: FolderHistory[];
  navigateToFolder: (folder: DocumentFolder, historyIndex?: number) => void;
  navigateToRoot: () => void;
}

const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({
  currentFolder,
  folderHistory,
  navigateToFolder,
  navigateToRoot
}) => {
  return (
    <div className="flex items-center flex-wrap gap-1 mb-4 text-sm">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 px-2 text-muted-foreground" 
        onClick={navigateToRoot}
      >
        <Home className="h-3.5 w-3.5 mr-1" />
        Root
      </Button>
      
      {folderHistory.map((folder, index) => (
        <React.Fragment key={folder.id || index}>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground"
            onClick={() => navigateToFolder(folder, index)}
          >
            {folder.name}
          </Button>
        </React.Fragment>
      ))}
      
      {currentFolder.id && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 font-medium"
            disabled
          >
            {currentFolder.name}
          </Button>
        </>
      )}
    </div>
  );
};

export default FolderBreadcrumb;
