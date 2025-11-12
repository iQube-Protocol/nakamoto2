import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Download, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getSharedAsset, type Asset, type Entitlement } from '@/services/aa-api-client';
import { AssetPreview } from './AssetPreview';

export const SharedAssetView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shareToken = searchParams.get('token');
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareToken) {
      loadSharedAsset();
    } else {
      setError('No share token provided');
      setLoading(false);
    }
  }, [shareToken]);

  const loadSharedAsset = async () => {
    if (!shareToken) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getSharedAsset(shareToken);
      setAsset(data.asset);
      setEntitlement(data.entitlement);
    } catch (error) {
      console.error('Failed to load shared asset:', error);
      setError(error instanceof Error ? error.message : 'Failed to load shared asset');
      toast.error('Failed to load shared asset');
    } finally {
      setLoading(false);
    }
  };

  const handleStream = () => {
    if (entitlement?.signedUrl) {
      window.open(entitlement.signedUrl, '_blank');
    } else if (entitlement?.playbackToken) {
      toast.info('Playback token available', { description: entitlement.playbackToken });
    }
  };

  const handleDownload = () => {
    if (entitlement?.signedUrl) {
      const a = document.createElement('a');
      a.href = entitlement.signedUrl;
      a.download = asset?.metadata.title || 'asset';
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared asset...</p>
        </Card>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-6">
            {error || 'This shared link is invalid or has expired'}
          </p>
          <Button onClick={() => navigate('/aa/library')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Library
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shared Asset</h1>
          <p className="text-sm text-muted-foreground">
            This asset has been shared with you
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/aa/library')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Library
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          {entitlement ? (
            <div className="space-y-4">
              <AssetPreview 
                assetId={asset.id}
                contentType={asset.metadata.contentType}
                title={asset.metadata.title}
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              {asset.metadata.thumbnail ? (
                <img 
                  src={asset.metadata.thumbnail} 
                  alt={asset.metadata.title}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <Play className="w-24 h-24 text-muted-foreground" />
              )}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{asset.metadata.title}</h2>
            <p className="text-muted-foreground">{asset.metadata.description}</p>
          </div>

          {asset.metadata.tags && asset.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {asset.metadata.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Card className="p-4 space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Creator</p>
              <p className="text-sm text-muted-foreground">{asset.metadata.creator}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Content Type</p>
              <p className="text-sm text-muted-foreground">{asset.metadata.contentType}</p>
            </div>
            {entitlement && (
              <div>
                <p className="text-sm font-medium mb-1">Your Access Rights</p>
                <p className="text-sm text-muted-foreground">{entitlement.rights.join(', ')}</p>
              </div>
            )}
          </Card>

          {entitlement && (
            <div className="flex gap-3">
              {entitlement.rights.includes('stream') && (
                <Button onClick={handleStream} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Stream
                </Button>
              )}
              {entitlement.rights.includes('download') && (
                <Button onClick={handleDownload} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
