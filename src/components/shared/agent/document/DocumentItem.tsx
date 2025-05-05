
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, FileText, FileSpreadsheet, Presentation, File, Image, Video, Headphones, Folder } from 'lucide-react';
import { getFileExtension } from '@/components/shared/document-selector/documentUtils';

interface DocumentItemProps {
  document: {
    id: string;
    name: string;
    mimeType: string;
    content?: string;
  };
  onView: (document: any) => void;
  onRemove: (documentId: string) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document, onView, onRemove }) => {
  // Get icon based on file mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) {
      return <Folder className="h-4 w-4 text-yellow-500" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (mimeType.includes('video')) {
      return <Video className="h-4 w-4 text-purple-500" />;
    } else if (mimeType.includes('audio')) {
      return <Headphones className="h-4 w-4 text-green-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <Presentation className="h-4 w-4 text-orange-500" />;
    } else {
      return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-2 flex items-center justify-between">
      <div className="flex items-center gap-2 truncate">
        {getFileIcon(document.mimeType)}
        <span className="truncate text-sm">{document.name}</span>
      </div>
      <div className="flex gap-2 shrink-0">
        <Badge variant="outline" className="text-xs">
          {getFileExtension(document.mimeType)}
        </Badge>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => onView(document)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => onRemove(document.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
};

export default DocumentItem;
