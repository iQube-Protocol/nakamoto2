import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Play, ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAsset,
  getPaymentQuote,
  subscribeToSettlement,
  getEntitlement,
  getUserDID,
  type Asset,
  type PaymentQuote,
  type Entitlement
} from '@/services/aa-api-client';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetPreview } from './AssetPreview';

export const AssetDetail: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentQuote, setPaymentQuote] = useState<PaymentQuote | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    if (assetId) {
      loadAssetDetails();
    }
  }, [assetId]);

  const loadAssetDetails = async () => {
    if (!assetId) return;
    
    setLoading(true);
    try {
      const [assetData, entitlementData] = await Promise.all([
        getAsset(assetId),
        getEntitlement(assetId).catch(() => null)
      ]);
      setAsset(assetData);
      setEntitlement(entitlementData);
    } catch (error) {
      toast.error('Failed to load asset', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!assetId || !asset?.policy) return;
    
    setPurchasing(true);
    try {
      const buyerDid = await getUserDID();
      const quote = await getPaymentQuote(assetId, buyerDid, asset.policy.destChain);
      setPaymentQuote(quote);
      setShowPaymentDialog(true);
      
      // Subscribe to settlement events
      const unsubscribe = subscribeToSettlement(
        quote.requestId,
        async (entitlementId) => {
          toast.success('Payment settled!', { description: 'Loading your entitlement...' });
          setShowPaymentDialog(false);
          await loadAssetDetails();
          unsubscribe();
        },
        (error) => {
          toast.error('Settlement error', { description: error.message });
          unsubscribe();
        }
      );
    } catch (error) {
      toast.error('Failed to initiate purchase', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setPurchasing(false);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">Asset Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The requested asset could not be found
          </p>
          <Button onClick={() => navigate('/aa/library')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </Card>
      </div>
    );
  }

  const x402Deeplink = paymentQuote 
    ? `x402://${paymentQuote.recipient}?amount=${paymentQuote.amount}&asset=${paymentQuote.assetSymbol}&chain=${paymentQuote.toChain || 'default'}&requestId=${paymentQuote.requestId}`
    : '';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/aa/library')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Library
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          {entitlement ? (
            <Tabs defaultValue="preview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview">
                <AssetPreview 
                  assetId={asset.id}
                  contentType={asset.metadata.contentType}
                  title={asset.metadata.title}
                />
              </TabsContent>
              
              <TabsContent value="info">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Creator</p>
                    <p className="text-sm text-muted-foreground">{asset.metadata.creator}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Content Type</p>
                    <p className="text-sm text-muted-foreground">{asset.metadata.contentType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
            <h1 className="text-3xl font-bold mb-2">{asset.metadata.title}</h1>
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

          {asset.policy && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="text-2xl font-bold">
                  {asset.policy.priceAmount} {asset.policy.priceAsset}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rights</span>
                <span className="font-medium">{asset.policy.rights.join(', ')}</span>
              </div>
              {asset.policy.destChain && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chain</span>
                  <span className="font-medium">{asset.policy.destChain}</span>
                </div>
              )}
            </Card>
          )}

          {entitlement ? (
            <div className="space-y-3">
              <Card className="p-4 bg-primary/5 border-primary">
                <p className="text-sm font-medium mb-2">You own this asset</p>
                <p className="text-xs text-muted-foreground">
                  Granted: {new Date(entitlement.grantedAt).toLocaleDateString()}
                </p>
              </Card>
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
            </div>
          ) : (
            <Button 
              onClick={handleBuy} 
              disabled={purchasing || !asset.policy}
              className="w-full"
              size="lg"
            >
              {purchasing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              Buy Now
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {paymentQuote && (
              <>
                <div className="flex justify-center">
                  <QRCodeSVG value={x402Deeplink} size={200} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      {paymentQuote.amount} {paymentQuote.assetSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Request ID</span>
                    <span className="font-mono text-xs">{paymentQuote.requestId.substring(0, 12)}...</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan the QR code with your wallet or use the deeplink below
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(x402Deeplink, '_blank')}
                >
                  Open in Wallet
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
