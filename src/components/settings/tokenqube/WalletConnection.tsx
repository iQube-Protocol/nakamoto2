
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, Wallet, RefreshCw } from 'lucide-react';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { walletConnectionService } from '@/services/wallet-connection-service';

interface WalletConnectionProps {
  isConnected: boolean;
  onConnectWallet: () => void;
  walletAddress: string | null;
  knytBalance: string | null;
}

const WalletConnection = ({ isConnected, onConnectWallet, walletAddress, knytBalance }: WalletConnectionProps) => {
  const { connections, getWalletAddress, connectionData, refreshConnections } = useServiceConnections();
  
  // Use direct connection data instead of props to avoid stale/hardcoded data
  const actualWalletAddress = getWalletAddress();
  const actualIsConnected = connections.wallet;
  const actualKnytBalance = connectionData.wallet?.knytTokenBalance?.formatted || null;
  
  // Debug logging to track balance updates
  useEffect(() => {
    console.log('🔍 WalletConnection: Props vs Actual Data', {
      propsIsConnected: isConnected,
      actualIsConnected,
      propsWalletAddress: walletAddress,
      actualWalletAddress,
      propsKnytBalance: knytBalance,
      actualKnytBalance
    });
  }, [isConnected, walletAddress, knytBalance, actualIsConnected, actualWalletAddress, actualKnytBalance]);
  
  const handleRefreshBalance = async () => {
    console.log('🔄 Manually refreshing KNYT balance...');
    const success = await walletConnectionService.refreshKnytBalance();
    if (success) {
      // Refresh the connection data in the hook
      await refreshConnections(false);
    }
  };
  
  // Format the address for display (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Connected Wallet</Label>
        {actualIsConnected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshBalance}
            className="h-auto p-1 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        )}
      </div>
      {actualIsConnected && actualWalletAddress ? (
        <div className="space-y-2">
          <div className="flex items-center p-2 bg-iqube-primary/10 rounded-md border border-iqube-primary/30">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <div className="flex-1">
              <div className="font-mono text-xs truncate">
                {formatAddress(actualWalletAddress)}
              </div>
              {actualKnytBalance && (
                <div className="text-xs text-muted-foreground mt-1">
                  <Wallet className="h-3 w-3 inline mr-1" />
                  {actualKnytBalance}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Button 
          className="w-full bg-iqube-primary hover:bg-iqube-primary/90"
          onClick={onConnectWallet}
          size="sm"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;
