
import React from 'react';
import { ChevronLeft, Folder, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { DocumentFolder } from '@/hooks/document-browser/types';

interface FileGridProps {
  documents: any[];
  isLoading: boolean;
  processingDocId?: string | null;
  currentFolder: DocumentFolder;
  handleDocumentClick: (doc: any) => void;
  handleBack: () => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  documents,
  isLoading,
  processingDocId,
  currentFolder,
  handleDocumentClick,
  handleBack
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <AspectRatio ratio={1} className="mb-2 w-full">
              <Skeleton className="h-full w-full" />
            </AspectRatio>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back button - only show if we're in a folder (currentFolder has an ID) */}
      {currentFolder.id && (
        <Button
          variant="outline"
          size="sm"
          className="mb-2 flex items-center gap-1"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No documents found in this folder
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <Button
              key={doc.id}
              variant="ghost"
              className={`h-auto flex flex-col items-center p-2 space-y-2 ${
                processingDocId === doc.id ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => handleDocumentClick(doc)}
            >
              <AspectRatio ratio={1} className="w-full bg-background rounded-md flex items-center justify-center">
                {doc.mimeType.includes('folder') ? (
                  <Folder className="h-12 w-12 text-blue-500" />
                ) : (
                  <FileText className="h-12 w-12 text-slate-500" />
                )}
              </AspectRatio>
              <span className="text-xs text-center line-clamp-2">{doc.name}</span>
              {processingDocId === doc.id && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Processing...
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileGrid;
