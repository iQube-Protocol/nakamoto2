import { useState, useEffect } from 'react';
import { MediaPlayer } from './MediaPlayer';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image as ImageIcon, Video, Music, File } from 'lucide-react';
import { toast } from 'sonner';
import { getEntitlement } from '@/services/aa-api-client';

interface AssetPreviewProps {
  assetId: string;
  contentType: string;
  title: string;
}

export const AssetPreview = ({ assetId, contentType, title }: AssetPreviewProps) => {
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [playbackToken, setPlaybackToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntitlement();
  }, [assetId]);

  const loadEntitlement = async () => {
    try {
      setLoading(true);
      const entitlement = await getEntitlement(assetId);
      
      if (entitlement.signedUrl) {
        setSignedUrl(entitlement.signedUrl);
      }
      if (entitlement.playbackToken) {
        setPlaybackToken(entitlement.playbackToken);
      }
    } catch (error) {
      console.error('Failed to load entitlement:', error);
      toast.error('Failed to load asset preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!signedUrl) {
      toast.error('Download not available');
      return;
    }

    try {
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title || 'asset';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const getPreviewIcon = () => {
    if (contentType.startsWith('video/')) return <Video className="h-12 w-12" />;
    if (contentType.startsWith('audio/')) return <Music className="h-12 w-12" />;
    if (contentType.startsWith('image/')) return <ImageIcon className="h-12 w-12" />;
    if (contentType.startsWith('text/')) return <FileText className="h-12 w-12" />;
    return <File className="h-12 w-12" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!signedUrl && !playbackToken) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-muted-foreground mb-4">{getPreviewIcon()}</div>
        <p className="text-muted-foreground">Preview not available</p>
      </div>
    );
  }

  // Video preview
  if (contentType.startsWith('video/')) {
    return (
      <div className="space-y-4">
        <MediaPlayer src={signedUrl} type="video" />
        <Button onClick={handleDownload} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Video
        </Button>
      </div>
    );
  }

  // Audio preview
  if (contentType.startsWith('audio/')) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8 flex items-center justify-center">
          <Music className="h-24 w-24 text-primary opacity-50" />
        </div>
        <MediaPlayer src={signedUrl} type="audio" />
        <Button onClick={handleDownload} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Audio
        </Button>
      </div>
    );
  }

  // Image preview
  if (contentType.startsWith('image/')) {
    return (
      <div className="space-y-4">
        <img
          src={signedUrl}
          alt={title}
          className="w-full rounded-lg object-contain max-h-96"
        />
        <Button onClick={handleDownload} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Image
        </Button>
      </div>
    );
  }

  // Document/Text preview
  if (contentType.startsWith('text/') || contentType === 'application/pdf') {
    return (
      <div className="space-y-4">
        <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center h-64">
          <FileText className="h-24 w-24 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            {contentType === 'application/pdf' ? 'PDF Document' : 'Text Document'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.open(signedUrl, '_blank')} className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            Open in New Tab
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    );
  }

  // Generic file preview
  return (
    <div className="space-y-4">
      <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center h-64">
        <File className="h-24 w-24 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground text-center">
          {contentType}
        </p>
      </div>
      <Button onClick={handleDownload} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Download File
      </Button>
    </div>
  );
};
