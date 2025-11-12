import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Copy, Share2, CheckCircle } from 'lucide-react';
import { createShareLink, ShareLink } from '@/services/aa-api-client';

interface ShareAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  assetTitle: string;
}

export const ShareAssetDialog: React.FC<ShareAssetDialogProps> = ({
  open,
  onOpenChange,
  assetId,
  assetTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiryDuration, setExpiryDuration] = useState('86400'); // 24 hours
  const [accessRights, setAccessRights] = useState<string[]>(['read']);

  const handleCreateShareLink = async () => {
    setLoading(true);
    try {
      const link = await createShareLink(assetId, parseInt(expiryDuration), accessRights);
      setShareLink(link);
      toast.success('Share link created successfully');
    } catch (error) {
      console.error('Failed to create share link:', error);
      toast.error('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink.shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setCopied(false);
    onOpenChange(false);
  };

  const toggleAccessRight = (right: string) => {
    setAccessRights(prev => 
      prev.includes(right) 
        ? prev.filter(r => r !== right)
        : [...prev, right]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Asset
          </DialogTitle>
          <DialogDescription>
            Create a temporary share link for "{assetTitle}"
          </DialogDescription>
        </DialogHeader>

        {!shareLink ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Link expires in</Label>
              <Select value={expiryDuration} onValueChange={setExpiryDuration}>
                <SelectTrigger id="expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3600">1 hour</SelectItem>
                  <SelectItem value="21600">6 hours</SelectItem>
                  <SelectItem value="86400">24 hours</SelectItem>
                  <SelectItem value="259200">3 days</SelectItem>
                  <SelectItem value="604800">7 days</SelectItem>
                  <SelectItem value="2592000">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Access Rights</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="read"
                    checked={accessRights.includes('read')}
                    onCheckedChange={() => toggleAccessRight('read')}
                  />
                  <label
                    htmlFor="read"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    View/Read
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="download"
                    checked={accessRights.includes('download')}
                    onCheckedChange={() => toggleAccessRight('download')}
                  />
                  <label
                    htmlFor="download"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Download
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stream"
                    checked={accessRights.includes('stream')}
                    onCheckedChange={() => toggleAccessRight('stream')}
                  />
                  <label
                    htmlFor="stream"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Stream
                  </label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateShareLink}
              disabled={loading || accessRights.length === 0}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Share Link'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink.shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires:</span>
                <span className="font-medium">
                  {new Date(shareLink.expiresAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Access Rights:</span>
                <span className="font-medium">{shareLink.accessRights.join(', ')}</span>
              </div>
            </div>

            <Button onClick={handleClose} variant="outline" className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
