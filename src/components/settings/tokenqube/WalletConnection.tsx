
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, Wallet } from 'lucide-react';
import { useServiceConnections } from '@/hooks/useServiceConnections';

interface WalletConnectionProps {
  isConnected: boolean;
  onConnectWallet: () => void;
}

const WalletConnection = ({ isConnected, onConnectWallet }: WalletConnectionProps) => {
  const { getWalletAddress, connectionData } = useServiceConnections();
  
  // Get the actual wallet address from the connections
  const walletAddress = getWalletAddress();
  
  // Get KNYT balance if available
  const knytBalance = connectionData.wallet?.knytTokenBalance?.formatted || null;
  
  // Debug logging to track balance updates
  useEffect(() => {
    console.log('🔍 WalletConnection: Connection data updated', {
      isConnected,
      walletAddress,
      knytBalance,
      fullWalletData: connectionData.wallet
    });
  }, [isConnected, walletAddress, knytBalance, connectionData.wallet]);
  
  // Format the address for display (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    if (!address) return "0x71C7656EC7...8976F";
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm">Connected Wallet</Label>
      {isConnected ? (
        <div className="space-y-2">
          <div className="flex items-center p-2 bg-iqube-primary/10 rounded-md border border-iqube-primary/30">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <div className="flex-1">
              <div className="font-mono text-xs truncate">
                {walletAddress ? formatAddress(walletAddress) : "0x71C7656EC7...8976F"}
              </div>
              {knytBalance && (
                <div className="text-xs text-muted-foreground mt-1">
                  <Wallet className="h-3 w-3 inline mr-1" />
                  {knytBalance}
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
