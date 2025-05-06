
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import FileIcon from './FileIcon';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    mimeType: string;
  };
  onView: (document: any) => void;
  onRemove: (documentId: string) => void;
}

/**
 * Card component for displaying a document in the context
 */
const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onView, 
  onRemove 
}) => {
  // Get file extension from MIME type
  const getFileExtension = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('doc')) return 'doc';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xls';
    if (mimeType.includes('csv')) return 'csv';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
    if (mimeType.includes('text/plain')) return 'txt';
    if (mimeType.includes('json')) return 'json';
    if (mimeType.includes('html')) return 'html';
    
    // Extract from MIME type
    const parts = mimeType.split('/');
    return parts.length > 1 ? parts[1] : 'file';
  };

  return (
    <Card className="p-2 flex items-center justify-between">
      <div className="flex items-center gap-2 truncate">
        <FileIcon mimeType={document.mimeType} />
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

export default DocumentCard;
