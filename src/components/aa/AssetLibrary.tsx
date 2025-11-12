import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Library, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { listUserAssets, listUserEntitlements, type Asset, type Entitlement } from '@/services/aa-api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AssetLibrary: React.FC = () => {
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [purchases, setPurchases] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const [assets, entitlements] = await Promise.all([
        listUserAssets(),
        listUserEntitlements()
      ]);
      setMyAssets(assets);
      setPurchases(entitlements);
    } catch (error) {
      toast.error('Failed to load library', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Asset Library</h1>
        <Link to="/aa/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Asset
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="my-assets" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-assets" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            My Assets
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Purchases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-assets" className="mt-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : myAssets.length === 0 ? (
            <Card className="p-12 text-center">
              <Library className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Assets Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first asset to get started
              </p>
              <Link to="/aa/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Asset
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAssets.map((asset) => (
                <Link key={asset.id} to={`/aa/asset/${asset.id}`}>
                  <Card className="p-4 hover:border-primary transition-colors cursor-pointer">
                    <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                      {asset.metadata.thumbnail ? (
                        <img 
                          src={asset.metadata.thumbnail} 
                          alt={asset.metadata.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Library className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-2 truncate">{asset.metadata.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {asset.metadata.description}
                    </p>
                    {asset.policy && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium">
                          {asset.policy.priceAmount} {asset.policy.priceAsset}
                        </span>
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : purchases.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Purchases Yet</h3>
              <p className="text-muted-foreground">
                Browse and purchase assets to see them here
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((entitlement) => (
                <Link key={entitlement.id} to={`/aa/asset/${entitlement.assetId}`}>
                  <Card className="p-4 hover:border-primary transition-colors cursor-pointer">
                    <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Asset #{entitlement.assetId.substring(0, 8)}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Rights</span>
                        <span className="font-medium">{entitlement.rights.join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Granted</span>
                        <span className="font-medium">
                          {new Date(entitlement.grantedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
