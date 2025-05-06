
import React from 'react';
import { FileText, File, Image, Video, Headphones, FileSpreadsheet, Presentation } from 'lucide-react';

interface FileIconProps {
  mimeType: string;
  className?: string;
}

/**
 * Component that renders the appropriate icon based on file mime type
 */
const FileIcon: React.FC<FileIconProps> = ({ mimeType, className }) => {
  if (mimeType.includes('pdf')) {
    return <FileText className={className || "h-4 w-4 text-red-500"} />;
  } else if (mimeType.includes('image')) {
    return <Image className={className || "h-4 w-4 text-blue-500"} />;
  } else if (mimeType.includes('video')) {
    return <Video className={className || "h-4 w-4 text-purple-500"} />;
  } else if (mimeType.includes('audio')) {
    return <Headphones className={className || "h-4 w-4 text-green-500"} />;
  } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
    return <FileSpreadsheet className={className || "h-4 w-4 text-emerald-500"} />;
  } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return <Presentation className={className || "h-4 w-4 text-orange-500"} />;
  } else {
    return <File className={className || "h-4 w-4 text-muted-foreground"} />;
  }
};

export default FileIcon;
